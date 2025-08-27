import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Smart outfit AI function called');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User error:', userError);
      throw new Error('Invalid user');
    }

    console.log('User authenticated:', user.id);

    const { location, preferences } = await req.json();
    console.log('Request data:', { location, preferences });

    // Get weather data
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured');
    }

    console.log('Fetching weather for location:', location);
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${weatherApiKey}&units=imperial`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await weatherResponse.json();
    console.log('Weather data fetched:', {
      temp: weatherData.main.temp,
      condition: weatherData.weather[0].description,
      humidity: weatherData.main.humidity
    });

    // Get user's wardrobe items
    console.log('Fetching wardrobe items for user:', user.id);
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from('wardrobe_items')
      .select('id, name, category, color, brand, photo_url')
      .eq('user_id', user.id);

    if (wardrobeError) {
      console.error('Wardrobe error:', wardrobeError);
      throw new Error('Failed to fetch wardrobe items');
    }

    console.log('Wardrobe items fetched:', wardrobeItems?.length || 0, 'items');

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(JSON.stringify({
        suggestions: [],
        message: "No wardrobe items found. Please add some clothes to your wardrobe first!"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare wardrobe summary for AI
    const wardrobeSummary = wardrobeItems.map(item => 
      `${item.name} (${item.category}${item.color ? `, ${item.color}` : ''}${item.brand ? `, ${item.brand}` : ''})`
    ).join('\n');

    // Create AI prompt
    const aiPrompt = `You are a professional stylist AI. Based on the current weather and the user's wardrobe, suggest 3 complete outfit combinations.

WEATHER CONDITIONS:
- Temperature: ${weatherData.main.temp}°F
- Condition: ${weatherData.weather[0].description}
- Humidity: ${weatherData.main.humidity}%
- Feels like: ${weatherData.main.feels_like}°F

USER'S WARDROBE:
${wardrobeSummary}

USER PREFERENCES: ${preferences || 'No specific preferences mentioned'}

Please suggest 3 complete outfits that:
1. Are appropriate for the weather conditions
2. Use only items from the user's wardrobe
3. Consider style, comfort, and practicality
4. Include items from different categories (tops, bottoms, shoes, outerwear if needed)

For each outfit, provide:
- A catchy outfit name
- List of specific items from their wardrobe
- Brief explanation of why this outfit works for today's weather
- Style notes or tips

Format your response as a JSON array with this structure:
[
  {
    "name": "Outfit Name",
    "items": ["item name 1", "item name 2", "item name 3"],
    "reason": "Why this outfit works for the weather",
    "styleNotes": "Additional styling tips",
    "occasion": "work/casual/formal",
    "weatherScore": 95
  }
]

Only suggest outfits using items that actually exist in their wardrobe. Be creative but practical.`;

    console.log('Sending request to OpenAI...');
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fashion stylist with expertise in weather-appropriate dressing. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_completion_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received');
    
    let aiSuggestions;
    try {
      const content = openAIData.choices[0].message.content;
      const parsed = JSON.parse(content);
      // Handle both array format and object with array property
      aiSuggestions = Array.isArray(parsed) ? parsed : (parsed.outfits || parsed.suggestions || []);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI suggestions');
    }

    // Match AI suggestions with actual wardrobe items
    const enhancedSuggestions = aiSuggestions.map((suggestion: any, index: number) => {
      const matchedItems = suggestion.items?.map((itemName: string) => {
        // Find matching wardrobe item (flexible matching)
        const match = wardrobeItems.find(item => 
          item.name.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(item.name.toLowerCase())
        );
        return match;
      }).filter(Boolean) || [];

      return {
        id: `ai-suggestion-${index + 1}`,
        name: suggestion.name || `AI Outfit ${index + 1}`,
        items: matchedItems,
        suggestedItems: suggestion.items || [],
        reason: suggestion.reason || 'Perfect for today\'s weather',
        styleNotes: suggestion.styleNotes || '',
        occasion: suggestion.occasion || 'casual',
        weatherScore: suggestion.weatherScore || 90,
        aiGenerated: true
      };
    });

    const result = {
      suggestions: enhancedSuggestions,
      weather: {
        temperature: weatherData.main.temp,
        condition: weatherData.weather[0].description,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        location: weatherData.name
      },
      wardrobeItemsCount: wardrobeItems.length
    };

    console.log('Returning suggestions:', enhancedSuggestions.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in smart-outfit-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [],
      message: 'Failed to generate outfit suggestions. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});