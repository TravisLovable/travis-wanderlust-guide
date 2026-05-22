// Step 7 — Travel Style option catalogs (Checkpoint D).
//
// Shared between TravelStyleStep (renders the chips) and CompleteStep (maps a
// stored key back to a label for the summary). The stable `key` is what lands
// in the DB (travel_frequency / travel_pace text, travel_styles text[]); the
// `label` is display-only.

export interface TravelOption {
  key: string;
  label: string;
}

export const FREQUENCY_OPTIONS: TravelOption[] = [
  { key: 'rarely', label: 'Rarely' },
  { key: 'few_trips_year', label: 'A few trips a year' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'weekly', label: 'Weekly' },
];

/** Pace carries a `short` label for compact summaries (Complete step). */
export interface PaceOption extends TravelOption {
  short: string;
}

export const PACE_OPTIONS: PaceOption[] = [
  { key: 'slow', label: 'Slow — fewer stops, deeper', short: 'Slow' },
  { key: 'balanced', label: 'Balanced — mix of both', short: 'Balanced' },
  { key: 'packed', label: 'Packed — maximize ground covered', short: 'Packed' },
];

export const STYLE_OPTIONS: TravelOption[] = [
  { key: 'adventure', label: 'Adventure' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'budget', label: 'Budget' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'foodie', label: 'Foodie' },
  { key: 'solo', label: 'Solo' },
  { key: 'family', label: 'Family' },
  { key: 'business', label: 'Business' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'nightlife', label: 'Nightlife' },
];

/** Short pace label for the Complete summary; em-dash when unset. */
export const paceShort = (key?: string): string =>
  PACE_OPTIONS.find((o) => o.key === key)?.short ?? '—';
