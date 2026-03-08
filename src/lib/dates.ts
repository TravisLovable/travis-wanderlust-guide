/**
 * Canonical date utilities — single source of truth for date-only operations.
 *
 * Rules:
 * - Trip dates are DATE-ONLY (no time component).
 * - URL params store dates as YYYY-MM-DD strings.
 * - Never use `new Date(dateString)` to parse YYYY-MM-DD — it parses as UTC,
 *   which shifts -1 day in western timezones.
 * - Always parse with `toLocalMidnight` which constructs via local year/month/day.
 */

/** Parse a YYYY-MM-DD string into { y, m, d } without creating a Date. */
export function parseDateOnly(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { y, m, d };
}

/** Create a Date at local midnight from a YYYY-MM-DD string. */
export function toLocalMidnight(dateStr: string): Date {
  const { y, m, d } = parseDateOnly(dateStr);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Serialize a Date to YYYY-MM-DD using local time (not UTC). */
export function formatDateOnlyLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Add N days to a Date, returning a new Date at local midnight. */
export function addDaysLocal(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get today at local midnight. */
export function todayLocal(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Check if `today` falls within [startStr, endStr).
 * Start inclusive, end exclusive (checkout = departure day, not a trip day).
 * All comparisons use local midnight.
 */
export function isWithinTripWindow(today: Date, startStr: string, endStr: string): boolean {
  const start = toLocalMidnight(startStr);
  const end = toLocalMidnight(endStr);
  return today >= start && today < end;
}
