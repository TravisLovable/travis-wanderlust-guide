
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TimeZoneData {
  timeZone: string;
  time: string;
  time12: string;
  date: string;
  abbreviation: string;
  fullDateTime: string;
  isDst: boolean;
}

interface WorldClockData {
  origin: TimeZoneData;
  destination: TimeZoneData;
  timeDifferenceHours: number;
  timeDifferenceText: string;
}

const getTimezoneFromDestination = (destination: string): string => {
  const timezoneMap: { [key: string]: string } = {
    // South America
    'lima': 'America/Lima',
    'peru': 'America/Lima',
    'são paulo': 'America/Sao_Paulo',
    'rio de janeiro': 'America/Sao_Paulo',
    'brazil': 'America/Sao_Paulo',
    'buenos aires': 'America/Argentina/Buenos_Aires',
    'argentina': 'America/Argentina/Buenos_Aires',
    'santiago': 'America/Santiago',
    'chile': 'America/Santiago',
    'bogotá': 'America/Bogota',
    'colombia': 'America/Bogota',
    'caracas': 'America/Caracas',
    'venezuela': 'America/Caracas',
    'quito': 'America/Guayaquil',
    'ecuador': 'America/Guayaquil',
    'la paz': 'America/La_Paz',
    'bolivia': 'America/La_Paz',
    'montevideo': 'America/Montevideo',
    'uruguay': 'America/Montevideo',
    'asunción': 'America/Asuncion',
    'paraguay': 'America/Asuncion',
    
    // Africa
    'cape town': 'Africa/Johannesburg',
    'johannesburg': 'Africa/Johannesburg',
    'durban': 'Africa/Johannesburg',
    'pretoria': 'Africa/Johannesburg',
    'south africa': 'Africa/Johannesburg',
    'cairo': 'Africa/Cairo',
    'egypt': 'Africa/Cairo',
    'lagos': 'Africa/Lagos',
    'nigeria': 'Africa/Lagos',
    'nairobi': 'Africa/Nairobi',
    'kenya': 'Africa/Nairobi',
    'casablanca': 'Africa/Casablanca',
    'morocco': 'Africa/Casablanca',
    
    // Europe
    'london': 'Europe/London',
    'united kingdom': 'Europe/London',
    'uk': 'Europe/London',
    'paris': 'Europe/Paris',
    'france': 'Europe/Paris',
    'berlin': 'Europe/Berlin',
    'germany': 'Europe/Berlin',
    'rome': 'Europe/Rome',
    'italy': 'Europe/Rome',
    'madrid': 'Europe/Madrid',
    'spain': 'Europe/Madrid',
    'amsterdam': 'Europe/Amsterdam',
    'netherlands': 'Europe/Amsterdam',
    'stockholm': 'Europe/Stockholm',
    'sweden': 'Europe/Stockholm',
    'oslo': 'Europe/Oslo',
    'norway': 'Europe/Oslo',
    'copenhagen': 'Europe/Copenhagen',
    'denmark': 'Europe/Copenhagen',
    'helsinki': 'Europe/Helsinki',
    'finland': 'Europe/Helsinki',
    'moscow': 'Europe/Moscow',
    'russia': 'Europe/Moscow',
    
    // Asia
    'tokyo': 'Asia/Tokyo',
    'japan': 'Asia/Tokyo',
    'beijing': 'Asia/Shanghai',
    'shanghai': 'Asia/Shanghai',
    'china': 'Asia/Shanghai',
    'mumbai': 'Asia/Kolkata',
    'delhi': 'Asia/Kolkata',
    'india': 'Asia/Kolkata',
    'bangkok': 'Asia/Bangkok',
    'thailand': 'Asia/Bangkok',
    'singapore': 'Asia/Singapore',
    'jakarta': 'Asia/Jakarta',
    'indonesia': 'Asia/Jakarta',
    'manila': 'Asia/Manila',
    'philippines': 'Asia/Manila',
    'seoul': 'Asia/Seoul',
    'south korea': 'Asia/Seoul',
    'dubai': 'Asia/Dubai',
    'uae': 'Asia/Dubai',
    'riyadh': 'Asia/Riyadh',
    'saudi arabia': 'Asia/Riyadh',
    
    // North America
    'new york': 'America/New_York',
    'boston': 'America/New_York',
    'miami': 'America/New_York',
    'toronto': 'America/Toronto',
    'montreal': 'America/Toronto',
    'canada': 'America/Toronto',
    'chicago': 'America/Chicago',
    'dallas': 'America/Chicago',
    'houston': 'America/Chicago',
    'denver': 'America/Denver',
    'phoenix': 'America/Phoenix',
    'los angeles': 'America/Los_Angeles',
    'san francisco': 'America/Los_Angeles',
    'seattle': 'America/Los_Angeles',
    'mexico city': 'America/Mexico_City',
    'mexico': 'America/Mexico_City',
    
    // Oceania
    'sydney': 'Australia/Sydney',
    'melbourne': 'Australia/Melbourne',
    'australia': 'Australia/Sydney',
    'auckland': 'Pacific/Auckland',
    'new zealand': 'Pacific/Auckland'
  };

  const destinationLower = destination.toLowerCase();
  
  for (const [location, timezone] of Object.entries(timezoneMap)) {
    if (destinationLower.includes(location)) {
      return timezone;
    }
  }
  
  // Default to UTC if no match found
  return 'UTC';
};

export const useWorldClockData = (destination: string) => {
  const [worldClockData, setWorldClockData] = useState<WorldClockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorldClockData = async () => {
      if (!destination) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching world clock data for: ${destination}`);
        
        const originTimeZone = 'America/Chicago'; // User's home timezone
        const destinationTimeZone = getTimezoneFromDestination(destination);
        
        console.log(`Using timezones: origin=${originTimeZone}, destination=${destinationTimeZone}`);

        const { data, error: functionError } = await supabase.functions.invoke('get-world-clock', {
          body: { 
            originTimeZone,
            destinationTimeZone
          }
        });

        if (functionError) throw functionError;

        if (data) {
          console.log('World clock data received:', data);
          setWorldClockData(data);
        }
      } catch (err) {
        console.error('Error fetching world clock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch world clock data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorldClockData();
  }, [destination]);

  return { worldClockData, isLoading, error };
};
