// Minimal Product Advertising API 5.0 client for the GetItems operation.
//
// PA-API is the only sanctioned way to read live availability. Scraping the
// public product page from CI gets served a CAPTCHA from datacentre IPs, which
// would report healthy listings as dead, so the stock verdict comes from here
// or it does not come at all.
//
// Signing is AWS SigV4 against service "ProductAdvertisingAPI". No SDK: the
// signature is ~40 lines of node:crypto and the repo has no AWS dependency.

import crypto from 'node:crypto';
import { MARKETPLACES } from './amazonLinks.js';

const SERVICE = 'ProductAdvertisingAPI';
const PATH = '/paapi5/getitems';
const TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
const CONTENT_TYPE = 'application/json; charset=utf-8';

// GetItems accepts at most 10 ASINs per call.
export const MAX_ITEMS_PER_REQUEST = 10;

const RESOURCES = [
  'ItemInfo.Title',
  'Offers.Listings.Availability.Message',
  'Offers.Listings.Availability.Type',
  'Offers.Listings.Price',
  'Offers.Listings.MerchantInfo',
  'Offers.Summaries.OfferCount',
];

export function readCredentials(env = process.env) {
  const accessKey = env.AMAZON_PAAPI_ACCESS_KEY;
  const secretKey = env.AMAZON_PAAPI_SECRET_KEY;
  const partnerTag = env.AMAZON_PAAPI_PARTNER_TAG || env.AMAZON_ASSOCIATE_TAG;
  if (!accessKey || !secretKey || !partnerTag) return null;
  return { accessKey, secretKey, partnerTag };
}

export function marketplaceFor(hostname) {
  const config = MARKETPLACES[hostname] || MARKETPLACES[`www.${hostname.replace(/^www\./, '')}`];
  if (!config) throw new Error(`No Product Advertising API marketplace configured for ${hostname}`);
  return config;
}

export async function getItems({ asins, hostname, credentials, fetchImpl = fetch }) {
  if (asins.length > MAX_ITEMS_PER_REQUEST) {
    throw new Error(`GetItems accepts at most ${MAX_ITEMS_PER_REQUEST} ASINs, got ${asins.length}`);
  }
  const { host, region, marketplace } = marketplaceFor(hostname);
  const payload = JSON.stringify({
    ItemIds: asins,
    ItemIdType: 'ASIN',
    Resources: RESOURCES,
    PartnerTag: credentials.partnerTag,
    PartnerType: 'Associates',
    Marketplace: marketplace,
  });

  const headers = signRequest({ payload, host, region, credentials });
  const response = await fetchImpl(`https://${host}${PATH}`, { method: 'POST', headers, body: payload });
  const text = await response.text();

  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Fall through: a non-JSON body is reported with the status below.
  }

  if (!response.ok) {
    // PA-API reports per-ASIN problems (a delisted product) inside a 200 body.
    // A non-2xx status is a request-level failure — bad credentials, throttling,
    // an unapproved account — and must never be read as "these links are dead".
    const detail = body?.Errors?.map(error => `${error.Code}: ${error.Message}`).join('; ')
      || text.slice(0, 300)
      || response.statusText;
    const error = new Error(`PA-API ${response.status}: ${detail}`);
    error.status = response.status;
    error.retryable = response.status === 429 || response.status >= 500;
    throw error;
  }

  return {
    items: body?.ItemsResult?.Items ?? [],
    errors: body?.Errors ?? [],
  };
}

// Turn one PA-API item into the availability verdict the report speaks in.
export function verdictForItem(item) {
  const listings = item?.Offers?.Listings ?? [];
  const title = item?.ItemInfo?.Title?.DisplayValue ?? null;

  if (!listings.length) {
    // The ASIN resolves but carries no buyable offer: classic "Currently
    // unavailable" or a listing that only has used/third-party stock we cannot see.
    return { status: 'out-of-stock', title, availability: 'No buyable offer returned', price: null, merchant: null };
  }

  const listing = listings[0];
  const type = listing?.Availability?.Type ?? null;
  const message = listing?.Availability?.Message ?? null;
  const price = listing?.Price?.DisplayAmount ?? null;
  const merchant = listing?.MerchantInfo?.Name ?? null;

  // "Now" is in stock. Everything else (Backorderable, PreorderableFuture,
  // OutOfStock) is something a buyer cannot get today.
  const status = type === 'Now' ? 'in-stock' : 'out-of-stock';
  return { status, title, availability: message || type || 'Unknown', price, merchant };
}

// Map a per-ASIN PA-API error to a verdict. ItemNotAccessible and
// InvalidParameterValue mean the ASIN no longer resolves in this marketplace.
export function verdictForError(error) {
  const code = error?.Code ?? 'UnknownError';
  const dead = code === 'ItemNotAccessible' || code === 'InvalidParameterValue';
  return {
    status: dead ? 'dead' : 'unknown',
    title: null,
    availability: `${code}: ${error?.Message ?? 'no message'}`,
    price: null,
    merchant: null,
  };
}

export function asinsFromError(error) {
  // PA-API echoes the offending ASIN inside the message text.
  return [...String(error?.Message ?? '').matchAll(/\b([A-Z0-9]{10})\b/g)].map(match => match[1]);
}

function signRequest({ payload, host, region, credentials }) {
  const now = new Date();
  const amzDate = `${now.toISOString().replace(/[:-]|\.\d{3}/g, '')}`;
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n`
    + `content-type:${CONTENT_TYPE}\n`
    + `host:${host}\n`
    + `x-amz-date:${amzDate}\n`
    + `x-amz-target:${TARGET}\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = ['POST', PATH, '', canonicalHeaders, signedHeaders, sha256(payload)].join('\n');
  const scope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');

  const signingKey = [dateStamp, region, SERVICE, 'aws4_request']
    .reduce(hmac, `AWS4${credentials.secretKey}`);
  const signature = hmac(signingKey, stringToSign).toString('hex');

  return {
    'content-encoding': 'amz-1.0',
    'content-type': CONTENT_TYPE,
    host,
    'x-amz-date': amzDate,
    'x-amz-target': TARGET,
    Authorization: `AWS4-HMAC-SHA256 Credential=${credentials.accessKey}/${scope}, `
      + `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value, 'utf8').digest();
}
