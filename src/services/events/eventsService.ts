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

/** Final chronological list size. Survivors of the relevance filter, capped. */
const RESULT_CAP = 15;

const isHoliday = (e: TravisEvent): boolean => e.category === "holiday";

const titleKey = (e: TravisEvent): string => e.title.trim().toLowerCase();

/** Inclusive day count of the trip window (min 1). */
function windowDays(query: EventQuery): number {
  const start = Date.parse(`${query.startDate}T00:00:00Z`);
  const end = Date.parse(`${query.endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 1;
  return Math.round((end - start) / 86_400_000) + 1;
}

/**
 * Relevance filter — keep trip-relevant happenings, drop standing inventory.
 *
 * Travis should surface events worth planning around, not a city's
 * always-available catalogue. A non-holiday title that recurs on many distinct
 * dates across the window (daily Broadway runs, standing museum admission)
 * reads as "always available" and is excluded; titles on a small number of
 * discrete dates are real, time-bound happenings and kept.
 *
 * Holidays are NEVER filtered — they affect travel (closures, crowds) and are
 * few.
 *
 * The threshold scales with window length but is capped at 6 so a dense
 * multi-week city (where Ticketmaster's ~1000-row paging ceiling truncates the
 * tail of the window) still flags daily runs from the dates we did see:
 * standing if distinct in-window dates >= max(3, min(6, ceil(0.6 * days))).
 */
function dropStandingInventory(
  events: TravisEvent[],
  query: EventQuery,
): TravisEvent[] {
  const datesByTitle = new Map<string, Set<string>>();
  for (const e of events) {
    if (isHoliday(e)) continue;
    let set = datesByTitle.get(titleKey(e));
    if (!set) {
      set = new Set<string>();
      datesByTitle.set(titleKey(e), set);
    }
    set.add(e.startDate);
  }

  const threshold = Math.max(3, Math.min(6, Math.ceil(0.6 * windowDays(query))));

  return events.filter((e) => {
    if (isHoliday(e)) return true;
    const distinctDates = datesByTitle.get(titleKey(e))?.size ?? 1;
    return distinctDates < threshold;
  });
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

  // Merge-layer pipeline, applied uniformly to every source:
  //   window filter → relevance filter (drop standing inventory) →
  //   dedupe → chronological rank → cap.
  const inWindow = settled.flat().filter((e) => withinTripWindow(e, query));
  const relevant2 = dropStandingInventory(inWindow, query);
  return rank(dedupe(relevant2)).slice(0, RESULT_CAP);
}
