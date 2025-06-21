
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
  };
  forecast: WeatherDay[];
  location: string;
}

export const useWeatherData = (destination: string) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!destination) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching weather data for: ${destination}`);
        
        const { data, error: functionError } = await supabase.functions.invoke('get-weather-low-tier', {
          body: { location: destination }
        });

        if (functionError) {
          console.error('Supabase function error:', functionError);
          throw new Error(`Function error: ${functionError.message}`);
        }

        if (data?.error) {
          console.error('Weather API error:', data.error);
          throw new Error(data.error);
        }

        if (data) {
          setWeatherData(data);
          console.log('Weather data fetched successfully:', data);
        } else {
          throw new Error('No weather data received');
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [destination]);

  return { weatherData, isLoading, error };
};
