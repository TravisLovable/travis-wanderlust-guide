import { supabase } from "@/integrations/supabase/client";
import type { EventProvider, EventQuery, TravisEvent } from "../types";

// Provider 2 — Ticketmaster Discovery (ticketed events).
//
// Requires an API key, which must NOT ship in the client bundle (extractable
// from a native IPA), so this provider calls the `ticketmaster-events` Edge
// Function, which holds TICKETMASTER_API_KEY as a secret and returns events
// already normalized to the TravisEvent shape.
//
// Coverage is Western-skewed; we only call the provider for countries
// Ticketmaster actually serves so we don't fire empty requests elsewhere.
// (PredictHQ, added later, would fill the non-covered gaps.)

const COVERED_COUNTRIES = new Set<string>([
  "US", "CA", "MX",
  "GB", "IE",
  "AU", "NZ",
  // Western/Central Europe
  "DE", "FR", "ES", "IT", "NL", "BE", "AT", "CH",
  "SE", "NO", "DK", "FI", "PT", "PL",
]);

function coerceEvent(raw: unknown): TravisEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === "string" ? r.title : undefined;
  const startDate = typeof r.startDate === "string" ? r.startDate : undefined;
  if (!title || !startDate) return null;

  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() ? v : undefined;

  return {
    id: str(r.id) ?? `tm-${startDate}-${title}`,
    title,
    category: str(r.category) ?? "Event",
    startDate,
    endDate: str(r.endDate),
    venue: str(r.venue),
    city: str(r.city) ?? "",
    country: str(r.country) ?? "",
    url: str(r.url),
    source: "Ticketmaster",
  };
}

export const ticketmasterProvider: EventProvider = {
  name: "Ticketmaster",

  covers: (q: EventQuery) =>
    !!q.countryCode && COVERED_COUNTRIES.has(q.countryCode.trim().toUpperCase()),

  async fetchEvents(q: EventQuery): Promise<TravisEvent[]> {
    try {
      const { data, error } = await supabase.functions.invoke<{
        events?: unknown[];
      }>("ticketmaster-events", {
        body: {
          countryCode: q.countryCode?.trim().toUpperCase(),
          city: q.city,
          startDate: q.startDate,
          endDate: q.endDate,
        },
      });

      // The function returns graceful empties (200) for 401/empty upstream, so
      // an error here is a transport/function failure — treat as no events.
      if (error || !data?.events || !Array.isArray(data.events)) return [];

      return data.events
        .map(coerceEvent)
        .filter((e): e is TravisEvent => e !== null);
    } catch {
      return [];
    }
  },
};
