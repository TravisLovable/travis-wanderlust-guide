
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
      let date;
      try {
        date = new Date()

        // Get 12-hour time format
        const time12 = date.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

        // Get 24-hour time format (military time)
        const time24 = date.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })

        const dateString = date.toLocaleDateString('en-US', {
          timeZone: timezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })

        // Get timezone abbreviation based on timezone
        const getTimezoneAbbr = (tz: string) => {
          const abbreviations: { [key: string]: string } = {
            'America/Chicago': 'CST',
            'America/Lima': 'PET',
            'America/New_York': 'EST',
            'America/Los_Angeles': 'PST',
            'America/Sao_Paulo': 'BRT',
            'America/Argentina/Buenos_Aires': 'ART',
            'America/Santiago': 'CLT',
            'America/Bogota': 'COT',
            'America/Mexico_City': 'CST',
            'Europe/London': 'GMT',
            'Europe/Paris': 'CET',
            'Asia/Tokyo': 'JST',
            'Asia/Makassar': 'WITA',
            'Africa/Johannesburg': 'SAST',
            'UTC': 'UTC'
          }

          return abbreviations[tz] || tz.split('/')[1]?.toUpperCase() || 'UTC'
        }

        return {
          timeZone: timezone,
          time: time24, // 24-hour format
          time12: time12, // 12-hour format 
          date: dateString,
          abbreviation: getTimezoneAbbr(timezone),
          fullDateTime: new Date(date.toLocaleString('en-US', { timeZone: timezone })).toISOString(),
          isDst: false
        }
      } catch (error) {
        console.error(`Error formatting time for timezone ${timezone}:`, error)
        // Fallback to UTC if timezone is invalid
        const utcTime24 = date.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        const utcTime12 = date.toLocaleTimeString('en-US', {
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
          timeZone: 'UTC',
          time: utcTime24,
          time12: utcTime12,
          date: utcDate,
          abbreviation: 'UTC',
          fullDateTime: date.toISOString(),
          isDst: false
        }
      }
    }

    const originTime = formatTimeForTimezone(originTimeZone)
    const destinationTime = formatTimeForTimezone(destinationTimeZone)

    // Calculate time difference using proper timezone offset calculation
    const getTimezoneOffsetHours = (timezone: string) => {
      try {
        const now = new Date()

        // Create a date formatter for the timezone
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })

        // Get the formatted date parts
        const parts = formatter.formatToParts(now)
        const tzDateStr = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}T${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`

        // Calculate offset in hours
        const utcTime = now.getTime()
        const tzTime = new Date(tzDateStr).getTime()
        const offsetMs = tzTime - utcTime
        const offsetHours = offsetMs / (1000 * 60 * 60)

        return offsetHours
      } catch (error) {
        console.error(`Error calculating offset for ${timezone}:`, error)
        // Fallback to standard timezone offset calculation
        const date = new Date()
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
        const diffMs = tzDate.getTime() - utcDate.getTime()
        return diffMs / (1000 * 60 * 60)
      }
    }

    const originOffsetHours = getTimezoneOffsetHours(originTimeZone)
    const destOffsetHours = getTimezoneOffsetHours(destinationTimeZone)
    const diffHours = destOffsetHours - originOffsetHours

    console.log(`Origin offset: ${originOffsetHours}h, Destination offset: ${destOffsetHours}h, Difference: ${diffHours}h`)

    const result = {
      origin: originTime,
      destination: destinationTime,
      timeDifferenceHours: Math.round(diffHours),
      timeDifferenceText: diffHours === 0
        ? 'Same time'
        : diffHours > 0
          ? `${Math.abs(Math.round(diffHours))}h ahead`
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
