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
    const { destination, passport } = body;

    if (!destination || !passport) {
      return new Response(
        JSON.stringify({ error: 'destination and passport are required' }),
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
            content: `You are a structured travel health data API for a premium travel intelligence product called Travis.

Return ONLY valid JSON matching this exact schema. No extra text, no markdown.

{
  "status": "string",
  "details": [
    { "label": "string", "value": "string" },
    { "label": "string", "value": "string" },
    { "label": "string", "value": "string" }
  ],
  "summary": "string"
}

RULES:

status:
- 1 line only, no explanation
- Must answer: "Is anything REQUIRED to enter this country?"
- GOOD: "No mandatory health requirements"
- GOOD: "Yellow fever vaccination required for entry"
- GOOD: "COVID vaccination required"
- BAD: "Routine vaccinations recommended" (recommendation, not requirement)
- BAD: "Ensure vaccinations are up to date" (advice, not requirement)
- If nothing is mandatory, always say: "No mandatory health requirements"

details:
- Max 3 items
- Each item is single-line
- Short labels only (e.g., Recommended, Regional risk, Documentation)
- Values must be concise (12 words max)
- No paragraphs, no categories, no line breaks

summary:
- Exactly 1 sentence
- 12 words max
- Concise takeaway for an experienced traveler

Do not return anything outside this JSON.`
          },
          {
            role: "user",
            content: `Health entry requirements for ${destination} for a traveler holding a ${passport} passport. Return the JSON.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', status: response.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Extract the model's text content from the Responses API envelope
    let healthData: unknown = data;
    try {
      const text = data?.output?.[0]?.content?.[0]?.text;
      if (text) {
        // Strip markdown code fences if present
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        healthData = JSON.parse(cleaned);
      }
    } catch {
      // If extraction/parsing fails, forward the raw response
      console.warn('Could not extract structured content from OpenAI response, forwarding raw');
    }

    return new Response(JSON.stringify(healthData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('health-data function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
