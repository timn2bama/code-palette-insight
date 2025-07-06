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
    const { locations } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

          console.log(`Fetching weather for ${locations.length} locations`);
          console.log(`API Key present: ${apiKey ? 'Yes' : 'No'}`);
          console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);

          // Fetch weather for all locations in parallel
          const weatherPromises = locations.map(async (location: { latitude: number; longitude: number; name?: string }) => {
            try {
              console.log(`Fetching weather for ${location.name}: ${location.latitude}, ${location.longitude}`);
              
              // Fetch current weather
              const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=imperial`;
              console.log(`URL for ${location.name}: ${currentWeatherUrl.replace(apiKey, 'HIDDEN_API_KEY')}`);
              
              const currentResponse = await fetch(currentWeatherUrl);
              console.log(`Response status for ${location.name}: ${currentResponse.status}`);
              
              if (!currentResponse.ok) {
                const errorText = await currentResponse.text();
                console.error(`Failed to fetch current weather for ${location.name || 'location'}:`, currentResponse.status, currentResponse.statusText, errorText);
                throw new Error(`Weather API error: ${currentResponse.status} - ${errorText}`);
              }
        
        const currentData = await currentResponse.json();

        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=imperial`;
        console.log(`Forecast URL for ${location.name}: ${forecastUrl.replace(apiKey, 'HIDDEN_API_KEY')}`);
        
        const forecastResponse = await fetch(forecastUrl);
        console.log(`Forecast response status for ${location.name}: ${forecastResponse.status}`);
        
        if (!forecastResponse.ok) {
          const errorText = await forecastResponse.text();
          console.error(`Failed to fetch forecast for ${location.name || 'location'}:`, forecastResponse.status, forecastResponse.statusText, errorText);
          throw new Error(`Forecast API error: ${forecastResponse.status} - ${errorText}`);
        }
        
        const forecastData = await forecastResponse.json();

        // Process forecast data to get daily forecasts
        const dailyForecasts = [];
        const today = new Date().toDateString();
        
        for (let i = 0; i < forecastData.list.length; i += 8) { // Every 8th item (24 hours)
          const item = forecastData.list[i];
          const date = new Date(item.dt * 1000);
          
          if (date.toDateString() === today) continue; // Skip today
          if (dailyForecasts.length >= 5) break;
          
          dailyForecasts.push({
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0].main,
            icon: getWeatherIcon(item.weather[0].main),
          });
        }

        const weatherIcon = getWeatherIcon(currentData.weather[0].main);

        return {
          location: location.name || currentData.name,
          latitude: location.latitude,
          longitude: location.longitude,
          current: {
            temperature: Math.round(currentData.main.temp),
            condition: currentData.weather[0].main,
            humidity: currentData.main.humidity,
            windSpeed: Math.round(currentData.wind?.speed || 0),
            icon: weatherIcon,
            city: currentData.name,
          },
          forecast: dailyForecasts,
        };
      } catch (error) {
        console.error(`Error fetching weather for ${location.name || 'location'}:`, error);
        return {
          location: location.name || 'Unknown',
          latitude: location.latitude,
          longitude: location.longitude,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(weatherPromises);
    console.log(`Weather data fetched for ${results.length} locations`);

    return new Response(
      JSON.stringify({ locations: results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-weather-multiple function:', error);
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