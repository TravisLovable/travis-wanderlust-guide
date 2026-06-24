import type { EventProvider, EventQuery, TravisEvent } from "./types";
import { nagerHolidaysProvider } from "./providers/nagerHolidays";
import { ticketmasterProvider } from "./providers/ticketmaster";

// The provider-merge orchestrator.
//
// Registers providers, calls only the ones relevant to the destination,
// normalizes (each provider already returns TravisEvent), dedupes across
// sources, and ranks chronologically. Adding a source = append to this array.

const PROVIDERS: EventProvider[] = [
  nagerHolidaysProvider,
  ticketmasterProvider,
];

/** Dedupe key: same day + same title is the same event, regardless of source. */
const dedupeKey = (e: TravisEvent): string =>
  `${e.startDate}|${e.title.trim().toLowerCase()}`;

function dedupe(events: TravisEvent[]): TravisEvent[] {
  const byKey = new Map<string, TravisEvent>();
  for (const e of events) {
    const key = dedupeKey(e);
    const existing = byKey.get(key);
    // Prefer the more actionable record (one with a ticket/info URL) on collision.
    if (!existing || (!existing.url && e.url)) {
      byKey.set(key, e);
    }
  }
  return [...byKey.values()];
}

/** Chronological, with a stable title tiebreak for same-day events. */
function rank(events: TravisEvent[]): TravisEvent[] {
  return [...events].sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title),
  );
}

/**
 * Query all relevant providers and return a merged, deduped, ranked list.
 * Never throws: a provider that fails contributes [] (providers swallow their
 * own errors, and we guard again here). An all-empty result is a valid,
 * honest "no events" — callers render an empty state, never a fabrication.
 */
export async function getEvents(query: EventQuery): Promise<TravisEvent[]> {
  const relevant = PROVIDERS.filter((p) => {
    try {
      return p.covers(query);
    } catch {
      return false;
    }
  });

  const settled = await Promise.all(
    relevant.map((p) => p.fetchEvents(query).catch(() => [] as TravisEvent[])),
  );

  return rank(dedupe(settled.flat()));
}
