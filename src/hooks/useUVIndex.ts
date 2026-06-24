import { useEffect, useState } from 'react';

// Real UV data from Open-Meteo (https://open-meteo.com) — free, no API key.
// Uses the destination's existing coordinates; no geocoding. Never fabricates:
// on any failure the hook clears `data` so the card renders "—".

export interface UVIndexData {
  /** UV index for the destination's current local hour. */
  now: number | null;
  /** Forecast peak UV for the destination's current local day (uv_index_max). */
  max: number | null;
}

interface UseUVIndexReturn {
  data: UVIndexData | null;
  isLoading: boolean;
  error: string | null;
}

const isDev = import.meta.env.DEV;

// Short TTL: UV is time-of-day dependent, so the "now" value goes stale within
// the hour. Keyed by coarse coordinates (~1km) to dedupe identical lookups.
const cache = new Map<string, { data: UVIndexData; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Open-Meteo hourly timestamps are local wall-clock strings (we request
 * timezone=auto), e.g. "2026-06-24T13:00". Build the key for the destination's
 * current hour using the UTC offset the API returns alongside the data.
 */
function currentHourKey(utcOffsetSeconds: number): string {
  const local = new Date(Date.now() + utcOffsetSeconds * 1000);
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(
    local.getUTCDate(),
  )}T${pad(local.getUTCHours())}:00`;
}

export function useUVIndex(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): UseUVIndexReturn {
  const [data, setData] = useState<UVIndexData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCoords = latitude != null && longitude != null;
  const key = hasCoords ? `${latitude!.toFixed(2)},${longitude!.toFixed(2)}` : null;

  useEffect(() => {
    if (!hasCoords || !key) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchUV = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
          `&longitude=${longitude}&daily=uv_index_max&hourly=uv_index&timezone=auto`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
        const json = await res.json();

        const times: string[] = json?.hourly?.time ?? [];
        const hourly: number[] = json?.hourly?.uv_index ?? [];
        const dailyMax: number[] = json?.daily?.uv_index_max ?? [];
        const offset: number = json?.utc_offset_seconds ?? 0;

        const idx = times.indexOf(currentHourKey(offset));
        const nowVal = idx >= 0 && Number.isFinite(hourly[idx]) ? hourly[idx] : null;
        const maxVal = Number.isFinite(dailyMax[0]) ? dailyMax[0] : null;

        // Nothing usable came back — treat as a failure, not a zero reading.
        if (nowVal == null && maxVal == null) {
          throw new Error('No UV index values in Open-Meteo response');
        }

        if (cancelled) return;
        const uvData: UVIndexData = { now: nowVal, max: maxVal };
        cache.set(key, { data: uvData, ts: Date.now() });
        setData(uvData);
      } catch (err) {
        if (cancelled) return;
        if (isDev) console.debug('[useUVIndex] fetch failed:', (err as Error).message);
        setError(err instanceof Error ? err.message : 'Failed to fetch UV index');
        setData(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchUV();

    return () => {
      cancelled = true;
    };
  }, [hasCoords, key, latitude, longitude]);

  return { data, isLoading, error };
}
