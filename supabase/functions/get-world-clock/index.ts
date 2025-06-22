
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorldClockRequest {
  originTimeZone: string;
  destinationTimeZone: string;
}

interface TimeApiResponse {
  utc_datetime: string;
  timezone: string;
  datetime: string;
  dst: boolean;
  dst_offset: number;
  utc_offset: string;
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

    const apiKey = Deno.env.get('TIME_DATE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Time and Date API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current time for both timezones
    const [originResponse, destinationResponse] = await Promise.all([
      fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=${encodeURIComponent(originTimeZone)}`),
      fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=${encodeURIComponent(destinationTimeZone)}`)
    ])

    if (!originResponse.ok || !destinationResponse.ok) {
      throw new Error('Failed to fetch timezone data from TimeZoneDB API')
    }

    const originData = await originResponse.json()
    const destinationData = await destinationResponse.json()

    if (originData.status === 'FAIL' || destinationData.status === 'FAIL') {
      throw new Error(originData.message || destinationData.message || 'Invalid timezone provided')
    }

    // Parse timestamps and calculate time difference
    const originTimestamp = parseInt(originData.timestamp)
    const destinationTimestamp = parseInt(destinationData.timestamp)
    
    // Convert UTC timestamps to local times using GMT offsets
    const originOffset = parseInt(originData.gmtOffset)
    const destinationOffset = parseInt(destinationData.gmtOffset)
    
    const originLocalTime = new Date((originTimestamp + originOffset) * 1000)
    const destinationLocalTime = new Date((destinationTimestamp + destinationOffset) * 1000)
    
    // Calculate time difference in hours
    const timeDifferenceHours = (destinationOffset - originOffset) / 3600

    // Format times for display
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC' // Since we already adjusted for timezone
      })
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Since we already adjusted for timezone
      })
    }

    const result = {
      origin: {
        timeZone: originTimeZone,
        time: formatTime(originLocalTime),
        date: formatDate(originLocalTime),
        fullDateTime: originLocalTime.toISOString(),
        isDst: originData.dst === '1'
      },
      destination: {
        timeZone: destinationTimeZone,
        time: formatTime(destinationLocalTime),
        date: formatDate(destinationLocalTime),
        fullDateTime: destinationLocalTime.toISOString(),
        isDst: destinationData.dst === '1'
      },
      timeDifferenceHours: timeDifferenceHours,
      timeDifferenceText: timeDifferenceHours >= 0 
        ? `+${timeDifferenceHours}h ahead` 
        : `${Math.abs(timeDifferenceHours)}h behind`
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
