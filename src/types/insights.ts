export interface TravisInsights {
  greeting: string | null;
  weather: string | null;
  localTime: string | null;
  waterSafety: string | null;
  uvIndex: string | null;
  pharmacyIntel: string | null;
  powerAdapter: string | null;
  currency: string | null;
  visa: string | null;
  healthEntry: string | null;
  transportation: string | null;
  localHolidays: string | null;
  localEvents: string | null;
  culturalInsights: string | null;
}

export interface InsightRequest {
  destination: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  dates: {
    start: string;
    end: string;
  };
  user: {
    firstName: string;
    originCity: string;
    originCountry: string;
  };
  widgetData: Record<string, any>;
}
