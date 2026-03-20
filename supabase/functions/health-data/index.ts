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

IMPORTANT STYLE RULES for summary fields:
- health_clearance: This is ONLY about mandatory entry requirements. NEVER a recommendation.
  It must answer: "Is anything REQUIRED to enter this country?"
  GOOD: "No mandatory health requirements"
  GOOD: "Yellow fever vaccination required for entry"
  GOOD: "COVID vaccination required"
  GOOD: "No vaccines or tests required for entry"
  BAD: "Routine vaccinations recommended" (this is a recommendation, not a requirement)
  BAD: "Ensure vaccinations are up to date" (this is advice, not a requirement)
  BAD: "Consider malaria prophylaxis" (this is a suggestion, not a requirement)
  If nothing is mandatory, always say: "No mandatory health requirements"
- key_action: One short, actionable sentence. No filler.
  GOOD: "Keep routine vaccinations up to date"
  GOOD: "Get yellow fever vaccination before travel"
  BAD: "Ensure that all routine vaccinations are current and up to date before departure"

{
  "summary": {
    "health_clearance": "string — ONLY mandatory entry requirements, never recommendations",
    "risk_level": "low | moderate | high",
    "key_action": "string — one short actionable sentence"
  },
  "required_for_entry": {
    "covid_vaccination": true | false | null,
    "covid_test": true | false | null,
    "health_declaration_form": true | false | null,
    "quarantine": true | false | null,
    "entry_screening": true | false | null
  },
  "recommended": {
    "vaccines": ["string array of recommended vaccines, empty if none"],
    "malaria_prophylaxis": true | false | "regional",
    "mosquito_protection": true | false,
    "food_water_precautions": true | false
  },
  "regional_risks": {
    "malaria_risk_areas": "string or null — describe regions if applicable",
    "mosquito_borne_illness": "string or null — dengue, Zika, etc.",
    "other_advisories": "string or null — altitude, water quality, etc."
  },
  "source": "string — primary source name",
  "last_updated": "YYYY-MM or 'Current'"
}`
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
