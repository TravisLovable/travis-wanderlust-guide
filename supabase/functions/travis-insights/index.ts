import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = "claude-sonnet-4-6";

const TRAVIS_SYSTEM_PROMPT = `You are Travis — a sharp, experienced traveler briefing a friend before their trip.

VOICE RULES:
- Maximum 12 words per insight
- No hedging ("you might want to", "consider", "I recommend")
- Sound experienced, not researched
- Confident and direct
- Warm but never cute (no "Happy travels!", no exclamation marks)
- Actionable over descriptive ("Bring layers" not "It gets cold")

NEVER SAY:
- "I recommend..."
- "You might want to..."
- "Don't forget to..."
- "Pro tip:"
- "Fun fact:"
- "Did you know..."

YOU SOUND LIKE:
- "Cash only outside the center."
- "Skip the tourist SIM counter."
- "The 3pm lull is real — museum to yourself."
- "Punctuality here is a suggestion. Relax into it."`;

interface InsightRequestBody {
  destination?: { city?: string; country?: string; lat?: number; lng?: number };
  dates?: { start?: string; end?: string };
  user?: { firstName?: string; originCity?: string; originCountry?: string };
  widgetData?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as InsightRequestBody;
    const destination = body?.destination;
    const dates = body?.dates;
    const user = body?.user;
    const widgetData = body?.widgetData ?? {};

    if (!destination?.city) {
      return new Response(
        JSON.stringify({ error: "destination.city is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const firstName = user?.firstName ?? "Traveler";
    const originCity = user?.originCity ?? "New York";
    const originCountry = user?.originCountry ?? "United States";
    const startDate = dates?.start ?? "";
    const endDate = dates?.end ?? "";

    const currentHour = new Date().getHours();
    const timeOfDay =
      currentHour < 12 ? "Morning" : currentHour < 17 ? "Afternoon" : "Evening";

    const userPrompt = `
CONTEXT:
- User: ${firstName}
- Origin: ${originCity}, ${originCountry}
- Destination: ${destination.city}, ${destination.country ?? ""}
- Dates: ${startDate} to ${endDate}
- Time of day: ${timeOfDay}

WIDGET DATA:
${JSON.stringify(widgetData, null, 2)}

TASK:
Generate a single insight (max 12 words) for each relevant widget.
Return JSON only. Skip widgets where the data speaks for itself.
If there's nothing non-obvious to say, set the value to null.

Also produce \`insiderAsides\`: EXACTLY 5 single-sentence asides — the kind
of quick observation a well-traveled friend would drop in conversation.
Each must:
- Be max 14 words
- Reveal something a guidebook would miss (rhythms, social codes, hidden
  costs, small frictions, the texture of daily life)
- Avoid duplicating the other insight fields (weather, visa, currency, etc.)
- Avoid generic travel advice ("be respectful", "carry cash") — be specific
  to this destination

Example for Tokyo:
[
  "Train staff bow at empty platforms. Just trust the rhythm.",
  "Convenience stores beat most cafés for breakfast. The egg sandwiches are real.",
  "Tipping in cabs gets your money returned, sometimes with a chase.",
  "Lines form themselves. Don't ask where it starts — just stand.",
  "Smoking is banned on sidewalks but allowed in bars. It's inverted."
]

RESPONSE FORMAT (JSON only, no markdown, no code blocks):
{
  "greeting": "${timeOfDay}, ${firstName}.",
  "weather": "string or null",
  "localTime": "string or null",
  "waterSafety": "string or null",
  "uvIndex": "string or null",
  "pharmacyIntel": "string or null",
  "powerAdapter": "string or null",
  "currency": "string or null",
  "visa": "string or null",
  "healthEntry": "string or null",
  "transportation": "string or null",
  "localHolidays": "string or null",
  "localEvents": "string or null",
  "culturalInsights": "string or null",
  "insiderAsides": ["string", "string", "string", "string", "string"]
}`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 700,
        temperature: 0.7,
        system: [
          {
            type: "text",
            text: TRAVIS_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("[travis-insights] Anthropic error:", anthropicRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable", status: anthropicRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await anthropicRes.json();
    const text: string | undefined = data?.content?.[0]?.text;

    if (!text) {
      console.error("[travis-insights] No text in response");
      return new Response(
        JSON.stringify({ error: "AI returned empty response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("[travis-insights] JSON parse failed:", e, "raw:", cleaned);
      return new Response(
        JSON.stringify({ error: "AI returned malformed JSON" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(
      `[travis-insights] ${originCity} -> ${destination.city}: OK`,
    );

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[travis-insights] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
