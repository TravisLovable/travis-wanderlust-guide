import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WHO_GHO_BASE = 'https://ghoapi.azureedge.net/api'
const INDICATOR = 'WSH_WATER_SAFELY_MANAGED'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const FALLBACK_DEFINITION =
  'Percentage of population drinking water from an improved source that is accessible on premises, available when needed and free from faecal and priority chemical contamination.'

const SOURCE_NAME = 'WHO/UNICEF JMP (via WHO GHO)'
const SOURCE_URL =
  'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/population-using-safely-managed-drinking-water-services-%28-%29'

// ── In-memory cache keyed by ISO3 ──
interface CacheEntry {
  data: WaterSafetyResponse
  expiresAt: number
}
const cache = new Map<string, CacheEntry>()

interface WaterSafetyResponse {
  iso3: string
  value_pct: number | null
  year: number | null
  definition: string
  source_name: string
  source_url: string
  last_updated: string | null
}

// ── Indicator definition (fetched once, cached for process lifetime) ──
let cachedDefinition: string | null = null

async function fetchDefinition(): Promise<string> {
  if (cachedDefinition) return cachedDefinition

  try {
    const url = `${WHO_GHO_BASE}/Indicator?$filter=IndicatorCode%20eq%20'${INDICATOR}'`
    const res = await fetch(url)
    if (res.ok) {
      const json = await res.json()
      const entry = json.value?.[0]
      const def = entry?.Definition || entry?.IndicatorDefinition || null
      if (def && typeof def === 'string' && def.length > 20) {
        cachedDefinition = def
        return def
      }
    }
  } catch (e) {
    console.warn('Failed to fetch WHO indicator metadata, using fallback definition:', e)
  }

  cachedDefinition = FALLBACK_DEFINITION
  return FALLBACK_DEFINITION
}

// ── Schema-agnostic field detection ──

/** Detect which key holds the ISO3 location code. Priority: SpatialDim > LocationCode > Location (only if ISO3-shaped). */
export function detectLocationField(row: Record<string, any>): string | null {
  if (row.SpatialDim !== undefined) return 'SpatialDim'
  if (row.LocationCode !== undefined) return 'LocationCode'
  // Only use Location if its value looks like an ISO3 code (3 uppercase letters)
  if (row.Location !== undefined && typeof row.Location === 'string' && /^[A-Z]{3}$/.test(row.Location)) {
    return 'Location'
  }
  return null
}

/** Detect which key holds the year. Priority: TimeDim > Year > Period. */
export function detectYearField(row: Record<string, any>): string | null {
  if (row.TimeDim !== undefined) return 'TimeDim'
  if (row.Year !== undefined) return 'Year'
  if (row.Period !== undefined) return 'Period'
  return null
}

/** Extract numeric value from a row. Priority: NumericValue > Value > DisplayValue. */
export function extractValue(row: Record<string, any>): number | null {
  if (row.NumericValue != null) {
    const n = Number(row.NumericValue)
    return isNaN(n) ? null : Math.round(n * 100) / 100
  }
  if (row.Value != null) {
    const n = parseFloat(String(row.Value))
    return isNaN(n) ? null : Math.round(n * 100) / 100
  }
  if (row.DisplayValue != null) {
    const n = parseFloat(String(row.DisplayValue))
    return isNaN(n) ? null : Math.round(n * 100) / 100
  }
  return null
}

/** Check if a row has a "Total" dimension for residence area type. Scans all plausible fields. */
export function hasTotal(row: Record<string, any>): boolean {
  const keys = Object.keys(row)

  // Check explicit ResidenceAreaType field
  for (const k of keys) {
    if (k.toLowerCase().includes('residence') || k.toLowerCase().includes('area')) {
      const v = String(row[k] ?? '').toLowerCase()
      if (v.includes('totl') || v === 'total') return true
    }
  }

  // Check Dim1..Dim8
  for (let i = 1; i <= 8; i++) {
    const v = row[`Dim${i}`]
    if (v != null) {
      const s = String(v).toLowerCase()
      if (s.includes('totl') || s === 'total') return true
    }
  }

  return false
}

/** Core row selection: filter by iso3, pick latest year, prefer Total. Exported for testing. */
export function selectRow(
  rows: any[],
  iso3: string
): { chosen: any | null; year: number | null; locationField: string | null; yearField: string | null } {
  if (rows.length === 0) {
    return { chosen: null, year: null, locationField: null, yearField: null }
  }

  const sample = rows[0]
  const locationField = detectLocationField(sample)
  const yearField = detectYearField(sample)

  if (!locationField) {
    console.warn(
      `[who-water-safety] Could not detect location field. Keys: ${Object.keys(sample).join(', ')}`
    )
    return { chosen: null, year: null, locationField: null, yearField: null }
  }

  // Filter to rows matching the requested iso3
  const isoUpper = iso3.toUpperCase()
  const countryRows = rows.filter((r: any) => String(r[locationField]).toUpperCase() === isoUpper)

  if (countryRows.length === 0) {
    console.log(
      `[who-water-safety] No rows matched ${iso3} on field "${locationField}". ` +
      `Total rows: ${rows.length}. First row ${locationField}: ${sample[locationField]}`
    )
    return { chosen: null, year: null, locationField, yearField }
  }

  // Find latest year
  let latestYear = 0
  if (yearField) {
    for (const r of countryRows) {
      const y = parseInt(String(r[yearField]), 10)
      if (!isNaN(y) && y > latestYear) latestYear = y
    }
  }

  // Filter to latest year (or all rows if no year field)
  const latestRows = yearField
    ? countryRows.filter((r: any) => parseInt(String(r[yearField]), 10) === latestYear)
    : countryRows

  // Prefer "Total" row
  let chosen = latestRows.find((r: any) => hasTotal(r))

  if (!chosen) {
    chosen = latestRows[0]
    if (latestRows.length > 1) {
      console.warn(
        `[who-water-safety] Could not confidently filter to "Total" for ${iso3} year ${latestYear}. ` +
        `Found ${latestRows.length} rows. Using first row.`
      )
    }
  }

  return {
    chosen,
    year: latestYear || null,
    locationField,
    yearField,
  }
}

// ── Main data fetch ──
async function fetchWaterSafety(iso3: string): Promise<WaterSafetyResponse> {
  // Check cache
  const cached = cache.get(iso3)
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[who-water-safety] Cache hit for ${iso3}`)
    return cached.data
  }

  const definition = await fetchDefinition()

  // Fetch full dataset (no server-side $filter on SpatialDim — field name may vary)
  const dataUrl = `${WHO_GHO_BASE}/${INDICATOR}?$filter=SpatialDim%20eq%20'${iso3}'`

  let rows: any[] = []

  // Try OData filter first (works when SpatialDim exists)
  const res = await fetch(dataUrl)
  if (res.ok) {
    const json = await res.json()
    rows = json.value || []
  }

  // If OData filter returned nothing, the dataset may use a different field name.
  // Fetch a broader set and filter client-side.
  if (rows.length === 0) {
    console.log(`[who-water-safety] OData SpatialDim filter returned 0 rows for ${iso3}, trying broader fetch`)
    const broadUrl = `${WHO_GHO_BASE}/${INDICATOR}?$top=5000`
    const broadRes = await fetch(broadUrl)
    if (broadRes.ok) {
      const broadJson = await broadRes.json()
      rows = broadJson.value || []
    }
  }

  const { chosen, year, locationField, yearField } = selectRow(rows, iso3)

  if (!chosen) {
    console.log(
      `[who-water-safety] NULL result for ${iso3}. ` +
      `locationField=${locationField}, yearField=${yearField}, ` +
      `totalRows=${rows.length}, ` +
      `keys=${rows[0] ? Object.keys(rows[0]).join(',') : 'none'}, ` +
      `first2=${JSON.stringify(rows.slice(0, 2))}`
    )

    const result: WaterSafetyResponse = {
      iso3,
      value_pct: null,
      year: null,
      definition,
      source_name: SOURCE_NAME,
      source_url: SOURCE_URL,
      last_updated: null,
    }
    cache.set(iso3, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })
    return result
  }

  const valuePct = extractValue(chosen)
  const lastUpdated = chosen.Date || chosen.DateModified || null

  const result: WaterSafetyResponse = {
    iso3,
    value_pct: valuePct,
    year: year,
    definition,
    source_name: SOURCE_NAME,
    source_url: SOURCE_URL,
    last_updated: lastUpdated,
  }

  console.log(`[who-water-safety] ${iso3}: year=${year}, value=${valuePct}% (field=${locationField})`)

  cache.set(iso3, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })
  return result
}

// ── Edge function handler ──
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let iso3: string | null = null

    // Support GET with query param or POST with JSON body
    if (req.method === 'GET') {
      const url = new URL(req.url)
      iso3 = url.searchParams.get('iso3')
    } else {
      const body = await req.json().catch(() => ({}))
      iso3 = body.iso3 || null
    }

    // Validate: must be exactly 3 uppercase letters
    if (!iso3 || !/^[A-Z]{3}$/.test(iso3)) {
      return new Response(
        JSON.stringify({
          error: 'iso3 parameter is required and must be exactly 3 uppercase letters (e.g. PER, USA, JPN)',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await fetchWaterSafety(iso3)

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=604800',
      },
    })
  } catch (error) {
    console.error('[who-water-safety] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
