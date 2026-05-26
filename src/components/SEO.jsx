import { Helmet } from 'react-helmet-async';

const DOMAIN = 'https://www.mealprep.org.uk';
const DEFAULT_OG_IMAGE = `${DOMAIN}/og-preview.png`;

export default function SEO({ title, description, canonical, jsonLd, ogType = 'website', ogImage }) {
  const url = `${DOMAIN}${canonical || '/'}`;
  const selectedImage = ogImage || DEFAULT_OG_IMAGE;
  const image = selectedImage.startsWith('http') ? selectedImage : `${DOMAIN}${selectedImage}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="MealPrep.org.uk" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@mealpreporuk" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
