import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const WHO_GHO_REMOTE = 'https://ghoapi.azureedge.net/api';
const WHO_GHO_BASE = import.meta.env.DEV ? '/api/who' : WHO_GHO_REMOTE;
const INDICATOR = 'WSH_WATER_SAFELY_MANAGED';

const FALLBACK_DEFINITION =
  'Percentage of population drinking water from an improved source that is accessible on premises, available when needed and free from faecal and priority chemical contamination.';
const SOURCE_NAME = 'WHO/UNICEF JMP (via WHO GHO)';
const SOURCE_URL =
  'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/population-using-safely-managed-drinking-water-services-%28-%29';

const isDev = import.meta.env.DEV;

export interface WaterSafetyData {
  iso3: string;
  value_pct: number | null;
  year: number | null;
  definition: string;
  source_name: string;
  source_url: string;
  last_updated: string | null;
}

interface UseWaterSafetyReturn {
  data: WaterSafetyData | null;
  isLoading: boolean;
  error: string | null;
}

// ── Cache: null-value results expire after 5 min to allow retries ──
const cache = new Map<string, { data: WaterSafetyData; ts: number }>();
const CACHE_TTL_SUCCESS = 7 * 24 * 60 * 60 * 1000;
const CACHE_TTL_EMPTY = 5 * 60 * 1000;

// ── Schema-agnostic row parsing ──

function detectYearField(row: Record<string, any>): string | null {
  for (const c of ['TimeDim', 'Year', 'Period', 'TimeDimensionBegin']) {
    if (row[c] !== undefined) return c;
  }
  return null;
}

function extractValue(row: Record<string, any>): number | null {
  for (const k of ['NumericValue', 'Value', 'DisplayValue']) {
    if (row[k] != null) {
      const n = parseFloat(String(row[k]));
      if (!isNaN(n)) return Math.round(n * 100) / 100;
    }
  }
  return null;
}

function hasTotal(row: Record<string, any>): boolean {
  for (const k of Object.keys(row)) {
    const kl = k.toLowerCase();
    if (kl.includes('residence') || kl.includes('area') || kl.includes('type')) {
      const v = String(row[k] ?? '').toLowerCase();
      if (v.includes('totl') || v === 'total') return true;
    }
  }
  for (let i = 1; i <= 8; i++) {
    const v = row[`Dim${i}`];
    if (v != null) {
      const s = String(v).toLowerCase();
      if (s.includes('totl') || s === 'total') return true;
    }
  }
  return false;
}

function pickBestRow(rows: any[]): { chosen: any; year: number | null } | null {
  if (rows.length === 0) return null;
  const yearField = detectYearField(rows[0]);

  let latestYear = 0;
  if (yearField) {
    for (const r of rows) {
      const y = parseInt(String(r[yearField]), 10);
      if (!isNaN(y) && y > latestYear) latestYear = y;
    }
  }

  const latestRows = yearField && latestYear > 0
    ? rows.filter(r => parseInt(String(r[yearField]), 10) === latestYear)
    : rows;

  const chosen = latestRows.find(r => hasTotal(r)) || latestRows[0];
  return { chosen, year: latestYear || null };
}

// ── Fetch strategies ──

/** Strategy 1: Call Supabase edge function (proxies WHO, avoids CORS). */
async function fetchViaEdgeFunction(iso3: string): Promise<WaterSafetyData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('who-water-safety', {
      body: { iso3 },
    });
    if (error) throw error;
    if (data && typeof data === 'object' && 'iso3' in data) {
      return data as WaterSafetyData;
    }
    return null;
  } catch (e) {
    if (isDev) console.debug('[useWaterSafety] Edge function unavailable:', (e as Error).message);
    return null;
  }
}

/** Strategy 2: Direct WHO OData fetch (works only if CORS allows — e.g. non-browser envs). */
async function fetchDirectWho(iso3: string): Promise<any[] | null> {
  const strategies = [
    `${WHO_GHO_BASE}/${INDICATOR}?$filter=SpatialDim%20eq%20'${iso3}'`,
    `${WHO_GHO_BASE}/${INDICATOR}?$filter=LocationCode%20eq%20'${iso3}'`,
  ];

  for (const url of strategies) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const rows = json.value || [];
      if (rows.length > 0) {
        if (isDev) console.debug(`[useWaterSafety] Direct WHO fetch succeeded: ${url}, ${rows.length} rows`);
        return rows;
      }
    } catch {
      // CORS block or network error — expected in browser
      continue;
    }
  }
  return null;
}

function buildResponse(iso3: string, rows: any[]): WaterSafetyData {
  const result = pickBestRow(rows);

  if (isDev) {
    const sample = rows[0];
    console.debug('[useWaterSafety] Parse result:', {
      iso3,
      rowCount: rows.length,
      firstRowKeys: sample ? Object.keys(sample) : [],
      sampleFields: sample ? {
        SpatialDim: sample.SpatialDim,
        LocationCode: sample.LocationCode,
        Location: sample.Location,
        SpatialDimType: sample.SpatialDimType,
        TimeDim: sample.TimeDim,
        NumericValue: sample.NumericValue,
      } : null,
      yearField: sample ? detectYearField(sample) : null,
      chosenYear: result?.year,
      chosenValue: result ? extractValue(result.chosen) : null,
    });
  }

  return {
    iso3,
    value_pct: result ? extractValue(result.chosen) : null,
    year: result?.year ?? null,
    definition: FALLBACK_DEFINITION,
    source_name: SOURCE_NAME,
    source_url: SOURCE_URL,
    last_updated: result?.chosen?.Date || result?.chosen?.DateModified || null,
  };
}

// ── Hook ──

export function useWaterSafety(iso3: string | null): UseWaterSafetyReturn {
  const [data, setData] = useState<WaterSafetyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iso3) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cached = cache.get(iso3);
    if (cached) {
      const ttl = cached.data.value_pct != null ? CACHE_TTL_SUCCESS : CACHE_TTL_EMPTY;
      if (Date.now() - cached.ts < ttl) {
        setData(cached.data);
        setIsLoading(false);
        setError(null);
        return;
      }
      cache.delete(iso3);
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let waterData: WaterSafetyData | null = null;

        if (isDev) {
          // In dev: use Vite proxy (bypasses CORS) — skip edge function
          if (isDev) console.debug('[useWaterSafety] DEV mode — using Vite proxy for', iso3);
          const rows = await fetchDirectWho(iso3);
          if (rows && rows.length > 0) {
            waterData = buildResponse(iso3, rows);
          }
        } else {
          // In prod: try Supabase edge function first (CORS-safe proxy)
          waterData = await fetchViaEdgeFunction(iso3);

          // Fallback to direct WHO fetch (may fail due to CORS in browser)
          if (!waterData || waterData.value_pct == null) {
            const rows = await fetchDirectWho(iso3);
            if (rows && rows.length > 0) {
              waterData = buildResponse(iso3, rows);
            }
          }
        }

        if (cancelled) return;

        // 3) If everything failed, return null data
        if (!waterData) {
          waterData = {
            iso3,
            value_pct: null,
            year: null,
            definition: FALLBACK_DEFINITION,
            source_name: SOURCE_NAME,
            source_url: SOURCE_URL,
            last_updated: null,
          };
        }

        cache.set(iso3, { data: waterData, ts: Date.now() });
        setData(waterData);
      } catch (err) {
        if (cancelled) return;
        console.error('[useWaterSafety] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setData(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, [iso3]);

  return { data, isLoading, error };
}
