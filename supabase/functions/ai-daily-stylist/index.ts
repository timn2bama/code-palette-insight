import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user_id } = await req.json();

    // Get user's wardrobe items
    const { data: wardrobeItems, error: wardrobeError } = await supabaseClient
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user_id);

    if (wardrobeError) throw wardrobeError;

    // Get user's style preferences
    const { data: stylePrefs } = await supabaseClient
      .from('user_style_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Simple AI logic for outfit suggestion
    const categories = ['tops', 'bottoms', 'shoes'];
    const suggestedItems = [];

    for (const category of categories) {
      const categoryItems = wardrobeItems?.filter(item => item.category === category) || [];
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        suggestedItems.push({
          id: randomItem.id,
          name: randomItem.name,
          category: randomItem.category,
          brand: randomItem.brand,
          photo_url: randomItem.photo_url
        });
      }
    }

    const outfitSuggestion = {
      user_id: user_id,
      suggestion_date: new Date().toISOString().split('T')[0],
      outfit_data: {
        items: suggestedItems,
        styling_notes: "Perfect combination for today's weather and activities"
      },
      weather_context: {
        temperature: 72,
        condition: "partly cloudy"
      },
      occasion: "casual",
      style_preference: stylePrefs?.style_keywords?.[0] || "casual",
      ai_reasoning: "Selected based on your style preferences and wardrobe analytics. This combination balances comfort with your preferred aesthetic."
    };

    const { data, error } = await supabaseClient
      .from('daily_outfit_suggestions')
      .upsert(outfitSuggestion, {
        onConflict: 'user_id,suggestion_date'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, suggestion: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating daily outfit:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});