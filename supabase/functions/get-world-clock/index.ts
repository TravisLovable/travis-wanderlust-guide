
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorldClockRequest {
  originTimeZone: string;
  destinationTimeZone: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { originTimeZone, destinationTimeZone }: WorldClockRequest = await req.json()
    
    console.log(`Fetching world clock data for origin: ${originTimeZone}, destination: ${destinationTimeZone}`)
    
    if (!originTimeZone || !destinationTimeZone) {
      return new Response(
        JSON.stringify({ error: 'Both originTimeZone and destinationTimeZone parameters are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current time for both timezones using JavaScript's built-in Intl API
    const now = new Date()
    
    // Format times for each timezone
    const formatTimeForTimezone = (timezone: string) => {
      try {
        const date = new Date()
        
        // Get the time in the specified timezone
        const timeString = date.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        
        const dateString = date.toLocaleDateString('en-US', {
          timeZone: timezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
        
        const fullDateTime = new Date(date.toLocaleString('en-CA', { timeZone: timezone })).toISOString()
        
        return {
          time: timeString,
          date: dateString,
          fullDateTime: fullDateTime
        }
      } catch (error) {
        console.error(`Error formatting time for timezone ${timezone}:`, error)
        // Fallback to UTC if timezone is invalid
        const utcTime = date.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        const utcDate = date.toLocaleDateString('en-US', {
          timeZone: 'UTC',
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
        return {
          time: utcTime,
          date: utcDate,
          fullDateTime: date.toISOString()
        }
      }
    }
    
    const originTime = formatTimeForTimezone(originTimeZone)
    const destinationTime = formatTimeForTimezone(destinationTimeZone)
    
    // Calculate time difference in hours
    const getTimezoneOffset = (timezone: string) => {
      try {
        const date = new Date()
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
        const targetTime = new Date(utc + (0 * 3600000)) // UTC time
        const localTime = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
        const offsetMs = localTime.getTime() - targetTime.getTime()
        return offsetMs / (1000 * 60 * 60) // Convert to hours
      } catch (error) {
        console.error(`Error calculating offset for ${timezone}:`, error)
        return 0
      }
    }
    
    // For a more accurate calculation, we'll use the built-in method
    const originOffset = -new Date().toLocaleString('en-US', { timeZone: originTimeZone, timeZoneName: 'longOffset' }).match(/GMT([+-]\d+)/)?.[1] || 0
    const destOffset = -new Date().toLocaleString('en-US', { timeZone: destinationTimeZone, timeZoneName: 'longOffset' }).match(/GMT([+-]\d+)/)?.[1] || 0
    
    // Simple calculation: get the actual time difference
    const originDate = new Date(new Date().toLocaleString('en-US', { timeZone: originTimeZone }))
    const destDate = new Date(new Date().toLocaleString('en-US', { timeZone: destinationTimeZone }))
    const timeDifferenceHours = (destDate.getTime() - originDate.getTime()) / (1000 * 60 * 60)
    
    const result = {
      origin: {
        timeZone: originTimeZone,
        time: originTime.time,
        date: originTime.date,
        fullDateTime: originTime.fullDateTime,
        isDst: false // We'll keep this simple for now
      },
      destination: {
        timeZone: destinationTimeZone,
        time: destinationTime.time,
        date: destinationTime.date,
        fullDateTime: destinationTime.fullDateTime,
        isDst: false // We'll keep this simple for now
      },
      timeDifferenceHours: Math.round(timeDifferenceHours),
      timeDifferenceText: timeDifferenceHours === 0 
        ? 'Same time zone' 
        : timeDifferenceHours > 0 
          ? `+${Math.abs(Math.round(timeDifferenceHours))}h ahead` 
          : `${Math.abs(Math.round(timeDifferenceHours))}h behind`
    }

    console.log('World clock data fetched successfully:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in get-world-clock function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch world clock data' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
