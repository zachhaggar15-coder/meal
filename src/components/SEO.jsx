import { Helmet } from 'react-helmet-async';

const DOMAIN = 'https://YOUR_DOMAIN_HERE.com';

export default function SEO({ title, description, canonical, jsonLd }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${DOMAIN}${canonical || '/'}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${DOMAIN}${canonical || '/'}`} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
