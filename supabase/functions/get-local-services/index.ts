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
    const { location, serviceType = 'all', radius = 10000 } = await req.json();
    
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
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Map service types to Google Places types
    const serviceTypeMap: Record<string, string[]> = {
      'cleaners': ['laundry', 'dry_cleaning'],
      'tailors': ['clothing_store', 'tailor'],
      'laundromats': ['laundry'],
      'seamstresses': ['tailor', 'clothing_store'],
      'shoe-repair': ['shoe_store'],
      'alterations': ['tailor', 'clothing_store'],
    };

    const searchTypes = serviceType === 'all' 
      ? ['laundry', 'dry_cleaning', 'tailor', 'clothing_store', 'shoe_store']
      : serviceTypeMap[serviceType] || ['laundry'];

    const allServices = [];

    // Search for each service type
    for (const type of searchTypes) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${type}+near+${encodeURIComponent(location)}&radius=${radius}&key=${apiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.results) {
        const services = data.results.map((place: PlaceResult) => ({
          id: place.place_id,
          name: place.name,
          type: determineServiceType(place.types, type),
          rating: place.rating || 0,
          price: getPriceLevel(place.price_level),
          distance: calculateDistance(location, place.geometry.location),
          address: place.vicinity,
          phone: place.formatted_phone_number || 'N/A',
          services: getServicesForType(place.types, type),
          hours: place.opening_hours?.open_now ? 'Open Now' : 'Hours vary',
          specialties: getSpecialtiesForType(place.types, type),
          isOpen: place.opening_hours?.open_now || false,
        }));
        
        allServices.push(...services);
      }
    }

    // Remove duplicates and sort by rating
    const uniqueServices = allServices.filter((service, index, self) => 
      index === self.findIndex(s => s.id === service.id)
    );
    
    uniqueServices.sort((a, b) => b.rating - a.rating);

    return new Response(
      JSON.stringify({ 
        services: uniqueServices.slice(0, 20), // Limit to 20 results
        total: uniqueServices.length 
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

function getServicesForType(types: string[], searchType: string): string[] {
  if (types.includes('laundry') || searchType === 'laundry') {
    return ['Self-service', 'Wash & Fold', 'Drop-off'];
  }
  if (types.includes('dry_cleaning') || searchType === 'dry_cleaning') {
    return ['Dry Cleaning', 'Laundry', 'Alterations'];
  }
  if (types.includes('tailor') || searchType === 'tailor') {
    return ['Custom Tailoring', 'Alterations', 'Repairs'];
  }
  if (types.includes('shoe_store') || searchType === 'shoe_store') {
    return ['Sole replacement', 'Heel repair', 'Cleaning'];
  }
  return ['Alterations', 'Repairs', 'Custom work'];
}

function getSpecialtiesForType(types: string[], searchType: string): string[] {
  if (types.includes('laundry') || searchType === 'laundry') {
    return ['Large capacity machines', 'Express service'];
  }
  if (types.includes('dry_cleaning') || searchType === 'dry_cleaning') {
    return ['Delicate fabrics', 'Designer clothing'];
  }
  if (types.includes('tailor') || searchType === 'tailor') {
    return ['Suits', 'Formal wear', 'Custom fitting'];
  }
  if (types.includes('shoe_store') || searchType === 'shoe_store') {
    return ['Leather shoes', 'Boot repair', 'Sneaker cleaning'];
  }
  return ['Vintage clothing', 'Delicate repairs'];
}