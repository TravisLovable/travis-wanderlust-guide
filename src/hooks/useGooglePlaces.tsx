
import { useState, useEffect } from 'react';

interface PlaceDetails {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface GooglePlacesResponse {
  predictions: PlaceDetails[];
  status: string;
}

interface PlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

interface PlaceDetailsResponse {
  result: {
    name: string;
    formatted_address: string;
    geometry: PlaceGeometry;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  };
  status: string;
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

export const useGooglePlaces = (query: string, enabled: boolean = true) => {
  const [suggestions, setSuggestions] = useState<PlaceDetails[]>([]);
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
          `/api/google-places-autocomplete?input=${encodedQuery}`
        );

        if (response.status === 403 || response.status === 401) {
          console.warn('Google Places API access denied. Please check your API key.');
          setHasApiAccess(false);
          setError('Google Places API access denied');
          setSuggestions([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GooglePlacesResponse = await response.json();
        
        if (data.status === 'OK') {
          // Apply broader filtering to include countries, regions, cities, and popular areas
          // Allow most geographic location types while excluding businesses and specific addresses
          const filteredSuggestions = data.predictions.filter(prediction => {
            const types = prediction.types;
            // Include if it contains any geographic location type
            const hasGeographicType = types.some(type => 
              [
                'country',
                'administrative_area_level_1', // States/provinces
                'administrative_area_level_2', // Counties
                'locality', // Cities
                'sublocality', // Neighborhoods/districts
                'sublocality_level_1',
                'political',
                'natural_feature', // Mountains, lakes, etc.
                'colloquial_area' // Popular areas like "Silicon Valley"
              ].includes(type)
            );
            
            // Exclude specific addresses and businesses
            const hasRestrictedType = types.some(type => 
              [
                'street_address',
                'premise',
                'establishment',
                'point_of_interest'
              ].includes(type)
            );
            
            return hasGeographicType && !hasRestrictedType;
          });
          
          setSuggestions(filteredSuggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Google Places autocomplete error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [query, enabled, hasApiAccess]);

  const getPlaceDetails = async (placeId: string): Promise<SelectedPlace | null> => {
    try {
      const response = await fetch(`/api/google-place-details?place_id=${placeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlaceDetailsResponse = await response.json();
      
      if (data.status === 'OK') {
        const result = data.result;
        const countryComponent = result.address_components.find(component =>
          component.types.includes('country')
        );
        const regionComponent = result.address_components.find(component =>
          component.types.includes('administrative_area_level_1')
        );

        return {
          name: result.name,
          formatted_address: result.formatted_address,
          country_code: countryComponent?.short_name,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          region: regionComponent?.long_name,
          place_id: placeId
        };
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching place details:', err);
      return null;
    }
  };

  return { suggestions, isLoading, error, hasApiAccess, getPlaceDetails };
};
