import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { latitude, longitude } = await req.json();
    const apiKey = Deno.env.get('WEATHERAPI_KEY');
    
    if (!apiKey) {
      console.error('WEATHERAPI_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching weather for coordinates: ${latitude}, ${longitude}`);
    console.log(`API Key present: ${apiKey ? 'Yes' : 'No'}`);
    console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);

    // Fetch current weather and forecast from WeatherAPI.com
    const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=6&aqi=no&alerts=no`;
    console.log(`Weather URL: ${weatherUrl.replace(apiKey, 'HIDDEN_API_KEY')}`);
    
    const weatherResponse = await fetch(weatherUrl);
    console.log(`Weather response status: ${weatherResponse.status}`);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Failed to fetch weather:', weatherResponse.status, weatherResponse.statusText, errorText);
      throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
    }
    
    const weatherData = await weatherResponse.json();

    // Process forecast data to get daily forecasts
    const dailyForecasts = [];
    
    // Skip today and get next 5 days
    for (let i = 1; i < Math.min(weatherData.forecast.forecastday.length, 6); i++) {
      const day = weatherData.forecast.forecastday[i];
      const date = new Date(day.date);
      
      dailyForecasts.push({
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        high: Math.round(day.day.maxtemp_f),
        low: Math.round(day.day.mintemp_f),
        condition: day.day.condition.text,
        icon: getWeatherIcon(day.day.condition.text),
      });
    }

    const result = {
      current: {
        temperature: Math.round(weatherData.current.temp_f),
        condition: weatherData.current.condition.text,
        humidity: weatherData.current.humidity,
        windSpeed: Math.round(weatherData.current.wind_mph),
        icon: getWeatherIcon(weatherData.current.condition.text),
        city: weatherData.location.name,
      },
      forecast: dailyForecasts,
    };

    console.log('Weather data fetched successfully:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
  };
  
  return iconMap[condition] || '🌤️';
}