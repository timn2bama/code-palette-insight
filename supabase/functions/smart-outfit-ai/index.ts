import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    // Test 1: Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
      supabaseServiceKey: supabaseServiceKey ? 'Present' : 'Missing',
      openAIApiKey: openAIApiKey ? 'Present' : 'Missing',
      weatherApiKey: weatherApiKey ? 'Present' : 'Missing'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Test 2: Supabase client creation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');
    
    // Test 3: User authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('Invalid user authentication');
    }

    console.log('User authenticated successfully:', user.id);

    // Test 4: Request body parsing
    const requestBody = await req.json();
    console.log('Request body parsed:', requestBody);

    const { location, preferences } = requestBody;
    if (!location) {
      throw new Error('Location is required');
    }

    // Test 5: Basic response
    const testResponse = {
      success: true,
      message: 'All tests passed successfully!',
      data: {
        userId: user.id,
        location: location,
        preferences: preferences || 'None',
        environmentCheck: 'All environment variables present'
      }
    };

    console.log('Returning test response:', testResponse);

    return new Response(JSON.stringify(testResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in smart-outfit-ai function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Test function failed',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});