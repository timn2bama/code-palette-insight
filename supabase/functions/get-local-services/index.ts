import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  formatted_phone_number?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, radius = 10000 } = await req.json();
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    console.log('API Key exists:', !!apiKey);
    if (!apiKey) {
      console.error('Google Places API key not found in environment');
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Define all service categories to search
    const serviceCategories = [
      {
        id: 'cleaners',
        name: 'Dry Cleaners',
        icon: '🧼',
        searchTerms: ['dry cleaning', 'laundry service', 'dry cleaner']
      },
      {
        id: 'tailors',
        name: 'Tailors',
        icon: '✂️',
        searchTerms: ['tailor', 'alterations', 'custom tailoring']
      },
      {
        id: 'laundromats',
        name: 'Laundromats',
        icon: '🏪',
        searchTerms: ['laundromat', 'coin laundry', 'self service laundry']
      },
      {
        id: 'seamstresses',
        name: 'Seamstresses',
        icon: '🪡',
        searchTerms: ['seamstress', 'sewing service', 'clothing repair']
      },
      {
        id: 'shoe-repair',
        name: 'Shoe Repair',
        icon: '👟',
        searchTerms: ['shoe repair', 'cobbler', 'shoe service']
      },
      {
        id: 'alterations',
        name: 'Alterations',
        icon: '📏',
        searchTerms: ['alterations', 'clothing alterations', 'hemming service']
      }
    ];

    const servicesByCategory: Record<string, any[]> = {};

    // Search for each service category
    for (const category of serviceCategories) {
      servicesByCategory[category.id] = [];
      
      // Search with multiple terms for better coverage
      for (const term of category.searchTerms) {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(term)}+near+${encodeURIComponent(location)}&radius=${radius}&key=${apiKey}`;
        
        try {
          console.log(`Searching for: ${term} near ${location}`);
          const response = await fetch(searchUrl);
          const data = await response.json();
          
          console.log(`API Response for ${term}:`, {
            status: data.status,
            resultsCount: data.results?.length || 0,
            error: data.error_message
          });

          if (data.error_message) {
            console.error(`Google Places API Error for ${term}:`, data.error_message);
            continue;
          }

          if (data.results && data.results.length > 0) {
            const services = data.results.slice(0, 5).map((place: PlaceResult) => ({
              id: place.place_id,
              name: place.name,
              type: category.id,
              rating: place.rating || 0,
              price: getPriceLevel(place.price_level),
              distance: calculateDistance(location, place.geometry.location),
              address: place.vicinity,
              phone: place.formatted_phone_number || 'N/A',
              services: getServicesForCategory(category.id),
              hours: place.opening_hours?.open_now ? 'Open Now' : 'Hours vary',
              specialties: getSpecialtiesForCategory(category.id),
              isOpen: place.opening_hours?.open_now || false,
            }));
            
            servicesByCategory[category.id].push(...services);
          }
        } catch (error) {
          console.error(`Error searching for ${term}:`, error);
        }
      }

      // Remove duplicates within category and sort by rating
      const uniqueServices = servicesByCategory[category.id].filter((service, index, self) => 
        index === self.findIndex(s => s.id === service.id)
      );
      
      servicesByCategory[category.id] = uniqueServices
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8); // Limit to 8 per category
    }

    // Calculate totals
    const totalServices = Object.values(servicesByCategory).reduce((sum, services) => sum + services.length, 0);
    const allServices = Object.values(servicesByCategory).flat();
    const avgRating = allServices.length > 0 
      ? allServices.reduce((sum, s) => sum + s.rating, 0) / allServices.length 
      : 0;
    const openCount = allServices.filter(s => s.isOpen).length;

    return new Response(
      JSON.stringify({ 
        servicesByCategory,
        categories: serviceCategories,
        stats: {
          total: totalServices,
          avgRating: parseFloat(avgRating.toFixed(1)),
          openCount
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching local services:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch local services' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function determineServiceType(types: string[], searchType: string): string {
  if (types.includes('laundry') || searchType === 'laundry') return 'laundromats';
  if (types.includes('dry_cleaning') || searchType === 'dry_cleaning') return 'cleaners';
  if (types.includes('tailor') || searchType === 'tailor') return 'tailors';
  if (types.includes('shoe_store') || searchType === 'shoe_store') return 'shoe-repair';
  return 'alterations';
}

function getPriceLevel(priceLevel?: number): string {
  if (!priceLevel) return '$$';
  switch (priceLevel) {
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    case 4: return '$$$$';
    default: return '$$';
  }
}

function calculateDistance(location: string, placeLocation: { lat: number; lng: number }): string {
  // For now, return a placeholder distance
  // In a real implementation, you'd geocode the location string and calculate actual distance
  return `${(Math.random() * 2 + 0.1).toFixed(1)} miles`;
}

function getServicesForCategory(categoryId: string): string[] {
  switch (categoryId) {
    case 'cleaners':
      return ['Dry Cleaning', 'Laundry', 'Alterations'];
    case 'tailors':
      return ['Custom Tailoring', 'Alterations', 'Repairs'];
    case 'laundromats':
      return ['Self-service', 'Wash & Fold', 'Drop-off'];
    case 'seamstresses':
      return ['Hemming', 'Repairs', 'Custom work'];
    case 'shoe-repair':
      return ['Sole replacement', 'Heel repair', 'Cleaning'];
    case 'alterations':
      return ['Alterations', 'Repairs', 'Custom work'];
    default:
      return ['General Services'];
  }
}

function getSpecialtiesForCategory(categoryId: string): string[] {
  switch (categoryId) {
    case 'cleaners':
      return ['Delicate fabrics', 'Designer clothing'];
    case 'tailors':
      return ['Suits', 'Formal wear', 'Custom fitting'];
    case 'laundromats':
      return ['Large capacity machines', 'Express service'];
    case 'seamstresses':
      return ['Vintage clothing', 'Delicate repairs'];
    case 'shoe-repair':
      return ['Leather shoes', 'Boot repair', 'Sneaker cleaning'];
    case 'alterations':
      return ['Professional alterations', 'Quick turnaround'];
    default:
      return ['Quality service'];
  }
}