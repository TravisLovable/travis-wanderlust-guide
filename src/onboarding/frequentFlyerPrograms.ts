// Step 7.5 — Per-airline frequent-flyer programs.
//
// Real, documented loyalty programs for the 25 carriers verified via live web
// search in Phase 1 (see PR discussion / commit history for sources cited per
// airline — American through Air Canada). Deliberately NOT auto-derived from
// the airlines.ts dataset: only a small fraction of the ~954 airlines there
// have a real elite-tier program, and there's no reliable mechanical signal
// to detect that, so this is a hand-maintained allowlist by design (unlike
// airlines.ts / countries.ts, which are generated specifically to avoid hand-
// maintenance). Ryanair and easyJet were explicitly researched and confirmed
// to have no elite-tier program — absent here, not an oversight.
//
// Keyed by IATA code. Air France/KLM and Lufthansa/ITA Airways share a single
// program each (Flying Blue; Miles & More since ITA's Volare was discontinued
// April 2026) — both codes point at the same tier list rather than duplicating
// it. Tier `key` values are stable storage keys (frequent_flyer_status_by_
// airline jsonb: IATA code -> tier key); `label` is display-only. Every list
// includes the base/no-status entry first, even where the program itself
// doesn't formally name one (e.g. Delta, United — the base tier before any
// named status).
//
// Singapore Airlines' KrisFlyer is simplified here: the program actually runs
// two related but distinct ladders (KrisFlyer Elite Silver/Gold, and the
// separate PPS Club/Solitaire PPS Club premium-cabin track). Presented as one
// ascending list for a simple tier picker — flagged here rather than silently
// flattened without comment.

export interface FrequentFlyerTier {
  /** Stable key — stored as the value in frequent_flyer_status_by_airline. */
  key: string;
  /** Chip label. */
  label: string;
}

export interface FrequentFlyerProgram {
  /** Program name, e.g. "SkyMiles Medallion". */
  programName: string;
  /** Ascending order, including the base/no-status entry. */
  tiers: FrequentFlyerTier[];
}

const FLYING_BLUE: FrequentFlyerProgram = {
  programName: 'Flying Blue',
  tiers: [
    { key: 'explorer', label: 'Explorer' },
    { key: 'silver', label: 'Silver' },
    { key: 'gold', label: 'Gold' },
    { key: 'platinum', label: 'Platinum' },
    { key: 'ultimate', label: 'Ultimate' },
  ],
};

const MILES_AND_MORE: FrequentFlyerProgram = {
  programName: 'Miles & More',
  tiers: [
    { key: 'none', label: 'Member' },
    { key: 'frequent_traveller', label: 'Frequent Traveller' },
    { key: 'senator', label: 'Senator' },
    { key: 'hon_circle', label: 'HON Circle' },
  ],
};

export const FREQUENT_FLYER_PROGRAMS: Record<string, FrequentFlyerProgram> = {
  AA: {
    programName: 'AAdvantage',
    tiers: [
      { key: 'none', label: 'None' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'platinum_pro', label: 'Platinum Pro' },
      { key: 'executive_platinum', label: 'Executive Platinum' },
    ],
  },
  DL: {
    programName: 'SkyMiles Medallion',
    tiers: [
      { key: 'none', label: 'None' },
      { key: 'silver', label: 'Silver Medallion' },
      { key: 'gold', label: 'Gold Medallion' },
      { key: 'platinum', label: 'Platinum Medallion' },
      { key: 'diamond', label: 'Diamond Medallion' },
    ],
  },
  UA: {
    programName: 'MileagePlus Premier',
    tiers: [
      { key: 'none', label: 'None' },
      { key: 'silver', label: 'Premier Silver' },
      { key: 'gold', label: 'Premier Gold' },
      { key: 'platinum', label: 'Premier Platinum' },
      { key: 'premier_1k', label: 'Premier 1K' },
    ],
  },
  WN: {
    programName: 'Rapid Rewards',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'a_list', label: 'A-List' },
      { key: 'a_list_preferred', label: 'A-List Preferred' },
    ],
  },
  B6: {
    programName: 'TrueBlue Mosaic',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'mosaic_1', label: 'Mosaic 1' },
      { key: 'mosaic_2', label: 'Mosaic 2' },
      { key: 'mosaic_3', label: 'Mosaic 3' },
      { key: 'mosaic_4', label: 'Mosaic 4' },
    ],
  },
  AS: {
    // Rebranded from "Mileage Plan" to "Atmos Rewards" Oct 2025.
    programName: 'Atmos Rewards',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
    ],
  },
  BA: {
    // Rebranded from "Executive Club" to "BA Club" in 2025.
    programName: 'BA Club',
    tiers: [
      { key: 'blue', label: 'Blue' },
      { key: 'bronze', label: 'Bronze' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'gold_guest_list', label: 'Gold Guest List' },
    ],
  },
  LH: MILES_AND_MORE,
  AF: FLYING_BLUE,
  KL: FLYING_BLUE,
  IB: {
    programName: 'Iberia Plus',
    tiers: [
      { key: 'classic', label: 'Classic' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'platinum_prime', label: 'Platinum Prime' },
      { key: 'infinita', label: 'Infinita' },
      { key: 'infinita_prime', label: 'Infinita Prime' },
    ],
  },
  TP: {
    programName: 'Miles&Go',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'navigator', label: 'Navigator' },
    ],
  },
  // ITA Airways' own Volare program was discontinued April 1, 2026; ITA now
  // runs on Lufthansa Group's Miles & More, same as LH.
  AZ: MILES_AND_MORE,
  NH: {
    programName: 'ANA Mileage Club',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'bronze', label: 'Bronze' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'diamond', label: 'Diamond' },
    ],
  },
  JL: {
    programName: 'JAL Mileage Bank',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'crystal', label: 'Crystal' },
      { key: 'sapphire', label: 'Sapphire' },
    ],
  },
  AM: {
    programName: 'Aeromexico Rewards',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'titanium', label: 'Titanium' },
    ],
  },
  LA: {
    programName: 'LATAM Pass',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'black', label: 'Black' },
      { key: 'black_signature', label: 'Black Signature' },
    ],
  },
  G3: {
    programName: 'Smiles',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'prata', label: 'Prata' },
      { key: 'ouro', label: 'Ouro' },
      { key: 'diamante', label: 'Diamante' },
      { key: 'diamante_magno', label: 'Diamante Magno' },
    ],
  },
  EK: {
    programName: 'Skywards',
    tiers: [
      { key: 'blue', label: 'Blue' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
    ],
  },
  QR: {
    programName: 'Privilege Club',
    tiers: [
      { key: 'burgundy', label: 'Burgundy' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
    ],
  },
  SQ: {
    // See file header — simplifies KrisFlyer's dual-ladder structure.
    programName: 'KrisFlyer',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: 'elite_silver', label: 'Elite Silver' },
      { key: 'elite_gold', label: 'Elite Gold' },
      { key: 'pps_club', label: 'PPS Club' },
      { key: 'solitaire_pps_club', label: 'Solitaire PPS Club' },
    ],
  },
  TK: {
    programName: 'Miles&Smiles',
    tiers: [
      { key: 'classic', label: 'Classic' },
      { key: 'classic_plus', label: 'Classic Plus' },
      { key: 'elite', label: 'Elite' },
      { key: 'elite_plus', label: 'Elite Plus' },
    ],
  },
  CX: {
    // Merged Asia Miles + Marco Polo Club into one "Cathay" program in 2025.
    programName: 'Cathay',
    tiers: [
      { key: 'green', label: 'Green' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'diamond', label: 'Diamond' },
      { key: 'diamond_plus', label: 'Diamond Plus' },
    ],
  },
  QF: {
    programName: 'Qantas Frequent Flyer',
    tiers: [
      { key: 'bronze', label: 'Bronze' },
      { key: 'silver', label: 'Silver' },
      { key: 'gold', label: 'Gold' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'platinum_one', label: 'Platinum One' },
    ],
  },
  AC: {
    programName: 'Aeroplan',
    tiers: [
      { key: 'none', label: 'Member' },
      { key: '25k', label: '25K' },
      { key: '35k', label: '35K' },
      { key: '50k', label: '50K' },
      { key: '75k', label: '75K' },
      { key: 'super_elite', label: 'Super Elite' },
    ],
  },
};

/** Friendly tier label for an airline+key pair; em-dash when unset or unknown. */
export const tierLabel = (code: string, key?: string | null): string => {
  if (!key) return '—';
  return FREQUENT_FLYER_PROGRAMS[code]?.tiers.find((t) => t.key === key)?.label ?? '—';
};
