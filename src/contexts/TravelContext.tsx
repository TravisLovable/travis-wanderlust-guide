import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ── Normalized country reference ──
export interface CountryRef {
  code: string;   // ISO 3166-1 alpha-2 (e.g. "BR")
  name: string;   // Display name (e.g. "Brazil")
  city?: string;  // City from IP geolocation (e.g. "Rio de Janeiro")
}

// Session-level cache — survives re-mounts but not full page reloads
let ipCache: CountryRef | null = null;

export type BaselineState = 'loading' | 'resolved' | 'unavailable';

interface TravelContextType {
  // Travel identity
  passport: string;
  origin: string;
  setPassport: (v: string) => void;
  setOrigin: (v: string) => void;
  ready: boolean;

  // Baseline country resolution
  manualBaselineCountry: CountryRef | null;
  ipDetectedCountry: CountryRef | null;
  resolvedBaselineCountry: CountryRef | null;
  baselineState: BaselineState;
  setManualBaselineCountry: (country: CountryRef | null) => void;
}

const TravelContext = createContext<TravelContextType>({
  passport: 'United States',
  origin: '',
  setPassport: () => {},
  setOrigin: () => {},
  ready: false,
  manualBaselineCountry: null,
  ipDetectedCountry: null,
  resolvedBaselineCountry: null,
  baselineState: 'loading',
  setManualBaselineCountry: () => {},
});

export const useTravelContext = () => useContext(TravelContext);

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'South Korea', 'Brazil', 'Mexico', 'India', 'China', 'South Africa',
  'Nigeria', 'United Arab Emirates', 'Singapore', 'New Zealand', 'Ireland',
  'Italy', 'Spain', 'Netherlands', 'Sweden', 'Switzerland', 'Norway', 'Denmark',
  'Portugal', 'Poland', 'Argentina', 'Chile', 'Colombia', 'Philippines', 'Thailand',
  'Israel', 'Egypt', 'Kenya', 'Ghana',
];

export { COUNTRIES };

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[TravelContext] ===== TravelProvider MOUNTED =====');

  const [passport, setPassportRaw] = useState('United States');
  const [origin, setOrigin] = useState('');
  const [ready, setReady] = useState(false);

  // ── Baseline country state ──
  const [manualBaselineCountry, setManualBaselineCountry] = useState<CountryRef | null>(null);
  const [ipDetectedCountry, setIpDetectedCountry] = useState<CountryRef | null>(null);
  const [ipLookupFinished, setIpLookupFinished] = useState(false);

  // Results page dropdown sets both passport display and manual baseline
  const setPassport = useCallback((v: string) => {
    setPassportRaw(v);
  }, []);

  // ── IP geolocation via direct browser call (single source of truth) ──
  const ipFetchStarted = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches from strict mode double-mount
    if (ipFetchStarted.current) return;
    ipFetchStarted.current = true;

    // Use session cache if available
    if (ipCache) {
      console.debug('[TravelContext] Using cached IP result:', ipCache);
      setIpDetectedCountry(ipCache);
      if (!origin) setOrigin(ipCache.city ? `${ipCache.city}, ${ipCache.name}` : ipCache.name);
      setIpLookupFinished(true);
      return;
    }

    // Try ipapi.co first (reliable free tier), fall back to ipwhois.is
    const tryIpwhois = async (): Promise<CountryRef | null> => {
      console.debug('[TravelContext] Trying ipwhois.is (fallback)...');
      const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`ipwhois returned ${res.status}`);
      const data = await res.json();
      console.debug('[TravelContext] Raw ipwhois.is response:', {
        country_code: data.country_code,
        country: data.country,
        city: data.city,
        success: data.success,
      });
      if (!data.success) throw new Error('ipwhois returned success=false');
      const cc2 = data.country_code;
      const name = data.country;
      const city = data.city || undefined;
      if (cc2 && name) return { code: cc2, name, city };
      return null;
    };

    const tryIpapi = async (): Promise<CountryRef | null> => {
      console.debug('[TravelContext] Trying ipapi.co...');
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`ipapi.co returned ${res.status}`);
      const data = await res.json();
      console.debug('[TravelContext] Raw ipapi.co response:', {
        country_code: data.country_code,
        country_name: data.country_name,
        city: data.city,
      });
      const cc2 = data.country_code;
      const name = data.country_name;
      const city = data.city || undefined;
      if (cc2 && name) return { code: cc2, name, city };
      return null;
    };

    const detectCountry = async () => {
      try {
        let result = await tryIpapi().catch((err) => {
          console.warn('[TravelContext] ipapi.co failed:', err.message);
          return null;
        });

        if (!result) {
          result = await tryIpwhois().catch((err) => {
            console.warn('[TravelContext] ipwhois.is also failed:', err.message);
            return null;
          });
        }

        if (result) {
          ipCache = result;
          setIpDetectedCountry(result);
          console.debug('[TravelContext] ipDetectedCountry set to:', result);

          if (!origin) {
            setOrigin(result.city ? `${result.city}, ${result.name}` : result.name);
          }
        } else {
          console.warn('[TravelContext] All IP geolocation providers failed');
          if (!origin) setOrigin('United States');
        }
      } catch (err) {
        console.warn('[TravelContext] IP geolocation unexpected error:', err);
        if (!origin) setOrigin('United States');
      } finally {
        setIpLookupFinished(true);
        console.debug('[TravelContext] IP lookup finished');
      }
    };

    detectCountry();
  }, []);

  // ── Load passport from user profile ──
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('users')
            .select('country_data')
            .eq('auth_id', user.id);
          if (data?.[0]?.country_data) {
            const name = data[0].country_data.name || data[0].country_data.code;
            if (name) setPassportRaw(name);
          }
        }
      } catch {
        // Keep defaults
      } finally {
        setReady(true);
      }
    };
    loadProfile();
  }, []);

  // ── Derived baseline resolution ──
  // Precedence: manual > IP > unavailable
  const resolvedBaselineCountry = useMemo(
    () => manualBaselineCountry ?? ipDetectedCountry ?? null,
    [manualBaselineCountry, ipDetectedCountry]
  );

  const baselineState: BaselineState = useMemo(() => {
    if (manualBaselineCountry || ipDetectedCountry) return 'resolved';
    if (ipLookupFinished) return 'unavailable';
    return 'loading';
  }, [manualBaselineCountry, ipDetectedCountry, ipLookupFinished]);

  // Debug: log derived baseline on every change
  console.debug('[TravelContext] Baseline state:', {
    manualBaselineCountry,
    ipDetectedCountry,
    resolvedBaselineCountry,
    baselineState,
    ipLookupFinished,
  });

  const value = useMemo<TravelContextType>(() => ({
    passport,
    origin,
    setPassport,
    setOrigin,
    ready,
    manualBaselineCountry,
    ipDetectedCountry,
    resolvedBaselineCountry,
    baselineState,
    setManualBaselineCountry,
  }), [passport, origin, setPassport, ready, manualBaselineCountry, ipDetectedCountry, resolvedBaselineCountry, baselineState]);

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  );
};
