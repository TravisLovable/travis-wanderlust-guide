import { useState, useCallback } from 'react';
import { Destination, MapboxPlace } from '@/types/destination';
import { getCountryCodeFromName } from '@/utils/destinationHelpers';

export const useDestination = () => {
  const [destination, setDestinationState] = useState<Destination | null>(null);

  // Create a Destination object from a string input
  const createDestinationFromString = useCallback((destinationString: string): Destination => {
    // Parse city and country from the string
    const parts = destinationString.split(',').map(part => part.trim());
    const city = parts[0] || destinationString;
    const country = parts[1] || '';
    
    // Generate a consistent ID
    const id = destinationString.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return {
      id,
      name: city,
      displayName: destinationString,
      country,
      countryCode: getCountryCodeFromName(country),
    };
  }, []);

  // Create a Destination object from Mapbox place data
  const createDestinationFromMapbox = useCallback((place: MapboxPlace): Destination => {
    // Extract country from context
    const countryContext = place.context?.find(ctx => ctx.id.startsWith('country'));
    const country = countryContext?.text || '';
    const countryCode = countryContext?.short_code;

    return {
      id: place.id,
      name: place.text,
      displayName: place.place_name,
      country,
      countryCode,
      coordinates: {
        lat: place.center[1],
        lng: place.center[0],
      },
    };
  }, []);

  // Set destination from various input types
  const setDestination = useCallback((input: string | Destination | MapboxPlace) => {
    let newDestination: Destination;

    if (typeof input === 'string') {
      newDestination = createDestinationFromString(input);
    } else if ('place_name' in input) {
      // It's a MapboxPlace
      newDestination = createDestinationFromMapbox(input);
    } else {
      // It's already a Destination object
      newDestination = input;
    }

    setDestinationState(newDestination);
  }, [createDestinationFromString, createDestinationFromMapbox]);

  // Get display name for the current destination
  const getDisplayName = useCallback(() => {
    return destination?.displayName || destination?.name || '';
  }, [destination]);

  // Get destination string (for backward compatibility)
  const getDestinationString = useCallback(() => {
    return destination?.displayName || '';
  }, [destination]);

  return {
    destination,
    setDestination,
    getDisplayName,
    getDestinationString,
    createDestinationFromString,
    createDestinationFromMapbox,
  };
};