
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
    const url = new URL(req.url)
    let input = url.searchParams.get('input')
    let mode = url.searchParams.get('mode') // 'city' | 'destination' (default)
    if (!input || !mode) {
      try {
        const text = await req.text()
        if (text) {
          const body = JSON.parse(text)
          if (!input) input = body?.input ?? body?.query ?? null
          if (!mode) mode = body?.mode ?? null
        }
      } catch (_) { /* ignore */ }
    }

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Input parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Soft location bias toward the continental US (geographic center, ~2500km
    // radius) — reorders/ranks results, doesn't exclude anything outside it. Just
    // a tiebreaker on ambiguous queries; kept wide so it doesn't dominate over an
    // exact match elsewhere (e.g. "Paris" should still surface Paris, France).
    const US_BIAS = 'location=39.8283,-98.5795&radius=2500000'
    const baseUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&${US_BIAS}`

    // Home City (mode=city): Google's own `(cities)` collection excludes businesses
    // entirely, so a single restricted call is enough — no merge needed.
    if (mode === 'city') {
      const cityResponse = await fetch(`${baseUrl}&types=${encodeURIComponent('(cities)')}`)
      const data = await cityResponse.json()
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Destination search (default): unrestricted autocomplete surfaces businesses/POIs
    // (e.g. "Sam's Club", event venues) alongside real places, and Autocomplete only
    // ever returns 5 candidates — so on a business-crowded query (e.g. "Sam" near lots
    // of Sam's Clubs) an unrestricted call plus client-side filtering can come back
    // empty, because the real places never made Google's top 5 in the first place.
    //
    // Fix: run `types=(regions)` (country/admin-area/locality/sublocality — Google's
    // own ranking excludes businesses from this collection, so it isn't crowded out)
    // in parallel with the old unrestricted call, then fold in any colloquial_area /
    // natural_feature results from the unrestricted call (things like "Amalfi Coast"
    // that (regions) structurally excludes) that (regions) didn't already return.
    const [regionsResponse, broadResponse] = await Promise.all([
      fetch(`${baseUrl}&types=${encodeURIComponent('(regions)')}`),
      fetch(baseUrl),
    ])
    const [regionsData, broadData] = await Promise.all([
      regionsResponse.json(),
      broadResponse.json(),
    ])

    const regionsPredictions = Array.isArray(regionsData.predictions) ? regionsData.predictions : []
    const seenPlaceIds = new Set(regionsPredictions.map((p: { place_id: string }) => p.place_id))

    const extraPredictions = (Array.isArray(broadData.predictions) ? broadData.predictions : []).filter(
      (p: { place_id: string; types?: string[] }) =>
        !seenPlaceIds.has(p.place_id) &&
        (p.types?.includes('colloquial_area') || p.types?.includes('natural_feature'))
    )

    const data = {
      ...regionsData,
      predictions: [...regionsPredictions, ...extraPredictions],
      status: regionsPredictions.length + extraPredictions.length > 0 ? 'OK' : regionsData.status,
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
