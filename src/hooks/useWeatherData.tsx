
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

          // Ensure we have exactly 7 days of forecast data
          const processedData = {
            ...enhancedData,
            forecast: data.forecast ? data.forecast.slice(0, 7) : []
          };

          // If we have less than 7 days, pad with placeholder data
          if (processedData.forecast.length < 7) {
            const currentLength = processedData.forecast.length;
            for (let i = currentLength; i < 7; i++) {
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + i);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayName = i === 0 ? 'Today' : dayNames[futureDate.getDay()];

              processedData.forecast.push({
                date: futureDate.toISOString().split('T')[0],
                day: dayName,
                high: data.current?.temp || 25,
                low: (data.current?.temp || 25) - 5,
                condition: 'Partly Cloudy',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
              });
            }
          }

          setWeatherData(processedData);
          console.log('🌤️ Weather data fetched successfully:', processedData);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [placeDetails]);

  return { weatherData, isLoading, error };
};
