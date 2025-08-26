import { Destination, MapboxSuggestion, ParsedDestination, AddressComponents, DestinationInput } from '@/types/destination';

/**
 * Utility functions for consistent destination handling
 */

// Country code to flag URL mapping
const COUNTRY_FLAGS: Record<string, string> = {
    'US': 'https://flagcdn.com/w40/us.png',
    'CA': 'https://flagcdn.com/w40/ca.png',
    'GB': 'https://flagcdn.com/w40/gb.png',
    'FR': 'https://flagcdn.com/w40/fr.png',
    'DE': 'https://flagcdn.com/w40/de.png',
    'IT': 'https://flagcdn.com/w40/it.png',
    'ES': 'https://flagcdn.com/w40/es.png',
    'BR': 'https://flagcdn.com/w40/br.png',
    'AU': 'https://flagcdn.com/w40/au.png',
    'JP': 'https://flagcdn.com/w40/jp.png',
    'CN': 'https://flagcdn.com/w40/cn.png',
    'IN': 'https://flagcdn.com/w40/in.png',
    'ZA': 'https://flagcdn.com/w40/za.png',
    'EG': 'https://flagcdn.com/w40/eg.png',
    'NG': 'https://flagcdn.com/w40/ng.png',
    'KE': 'https://flagcdn.com/w40/ke.png',
    'MA': 'https://flagcdn.com/w40/ma.png',
    'TN': 'https://flagcdn.com/w40/tn.png',
    'GH': 'https://flagcdn.com/w40/gh.png',
    'ET': 'https://flagcdn.com/w40/et.png',
    'TZ': 'https://flagcdn.com/w40/tz.png',
    'UG': 'https://flagcdn.com/w40/ug.png',
    'RW': 'https://flagcdn.com/w40/rw.png',
    'SN': 'https://flagcdn.com/w40/sn.png',
    'MG': 'https://flagcdn.com/w40/mg.png',
    'ZW': 'https://flagcdn.com/w40/zw.png',
    'BW': 'https://flagcdn.com/w40/bw.png',
    'NA': 'https://flagcdn.com/w40/na.png',
    'ZM': 'https://flagcdn.com/w40/zm.png',
    'MW': 'https://flagcdn.com/w40/mw.png',
    'MZ': 'https://flagcdn.com/w40/mz.png',
    'AO': 'https://flagcdn.com/w40/ao.png',
    'PE': 'https://flagcdn.com/w40/pe.png',
    'AE': 'https://flagcdn.com/w40/ae.png',
    'TR': 'https://flagcdn.com/w40/tr.png',
    'TH': 'https://flagcdn.com/w40/th.png',
    'SG': 'https://flagcdn.com/w40/sg.png',
    'KR': 'https://flagcdn.com/w40/kr.png',
    'HK': 'https://flagcdn.com/w40/hk.png',
    'NZ': 'https://flagcdn.com/w40/nz.png',
    'MX': 'https://flagcdn.com/w40/mx.png',
    'AR': 'https://flagcdn.com/w40/ar.png',
    'CL': 'https://flagcdn.com/w40/cl.png',
    'CO': 'https://flagcdn.com/w40/co.png',
    'VE': 'https://flagcdn.com/w40/ve.png',
    'ID': 'https://flagcdn.com/w40/id.png',
    'PH': 'https://flagcdn.com/w40/ph.png',
    'MY': 'https://flagcdn.com/w40/my.png',
    'VN': 'https://flagcdn.com/w40/vn.png',
    'IL': 'https://flagcdn.com/w40/il.png',
    'RU': 'https://flagcdn.com/w40/ru.png',
    'PL': 'https://flagcdn.com/w40/pl.png',
    'CZ': 'https://flagcdn.com/w40/cz.png',
    'HU': 'https://flagcdn.com/w40/hu.png',
    'GR': 'https://flagcdn.com/w40/gr.png',
    'PT': 'https://flagcdn.com/w40/pt.png',
    'SE': 'https://flagcdn.com/w40/se.png',
    'NO': 'https://flagcdn.com/w40/no.png',
    'DK': 'https://flagcdn.com/w40/dk.png',
    'FI': 'https://flagcdn.com/w40/fi.png',
    'IS': 'https://flagcdn.com/w40/is.png',
    'NL': 'https://flagcdn.com/w40/nl.png',
    'AT': 'https://flagcdn.com/w40/at.png',
    'CH': 'https://flagcdn.com/w40/ch.png',
};

/**
 * Parse a destination string into structured components
 */
export function parseDestinationString(input: string): ParsedDestination {
    const parts = input.split(',').map(part => part.trim());

    let city: string | undefined;
    let state: string | undefined;
    let country: string | undefined;
    let confidence: 'high' | 'medium' | 'low' = 'medium';

    if (parts.length === 1) {
        // Could be city or country
        city = parts[0];
        confidence = 'low';
    } else if (parts.length === 2) {
        // City, Country or City, State
        city = parts[0];
        // Try to determine if second part is country or state
        const secondPart = parts[1];
        if (isLikelyCountry(secondPart)) {
            country = secondPart;
            confidence = 'high';
        } else {
            state = secondPart;
            confidence = 'medium';
        }
    } else if (parts.length >= 3) {
        // City, State, Country
        city = parts[0];
        state = parts[1];
        country = parts[2];
        confidence = 'high';
    }

    return {
        city,
        state,
        country,
        raw: input,
        confidence
    };
}

/**
 * Simple heuristic to determine if a string is likely a country
 */
function isLikelyCountry(text: string): boolean {
    const countries = [
        'USA', 'United States', 'US', 'Brazil', 'Canada', 'Mexico', 'UK', 'United Kingdom',
        'France', 'Germany', 'Italy', 'Spain', 'Japan', 'China', 'India', 'Australia',
        'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ghana', 'Argentina',
        'Chile', 'Peru', 'Colombia', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia'
    ];
    return countries.some(country =>
        country.toLowerCase() === text.toLowerCase()
    );
}

/**
 * Convert a Mapbox suggestion to a Destination object
 */
export function mapboxToDestination(suggestion: MapboxSuggestion, searchQuery?: string): Destination {
    const parsed = parseDestinationString(suggestion.place_name);

    // Extract address components from Mapbox context
    const addressComponents: AddressComponents = {
        city: parsed.city,
        state: parsed.state,
        country: parsed.country,
    };

    // Try to get country code from context
    if (suggestion.context) {
        const countryContext = suggestion.context.find(ctx => ctx.id.startsWith('country'));
        if (countryContext?.short_code) {
            addressComponents.countryCode = countryContext.short_code.toUpperCase();
        }
    }

    const coordinates = suggestion.center ? {
        longitude: suggestion.center[0],
        latitude: suggestion.center[1]
    } : undefined;

    return {
        id: suggestion.id,
        displayName: suggestion.text,
        shortName: suggestion.text,
        fullName: suggestion.place_name,
        coordinates,
        addressComponents,
        source: {
            type: 'mapbox',
            id: suggestion.id,
            confidence: 0.9
        },
        searchQuery,
        createdAt: new Date(),
        countryFlag: addressComponents.countryCode ? COUNTRY_FLAGS[addressComponents.countryCode] : undefined
    };
}

/**
 * Convert a static string to a Destination object
 */
export function staticToDestination(input: string, searchQuery?: string): Destination {
    const parsed = parseDestinationString(input);
    const id = `static-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Try to infer country code for flag
    let countryCode: string | undefined;
    if (parsed.country) {
        countryCode = inferCountryCode(parsed.country);
    }

    const addressComponents: AddressComponents = {
        city: parsed.city,
        state: parsed.state,
        country: parsed.country,
        countryCode
    };

    return {
        id,
        displayName: parsed.city || input,
        shortName: parsed.city || input,
        fullName: input,
        addressComponents,
        source: {
            type: 'static',
            confidence: parsed.confidence === 'high' ? 0.7 : 0.5
        },
        searchQuery,
        createdAt: new Date(),
        countryFlag: countryCode ? COUNTRY_FLAGS[countryCode] : undefined
    };
}

/**
 * Infer country code from country name
 */
function inferCountryCode(countryName: string): string | undefined {
    const countryMap: Record<string, string> = {
        'United States': 'US',
        'USA': 'US',
        'US': 'US',
        'Brazil': 'BR',
        'Canada': 'CA',
        'Mexico': 'MX',
        'United Kingdom': 'GB',
        'UK': 'GB',
        'France': 'FR',
        'Germany': 'DE',
        'Italy': 'IT',
        'Spain': 'ES',
        'Japan': 'JP',
        'China': 'CN',
        'India': 'IN',
        'Australia': 'AU',
        'South Africa': 'ZA',
        'Egypt': 'EG',
        'Nigeria': 'NG',
        'Kenya': 'KE',
        'Morocco': 'MA',
        'Ghana': 'GH',
        'Argentina': 'AR',
        'Chile': 'CL',
        'Peru': 'PE',
        'Colombia': 'CO',
        'Thailand': 'TH',
        'Singapore': 'SG',
        'Malaysia': 'MY',
        'Indonesia': 'ID'
    };

    return countryMap[countryName];
}

/**
 * Normalize any destination input to a Destination object
 */
export function normalizeDestination(input: DestinationInput, searchQuery?: string): Destination {
    if (typeof input === 'string') {
        return staticToDestination(input, searchQuery);
    }

    if ('place_name' in input) {
        // MapboxSuggestion
        return mapboxToDestination(input, searchQuery);
    }

    // Already a Destination
    return input;
}

/**
 * Format destination for display in different contexts
 */
export function formatDestination(destination: Destination, format: 'short' | 'medium' | 'full' = 'medium'): string {
    switch (format) {
        case 'short':
            return destination.shortName;
        case 'full':
            return destination.fullName;
        case 'medium':
        default:
            return destination.displayName;
    }
}

/**
 * Get the best search query for APIs (like photos)
 */
export function getSearchableDestination(destination: Destination): string {
    const { addressComponents } = destination;

    // For photo searches, prioritize city over full address
    if (addressComponents.city && addressComponents.country) {
        return `${addressComponents.city}, ${addressComponents.country}`;
    }

    if (addressComponents.city) {
        return addressComponents.city;
    }

    return destination.shortName;
}

/**
 * Check if two destinations are the same place
 */
export function isSameDestination(dest1: Destination, dest2: Destination): boolean {
    // If both have coordinates, use distance
    if (dest1.coordinates && dest2.coordinates) {
        const distance = getDistanceBetweenCoordinates(dest1.coordinates, dest2.coordinates);
        return distance < 10; // Within 10km
    }

    // Otherwise compare normalized names
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalize(dest1.displayName) === normalize(dest2.displayName);
}

/**
 * Calculate distance between two coordinates (km)
 */
function getDistanceBetweenCoordinates(coord1: { latitude: number; longitude: number }, coord2: { latitude: number; longitude: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

