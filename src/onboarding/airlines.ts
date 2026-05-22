// Step 7.5 — Airline catalog.
//
// Selected airlines persist as IATA codes in users.airlines (per the column
// comment "up to 3 preferred airline codes, e.g. AA, UA"); `name` is display-
// only. Shared between AirlineStep (renders the chips) and CompleteStep (maps
// stored codes back to names for the recap).

export interface Airline {
  /** IATA code — the stored value (users.airlines text[]). */
  code: string;
  /** Display name (chips, recap). */
  name: string;
}

export const AIRLINES: Airline[] = [
  { code: 'AA', name: 'American' },
  { code: 'DL', name: 'Delta' },
  { code: 'UA', name: 'United' },
  { code: 'WN', name: 'Southwest' },
  { code: 'B6', name: 'JetBlue' },
  { code: 'AS', name: 'Alaska' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM' },
  { code: 'IB', name: 'Iberia' },
  { code: 'TP', name: 'TAP Portugal' },
  { code: 'AZ', name: 'ITA Airways' },
  { code: 'NH', name: 'ANA' },
  { code: 'JL', name: 'JAL' },
  { code: 'AM', name: 'Aeromexico' },
  { code: 'LA', name: 'LATAM' },
  { code: 'G3', name: 'GOL' },
];

/** Friendly name for an IATA code; falls back to the code for unknown values. */
export const airlineName = (code: string): string =>
  AIRLINES.find((a) => a.code === code)?.name ?? code;
