import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  jsonLd?: object;
}

const SEO = ({
  title = 'SyncStyle - Smart Wardrobe & Outfit Management',
  description = 'Organize your wardrobe, create perfect outfits, and get weather-based style recommendations with SyncStyle. Your personal styling assistant.',
  keywords = 'wardrobe management, outfit planning, style assistant, weather-based outfits, fashion organizer, digital closet',
  image = '/og-image.jpg',
  url = 'https://syncstyle.lovable.app',
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  author,
  tags,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes('SyncStyle') ? title : `${title} | SyncStyle`;
  const fullUrl = url.startsWith('http') ? url : `https://syncstyle.lovable.app${url}`;
  const fullImage = image.startsWith('http') ? image : `https://syncstyle.lovable.app${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="SyncStyle" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Performance & SEO */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//api.openweathermap.org" />
      <link rel="dns-prefetch" href="//api.weatherapi.com" />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;