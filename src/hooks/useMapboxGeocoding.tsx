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

export interface SelectedPlace {
  name: string;
  formatted_address: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  region?: string;
  place_id: string;
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
        const response = await fetch(
          `/api/mapbox-geocoding?input=${encodedQuery}`
        );

        if (response.status === 403 || response.status === 401) {
          console.warn('Mapbox API access denied. Please check your API key.');
          setHasApiAccess(false);
          setError('Mapbox API access denied');
          setSuggestions([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MapboxResponse = await response.json();
        
        // Filter out very specific addresses and POIs, keep geographic places
        const filteredSuggestions = data.features.filter(feature => {
          const placeTypes = feature.place_type;
          
          // Keep geographic places: countries, regions, places (cities/towns), districts, localities
          // Exclude: addresses, POIs, postcode
          const hasGeoType = placeTypes.some(type => 
            ['country', 'region', 'place', 'district', 'locality'].includes(type)
          );
          
          const hasUnwantedType = placeTypes.some(type => 
            ['address', 'poi', 'postcode'].includes(type)
          );
          
          return hasGeoType && !hasUnwantedType;
        });
        
        setSuggestions(filteredSuggestions || []);
      } catch (err) {
        console.error('Mapbox geocoding error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [query, enabled, hasApiAccess]);

  const getPlaceDetails = async (feature: MapboxFeature): Promise<SelectedPlace | null> => {
    try {
      // Extract country and region from context
      const countryContext = feature.context?.find(ctx => 
        ctx.id.startsWith('country.')
      );
      const regionContext = feature.context?.find(ctx => 
        ctx.id.startsWith('region.')
      );

      return {
        name: feature.text,
        formatted_address: feature.place_name,
        country_code: countryContext?.short_code,
        latitude: feature.center[1],
        longitude: feature.center[0],
        region: regionContext?.text,
        place_id: feature.id
      };
    } catch (err) {
      console.error('Error processing place details:', err);
      return null;
    }
  };

  return { suggestions, isLoading, error, hasApiAccess, getPlaceDetails };
};
