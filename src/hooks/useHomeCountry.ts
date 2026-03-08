import { useState, useEffect } from 'react';
import { cca2ToIso3 } from '@/utils/countryIso3';

interface HomeCountry {
  iso3: string;
  name: string;
}

interface UseHomeCountryReturn {
  homeCountry: HomeCountry | null;
  isLoading: boolean;
}

// Module-level cache — survives re-renders and re-mounts
let cached: HomeCountry | null | undefined; // undefined = not fetched yet

export function useHomeCountry(): UseHomeCountryReturn {
  const [homeCountry, setHomeCountry] = useState<HomeCountry | null>(
    cached !== undefined ? cached : null
  );
  const [isLoading, setIsLoading] = useState(cached === undefined);

  useEffect(() => {
    if (cached !== undefined) {
      setHomeCountry(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const detect = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();

        const cc2 = json.country_code; // e.g. "US"
        const name = json.country_name; // e.g. "United States"

        if (!cc2 || typeof cc2 !== 'string') throw new Error('No country_code');

        const iso3 = cca2ToIso3(cc2);
        if (!iso3) throw new Error(`Unknown cc2: ${cc2}`);

        const result: HomeCountry = { iso3, name: name || cc2 };
        cached = result;
        if (!cancelled) {
          setHomeCountry(result);
        }
      } catch {
        // Fail silently — widget falls back to global average
        cached = null;
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    detect();
    return () => { cancelled = true; };
  }, []);

  return { homeCountry, isLoading };
}
