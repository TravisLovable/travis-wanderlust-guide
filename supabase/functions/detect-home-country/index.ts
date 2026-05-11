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
    // Log ALL headers to find which one carries the client IP
    const allHeaders: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      allHeaders[key] = value
    })
    console.log(`[detect-home-country] All request headers:`, JSON.stringify(allHeaders))

    // Extract client IP — try every known header
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const connectingIp = req.headers.get('cf-connecting-ip')
    const trueClientIp = req.headers.get('true-client-ip')
    const xClientIp = req.headers.get('x-client-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIp || connectingIp || trueClientIp || xClientIp || null

    console.log(`[detect-home-country] IP resolution:`, {
      'x-forwarded-for': forwarded,
      'x-real-ip': realIp,
      'cf-connecting-ip': connectingIp,
      'true-client-ip': trueClientIp,
      'x-client-ip': xClientIp,
      resolved: ip,
    })

    // If we have an IP, query for that IP; otherwise let ipapi.co detect from the request
    const geoUrl = ip
      ? `https://ipapi.co/${ip}/json/`
      : `https://ipapi.co/json/`

    console.log(`[detect-home-country] Fetching: ${geoUrl}`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(geoUrl, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      console.warn(`[detect-home-country] ipapi.co returned ${res.status}`)
      return new Response(
        JSON.stringify({ countryCode: null, countryName: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    console.log(`[detect-home-country] ipapi.co raw response:`, JSON.stringify(data))

    const countryCode = data.country_code ?? null
    const countryName = data.country_name ?? null
    const city = data.city ?? null

    console.log(`[detect-home-country] Final result: { countryCode: ${countryCode}, countryName: ${countryName}, city: ${city} }`)

    return new Response(
      JSON.stringify({ countryCode, countryName, city }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=3600',
        },
      }
    )
  } catch (err) {
    console.error('[detect-home-country] Error:', err.message)
    return new Response(
      JSON.stringify({ countryCode: null, countryName: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
