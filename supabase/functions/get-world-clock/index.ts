
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

    // Get current time
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
          hour12: false // Use 24-hour format for consistency
        })
        
        const dateString = date.toLocaleDateString('en-US', {
          timeZone: timezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
        
        // Get timezone abbreviation
        const getTimezoneAbbr = (tz: string) => {
          if (tz === 'America/Chicago') return 'CST'
          if (tz === 'America/Lima') return 'PET'
          if (tz === 'America/New_York') return 'EST'
          if (tz === 'America/Los_Angeles') return 'PST'
          if (tz === 'Europe/London') return 'GMT'
          if (tz === 'Asia/Tokyo') return 'JST'
          if (tz === 'America/Sao_Paulo') return 'BRT'
          // Default to extracting from timezone string
          return tz.split('/')[1] || 'UTC'
        }
        
        return {
          time: timeString,
          date: dateString,
          timezone: getTimezoneAbbr(timezone),
          fullDateTime: new Date(date.toLocaleString('en-US', { timeZone: timezone })).toISOString()
        }
      } catch (error) {
        console.error(`Error formatting time for timezone ${timezone}:`, error)
        // Fallback to UTC if timezone is invalid
        const utcTime = date.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
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
          timezone: 'UTC',
          fullDateTime: date.toISOString()
        }
      }
    }
    
    const originTime = formatTimeForTimezone(originTimeZone)
    const destinationTime = formatTimeForTimezone(destinationTimeZone)
    
    // Calculate time difference more accurately
    const getTimezoneOffsetMinutes = (timezone: string) => {
      try {
        const date = new Date()
        const utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
        const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
        return Math.round((local.getTime() - utc.getTime()) / (1000 * 60))
      } catch (error) {
        return 0
      }
    }
    
    const originOffsetMin = getTimezoneOffsetMinutes(originTimeZone)
    const destOffsetMin = getTimezoneOffsetMinutes(destinationTimeZone)
    const diffMinutes = destOffsetMin - originOffsetMin
    const diffHours = diffMinutes / 60
    
    const result = {
      origin: {
        timeZone: originTimeZone,
        time: originTime.time,
        date: originTime.date,
        timezone: originTime.timezone,
        fullDateTime: originTime.fullDateTime,
        isDst: false // We'll keep this simple for now
      },
      destination: {
        timeZone: destinationTimeZone,
        time: destinationTime.time,
        date: destinationTime.date,
        timezone: destinationTime.timezone,
        fullDateTime: destinationTime.fullDateTime,
        isDst: false // We'll keep this simple for now
      },
      timeDifferenceHours: Math.round(diffHours),
      timeDifferenceText: diffHours === 0 
        ? 'Same time zone' 
        : diffHours > 0 
          ? `+${Math.abs(Math.round(diffHours))}h ahead` 
          : `${Math.abs(Math.round(diffHours))}h behind`
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
