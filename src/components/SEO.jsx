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
  ogImage,
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
}) {
  const url = cleanCanonicalUrl(canonical);
  const image = ogImage || `${DOMAIN}/og-preview.png`;
  const structuredData = [
    ORGANIZATION_JSON_LD,
    ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []),
  ];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="theme-color" content="#2f855a" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />

      {structuredData.map((item, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(item)}</script>
      ))}
    </Helmet>
  );
}
