
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

  useEffect(() => {
    if (!query || query.length < 2 || !enabled) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?types=country,region,place&limit=8&access_token=pk.eyJ1IjoicG93ZXJlZGJ5dHJhdmlzIiwiYSI6ImNtNnpjdXNtYTAzaDAya3B1eGkxMno0ZjUifQ.EBiUzfzILeKWrf4Jb0g7GA`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MapboxResponse = await response.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error('Mapbox geocoding error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [query, enabled]);

  return { suggestions, isLoading, error };
};
