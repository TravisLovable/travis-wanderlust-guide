import { useState, useEffect, useRef, useCallback } from 'react';

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

  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_KEY;

  // Initialise Google Places SDK
  useEffect(() => {
    console.log('[places] init effect — apiKey:', apiKey ? 'present' : 'MISSING');
    if (!apiKey) {
      console.warn('[places] no VITE_GOOGLE_PLACES_KEY in env');
      setHasApiAccess(false);
      return;
    }

    let cancelled = false;

    loadGooglePlacesScript(apiKey)
      .then(() => {
        if (cancelled) {
          console.log('[places] script loaded but effect was cancelled (strict mode)');
          return;
        }
        console.log('[places] Google Places SDK ready');
        autocompleteRef.current = new google.maps.places.AutocompleteService();
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        if (!dummyDivRef.current) {
          dummyDivRef.current = document.createElement('div');
        }
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDivRef.current);
        setReady(true);
      })
      .catch((err) => {
        console.error('[places] script load failed:', err);
        if (!cancelled) setHasApiAccess(false);
      });

    return () => { cancelled = true; };
  }, [apiKey]);

  // Fetch predictions with 300ms debounce
  useEffect(() => {
    console.log('[places] predictions effect —', { ready, query, enabled, queryLen: query?.length });
    if (!ready || !query || query.length < 2 || !enabled) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      if (!autocompleteRef.current) {
        console.warn('[places] autocompleteRef is null');
        setIsLoading(false);
        return;
      }

      console.log('[places] calling getPlacePredictions:', query);
      autocompleteRef.current.getPlacePredictions(
        {
          input: query,
          types: ['(cities)'],
          sessionToken: sessionTokenRef.current!,
        },
        (predictions, status) => {
          console.log('[places] predictions callback — status:', status, 'count:', predictions?.length);
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
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, enabled, ready]);

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<SelectedPlace | null> => {
      if (!placesServiceRef.current) return null;

      return new Promise((resolve) => {
        placesServiceRef.current!.getDetails(
          {
            placeId,
            fields: ['geometry', 'formatted_address', 'name', 'address_components', 'place_id'],
            sessionToken: sessionTokenRef.current!,
          },
          (place, status) => {
            // Rotate session token after each details call
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

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
    []
  );

  return { suggestions, isLoading, hasApiAccess, getPlaceDetails };
};
