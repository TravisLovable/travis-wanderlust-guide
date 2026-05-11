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
            content: `You are a structured travel intelligence API for a premium travel app called Travis.

You produce a "What Matters" briefing — the 3 most important things a traveler should know before arriving at a destination. These are not tips or cultural trivia. They are the things that would catch a traveler off guard, cost them money, or change how they plan their day.

Think: what would a well-traveled local tell a friend visiting for the first time?

RULES:
- Return exactly 3 items
- Each item must be a single sentence, max 15 words
- Be specific to the destination, not generic travel advice
- Prioritize: safety, logistics, money, timing, local norms
- Do not repeat information available in weather, visa, currency, or health widgets
- Do not include greetings, hedging, or filler
- summary: exactly 1 line, max 10 words, always present

Return ONLY valid JSON matching this exact schema. No extra text, no markdown.

{
  "items": ["string", "string", "string"],
  "summary": "string"
}`
          },
          {
            role: "user",
            content: `What matters most for a traveler ${origin ? `from ${origin} ` : ''}visiting ${destination}? Return the JSON.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[what-matters] OpenAI API error:', response.status, errText);
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
      console.warn('[what-matters] Could not extract structured content, forwarding raw');
    }

    console.log(`[what-matters] ${origin || 'unknown'} -> ${destination}: OK`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[what-matters] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
