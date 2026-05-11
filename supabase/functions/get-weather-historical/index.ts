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
        const { latitude, longitude, location, dateRanges } = body

        if (!location && (!latitude || !longitude)) {
            throw new Error('Either location or coordinates required')
        }

        if (!dateRanges || dateRanges.length === 0) {
            throw new Error('At least one date range is required')
        }

        const apiKey = Deno.env.get('WEATHERAPI_KEY') ?? ''
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'WEATHERAPI_KEY not configured' }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        let queryParam: string
        if (latitude != null && longitude != null && (latitude !== 0 || longitude !== 0)) {
            queryParam = `${latitude},${longitude}`
        } else {
            queryParam = encodeURIComponent(location)
        }

        const allDays: { date: string; high: number; low: number; condition: string }[] = []

        for (const range of dateRanges) {
            const url = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${queryParam}&dt=${range.start}&end_dt=${range.end}`
            console.log(`Fetching historical weather: ${range.start} to ${range.end}`)

            const response = await fetch(url)
            if (!response.ok) {
                console.error(`History API error: ${response.status} for range ${range.start}-${range.end}`)
                continue
            }

            const data = await response.json()
            const forecastDays = data.forecast?.forecastday || []

            for (const day of forecastDays) {
                allDays.push({
                    date: day.date,
                    high: Math.round(day.day?.maxtemp_c ?? 0),
                    low: Math.round(day.day?.mintemp_c ?? 0),
                    condition: day.day?.condition?.text || 'Unknown',
                })
            }
        }

        if (allDays.length === 0) {
            throw new Error('No historical data returned')
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']

        const byMonth: { [key: string]: typeof allDays } = {}
        for (const day of allDays) {
            const monthIdx = new Date(day.date + 'T12:00:00').getMonth()
            const monthName = monthNames[monthIdx]
            if (!byMonth[monthName]) byMonth[monthName] = []
            byMonth[monthName].push(day)
        }

        const deriveConditionLabel = (conditions: string[]): string => {
            const lower = conditions.map(c => c.toLowerCase())
            const total = lower.length
            if (total === 0) return 'Mixed conditions'
            const sunny = lower.filter(c => c.includes('sun') || c.includes('clear')).length
            const rainy = lower.filter(c => c.includes('rain') || c.includes('drizzle') || c.includes('shower')).length
            const snowy = lower.filter(c => c.includes('snow') || c.includes('sleet') || c.includes('blizzard')).length
            const sunnyPct = sunny / total
            const rainyPct = rainy / total
            if (sunnyPct >= 0.6) return 'Usually sunny'
            if (sunnyPct >= 0.4 && rainyPct < 0.2) return 'Mostly sunny'
            if (rainyPct >= 0.5) return 'Usually rainy'
            if (rainyPct >= 0.3) return 'Occasional rain'
            if (snowy / total >= 0.3) return 'Occasional snow'
            if (sunnyPct >= 0.3 && rainyPct >= 0.2) return 'Mixed sun and rain'
            return 'Mixed conditions'
        }

        const monthSummaries = []
        for (const [monthName, days] of Object.entries(byMonth)) {
            const highs = days.map(d => d.high)
            const lows = days.map(d => d.low)
            const conditions = days.map(d => d.condition)
            monthSummaries.push({
                month: monthName,
                avgHigh: Math.round(highs.reduce((a, b) => a + b, 0) / highs.length),
                avgLow: Math.round(lows.reduce((a, b) => a + b, 0) / lows.length),
                highRange: { min: Math.min(...highs), max: Math.max(...highs) },
                lowRange: { min: Math.min(...lows), max: Math.max(...lows) },
                conditionLabel: deriveConditionLabel(conditions),
                days,
            })
        }

        const allHighs = allDays.map(d => d.high)
        const allLows = allDays.map(d => d.low)
        const allConditions = allDays.map(d => d.condition)

        const result = {
            overall: {
                avgHigh: Math.round(allHighs.reduce((a, b) => a + b, 0) / allHighs.length),
                avgLow: Math.round(allLows.reduce((a, b) => a + b, 0) / allLows.length),
                highRange: { min: Math.min(...allHighs), max: Math.max(...allHighs) },
                lowRange: { min: Math.min(...allLows), max: Math.max(...allLows) },
                conditionLabel: deriveConditionLabel(allConditions),
                totalDays: allDays.length,
            },
            months: monthSummaries,
            days: allDays,
        }

        console.log(`Historical weather: ${allDays.length} days across ${monthSummaries.length} month(s)`)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Historical weather error:', error)
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to fetch historical weather',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
