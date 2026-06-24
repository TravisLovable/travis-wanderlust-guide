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

/**
 * Hard trip-window filter, applied uniformly to every provider's output.
 *
 * An event qualifies only if its LOCAL start date falls within
 * [checkin, checkout] inclusive. TravisEvent.startDate is already a local
 * YYYY-MM-DD (Nager's `date`, Ticketmaster's venue-local `start.localDate`),
 * so a lexicographic compare is timezone-free by construction — it kills the
 * UTC-boundary bleed (events dated the day before check-in) without any Date
 * parsing. Spanning / open-ended listings whose start precedes the window are
 * dropped even if their range overlaps it (e.g. flex-admission tickets): we
 * key strictly on start date, never on a range.
 */
function withinTripWindow(e: TravisEvent, query: EventQuery): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.startDate)) return false;
  return e.startDate >= query.startDate && e.startDate <= query.endDate;
}

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

  // Window filter runs in the merge layer, after providers and before
  // dedupe/rank, so every source is held to the same start-date rule.
  const inWindow = settled.flat().filter((e) => withinTripWindow(e, query));
  return rank(dedupe(inWindow));
}
