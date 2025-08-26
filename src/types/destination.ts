// Destination Types for Consistent Location Handling

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface AddressComponents {
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    continent?: string;
}

export interface DestinationSource {
    type: 'mapbox' | 'static' | 'user_input' | 'geocoded';
    id?: string;
    confidence?: number;
}

export interface Destination {
    // Core identification
    id: string;

    // Display names
    displayName: string;           // "São Paulo, Brazil" 
    shortName: string;             // "São Paulo"
    fullName: string;              // "São Paulo, State of São Paulo, Brazil"

    // Geographic data
    coordinates?: Coordinates;
    addressComponents: AddressComponents;

    // Metadata
    source: DestinationSource;
    searchQuery?: string;          // Original user search
    createdAt: Date;

    // Optional enrichment data
    timezone?: string;
    countryFlag?: string;
    popularNames?: string[];       // Alternative names/spellings
}

// Mapbox-specific response format
export interface MapboxSuggestion {
    id: string;
    text: string;
    place_name: string;
    center?: [number, number];     // [longitude, latitude]
    context?: Array<{
        id: string;
        text: string;
        short_code?: string;
    }>;
    properties?: {
        category?: string;
        landmark?: boolean;
    };
}

// Utility types for different contexts
export type DestinationInput = string | Destination | MapboxSuggestion;

export interface DestinationSearchResult {
    suggestions: Destination[];
    hasMore: boolean;
    source: 'mapbox' | 'static' | 'hybrid';
}

// For travel planning contexts
export interface TravelDestination extends Destination {
    // Travel-specific metadata
    visaRequired?: boolean;
    safetyLevel?: 'low' | 'medium' | 'high';
    popularMonths?: number[];      // 1-12 for peak travel months
    averageStay?: number;          // days
    category?: 'city' | 'country' | 'region' | 'landmark' | 'airport';
}

// Helper type for destination parsing
export interface ParsedDestination {
    city?: string;
    state?: string;
    country?: string;
    raw: string;
    confidence: 'high' | 'medium' | 'low';
}

