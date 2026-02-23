import Anthropic from '@anthropic-ai/sdk';
import { TravisInsights, InsightRequest } from '@/types/insights';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
const hasRealKey = apiKey && apiKey !== 'your_key_here';

console.log('[Travis] API key present:', !!apiKey, '| real key:', hasRealKey);

const anthropic = hasRealKey
  ? new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Client-side for now — move to backend for production
    })
  : null;

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

const EMPTY_INSIGHTS: TravisInsights = {
  greeting: null,
  weather: null,
  localTime: null,
  waterSafety: null,
  uvIndex: null,
  pharmacyIntel: null,
  powerAdapter: null,
  currency: null,
  visa: null,
  healthEntry: null,
  transportation: null,
  localHolidays: null,
  localEvents: null,
  culturalInsights: null,
};

export async function generateInsights(request: InsightRequest): Promise<TravisInsights> {
  if (!anthropic) {
    console.warn('[Travis] No valid VITE_ANTHROPIC_API_KEY — skipping insights. Set a real key in .env');
    return EMPTY_INSIGHTS;
  }

  console.log('[Travis] Calling Claude API for', request.destination.city);

  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : 'Evening';

  const userPrompt = `
CONTEXT:
- User: ${request.user.firstName}
- Origin: ${request.user.originCity}, ${request.user.originCountry}
- Destination: ${request.destination.city}, ${request.destination.country}
- Dates: ${request.dates.start} to ${request.dates.end}
- Time of day: ${timeOfDay}

WIDGET DATA:
${JSON.stringify(request.widgetData, null, 2)}

TASK:
Generate a single insight (max 12 words) for each relevant widget.
Return JSON only. Skip widgets where the data speaks for itself.
If there's nothing non-obvious to say, set the value to null.

RESPONSE FORMAT (JSON only, no markdown, no code blocks):
{
  "greeting": "${timeOfDay}, ${request.user.firstName}.",
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
  "culturalInsights": "string or null"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.7,
      system: TRAVIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonStr = content.text.trim();
      const parsed = JSON.parse(jsonStr);
      console.log(`[Travis] Insights loaded for ${request.destination.city}`);
      return parsed;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('[Travis] Insight generation failed:', error);
    return EMPTY_INSIGHTS;
  }
}
