import { useState, useEffect } from 'react';
import { TravisInsights } from '@/types/insights';
import { useAuth } from '@/contexts/AuthContext';

interface UseTravisInsightsProps {
  destination: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  dates: {
    start: string;
    end: string;
  };
  widgetData: Record<string, unknown>;
  enabled?: boolean;
}

const asString = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
};

const asStringArray = (v: unknown): string[] | null => {
  if (!Array.isArray(v)) return null;
  const cleaned = v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((x) => x.length > 0);
  return cleaned.length > 0 ? cleaned : null;
};

function normalize(raw: unknown): TravisInsights {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    greeting: asString(r.greeting),
    weather: asString(r.weather),
    localTime: asString(r.localTime),
    waterSafety: asString(r.waterSafety),
    uvIndex: asString(r.uvIndex),
    pharmacyIntel: asString(r.pharmacyIntel),
    powerAdapter: asString(r.powerAdapter),
    currency: asString(r.currency),
    visa: asString(r.visa),
    healthEntry: asString(r.healthEntry),
    transportation: asString(r.transportation),
    localHolidays: asString(r.localHolidays),
    localEvents: asString(r.localEvents),
    culturalInsights: asString(r.culturalInsights),
    insiderAsides: asStringArray(r.insiderAsides),
  };
}

export function useTravisInsights({
  destination,
  dates,
  widgetData,
  enabled = true,
}: UseTravisInsightsProps) {
  const [insights, setInsights] = useState<TravisInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Personalize from the captured onboarding profile (public.users row).
  const { userProfile } = useAuth();
  const profileReady = !!userProfile;
  const fullName = asString(userProfile?.full_name);
  const firstName = fullName ? fullName.split(/\s+/)[0] : 'Traveler';
  const originCity = asString(userProfile?.home_city) ?? '';
  const originCountry = asString(userProfile?.passport_country) ?? '';

  useEffect(() => {
    // Wait for the profile to load before firing — never request with stand-in
    // identity. RequireOnboarding keeps un-onboarded users off this page.
    if (!enabled || !destination.city || !profileReady) return;
    let cancelled = false;

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travis-insights`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              destination,
              dates,
              user: {
                firstName,
                originCity,
                originCountry,
              },
              widgetData,
            }),
          },
        );

        if (!res.ok) throw new Error(`travis-insights: ${res.status}`);
        const raw: unknown = await res.json();
        if (cancelled) return;
        if ((raw as { error?: unknown })?.error) {
          throw new Error(String((raw as { error: unknown }).error));
        }
        setInsights(normalize(raw));
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setInsights(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInsights();

    return () => {
      cancelled = true;
    };
    // Re-fetch when the destination, dates, or resolved profile identity change
    // (the latter so the request fires once userProfile loads) — not when the
    // widgetData reference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    destination.city,
    destination.country,
    dates.start,
    dates.end,
    enabled,
    profileReady,
    firstName,
    originCity,
    originCountry,
  ]);

  return { insights, loading, error };
}
