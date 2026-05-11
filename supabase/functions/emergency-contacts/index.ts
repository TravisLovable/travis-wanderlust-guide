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
    let destination: string | null = null;
    try {
      const text = await req.text();
      if (text) {
        const body = JSON.parse(text);
        destination = body?.destination ?? null;
      }
    } catch (_) { /* ignore */ }

    if (!destination) {
      return new Response(
        JSON.stringify({ error: 'destination is required' }),
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
            content: `You are a structured emergency contacts API for a premium travel app called Travis.

You provide essential emergency phone numbers for travelers visiting a specific destination.

Return ONLY valid JSON matching this exact schema. No extra text, no markdown.

{
  "contacts": [
    {
      "label": "string",
      "number": "string"
    }
  ],
  "summary": "string"
}

Rules:
- contacts: exactly 4 items in this order: Police, Ambulance, Fire, Tourist Police (or Embassy Hotline if no tourist police exists)
- label: short service name (e.g. "Police", "Ambulance", "Fire", "Tourist Police")
- number: the actual local emergency number (e.g. "110", "911", "112")
- If a single number covers multiple services (e.g. 112 in EU), still list each service separately with that number
- summary: exactly 1 line, max 12 words, practical tip about emergency calls in that country`
          },
          {
            role: "user",
            content: `Emergency contact numbers for travelers in ${destination}. Return the JSON.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[emergency-contacts] OpenAI API error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', status: response.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    let result: unknown = data;
    try {
      const text = data?.output?.[0]?.content?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        result = JSON.parse(cleaned);
      }
    } catch {
      console.warn('[emergency-contacts] Could not extract structured content, forwarding raw');
    }

    console.log(`[emergency-contacts] ${destination}: OK`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[emergency-contacts] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
