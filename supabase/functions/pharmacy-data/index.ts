import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const body = await req.json();
    const { destination, origin } = body;

    if (!destination || !origin) {
      return new Response(
        JSON.stringify({ error: 'destination and origin are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
            content: `You are a structured pharmacy data API for a premium travel app called Travis.

You help travelers quickly recognize what medication to look for in a foreign country.
This is a real-world, in-store decision tool. NOT medical advice.

PRIMARY GOAL:
Help the user confidently identify what to look for or ask for in a pharmacy, with zero confusion.

CORE LOGIC — for each medication:

1. DETERMINE USER INTENT
Identify the real-world purpose (pain relief, allergy relief, congestion, stomach relief).

2. MATCH BEHAVIOR (CRITICAL)
Only return options that produce a similar real-world effect.
DO NOT:
- Substitute drowsy for non-drowsy medications without noting it in status
- Swap fundamentally different treatment types
- Provide misleading or technically-correct-but-behaviorally-wrong matches

3. PRIORITIZE RECOGNITION
Select equivalent using this order:
  1. Same recognizable brand sold in destination
  2. Most common local brand a traveler would see
  3. Common pharmacy term used locally
  4. Ingredient name ONLY if necessary

4. STATUS (REQUIRED)
Short access label. Use one of: "OTC", "Restricted", "Rx"

5. ACCURACY RULES
- Do NOT incorrectly match medications with different effects
- Do NOT assume availability without confidence
- Do NOT provide dosage or medical instructions

Return ONLY valid JSON matching this exact schema. No extra text, no markdown.

{
  "medications": [
    {
      "source": "string",
      "equivalent": "string",
      "status": "string"
    }
  ],
  "summary": "string"
}

Rules:
- medications: exactly 4 items (pain relief, allergy, cold/sinus, stomach)
- source: concise home-country name (e.g. "Tylenol", "Zyrtec", "Pepto" NOT "Pepto-Bismol")
- equivalent: concise destination name (e.g. "Panadol", "Cetirizina")
- status: short (OTC, Restricted, Rx)
- summary: exactly 1 line, max 12 words, always present`
          },
          {
            role: "user",
            content: `Pharmacy medication equivalents in ${destination} for a traveler from ${origin}. Return the JSON.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[pharmacy-data] OpenAI API error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', status: response.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    let pharmacyData: unknown = data;
    try {
      const text = data?.output?.[0]?.content?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        pharmacyData = JSON.parse(cleaned);
      }
    } catch {
      console.warn('[pharmacy-data] Could not extract structured content, forwarding raw');
    }

    console.log(`[pharmacy-data] ${origin} -> ${destination}: OK`);

    return new Response(JSON.stringify(pharmacyData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[pharmacy-data] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
