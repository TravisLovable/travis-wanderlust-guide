// Provider-merge events layer — shared contracts.
//
// A single normalized event shape every provider maps into, plus the provider
// interface itself. Adding a new source (e.g. PredictHQ) is a new file that
// implements EventProvider and gets registered in eventsService.ts — no
// changes to existing providers or the merge logic.

/** The one shape the whole app consumes. Every provider normalizes to this. */
export interface TravisEvent {
  /** Stable, provider-namespaced id (used for dedupe + React keys). */
  id: string;
  title: string;
  /**
   * Free-text category. Holidays use 'holiday'; ticketed sources pass through
   * their segment name (e.g. 'Music', 'Sports', 'Arts & Theatre').
   */
  category: string;
  /** ISO date, YYYY-MM-DD. */
  startDate: string;
  /** ISO date, YYYY-MM-DD. Omitted for single-day events. */
  endDate?: string;
  venue?: string;
  city: string;
  /** ISO 3166-1 alpha-2, uppercase. */
  country: string;
  url?: string;
  /** Human-readable provider name, e.g. 'Nager.Date' | 'Ticketmaster'. */
  source: string;
}

/** A destination + date window to look up events for. */
export interface EventQuery {
  /** City / place name (used by providers that search by city). */
  city: string;
  /** ISO 3166-1 alpha-2 country code, if known. */
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  /** Trip start, YYYY-MM-DD. */
  startDate: string;
  /** Trip end, YYYY-MM-DD. */
  endDate: string;
}

/**
 * A registered event source. Implementations MUST be defensive: fetchEvents
 * resolves to [] on any failure (network, bad key, unsupported country) and
 * never throws — a dead provider must not break the merge.
 */
export interface EventProvider {
  /** Human-readable name; also used as the TravisEvent.source value. */
  readonly name: string;
  /**
   * Whether this provider is worth calling for the given destination. The
   * service skips providers that return false, so we don't fire requests a
   * source can't serve (e.g. Ticketmaster outside its covered countries).
   */
  covers(query: EventQuery): boolean;
  /** Fetch + normalize. Resolves to [] on any failure; never rejects. */
  fetchEvents(query: EventQuery): Promise<TravisEvent[]>;
}
