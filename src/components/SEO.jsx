import { Helmet } from 'react-helmet-async';
import {
  ORGANIZATION_JSON_LD,
  SITE_NAME,
  SITE_URL,
} from '../constants/site.js';

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
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
}) {
  const url = cleanCanonicalUrl(canonical);
  const image = ogImage || `${DOMAIN}/og-preview.png`;
  const imageType = getImageType(image);
  const metaDescription = trimMetaDescription(description);
  const openGraphDescription = trimMetaDescription(ogDescription || description);
  const structuredData = [
    ORGANIZATION_JSON_LD,
    ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []),
  ];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="theme-color" content="#2f855a" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={openGraphDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content={imageType} />

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
