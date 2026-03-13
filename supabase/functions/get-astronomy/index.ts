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
        const body = await req.json()
        const { latitude, longitude, location, date } = body

        if (!location && (!latitude || !longitude)) {
            throw new Error('Either location or coordinates (latitude/longitude) are required')
        }

        const apiKey = Deno.env.get('WEATHERAPI_KEY') ?? ''
        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error: 'Weather API key not configured',
                    message: 'Set WEATHERAPI_KEY in Supabase Dashboard → Edge Functions → Secrets',
                }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Build query param
        let queryParam: string
        if (latitude != null && longitude != null) {
            queryParam = `${latitude},${longitude}`
        } else {
            queryParam = encodeURIComponent(location)
        }

        // Date defaults to today if not provided
        const dt = date || new Date().toISOString().split('T')[0]

        const url = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${queryParam}&dt=${dt}`
        console.log('🌅 Astronomy API request:', url)

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`WeatherAPI astronomy error: ${response.status}`)
        }

        const data = await response.json()
        console.log('🌅 Astronomy data received')

        const astro = data.astronomy?.astro
        if (!astro) {
            throw new Error('No astronomy data in response')
        }

        // Parse time strings like "06:12 AM" into decimal hours
        const parseTimeToDecimal = (timeStr: string): number => {
            const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (!match) return 12
            let h = parseInt(match[1])
            const m = parseInt(match[2])
            const period = match[3].toUpperCase()
            if (period === 'PM' && h !== 12) h += 12
            if (period === 'AM' && h === 12) h = 0
            return h + m / 60
        }

        const result = {
            sunrise: astro.sunrise,
            sunset: astro.sunset,
            moonrise: astro.moonrise,
            moonset: astro.moonset,
            moonPhase: astro.moon_phase,
            moonIllumination: astro.moon_illumination,
            isSunUp: astro.is_sun_up,
            isMoonUp: astro.is_moon_up,
            sunriseHour: parseTimeToDecimal(astro.sunrise),
            sunsetHour: parseTimeToDecimal(astro.sunset),
            location: data.location?.name || location || 'Unknown',
            country: data.location?.country || 'Unknown',
            localtime: data.location?.localtime || null,
            timezone: data.location?.tz_id || null,
        }

        console.log('✅ Astronomy data processed:', result)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('❌ Astronomy function error:', error)

        // Fallback with reasonable defaults
        return new Response(
            JSON.stringify({
                sunrise: '6:12 AM',
                sunset: '6:34 PM',
                moonrise: '10:00 PM',
                moonset: '8:00 AM',
                moonPhase: 'Waxing Crescent',
                moonIllumination: 25,
                sunriseHour: 6.2,
                sunsetHour: 18.567,
                location: 'Unknown',
                country: 'Unknown',
                localtime: null,
                timezone: null,
                error: error instanceof Error ? error.message : 'Failed to fetch astronomy data',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
