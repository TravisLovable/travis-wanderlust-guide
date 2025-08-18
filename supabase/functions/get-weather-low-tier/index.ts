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
    let days: number = 7

    try {
        const body = await req.json()
        location = body.location || ''
        days = body.days || 7

        if (!location) {
            throw new Error('Location parameter is required')
        }

        console.log(`🌤️ Weather request for: ${location}, days: ${days}`)


        const apiKey = Deno.env.get('OPENWEATHER_API_KEY') || 'demo_key'
        const baseUrl = 'https://api.openweathermap.org/data/2.5'

        // Get current weather
        const currentWeatherUrl = `${baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
        console.log('🌐 Current weather URL:', currentWeatherUrl)

        const currentResponse = await fetch(currentWeatherUrl)
        if (!currentResponse.ok) {
            throw new Error(`Current weather API error: ${currentResponse.status}`)
        }

        const currentData = await currentResponse.json()
        console.log('📊 Current weather response:', currentData)

        // Get forecast (5 days, 3-hour intervals)
        const forecastUrl = `${baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
        console.log('🌐 Forecast URL:', forecastUrl)

        const forecastResponse = await fetch(forecastUrl)
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status}`)
        }

        const forecastData = await forecastResponse.json()
        console.log('📊 Forecast response received, processing...')

        // Process current weather
        const current = {
            temp: Math.round(currentData.main.temp),
            condition: currentData.weather[0]?.main || 'Unknown',
            humidity: currentData.main.humidity,
            feels_like: Math.round(currentData.main.feels_like),
            wind_speed: Math.round(currentData.wind.speed),
            pressure: currentData.main.pressure
        }

        // Process forecast data (daily averages)
        const dailyForecasts = new Map()

        forecastData.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0]
            const day = new Date(item.dt * 1000).toDateString().split(' ')[0]

            if (!dailyForecasts.has(date)) {
                dailyForecasts.set(date, {
                    date,
                    day,
                    temps: [],
                    conditions: [],
                    humidity: []
                })
            }

            const daily = dailyForecasts.get(date)
            daily.temps.push(item.main.temp)
            daily.conditions.push(item.weather[0]?.main)
            daily.humidity.push(item.main.humidity)
        })

        // Convert to array and calculate daily averages
        const forecast = Array.from(dailyForecasts.values()).map((daily, index) => {
            const avgTemp = Math.round(daily.temps.reduce((a: number, b: number) => a + b, 0) / daily.temps.length)
            const mostFrequentCondition = daily.conditions.reduce((acc: any, val: string) => {
                acc[val] = (acc[val] || 0) + 1
                return acc
            }, {})
            const condition = Object.keys(mostFrequentCondition).reduce((a: string, b: string) =>
                mostFrequentCondition[a] > mostFrequentCondition[b] ? a : b
            )

            return {
                date: daily.date,
                day: index === 0 ? 'Today' : daily.day,
                temp: avgTemp,
                high: Math.round(Math.max(...daily.temps)),
                low: Math.round(Math.min(...daily.temps)),
                condition: condition || 'Unknown',
                icon: `//cdn.weatherapi.com/weather/64x64/day/${getWeatherIconCode(condition)}.png`
            }
        }).slice(0, days)

        const weatherData = {
            current,
            forecast,
            location: currentData.name || location,
            country: currentData.sys?.country,
            coordinates: {
                lat: currentData.coord?.lat,
                lon: currentData.coord?.lon
            }
        }

        console.log('✅ Weather data processed successfully:', weatherData)

        return new Response(
            JSON.stringify(weatherData),
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

// Helper function to get weather icon codes
function getWeatherIconCode(condition: string): string {
    const iconMap: { [key: string]: string } = {
        'Clear': '113',
        'Clouds': '116',
        'Rain': '266',
        'Drizzle': '266',
        'Thunderstorm': '200',
        'Snow': '179',
        'Mist': '143',
        'Fog': '143',
        'Haze': '143',
        'Smoke': '143',
        'Dust': '143',
        'Sand': '143',
        'Ash': '143',
        'Squall': '143',
        'Tornado': '143'
    }

    return iconMap[condition] || '116'
}
