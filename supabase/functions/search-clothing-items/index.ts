import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClothingSearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: string;
  displayLink: string;
  formattedUrl: string;
}

interface SearchResponse {
  items?: ClothingSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_CSE_API_KEY');
    const engineId = Deno.env.get('GOOGLE_CSE_ENGINE_ID');

    if (!apiKey || !engineId) {
      return new Response(
        JSON.stringify({ error: 'Google Custom Search configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced search query for clothing items
    const searchQuery = `${query} clothing fashion apparel`;
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('cx', engineId);
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('num', '8'); // Limit to 8 results
    searchUrl.searchParams.set('searchType', 'image'); // Search for images
    searchUrl.searchParams.set('imgType', 'photo');
    searchUrl.searchParams.set('imgSize', 'medium');
    searchUrl.searchParams.set('safe', 'active');

    console.log('Making Google Custom Search request:', searchUrl.toString());

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      console.error('Google Custom Search error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Search service unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data: SearchResponse = await response.json();
    
    // Process and format the results
    const formattedResults = data.items?.map(item => {
      // Extract potential clothing details from title and snippet
      const title = item.title || '';
      const snippet = item.snippet || '';
      
      // Try to extract brand, color, and category from the text
      const extractedInfo = extractClothingInfo(title + ' ' + snippet);
      
      return {
        id: item.link || item.formattedUrl,
        title: title.slice(0, 100), // Limit title length
        snippet: snippet.slice(0, 200), // Limit snippet length
        image: item.link, // This will be the image URL for image search
        source: item.displayLink,
        url: item.formattedUrl,
        ...extractedInfo
      };
    }) || [];

    console.log(`Found ${formattedResults.length} clothing items for query: ${query}`);

    return new Response(
      JSON.stringify({
        results: formattedResults,
        totalResults: data.searchInformation?.totalResults || '0',
        searchTime: data.searchInformation?.searchTime || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in search-clothing-items function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function extractClothingInfo(text: string) {
  const lowerText = text.toLowerCase();
  
  // Common clothing categories
  const categories = {
    'tops': ['shirt', 'blouse', 'top', 'tee', 't-shirt', 'tank', 'sweater', 'hoodie', 'cardigan'],
    'bottoms': ['pants', 'jeans', 'trousers', 'shorts', 'leggings', 'skirt'],
    'dresses': ['dress', 'gown', 'frock'],
    'outerwear': ['jacket', 'coat', 'blazer', 'vest', 'windbreaker'],
    'shoes': ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats'],
    'accessories': ['bag', 'purse', 'belt', 'hat', 'scarf', 'jewelry', 'watch']
  };

  // Common colors
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown', 'gray', 'grey', 'navy', 'beige', 'khaki'];

  // Common brands (basic set)
  const brands = ['nike', 'adidas', 'zara', 'h&m', 'uniqlo', 'gap', 'levi', 'calvin klein', 'tommy', 'polo', 'guess'];

  let detectedCategory = '';
  let detectedColor = '';
  let detectedBrand = '';

  // Detect category
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detectedCategory = category;
      break;
    }
  }

  // Detect color
  for (const color of colors) {
    if (lowerText.includes(color)) {
      detectedColor = color;
      break;
    }
  }

  // Detect brand
  for (const brand of brands) {
    if (lowerText.includes(brand)) {
      detectedBrand = brand;
      break;
    }
  }

  return {
    suggestedCategory: detectedCategory,
    suggestedColor: detectedColor,
    suggestedBrand: detectedBrand
  };
}