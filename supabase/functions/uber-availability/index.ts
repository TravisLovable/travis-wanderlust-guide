import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destination, origin } = await req.json()

    if (!destination) {
      return new Response(
        JSON.stringify({ error: 'destination is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0,
        input: [
          {
            role: "system",
            content: `You are a structured ride-share data API for a travel app called Travis.

This is a lightweight, pre-AI version. Do NOT overthink, infer deeply, or generate complex insights.
Return clean, reliable, globally consistent transport context.

PRIMARY GOAL:
Help the traveler quickly understand:
- if ride share is available
- how far the airport is from the city center
- what services exist
- what backup options exist

Keep everything simple, predictable, and UI-friendly.

INSTRUCTIONS:

1. PRIMARY PROVIDER
Return the most widely used ride-share platform in the destination city.
If multiple are common, choose the most globally recognizable (prefer Uber when available).
If ride share is not widely used, return "Ride share limited".

2. STATUS
Always return one of: Active, Limited, Unavailable.
Active = default if ride share is commonly available. Do not overcomplicate.

3. AIRPORT TO CITY CENTER TIME
Return a realistic estimated time range from the main international airport to the city center.
Format: "25–40 min"
Use a range, not a single number. Keep it broad and realistic.
Do not include traffic commentary. Do not over-explain.

4. AVAILABLE SERVICES
Return 2–4 common ride types for the primary provider.
Examples: UberX, Comfort, Black, XL.
Do not include uncommon or niche services.

5. LOCAL ALTERNATIVES
Return 2–3 realistic alternatives. Always include "Taxi" as a fallback.
Examples: Taxi, DiDi, Bolt, Ola, Cabify.

6. INSIGHT (OPTIONAL — MINIMAL USE)
Include ONLY if it is globally common and safe to assume.
Examples: "Airport pickups require designated pickup zones", "Taxis available outside arrivals"
If unsure, leave blank. Do NOT generate dynamic or speculative insights.

Return ONLY valid JSON matching this exact schema. No extra text, no markdown.

{
  "primary_provider": "string",
  "status": "Active | Limited | Unavailable",
  "airport_to_city_time": "string",
  "available_services": ["string array, 2-4 items"],
  "local_alternatives": ["string array, 2-3 items"],
  "insight": "string or empty"
}`
          },
          {
            role: "user",
            content: `Ride-share intelligence for ${destination}${origin ? ` for a traveler from ${origin}` : ''}. Return the JSON.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[uber-availability] OpenAI API error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', status: response.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json();

    let rideData: unknown = data;
    try {
      const text = data?.output?.[0]?.content?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        rideData = JSON.parse(cleaned);
      }
    } catch {
      console.warn('[uber-availability] Could not extract structured content, forwarding raw');
    }

    console.log(`[uber-availability] ${destination}: OK`);

    return new Response(JSON.stringify(rideData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[uber-availability] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
