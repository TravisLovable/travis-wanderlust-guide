
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    feels_like?: number;
    wind_speed?: number;
    pressure?: number;
  };
  forecast: WeatherDay[];
  location: string;
  country?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  userCountry?: any;
  homeWeather?: {
    country: string;
    region: string;
    timezone: string;
    insights?: {
      isWarmer: boolean;
      isColder: boolean;
      seasonalContext: string;
    };
  } | null;
}

// Helper function to get seasonal context based on region and temperature
const getSeasonalContext = (region: string, temp: number): string => {
  if (!temp) return 'Unknown';

  if (region === 'Americas') {
    if (temp > 25) return 'Summer-like';
    if (temp > 15) return 'Spring/Fall-like';
    return 'Winter-like';
  } else if (region === 'Europe') {
    if (temp > 20) return 'Summer-like';
    if (temp > 10) return 'Spring/Fall-like';
    return 'Winter-like';
  } else if (region === 'Asia') {
    if (temp > 30) return 'Tropical';
    if (temp > 20) return 'Warm';
    if (temp > 10) return 'Mild';
    return 'Cool';
  }

  return 'Moderate';
};

type PlaceDetailsLike = { latitude?: number; longitude?: number; name?: string; formatted_address?: string };

export const useWeatherData = (placeDetails?: PlaceDetailsLike | string, userCountry?: any) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStringInput = typeof placeDetails === 'string';

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (placeDetails == null || (isStringInput && !placeDetails.trim())) return;

      setIsLoading(true);
      setError(null);

      try {
        let locationName: string;
        let requestBody: { days: number; location?: string; latitude?: number; longitude?: number };

        if (isStringInput) {
          locationName = placeDetails as string;
          requestBody = { days: 7, location: locationName };
          console.log(`🌤️ Fetching weather data for (location name):`, locationName);
        } else {
          const p = placeDetails as PlaceDetailsLike;
          locationName = p.name || p.formatted_address || 'Unknown';
          requestBody = { days: 7 };
          if (p.latitude != null && p.longitude != null) {
            requestBody.latitude = p.latitude;
            requestBody.longitude = p.longitude;
            requestBody.location = locationName;
          } else {
            requestBody.location = locationName;
          }
          console.log(`🌤️ Fetching weather data for:`, {
            location: locationName,
            coordinates: p.latitude && p.longitude ? [p.latitude, p.longitude] : null
          });
        }

        if (userCountry) {
          console.log(`👤 User country context:`, userCountry);
        }

        const { data, error: functionError } = await supabase.functions.invoke('get-weather-low-tier', {
          body: requestBody
        });

        if (functionError) throw functionError;

        if (data) {
          // Enhance data with user country context
          const enhancedData = {
            ...data,
            userCountry: userCountry,
            // Add user's home weather context if available
            homeWeather: userCountry ? {
              country: userCountry.name,
              region: userCountry.region,
              timezone: userCountry.timezone,
              // Add weather insights based on user's home country
              insights: {
                isWarmer: userCountry.region === 'Americas' && data.current?.temp > 20,
                isColder: userCountry.region === 'Europe' && data.current?.temp < 15,
                seasonalContext: getSeasonalContext(userCountry.region, data.current?.temp)
              }
            } : null
          };

          // Use only the real forecast days (cap at 7) — no fabricated padding.
          const processedData = {
            ...enhancedData,
            forecast: data.forecast ? data.forecast.slice(0, 7) : []
          };

          setWeatherData(processedData);
          console.log('🌤️ Weather data fetched successfully:', processedData);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        // No fake data on failure — clear so the UI shows "—".
        setWeatherData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [placeDetails]);

  return { weatherData, isLoading, error };
};
