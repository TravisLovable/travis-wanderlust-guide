import React, { useState, useEffect } from 'react';
import TimeZonePresenter from '../presenters/TimeZonePresenter';
import { supabase } from '@/integrations/supabase/client';

interface TimeZoneContainerProps {
  destination: string;
}

interface WorldClockData {
  origin: {
    timeZone: string;
    time: string;
    time12: string;
    date: string;
    fullDateTime: string;
    isDst: boolean;
    abbreviation: string;
  };
  destination: {
    timeZone: string;
    time: string;
    time12: string;
    date: string;
    fullDateTime: string;
    isDst: boolean;
    abbreviation: string;
  };
  timeDifferenceHours: number;
  timeDifferenceText: string;
}

const TimeZoneContainer: React.FC<TimeZoneContainerProps> = ({ destination }) => {
  const [worldClockData, setWorldClockData] = useState<WorldClockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch world clock data
  useEffect(() => {
    const fetchWorldClockData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching world clock data for:', destination);

        // Get timezone for destination - improved mapping with more destinations
        const getTimezoneForDestination = (dest: string) => {
          const lowerDest = dest.toLowerCase();

          // Peru
          if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
            return 'America/Lima';
          }

          // South America
          if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro')) {
            return 'America/Sao_Paulo';
          }

          if (lowerDest.includes('argentina') || lowerDest.includes('buenos aires')) {
            return 'America/Argentina/Buenos_Aires';
          }

          if (lowerDest.includes('chile') || lowerDest.includes('santiago')) {
            return 'America/Santiago';
          }

          if (lowerDest.includes('colombia') || lowerDest.includes('bogota')) {
            return 'America/Bogota';
          }

          // North America
          if (lowerDest.includes('chicago')) {
            return 'America/Chicago';
          }

          if (lowerDest.includes('new york')) {
            return 'America/New_York';
          }

          if (lowerDest.includes('los angeles')) {
            return 'America/Los_Angeles';
          }

          if (lowerDest.includes('mexico')) {
            return 'America/Mexico_City';
          }

          // Europe
          if (lowerDest.includes('london')) {
            return 'Europe/London';
          }

          if (lowerDest.includes('paris')) {
            return 'Europe/Paris';
          }

          // Asia
          if (lowerDest.includes('bali') || lowerDest.includes('indonesia')) {
            return 'Asia/Makassar';
          }

          if (lowerDest.includes('tokyo')) {
            return 'Asia/Tokyo';
          }

          // Default fallback
          return 'UTC';
        };

        const destinationTimezone = getTimezoneForDestination(destination);
        const originTimezone = 'America/Chicago'; // User's timezone (CST)

        console.log(`Using timezones: origin=${originTimezone}, destination=${destinationTimezone}`);

        const { data, error } = await supabase.functions.invoke('get-world-clock', {
          body: {
            originTimeZone: originTimezone,
            destinationTimeZone: destinationTimezone
          }
        });

        if (error) {
          console.error('Error fetching world clock data:', error);
          throw error;
        }

        console.log('World clock data received:', data);
        setWorldClockData(data);
      } catch (error) {
        console.error('Failed to fetch world clock data:', error);
        // Keep existing mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorldClockData();
  }, [destination]);

  // Data transformation logic
  const transformedData = {
    origin: worldClockData?.origin || {
      time: '16:50',
      time12: '4:50 PM',
      abbreviation: 'CST'
    },
    destination: worldClockData?.destination || {
      time: '16:50',
      time12: '4:50 PM',
      abbreviation: 'PET'
    },
    timeDifferenceText: worldClockData?.timeDifferenceText || 'Same time',
    isLoading,
    destinationName: destination.split(',')[0]
  };

  return (
    <TimeZonePresenter data={transformedData} />
  );
};

export default TimeZoneContainer;
