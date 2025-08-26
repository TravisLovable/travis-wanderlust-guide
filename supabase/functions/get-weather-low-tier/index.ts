import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Get the request body
    let location: string = ''
    let latitude: number | null = null
    let longitude: number | null = null
    let days: number = 7

    try {
        const body = await req.json()
        location = body.location || ''
        latitude = body.latitude || null
        longitude = body.longitude || null
        days = body.days || 7

        if (!location && (!latitude || !longitude)) {
            throw new Error('Either location or coordinates (latitude/longitude) are required')
        }

        console.log(`🌤️ Weather request for: ${location || `${latitude},${longitude}`}, days: ${days}`)

        const apiKey = Deno.env.get('WEATHERAPI_KEY') || 'demo_key'
        const baseUrl = 'http://api.weatherapi.com/v1'

        // Build query parameter - WeatherAPI supports both coordinates and location names
        let queryParam: string
        if (latitude && longitude) {
            queryParam = `${latitude},${longitude}`
            console.log(`🎯 Using coordinates: ${latitude}, ${longitude}`)
        } else {
            queryParam = encodeURIComponent(location)
            console.log(`📍 Using location name: ${location}`)
        }

        // WeatherAPI.com has a single endpoint for current + forecast
        const weatherUrl = `${baseUrl}/forecast.json?key=${apiKey}&q=${queryParam}&days=${Math.min(days, 10)}&aqi=no&alerts=no`
        console.log('🌐 WeatherAPI URL:', weatherUrl)

        const weatherResponse = await fetch(weatherUrl)
        if (!weatherResponse.ok) {
            throw new Error(`WeatherAPI error: ${weatherResponse.status}`)
        }

        const weatherData = await weatherResponse.json()
        console.log('📊 WeatherAPI response received, processing...')

        // Process current weather from WeatherAPI response
        const current = {
            temp: Math.round(weatherData.current.temp_c || 0),
            condition: weatherData.current.condition.text || 'Unknown',
            humidity: weatherData.current.humidity || 0,
            feels_like: Math.round(weatherData.current.feelslike_c || 0),
            wind_speed: Math.round(weatherData.current.wind_kph || 0),
            pressure: Math.round(weatherData.current.pressure_mb || 0)
        }

        // Process forecast data - WeatherAPI provides clean daily forecasts
        const forecast = weatherData.forecast.forecastday.map((day: any, index: number) => {
            const date = new Date(day.date)
            const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })

            // Safely handle potentially null/undefined temperature values
            const avgTemp = day.day?.avgtemp_c ?? day.day?.maxtemp_c ?? 20;
            const maxTemp = day.day?.maxtemp_c ?? avgTemp + 2;
            const minTemp = day.day?.mintemp_c ?? avgTemp - 2;

            return {
                date: day.date || new Date().toISOString().split('T')[0],
                day: dayName,
                temp: Math.round(avgTemp),
                high: Math.round(maxTemp),
                low: Math.round(minTemp),
                condition: day.day?.condition?.text || 'Partly Cloudy',
                icon: day.day?.condition?.icon ?
                    (day.day.condition.icon.startsWith('//') ? day.day.condition.icon : `//${day.day.condition.icon}`) :
                    '//cdn.weatherapi.com/weather/64x64/day/116.png'
            }
        }).slice(0, days)

        const processedWeatherData = {
            current,
            forecast,
            location: weatherData.location?.name || location || 'Unknown Location',
            country: weatherData.location?.country || 'Unknown',
            coordinates: {
                lat: weatherData.location?.lat || latitude || 0,
                lon: weatherData.location?.lon || longitude || 0
            }
        }

        console.log('✅ Weather data processed successfully:', processedWeatherData)

        return new Response(
            JSON.stringify(processedWeatherData),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )

    } catch (error) {
        console.error('❌ Weather function error:', error)

        // Return fallback data if API fails
        const fallbackData = {
            current: {
                temp: 22,
                condition: 'Partly Cloudy',
                humidity: 65,
                feels_like: 24,
                wind_speed: 12,
                pressure: 1013
            },
            forecast: Array.from({ length: Math.min(days || 7, 7) }, (_, i) => {
                const futureDate = new Date()
                futureDate.setDate(futureDate.getDate() + i)
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                return {
                    date: futureDate.toISOString().split('T')[0],
                    day: i === 0 ? 'Today' : dayNames[futureDate.getDay()],
                    temp: 22 + Math.floor(Math.random() * 10) - 5,
                    high: 25 + Math.floor(Math.random() * 8) - 4,
                    low: 18 + Math.floor(Math.random() * 8) - 4,
                    condition: 'Partly Cloudy',
                    icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
                }
            }),
            location: location || 'Unknown Location',
            country: 'Unknown',
            coordinates: { lat: 0, lon: 0 }
        }

        return new Response(
            JSON.stringify(fallbackData),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )
    }
})


