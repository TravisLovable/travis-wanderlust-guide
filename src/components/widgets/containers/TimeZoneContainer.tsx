import React, { useState, useEffect } from 'react';
import TimeZonePresenter from '../presenters/TimeZonePresenter';
import { invokeFunction } from '@/integrations/supabase/client';
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

  console.log('TimeZoneContainer render - worldClockData:', worldClockData, 'isLoading:', isLoading);
  console.log('TimeZoneContainer render - placeDetails:', placeDetails);
  console.log('placeDetails has coordinates?', placeDetails?.latitude, placeDetails?.longitude);

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
    console.log('useEffect triggered - placeDetails:', placeDetails);
    console.log('Checking coordinates:', placeDetails?.latitude, placeDetails?.longitude);

    const fetchWorldClockData = async () => {
      if (placeDetails?.latitude === undefined || placeDetails?.latitude === null ||
        placeDetails?.longitude === undefined || placeDetails?.longitude === null) {
        console.log('No coordinates available for timezone lookup - exiting early');
        console.log('placeDetails:', placeDetails);
        console.log('latitude:', placeDetails?.latitude);
        console.log('longitude:', placeDetails?.longitude);
        return;
      }

      console.log('Proceeding with API call using coordinates:', placeDetails.latitude, placeDetails.longitude);

      // Note: coordinates 0,0 indicate a data issue - should be actual location coordinates
      if (placeDetails.latitude === 0 && placeDetails.longitude === 0) {
        console.warn('WARNING: Using coordinates 0,0 which may not represent the actual location');
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

        const data = await invokeFunction<Record<string, unknown>>('get-world-clock', {
          originTimeZone: originTimezone,
          destinationTimeZone: destinationTimezone
        });

        console.log('World clock data fetched successfully:', JSON.stringify(data, null, 2));

        // Use payload: support wrapped { data: {...} } or direct { origin, destination, ... }
        const payload = (data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object')
          ? (data.data as Record<string, unknown>)
          : data;
        const isErrorResponse = payload && typeof payload === 'object' && typeof (payload as { error?: unknown }).error === 'string';
        const hasExpectedShape = payload && typeof payload === 'object' && 'origin' in payload && 'destination' in payload && 'timeDifferenceText' in payload;

        if (hasExpectedShape && !isErrorResponse) {
          console.log('About to set worldClockData state with:', payload);
          setWorldClockData(payload as WorldClockData);
        } else if (isErrorResponse) {
          console.error('World clock API returned error:', (payload as { error: string }).error);
        } else {
          console.error('Invalid world clock data structure received:', data);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('TimeZoneContainer —', message);
        // Keep existing mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorldClockData();
  }, [placeDetails]);

  // Data transformation logic
  console.log('Transforming data - worldClockData state:', worldClockData);
  console.log('Is worldClockData null?', worldClockData === null);
  console.log('worldClockData origin:', worldClockData?.origin);

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

  console.log('Final transformed data being passed to presenter:', transformedData);

  return (
    <TimeZonePresenter data={transformedData} />
  );
};

export default TimeZoneContainer;
