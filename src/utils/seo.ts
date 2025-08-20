export const generateBlogPostJsonLd = (post: {
  title: string;
  content: string;
  author_name: string;
  published_at: string;
  featured_image_url?: string;
  slug: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "author": {
    "@type": "Person",
    "name": post.author_name
  },
  "datePublished": post.published_at,
  "image": post.featured_image_url || "https://syncstyle.lovable.app/og-image.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "SyncStyle",
    "logo": {
      "@type": "ImageObject",
      "url": "https://syncstyle.lovable.app/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://syncstyle.lovable.app/blog/${post.slug}`
  }
});

export const generateOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SyncStyle",
  "url": "https://syncstyle.lovable.app",
  "logo": "https://syncstyle.lovable.app/logo.png",
  "description": "Smart wardrobe and outfit management platform with weather-based style recommendations",
  "sameAs": [
    "https://twitter.com/syncstyle",
    "https://facebook.com/syncstyle"
  ]
});

export const generateWebsiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SyncStyle",
  "url": "https://syncstyle.lovable.app",
  "description": "Organize your wardrobe, create perfect outfits, and get weather-based style recommendations",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://syncstyle.lovable.app/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

export const generateFAQJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does SyncStyle help organize my wardrobe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SyncStyle allows you to digitally catalog your clothing items with photos, categories, and details. You can track wear counts, create outfits, and get weather-based recommendations."
      }
    },
    {
      "@type": "Question", 
      "name": "Can SyncStyle suggest outfits based on weather?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! SyncStyle integrates with weather APIs to provide intelligent outfit suggestions based on current and forecasted weather conditions in your location."
      }
    },
    {
      "@type": "Question",
      "name": "Is my wardrobe data secure and private?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. SyncStyle uses enterprise-grade security with encrypted data storage, secure authentication, and privacy controls. Your wardrobe data is never shared without your permission."
      }
    }
  ]
});