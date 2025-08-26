import React, { useState, useEffect } from 'react';
import TimeZonePresenter from '../presenters/TimeZonePresenter';
import { supabase } from '@/integrations/supabase/client';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface TimeZoneContainerProps {
  placeDetails: SelectedPlace | null;
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

const TimeZoneContainer: React.FC<TimeZoneContainerProps> = ({ placeDetails }) => {
  const [worldClockData, setWorldClockData] = useState<WorldClockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTimezoneFromCoordinates = (lat: number, lng: number): string => {


    if (lng >= -180 && lng < -120) {
      if (lat > 60) return 'America/Anchorage'; // Alaska
      if (lat > 45) return 'America/Vancouver'; // Pacific Northwest
      return 'America/Los_Angeles'; // Pacific
    }

    if (lng >= -120 && lng < -105) {
      if (lat > 50) return 'America/Edmonton'; // Mountain Canada
      if (lat > 31 && lat < 49) return 'America/Denver'; // Mountain US
      return 'America/Phoenix'; // Arizona/Mexico
    }

    if (lng >= -105 && lng < -90) {
      if (lat > 50) return 'America/Winnipeg'; // Central Canada
      if (lat > 25) return 'America/Chicago'; // Central US
      return 'America/Mexico_City'; // Mexico
    }

    if (lng >= -90 && lng < -75) {
      if (lat > 50) return 'America/Toronto'; // Eastern Canada
      if (lat > 25) return 'America/New_York'; // Eastern US
      return 'America/Havana'; // Caribbean
    }

    if (lng >= -75 && lng < -60) {
      if (lat > 10) return 'America/New_York'; // Eastern seaboard
      return 'America/Caracas'; // Northern South America
    }

    if (lng >= -60 && lng < -45) {
      if (lat > 5) return 'America/Caracas'; // Venezuela/Guyana
      if (lat > -15) return 'America/Sao_Paulo'; // Brazil
      return 'America/Argentina/Buenos_Aires'; // Argentina
    }

    if (lng >= -45 && lng < -30) {
      if (lat > -15) return 'America/Sao_Paulo'; // Eastern Brazil
      return 'America/Argentina/Buenos_Aires'; // Argentina
    }

    // Europe & Africa
    if (lng >= -15 && lng < 0) {
      if (lat > 35) return 'Europe/London'; // UK/Ireland
      return 'Africa/Casablanca'; // Morocco/Western Africa
    }

    if (lng >= 0 && lng < 15) {
      if (lat > 45) return 'Europe/Paris'; // Western Europe
      if (lat > 35) return 'Europe/Rome'; // Southern Europe
      return 'Africa/Lagos'; // Western Africa
    }

    if (lng >= 15 && lng < 30) {
      if (lat > 45) return 'Europe/Berlin'; // Central Europe
      if (lat > 35) return 'Europe/Athens'; // Southeastern Europe
      return 'Africa/Cairo'; // North/East Africa
    }

    if (lng >= 30 && lng < 45) {
      if (lat > 55) return 'Europe/Moscow'; // Western Russia
      if (lat > 35) return 'Europe/Istanbul'; // Turkey/Middle East
      return 'Africa/Nairobi'; // East Africa
    }

    // Asia
    if (lng >= 45 && lng < 60) {
      if (lat > 40) return 'Asia/Yekaterinburg'; // Central Russia
      return 'Asia/Dubai'; // Middle East
    }

    if (lng >= 60 && lng < 75) {
      if (lat > 50) return 'Asia/Omsk'; // Siberia
      if (lat > 35) return 'Asia/Tashkent'; // Central Asia
      return 'Asia/Karachi'; // Pakistan/Western India
    }

    if (lng >= 75 && lng < 90) {
      if (lat > 50) return 'Asia/Krasnoyarsk'; // Siberia
      if (lat > 25) return 'Asia/Kolkata'; // India
      return 'Asia/Colombo'; // Sri Lanka
    }

    if (lng >= 90 && lng < 105) {
      if (lat > 50) return 'Asia/Irkutsk'; // Siberia
      if (lat > 25) return 'Asia/Yangon'; // Myanmar/Bangladesh
      if (lat > 10) return 'Asia/Bangkok'; // Southeast Asia
      return 'Asia/Jakarta'; // Indonesia
    }

    if (lng >= 105 && lng < 120) {
      if (lat > 50) return 'Asia/Yakutsk'; // Eastern Siberia
      if (lat > 35) return 'Asia/Shanghai'; // China
      if (lat > 10) return 'Asia/Ho_Chi_Minh'; // Vietnam
      return 'Asia/Jakarta'; // Indonesia
    }

    if (lng >= 120 && lng < 135) {
      if (lat > 50) return 'Asia/Vladivostok'; // Far East Russia
      if (lat > 35) return 'Asia/Shanghai'; // Eastern China
      if (lat > 10) return 'Asia/Manila'; // Philippines
      return 'Asia/Makassar'; // Indonesia
    }

    if (lng >= 135 && lng < 150) {
      if (lat > 45) return 'Asia/Sakhalin'; // Sakhalin
      if (lat > 30) return 'Asia/Tokyo'; // Japan
      if (lat > 0) return 'Asia/Manila'; // Philippines
      return 'Australia/Darwin'; // Northern Australia
    }

    // Australia & Pacific
    if (lng >= 150 && lng < 165) {
      if (lat > 0) return 'Asia/Tokyo'; // Pacific extensions
      if (lat > -25) return 'Australia/Brisbane'; // Eastern Australia
      return 'Australia/Sydney'; // Southeastern Australia
    }

    if (lng >= 165 && lng <= 180) {
      if (lat > 0) return 'Pacific/Auckland'; // New Zealand region
      return 'Pacific/Auckland'; // New Zealand
    }

    // Default fallback
    return 'UTC';
  };

  // Fetch world clock data
  useEffect(() => {
    const fetchWorldClockData = async () => {
      if (!placeDetails?.latitude || !placeDetails?.longitude) {
        console.log('No coordinates available for timezone lookup');
        return;
      }

      setIsLoading(true);
      try {
        const originTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const destinationTimezone = getTimezoneFromCoordinates(placeDetails.latitude, placeDetails.longitude);

        console.log('Timezone detection:', {
          coordinates: [placeDetails.latitude, placeDetails.longitude],
          detectedTimezone: destinationTimezone,
          originTimezone
        });

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
  }, [placeDetails]);

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
    destinationName: placeDetails?.formatted_address || placeDetails?.name || 'Unknown'
  };

  return (
    <TimeZonePresenter data={transformedData} />
  );
};

export default TimeZoneContainer;
