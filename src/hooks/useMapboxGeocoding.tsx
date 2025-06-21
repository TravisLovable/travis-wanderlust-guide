
import { useState, useEffect } from 'react';

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  place_type: string[];
  center: [number, number];
  properties: {
    short_code?: string;
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

export const useMapboxGeocoding = (query: string, enabled: boolean = true) => {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiAccess, setHasApiAccess] = useState(true);

  useEffect(() => {
    if (!query || query.length < 2 || !enabled || !hasApiAccess) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const encodedQuery = encodeURIComponent(query);
        // TODO: Replace with your valid Mapbox public token
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?types=country,region,place&limit=8&access_token=YOUR_MAPBOX_TOKEN_HERE`
        );

        if (response.status === 403) {
          console.warn('Mapbox API access denied. Please check your API token.');
          setHasApiAccess(false);
          setError('Mapbox API access denied');
          setSuggestions([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MapboxResponse = await response.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error('Mapbox geocoding error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
        // Don't disable API access for network errors, only for auth errors
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [query, enabled, hasApiAccess]);

  return { suggestions, isLoading, error, hasApiAccess };
};
