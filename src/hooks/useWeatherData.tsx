
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
          body: { 
            location: destination,
            days: 7 // Request 7 days of forecast data
          }
        });

        if (functionError) throw functionError;

        if (data) {
          // Ensure we have exactly 7 days of forecast data
          const processedData = {
            ...data,
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
          console.log('Weather data fetched successfully:', processedData);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [destination]);

  return { weatherData, isLoading, error };
};
