export interface Destination {
  id: string;
  name: string;
  displayName: string;
  country: string;
  countryCode?: string;
  region?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string;
  currency?: string;
  flag?: string;
}

export interface DestinationState {
  current: Destination | null;
  history: Destination[];
  favorites: Destination[];
}

export interface MapboxPlace {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  properties?: {
    category?: string;
    address?: string;
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}