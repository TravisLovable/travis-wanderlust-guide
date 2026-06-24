import type { EventProvider, EventQuery, TravisEvent } from "../types";

// Provider 1 — Nager.Date public holidays / observances.
//
// Keyless and CORS-friendly, so it's called directly from the client (same as
// Open-Meteo) — no Edge Function. Covers ~100 countries; unsupported codes
// return 404, which we skip silently rather than surfacing as an error.

const BASE = "https://date.nager.at/api/v3/PublicHolidays";

interface NagerHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  types?: string[];
}

const yearOf = (iso: string): number => Number(iso.slice(0, 4));

const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Inclusive ISO date-range check (lexicographic works for YYYY-MM-DD). */
const inRange = (date: string, start: string, end: string): boolean =>
  date >= start && date <= end;

async function fetchYear(year: number, cc: string): Promise<NagerHoliday[]> {
  try {
    const res = await fetch(`${BASE}/${year}/${cc}`, {
      signal: AbortSignal.timeout(8000),
    });
    // 404 = country/year not supported by Nager. Skip gracefully.
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as NagerHoliday[]) : [];
  } catch {
    return [];
  }
}

export const nagerHolidaysProvider: EventProvider = {
  name: "Nager.Date",

  // Holidays need a country code; the city/coords are irrelevant here.
  covers: (q: EventQuery) => !!q.countryCode,

  async fetchEvents(q: EventQuery): Promise<TravisEvent[]> {
    const cc = q.countryCode?.trim().toUpperCase();
    if (!cc) return [];

    // A trip can straddle a year boundary (e.g. Dec→Jan); fetch each year once.
    const startY = yearOf(q.startDate);
    const endY = yearOf(q.endDate);
    const years =
      Number.isFinite(startY) && Number.isFinite(endY) && endY > startY
        ? [startY, endY]
        : [startY];

    const batches = await Promise.all(years.map((y) => fetchYear(y, cc)));
    const holidays = batches.flat();

    return holidays
      .filter((h) => h?.date && inRange(h.date, q.startDate, q.endDate))
      .map((h) => ({
        id: `nager-${cc}-${h.date}-${slug(h.name || h.localName || "holiday")}`,
        title: h.localName || h.name,
        category: "holiday",
        startDate: h.date,
        city: q.city,
        country: cc,
        source: "Nager.Date",
      }));
  },
};
