import { Helmet } from 'react-helmet-async';
import {
  ORGANIZATION_JSON_LD,
  SITE_NAME,
  SITE_URL,
} from '../constants/site.js';
import { fitMetadataTitle } from '../utils/seoMetadata.js';
import { resolveImageDimensions } from '../utils/ogImageMeta.js';

const DOMAIN = SITE_URL;

function cleanCanonicalUrl(canonical = '/') {
  const url = new URL(canonical || '/', DOMAIN);
  url.search = '';
  url.hash = '';
  return url.toString();
}

export default function SEO({
  title,
  description,
  canonical,
  jsonLd,
  ogType = 'website',
  ogTitle,
  ogDescription,
  ogImage,
  ogImageAlt,
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
}) {
  const url = cleanCanonicalUrl(canonical);
  // A generated card thumbnail (SVG data URI) is decorative, not a photograph
  // of the page - it has no stable crawlable URL and must never reach search
  // engines as the preferred image. No page currently passes one as ogImage;
  // this is a guard against that assumption silently breaking.
  const requestedImage = ogImage && !ogImage.startsWith('data:') ? ogImage : null;
  const image = requestedImage || `${DOMAIN}/og-preview.png`;
  const imageType = getImageType(image);
  const { width: imageWidth, height: imageHeight } = resolveImageDimensions(image);
  const metaTitle = fitMetadataTitle(title);
  const socialTitle = fitMetadataTitle(ogTitle || title);
  const metaDescription = trimMetaDescription(description);
  const openGraphDescription = trimMetaDescription(ogDescription || description);
  // Every page has a unique <title> (enforced by check-google-indexing's
  // duplicate-metadata check), so falling back to it keeps alt text
  // page-specific instead of repeating one phrase across the site.
  const imageAlt = ogImageAlt || socialTitle;
  const structuredData = [
    ORGANIZATION_JSON_LD,
    ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []),
  ];

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="theme-color" content="#2f855a" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={openGraphDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:type" content={imageType} />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Twitter/X card — falls back to a plain link without these */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={openGraphDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {structuredData.map((item, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}
    </Helmet>
  );
}

function getImageType(image) {
  const cleanImage = String(image || '').split('?')[0].toLowerCase();
  if (cleanImage.startsWith('data:image/svg')) return 'image/svg+xml';
  if (cleanImage.endsWith('.webp')) return 'image/webp';
  if (cleanImage.endsWith('.jpg') || cleanImage.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
}

function trimMetaDescription(value, maxLength = 155) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 3).trim();
  const lastSpace = clipped.lastIndexOf(' ');
  const safeCut = lastSpace > 110 ? clipped.slice(0, lastSpace) : clipped;
  return `${safeCut.replace(/[.,;:!?-]+$/, '')}...`;
}
