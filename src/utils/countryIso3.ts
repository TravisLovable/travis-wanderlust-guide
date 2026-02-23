/**
 * Resolve a destination to an ISO 3166-1 alpha-3 country code.
 *
 * Strategy:
 *  1. If SelectedPlace carries a 2-letter country_code, convert via cca2→cca3 map.
 *  2. Otherwise, parse the destination string for known country names.
 *  3. Returns null if unresolvable.
 */

// ISO 3166-1 alpha-2 → alpha-3 conversion
const cca2ToCca3: Record<string, string> = {
  AF: 'AFG', AL: 'ALB', DZ: 'DZA', AD: 'AND', AO: 'AGO', AG: 'ATG', AR: 'ARG', AM: 'ARM',
  AU: 'AUS', AT: 'AUT', AZ: 'AZE', BS: 'BHS', BH: 'BHR', BD: 'BGD', BB: 'BRB', BY: 'BLR',
  BE: 'BEL', BZ: 'BLZ', BJ: 'BEN', BT: 'BTN', BO: 'BOL', BA: 'BIH', BW: 'BWA', BR: 'BRA',
  BN: 'BRN', BG: 'BGR', BF: 'BFA', BI: 'BDI', KH: 'KHM', CM: 'CMR', CA: 'CAN', CV: 'CPV',
  CF: 'CAF', TD: 'TCD', CL: 'CHL', CN: 'CHN', CO: 'COL', KM: 'COM', CG: 'COG', CD: 'COD',
  CR: 'CRI', HR: 'HRV', CU: 'CUB', CY: 'CYP', CZ: 'CZE', DK: 'DNK', DJ: 'DJI', DM: 'DMA',
  DO: 'DOM', EC: 'ECU', EG: 'EGY', SV: 'SLV', GQ: 'GNQ', ER: 'ERI', EE: 'EST', SZ: 'SWZ',
  ET: 'ETH', FJ: 'FJI', FI: 'FIN', FR: 'FRA', GA: 'GAB', GM: 'GMB', GE: 'GEO', DE: 'DEU',
  GH: 'GHA', GR: 'GRC', GD: 'GRD', GT: 'GTM', GN: 'GIN', GW: 'GNB', GY: 'GUY', HT: 'HTI',
  HN: 'HND', HU: 'HUN', IS: 'ISL', IN: 'IND', ID: 'IDN', IR: 'IRN', IQ: 'IRQ', IE: 'IRL',
  IL: 'ISR', IT: 'ITA', CI: 'CIV', JM: 'JAM', JP: 'JPN', JO: 'JOR', KZ: 'KAZ', KE: 'KEN',
  KI: 'KIR', KP: 'PRK', KR: 'KOR', KW: 'KWT', KG: 'KGZ', LA: 'LAO', LV: 'LVA', LB: 'LBN',
  LS: 'LSO', LR: 'LBR', LY: 'LBY', LI: 'LIE', LT: 'LTU', LU: 'LUX', MG: 'MDG', MW: 'MWI',
  MY: 'MYS', MV: 'MDV', ML: 'MLI', MT: 'MLT', MH: 'MHL', MR: 'MRT', MU: 'MUS', MX: 'MEX',
  FM: 'FSM', MD: 'MDA', MC: 'MCO', MN: 'MNG', ME: 'MNE', MA: 'MAR', MZ: 'MOZ', MM: 'MMR',
  NA: 'NAM', NR: 'NRU', NP: 'NPL', NL: 'NLD', NZ: 'NZL', NI: 'NIC', NE: 'NER', NG: 'NGA',
  MK: 'MKD', NO: 'NOR', OM: 'OMN', PK: 'PAK', PW: 'PLW', PA: 'PAN', PG: 'PNG', PY: 'PRY',
  PE: 'PER', PH: 'PHL', PL: 'POL', PT: 'PRT', QA: 'QAT', RO: 'ROU', RU: 'RUS', RW: 'RWA',
  KN: 'KNA', LC: 'LCA', VC: 'VCT', WS: 'WSM', SM: 'SMR', ST: 'STP', SA: 'SAU', SN: 'SEN',
  RS: 'SRB', SC: 'SYC', SL: 'SLE', SG: 'SGP', SK: 'SVK', SI: 'SVN', SB: 'SLB', SO: 'SOM',
  ZA: 'ZAF', SS: 'SSD', ES: 'ESP', LK: 'LKA', SD: 'SDN', SR: 'SUR', SE: 'SWE', CH: 'CHE',
  SY: 'SYR', TW: 'TWN', TJ: 'TJK', TZ: 'TZA', TH: 'THA', TL: 'TLS', TG: 'TGO', TO: 'TON',
  TT: 'TTO', TN: 'TUN', TR: 'TUR', TM: 'TKM', TV: 'TUV', UG: 'UGA', UA: 'UKR', AE: 'ARE',
  GB: 'GBR', US: 'USA', UY: 'URY', UZ: 'UZB', VU: 'VUT', VE: 'VEN', VN: 'VNM', YE: 'YEM',
  ZM: 'ZMB', ZW: 'ZWE', HK: 'HKG', MO: 'MAC', PS: 'PSE', XK: 'XKX',
};

// Country name → ISO3 for string-based fallback resolution
const nameToCca3: Record<string, string> = {
  'united states': 'USA', 'usa': 'USA', 'us': 'USA',
  'united kingdom': 'GBR', 'uk': 'GBR', 'england': 'GBR', 'scotland': 'GBR', 'wales': 'GBR',
  'france': 'FRA', 'germany': 'DEU', 'italy': 'ITA', 'spain': 'ESP',
  'canada': 'CAN', 'mexico': 'MEX', 'brazil': 'BRA', 'argentina': 'ARG',
  'chile': 'CHL', 'colombia': 'COL', 'peru': 'PER', 'venezuela': 'VEN',
  'japan': 'JPN', 'china': 'CHN', 'india': 'IND', 'south korea': 'KOR', 'korea': 'KOR',
  'thailand': 'THA', 'singapore': 'SGP', 'malaysia': 'MYS', 'indonesia': 'IDN', 'vietnam': 'VNM',
  'philippines': 'PHL', 'cambodia': 'KHM', 'myanmar': 'MMR', 'laos': 'LAO', 'nepal': 'NPL',
  'australia': 'AUS', 'new zealand': 'NZL',
  'south africa': 'ZAF', 'egypt': 'EGY', 'nigeria': 'NGA', 'kenya': 'KEN',
  'morocco': 'MAR', 'ghana': 'GHA', 'ethiopia': 'ETH', 'tanzania': 'TZA', 'uganda': 'UGA',
  'rwanda': 'RWA', 'senegal': 'SEN',
  'netherlands': 'NLD', 'belgium': 'BEL', 'austria': 'AUT', 'switzerland': 'CHE',
  'portugal': 'PRT', 'greece': 'GRC', 'poland': 'POL', 'czech republic': 'CZE', 'czechia': 'CZE',
  'hungary': 'HUN', 'romania': 'ROU', 'bulgaria': 'BGR', 'croatia': 'HRV',
  'slovenia': 'SVN', 'slovakia': 'SVK', 'serbia': 'SRB',
  'sweden': 'SWE', 'norway': 'NOR', 'denmark': 'DNK', 'finland': 'FIN', 'iceland': 'ISL',
  'ireland': 'IRL', 'scotland': 'GBR',
  'turkey': 'TUR', 'russia': 'RUS', 'ukraine': 'UKR',
  'uae': 'ARE', 'united arab emirates': 'ARE', 'dubai': 'ARE',
  'saudi arabia': 'SAU', 'qatar': 'QAT', 'kuwait': 'KWT', 'oman': 'OMN',
  'israel': 'ISR', 'jordan': 'JOR', 'lebanon': 'LBN',
  'taiwan': 'TWN', 'hong kong': 'HKG', 'macau': 'MAC',
  'bali': 'IDN', 'phuket': 'THA', 'cancun': 'MEX', 'tulum': 'MEX',
  'costa rica': 'CRI', 'panama': 'PAN', 'cuba': 'CUB', 'jamaica': 'JAM',
  'dominican republic': 'DOM', 'puerto rico': 'PRI',
  'sri lanka': 'LKA', 'maldives': 'MDV', 'fiji': 'FJI',
  'pakistan': 'PAK', 'bangladesh': 'BGD',
  'luxembourg': 'LUX', 'malta': 'MLT', 'cyprus': 'CYP', 'estonia': 'EST',
  'latvia': 'LVA', 'lithuania': 'LTU',
};

/**
 * Convert a 2-letter country code to a 3-letter ISO code.
 */
export function cca2ToIso3(cca2: string): string | null {
  return cca2ToCca3[cca2.toUpperCase()] || null;
}

/**
 * Resolve ISO3 from a destination string by scanning for known country names.
 */
export function destinationToIso3(destination: string): string | null {
  const lower = destination.toLowerCase();

  // Check each known country name (longest-first isn't needed since we check includes)
  for (const [name, iso3] of Object.entries(nameToCca3)) {
    if (lower.includes(name)) {
      return iso3;
    }
  }

  return null;
}

/**
 * Best-effort ISO3 resolution from SelectedPlace.
 * Tries country_code first (2→3 conversion), then parses destination string.
 */
export function resolveIso3(
  countryCode?: string,
  destination?: string
): string | null {
  if (countryCode) {
    const iso3 = cca2ToIso3(countryCode);
    if (iso3) return iso3;
  }

  if (destination) {
    return destinationToIso3(destination);
  }

  return null;
}
