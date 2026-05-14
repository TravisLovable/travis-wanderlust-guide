import * as React from "react";
import { SubcardFrame } from "./SubcardFrame";

type CulturalPostureCardProps = {
  destination: string;
};

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

/**
 * Cultural Posture cell.
 *
 * Data source: the existing CulturalContainer's `getCulturalData()` table —
 * a synchronous per-country lookup returning `{ insights: string[3], summary }`.
 * We don't import the function (it lives inside a container we'll delete in
 * Checkpoint E); instead we inline the same logic. When the data layer is
 * upgraded to a real cultural Edge Function later, this card swaps to a
 * fetch — the inline table here is a deliberate near-duplicate to keep
 * Checkpoint E's deletion clean.
 *
 * Design has 5 key-value rows (Greetings/Meals/Tipping/Pace/Dress) but
 * our current data is 3 untagged observations. Honest mapping: 3 numbered
 * observation rows. The summary lives in the SubcardFrame footnote.
 */
export function CulturalPostureCard({ destination }: CulturalPostureCardProps) {
  const { insights, summary } = getCulturalData(destination);

  const cleanInsights = insights
    .map((x) => asString(x))
    .filter((x): x is string => !!x);

  return (
    <SubcardFrame
      label="Cultural posture"
      footnote={asString(summary)}
    >
      <div style={{ padding: "8px 20px 12px" }}>
        {cleanInsights.length === 0 && (
          <div
            className="font-travis"
            style={{ color: "var(--ink-4)", fontSize: 13, padding: "12px 0" }}
          >
            —
          </div>
        )}
        {cleanInsights.map((insight, i) => (
          <div
            key={i}
            className="grid items-baseline"
            style={{
              gridTemplateColumns: "28px 1fr",
              gap: 14,
              padding: "12px 0",
              borderBottom:
                i < cleanInsights.length - 1 ? "1px dashed var(--hair)" : "none",
            }}
          >
            <span
              className="font-travis-mono"
              style={{
                color: "var(--ink-4)",
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="font-travis"
              style={{
                color: "var(--ink-2)",
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              {insight}
            </span>
          </div>
        ))}
      </div>
    </SubcardFrame>
  );
}

type CulturalData = { insights: string[]; summary: string };

function getCulturalData(destination: string): CulturalData {
  const lower = destination.toLowerCase();

  if (["japan", "tokyo", "osaka", "kyoto"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Bowing replaces handshakes - depth signals respect level",
        "Shoes come off at every door, no exceptions",
        "Eating while walking is considered rude here",
      ],
      summary: "Highly ritualized - small gestures carry real weight",
    };
  }
  if (["france", "paris", "lyon", "marseille", "nice"].some((k) => lower.includes(k))) {
    return {
      insights: [
        'Say "Bonjour" entering any shop or you are rude',
        "Lunch runs noon to two, nothing else happens",
        "Sportswear outside a gym draws visible judgment",
      ],
      summary: "Formality matters more than friendliness at first",
    };
  }
  if (["uk", "united kingdom", "london", "england", "scotland", "edinburgh", "manchester"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Skipping a queue will get you publicly corrected",
        "Pub rounds are social contracts, not suggestions",
        '"Sorry" is used more than "hello" here',
      ],
      summary: "Understated politeness masks deeply rigid social rules",
    };
  }
  if (["peru", "lima", "cusco", "arequipa", "machu picchu"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Coca tea is offered everywhere - it is normal",
        "Photographing locals without asking causes real offense",
        "Scheduled times are loose, expect 20-30 minute drift",
      ],
      summary: "Relaxed pace but strong indigenous cultural boundaries",
    };
  }
  if (["brazil", "rio", "são paulo", "sao paulo", "salvador", "brasilia"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Personal space is half what you are used to",
        "Cheek kisses range from one to three by region",
        "Soccer conversations carry real emotional stakes here",
      ],
      summary: "Warm and physical - reserve reads as coldness",
    };
  }
  if (["germany", "berlin", "munich", "hamburg", "frankfurt"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Quiet hours are legally enforced, not just polite",
        "Direct feedback is normal - bluntness is not rude",
        "Cash is still preferred over cards in many places",
      ],
      summary: "Efficient and direct - small talk is not expected",
    };
  }
  if (["india", "delhi", "mumbai", "bangalore", "jaipur", "goa", "kolkata"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Left hand is considered unclean, use your right",
        "Head wobble means yes - not uncertainty",
        "Shoes come off at temples, mosques, and most homes",
      ],
      summary: "Sensory overload is constant - lean into it",
    };
  }
  if (["thailand", "bangkok", "chiang mai", "phuket", "pattaya"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Touching someone's head is a serious offense here",
        "Pointing feet at people or Buddha images is taboo",
        "Losing your temper publicly causes lasting shame",
      ],
      summary: "Calm and reverent - composure is deeply valued",
    };
  }
  if (["kenya", "nairobi", "ghana", "accra", "nigeria", "lagos", "tanzania", "cape town", "south africa"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Greetings take time - rushing them feels dismissive",
        "Elders are addressed with specific honorifics always",
        "Haggling is expected in markets, fixed in shops",
      ],
      summary: "Relational culture - connection comes before transaction",
    };
  }
  if (["italy", "rome", "milan", "florence", "venice", "naples"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Cappuccino after 11 AM marks you as a tourist",
        "Dinner before 8 PM means eating alone",
        "Sitting at a café table costs more than standing",
      ],
      summary: "Food and timing are cultural identity, not preference",
    };
  }
  if (["spain", "madrid", "barcelona", "seville", "malaga"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Dinner before 9 PM and restaurants are empty",
        "Siesta hours close shops from 2 to 5 PM",
        "Regional identity runs deep - Catalonia is not Spain",
      ],
      summary: "Late rhythms and strong local pride shape everything",
    };
  }
  if (["mexico", "mexico city", "cancun", "playa del carmen", "oaxaca", "guadalajara"].some((k) => lower.includes(k))) {
    return {
      insights: [
        "Mezcal and tequila are distinct - locals notice confusion",
        "Social punctuality runs 20-30 minutes late normally",
        "Day of the Dead is celebration, not mourning",
      ],
      summary: "Warm and flexible - formality fades fast after greeting",
    };
  }

  return {
    insights: [
      "Greet shopkeepers when entering - silence feels rude",
      "Observe local meal times before choosing when to eat",
      "Dress modestly at religious and government sites",
    ],
    summary: "Adjust pace and formality to match your surroundings",
  };
}
