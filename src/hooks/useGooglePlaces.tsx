import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SelectedPlace {
  name: string;
  formatted_address: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  region?: string;
  place_id: string;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Module-level singleton — ensures script loads exactly once
let googleScriptPromise: Promise<void> | null = null;

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    // Already loaded (e.g. HMR re-evaluation but script persists in DOM)
    if (window.google?.maps?.places) {
      console.log('[places] google.maps.places already available');
      resolve();
      return;
    }

    // Check if script tag already exists in DOM (HMR edge case)
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      console.log('[places] script tag already in DOM, waiting for google.maps.places...');
      const check = () => {
        if (window.google?.maps?.places) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      const check = () => {
        if (window.google?.maps?.places) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    };
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error('Failed to load Google Places script'));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export const useGooglePlaces = (query: string, enabled: boolean = true) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiAccess, setHasApiAccess] = useState(true);
  const [ready, setReady] = useState(false);

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const dummyDivRef = useRef<HTMLDivElement | null>(null);

  // Prefer env key; if missing, we use Supabase Edge Functions (they have GOOGLE_PLACES_KEY in secrets)
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_KEY;
  const useEdgeFunction = !apiKey;

  // Initialise: either load Google SDK (when key in env) or mark ready for Edge Function path
  useEffect(() => {
    const keyPreview = apiKey ? `${apiKey.slice(0, 6)}...` : 'MISSING';
    console.log('[places] init —', { apiKeyPreview: keyPreview, useEdgeFunction, willFetchSuggestions: 'when query.length >= 2 && enabled' });
    if (useEdgeFunction) {
      console.log('[places] using Supabase Edge Function for autocomplete (no client key)');
      setReady(true);
      return;
    }

    let cancelled = false;
    console.log('[places] loading Google Maps script (libraries=places)...');

    loadGooglePlacesScript(apiKey!)
      .then(() => {
        if (cancelled) {
          console.log('[places] script loaded but effect was cancelled (strict mode)');
          return;
        }
        console.log('[places] Google Places SDK ready — AutocompleteService & PlacesService created');
        autocompleteRef.current = new google.maps.places.AutocompleteService();
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        if (!dummyDivRef.current) {
          dummyDivRef.current = document.createElement('div');
        }
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDivRef.current);
        setReady(true);
      })
      .catch((err) => {
        console.error('[places] script load failed:', err?.message ?? err);
        if (!cancelled) setHasApiAccess(false);
      });

    return () => { cancelled = true; };
  }, [apiKey, useEdgeFunction]);

  // Fetch predictions with 300ms debounce (SDK or Edge Function)
  useEffect(() => {
    const skipReason = !ready ? 'not ready' : !query ? 'no query' : query.length < 2 ? 'query too short' : !enabled ? 'disabled' : null;
    console.log('[places] predictions effect —', { ready, query: query ?? '', queryLen: query?.length ?? 0, enabled, useEdgeFunction, skipReason: skipReason ?? 'none (will fetch)' });
    if (!ready || !query || query.length < 2 || !enabled) {
      if (skipReason) console.log('[places] skipping autocomplete:', skipReason);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      if (useEdgeFunction) {
        const url = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/google-places-autocomplete`;
        console.log('[places] edge autocomplete REQUEST —', { input: query, url });
        try {
          const { data, error } = await supabase.functions.invoke<{
            predictions?: Array<{
              place_id: string;
              description: string;
              structured_formatting?: { main_text: string; secondary_text: string };
            }>;
            status?: string;
          }>('google-places-autocomplete', { body: { input: query } });
          setIsLoading(false);

          console.log('[places] edge autocomplete RESPONSE —', {
            status: data?.status,
            error: error ? { message: error.message, name: error.name } : null,
            predictionsCount: data?.predictions?.length ?? 0,
            rawDataKeys: data ? Object.keys(data) : [],
          });

          if (error) {
            console.warn('[places] edge autocomplete error:', error);
            setSuggestions([]);
            return;
          }
          if (data?.status !== 'OK') {
            console.warn('[places] edge autocomplete non-OK status:', data?.status, data);
            setSuggestions([]);
            return;
          }
          const preds = data?.predictions ?? [];
          setSuggestions(
            preds.map((p) => ({
              place_id: p.place_id,
              description: p.description,
              structured_formatting: {
                main_text: p.structured_formatting?.main_text ?? p.description?.split(',')[0] ?? '',
                secondary_text: p.structured_formatting?.secondary_text ?? '',
              },
            }))
          );
          console.log('[places] edge autocomplete SUCCESS —', preds.length, 'suggestions');
        } catch (err) {
          setIsLoading(false);
          console.error('[places] edge autocomplete EXCEPTION:', err);
          setSuggestions([]);
        }
        return;
      }

      if (!autocompleteRef.current) {
        console.warn('[places] autocompleteRef is null — cannot call getPlacePredictions');
        setIsLoading(false);
        return;
      }

      const request = { input: query, types: ['(cities)'] as const, sessionToken: sessionTokenRef.current! };
      console.log('[places] SDK getPlacePredictions REQUEST —', request);
      autocompleteRef.current.getPlacePredictions(
        request,
        (predictions, status) => {
          const statusStr = typeof status === 'string' ? status : (status as unknown as string);
          console.log('[places] SDK getPlacePredictions RESPONSE —', {
            status: statusStr,
            count: predictions?.length ?? 0,
            sample: predictions?.[0] ? { place_id: predictions[0].place_id, description: predictions[0].description?.slice(0, 50) } : null,
          });
          if (statusStr !== 'OK' && statusStr !== 'ZERO_RESULTS') {
            console.warn('[places] SDK autocomplete non-OK status (check API key, billing, restrictions):', statusStr);
          }
          setIsLoading(false);

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(
              predictions.map((p) => ({
                place_id: p.place_id,
                description: p.description,
                structured_formatting: {
                  main_text: p.structured_formatting.main_text,
                  secondary_text: p.structured_formatting.secondary_text,
                },
              }))
            );
            console.log('[places] SDK autocomplete SUCCESS —', predictions.length, 'suggestions');
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, enabled, ready, useEdgeFunction]);

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<SelectedPlace | null> => {
      console.log('[places] getPlaceDetails REQUEST —', { placeId, useEdgeFunction });

      if (useEdgeFunction) {
        try {
          const { data, error } = await supabase.functions.invoke<{
            result?: {
              name?: string;
              formatted_address?: string;
              place_id?: string;
              geometry?: { location?: { lat: number; lng: number } };
              address_components?: Array<{ types: string[]; short_name?: string; long_name?: string }>;
            };
            status?: string;
          }>('google-place-details', { body: { place_id: placeId } });

          console.log('[places] edge place-details RESPONSE —', {
            status: data?.status,
            error: error ? { message: error.message } : null,
            hasResult: !!data?.result,
            hasGeometry: !!data?.result?.geometry?.location,
          });

          if (error) {
            console.warn('[places] edge place-details error:', error);
            return null;
          }
          if (data?.status !== 'OK' || !data?.result?.geometry?.location) {
            console.warn('[places] edge place-details missing OK/geometry:', data?.status);
            return null;
          }
          const r = data.result;
          const loc = r.geometry!.location!;
          const countryComponent = r.address_components?.find((c) => c.types.includes('country'));
          const regionComponent = r.address_components?.find((c) =>
            c.types.includes('administrative_area_level_1')
          );
          return {
            name: r.name ?? '',
            formatted_address: r.formatted_address ?? '',
            country_code: countryComponent?.short_name?.toLowerCase(),
            latitude: loc.lat,
            longitude: loc.lng,
            region: regionComponent?.long_name,
            place_id: r.place_id ?? placeId,
          };
        } catch (err) {
          console.error('[places] edge place-details EXCEPTION:', err);
          return null;
        }
      }

      if (!placesServiceRef.current) {
        console.warn('[places] getPlaceDetails: placesServiceRef is null');
        return null;
      }

      return new Promise((resolve) => {
        const request = { placeId, fields: ['geometry', 'formatted_address', 'name', 'address_components', 'place_id'], sessionToken: sessionTokenRef.current! };
        console.log('[places] SDK getDetails REQUEST —', request);
        placesServiceRef.current!.getDetails(
          request,
          (place, status) => {
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
            const statusStr = typeof status === 'string' ? status : (status as unknown as string);
            console.log('[places] SDK getDetails RESPONSE —', { status: statusStr, hasPlace: !!place, hasGeometry: !!place?.geometry?.location });
            if (statusStr !== 'OK') {
              console.warn('[places] SDK getDetails non-OK status:', statusStr);
            }

            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              place?.geometry?.location
            ) {
              const countryComponent = place.address_components?.find((c) =>
                c.types.includes('country')
              );
              const regionComponent = place.address_components?.find((c) =>
                c.types.includes('administrative_area_level_1')
              );

              resolve({
                name: place.name || '',
                formatted_address: place.formatted_address || '',
                country_code: countryComponent?.short_name?.toLowerCase(),
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                region: regionComponent?.long_name,
                place_id: place.place_id || placeId,
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    },
    [useEdgeFunction]
  );

  return { suggestions, isLoading, hasApiAccess, getPlaceDetails };
};
