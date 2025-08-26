import { Destination } from '@/types/destination';

/**
 * Helper functions for working with Destination objects across the application
 */

/**
 * Extracts a string representation of a destination for API calls and processing
 * Priority: displayName > fullName > shortName
 */
export const getDestinationString = (destination: Destination): string => {
    return destination.displayName || destination.fullName || destination.shortName;
};

/**
 * Gets the primary city name from a destination
 * Useful for timezone lookups and location-specific operations
 */
export const getDestinationCity = (destination: Destination): string => {
    return destination.shortName || destination.addressComponents.city || destination.displayName?.split(',')[0] || 'Unknown';
};

/**
 * Gets the country from a destination
 * Useful for country-specific operations like visa requirements
 */
export const getDestinationCountry = (destination: Destination): string => {
    return destination.addressComponents.country || destination.displayName?.split(',').pop()?.trim() || 'Unknown';
};

/**
 * Gets the country code from a destination
 * Useful for API calls that require country codes
 */
export const getDestinationCountryCode = (destination: Destination): string | undefined => {
    return destination.addressComponents.countryCode;
};

/**
 * Creates a readable location string for display purposes
 * Format: "City, Country" or falls back to displayName
 */
export const getDestinationDisplayString = (destination: Destination): string => {
    const city = destination.addressComponents.city || destination.shortName;
    const country = destination.addressComponents.country;
    
    if (city && country) {
        return `${city}, ${country}`;
    }
    
    return getDestinationString(destination);
};

/**
 * Checks if destination has geographic coordinates
 */
export const hasCoordinates = (destination: Destination): boolean => {
    return !!(destination.coordinates?.latitude && destination.coordinates?.longitude);
};

/**
 * Gets coordinates as a tuple [longitude, latitude] for mapping APIs
 */
export const getCoordinatesArray = (destination: Destination): [number, number] | null => {
    if (!hasCoordinates(destination)) {
        return null;
    }
    return [destination.coordinates!.longitude, destination.coordinates!.latitude];
};