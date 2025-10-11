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
  },
  "wordCount": post.content.split(' ').length,
  "articleBody": post.content.substring(0, 300) + "...",
  "keywords": ["fashion", "style", "wardrobe", "outfit planning"]
});

export const generateOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SyncStyle",
  "alternateName": "Sync Style",
  "url": "https://syncstyle.lovable.app",
  "logo": "https://syncstyle.lovable.app/logo.png",
  "description": "Smart wardrobe and outfit management platform with weather-based style recommendations. Track your clothing, create perfect outfits, and get AI-powered styling suggestions.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "syncstyleonline@gmail.com",
    "contactType": "customer service"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://twitter.com/syncstyle",
    "https://facebook.com/syncstyle"
  ],
  "knowsAbout": [
    "fashion",
    "wardrobe management",
    "outfit planning",
    "style consulting",
    "weather-based clothing",
    "fashion AI",
    "digital closet",
    "clothing organization"
  ]
});

export const generateWebsiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SyncStyle",
  "alternateName": "Sync Style",
  "url": "https://syncstyle.lovable.app",
  "description": "Organize your wardrobe, create perfect outfits, and get weather-based style recommendations. The ultimate digital closet and personal styling assistant.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://syncstyle.lovable.app/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "about": [
    {
      "@type": "Thing",
      "name": "Fashion Technology"
    },
    {
      "@type": "Thing", 
      "name": "Wardrobe Management"
    },
    {
      "@type": "Thing",
      "name": "AI Styling"
    }
  ],
  "keywords": "wardrobe management, outfit planning, fashion AI, digital closet, weather-based styling, smart wardrobe, style assistant"
});

export const generateFAQJsonLd = (faqData?: Array<{ question: string; answer: string }>) => {
  const defaultFAQs = [
    {
      "@type": "Question",
      "name": "How does SyncStyle help organize my wardrobe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SyncStyle allows you to digitally catalog your clothing items with photos, categories, and details. You can track wear counts, create outfits, and get weather-based recommendations. Upload photos of your clothes, categorize them by type, color, and season, and use our analytics to understand your style patterns."
      }
    },
    {
      "@type": "Question", 
      "name": "Can SyncStyle suggest outfits based on weather?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! SyncStyle integrates with weather APIs to provide intelligent outfit suggestions based on current and forecasted weather conditions in your location. Our AI considers temperature, precipitation, humidity, and wind to recommend appropriate clothing from your wardrobe."
      }
    },
    {
      "@type": "Question",
      "name": "Is my wardrobe data secure and private?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. SyncStyle uses enterprise-grade security with encrypted data storage, secure authentication, and privacy controls. Your wardrobe data is never shared without your permission. All photos and personal style data are protected with industry-standard encryption."
      }
    },
    {
      "@type": "Question",
      "name": "How does the AI outfit recommendation work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI analyzes your wardrobe items, considers weather conditions, occasion requirements, and style preferences to suggest optimal outfit combinations. The system learns from your choices to provide increasingly personalized recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Can I find local fashion services through SyncStyle?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! SyncStyle helps you discover nearby dry cleaners, tailors, styling services, and fashion professionals. Connect with local services to maintain and enhance your wardrobe."
      }
    }
  ];

  const mainEntity = faqData 
    ? faqData.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    : defaultFAQs;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity
  };
};

// New structured data generators for AI optimization
export const generateSoftwareApplicationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SyncStyle",
  "description": "Smart wardrobe management and outfit planning application with AI-powered styling recommendations",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Digital wardrobe organization",
    "Outfit creation and planning",
    "Weather-based style recommendations",
    "AI-powered styling assistant",
    "Local fashion services discovery",
    "Clothing analytics and insights"
  ],
  "screenshot": "https://syncstyle.lovable.app/og-image.jpg",
  "downloadUrl": "https://syncstyle.lovable.app",
  "author": {
    "@type": "Organization",
    "name": "SyncStyle"
  }
});

export const generateServiceJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "SyncStyle Wardrobe Management",
  "description": "Professional wardrobe organization and styling service powered by AI technology",
  "provider": {
    "@type": "Organization",
    "name": "SyncStyle"
  },
  "serviceType": "Fashion and Style Consulting",
  "areaServed": "Worldwide",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "SyncStyle Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Digital Wardrobe Organization"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "AI Outfit Recommendations"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Weather-Based Styling"
        }
      }
    ]
  }
});

export const generateHowToJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Organize Your Digital Wardrobe with SyncStyle",
  "description": "Step-by-step guide to organizing your wardrobe using SyncStyle's smart features",
  "image": "https://syncstyle.lovable.app/og-image.jpg",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Create Your Account",
      "text": "Sign up for SyncStyle to begin organizing your digital wardrobe"
    },
    {
      "@type": "HowToStep", 
      "name": "Upload Clothing Photos",
      "text": "Take photos of your clothing items and upload them to your digital closet"
    },
    {
      "@type": "HowToStep",
      "name": "Categorize Items",
      "text": "Organize clothes by type, color, season, and occasion for easy browsing"
    },
    {
      "@type": "HowToStep",
      "name": "Create Outfits",
      "text": "Mix and match items to create outfit combinations for different occasions"
    },
    {
      "@type": "HowToStep",
      "name": "Get AI Recommendations", 
      "text": "Use weather-based AI suggestions to choose perfect outfits for any day"
    }
  ]
});