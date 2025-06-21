
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { location } = await req.json()
    console.log(`Fetching weather data for: ${location}`)

    if (!location) {
      throw new Error('Location is required')
    }

    const weatherApiKey = Deno.env.get('GET_WEATHER_LOW_TIER')
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured')
    }

    // Call WeatherAPI to get current weather and forecast
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(location)}&days=7&aqi=no&alerts=no`
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match our expected format
    const weatherData = {
      current: {
        temp: data.current.temp_c,
        condition: data.current.condition.text,
        humidity: data.current.humidity,
      },
      forecast: data.forecast.forecastday.map((day: any, index: number) => {
        const date = new Date(day.date)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        return {
          date: day.date,
          day: index === 0 ? 'Today' : dayNames[date.getDay()],
          high: Math.round(day.day.maxtemp_c),
          low: Math.round(day.day.mintemp_c),
          condition: day.day.condition.text,
          icon: day.day.condition.icon,
        }
      }),
      location: data.location.name + ', ' + data.location.country,
    }

    console.log('Weather data fetched successfully:', weatherData)

    return new Response(
      JSON.stringify(weatherData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
