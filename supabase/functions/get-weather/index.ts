import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon, city } = await req.json()
    
    // Get weather API key from Supabase secrets
    const apiKey = Deno.env.get('WEATHER_API_KEY')
    
    if (!apiKey) {
      throw new Error('Weather API key not configured')
    }

    // Fetch current weather and 5-day forecast from OpenWeatherMap
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`)
    ])

    const currentWeather = await currentResponse.json()
    const forecastData = await forecastResponse.json()

    // Process forecast data to get daily summaries
    const dailyForecasts = []
    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday']
    
    // Group forecast by day (OpenWeatherMap gives 3-hour intervals)
    for (let i = 0; i < 5; i++) {
      const dayData = forecastData.list.slice(i * 8, (i + 1) * 8) // 8 intervals per day
      if (dayData.length > 0) {
        const temps = dayData.map(item => item.main.temp)
        const conditions = dayData.map(item => item.weather[0].main)
        const mostFrequentCondition = conditions.sort((a,b) =>
          conditions.filter(v => v===a).length - conditions.filter(v => v===b).length
        ).pop()

        dailyForecasts.push({
          day: days[i] || new Date(dayData[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
          high: Math.round(Math.max(...temps)),
          low: Math.round(Math.min(...temps)),
          condition: mostFrequentCondition,
          icon: getWeatherIcon(mostFrequentCondition)
        })
      }
    }

    const result = {
      current: {
        temperature: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].main,
        humidity: currentWeather.main.humidity,
        windSpeed: Math.round(currentWeather.wind.speed),
        icon: getWeatherIcon(currentWeather.weather[0].main),
        city: city
      },
      forecast: dailyForecasts
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Partly Cloudy': '🌤️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  }
  
  return iconMap[condition] || '🌤️'
}