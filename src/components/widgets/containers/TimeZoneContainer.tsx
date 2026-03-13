import React, { useState, useEffect, useMemo, Component, type ErrorInfo, type ReactNode } from 'react';
import TimeZonePresenter from '../presenters/TimeZonePresenter';
import { invokeFunction, supabase } from '@/integrations/supabase/client';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { getMockSunData } from '@/utils/mockData';
import { Clock } from 'lucide-react';

/** Tiny error boundary so a crash inside the widget never blanks the whole page. */
class TimeZoneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TimeZone widget crashed:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-icon bg-blue-500/10 text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="widget-title">Local Time</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Unable to load time data.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface TimeZoneContainerProps {
  placeDetails: SelectedPlace | null;
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

interface AstronomyData {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  moonIllumination: number;
  isSunUp: number;
  isMoonUp: number;
  sunriseHour: number;
  sunsetHour: number;
  location: string;
  country: string;
  localtime: string | null;
  timezone: string | null;
}

const TimeZoneContainer: React.FC<TimeZoneContainerProps> = ({ placeDetails, destination }) => {
  const [worldClockData, setWorldClockData] = useState<WorldClockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [astronomyData, setAstronomyData] = useState<AstronomyData | null>(null);

  // Fallback mock sun data
  const mockSunData = useMemo(() => getMockSunData(destination || 'Unknown'), [destination]);

  const getTimezoneFromCoordinates = (lat: number, lng: number): string => {
    if (lng >= -180 && lng < -120) {
      if (lat > 60) return 'America/Anchorage';
      if (lat > 45) return 'America/Vancouver';
      return 'America/Los_Angeles';
    }
    if (lng >= -120 && lng < -105) {
      if (lat > 50) return 'America/Edmonton';
      if (lat > 31 && lat < 49) return 'America/Denver';
      return 'America/Phoenix';
    }
    if (lng >= -105 && lng < -90) {
      if (lat > 50) return 'America/Winnipeg';
      if (lat > 25) return 'America/Chicago';
      if (lat > 10) return 'America/Mexico_City';
      return 'America/Guatemala';
    }
    if (lng >= -90 && lng < -75) {
      if (lat > 50) return 'America/Toronto';
      if (lat > 25) return 'America/New_York';
      if (lat > 15) return 'America/Havana';
      if (lat > -5) return 'America/Bogota';
      return 'America/Lima';
    }
    if (lng >= -75 && lng < -60) {
      if (lat > 25) return 'America/New_York';
      if (lat > 10) return 'America/Caracas';
      if (lat > -5) return 'America/Bogota';
      if (lat > -20) return 'America/Lima';
      return 'America/La_Paz';
    }
    if (lng >= -60 && lng < -45) {
      if (lat > 5) return 'America/Caracas';
      if (lat > -15) return 'America/Sao_Paulo';
      return 'America/Argentina/Buenos_Aires';
    }
    if (lng >= -45 && lng < -30) {
      if (lat > -15) return 'America/Sao_Paulo';
      return 'America/Argentina/Buenos_Aires';
    }
    if (lng >= -15 && lng < 0) {
      if (lat > 35) return 'Europe/London';
      return 'Africa/Casablanca';
    }
    if (lng >= 0 && lng < 15) {
      if (lat > 45) return 'Europe/Paris';
      if (lat > 35) return 'Europe/Rome';
      return 'Africa/Lagos';
    }
    if (lng >= 15 && lng < 30) {
      if (lat > 45) return 'Europe/Berlin';
      if (lat > 35) return 'Europe/Athens';
      return 'Africa/Cairo';
    }
    if (lng >= 30 && lng < 45) {
      if (lat > 55) return 'Europe/Moscow';
      if (lat > 35) return 'Europe/Istanbul';
      return 'Africa/Nairobi';
    }
    if (lng >= 45 && lng < 60) {
      if (lat > 40) return 'Asia/Yekaterinburg';
      return 'Asia/Dubai';
    }
    if (lng >= 60 && lng < 75) {
      if (lat > 50) return 'Asia/Omsk';
      if (lat > 35) return 'Asia/Tashkent';
      return 'Asia/Karachi';
    }
    if (lng >= 75 && lng < 90) {
      if (lat > 50) return 'Asia/Krasnoyarsk';
      if (lat > 25) return 'Asia/Kolkata';
      return 'Asia/Colombo';
    }
    if (lng >= 90 && lng < 105) {
      if (lat > 50) return 'Asia/Irkutsk';
      if (lat > 25) return 'Asia/Yangon';
      if (lat > 10) return 'Asia/Bangkok';
      return 'Asia/Jakarta';
    }
    if (lng >= 105 && lng < 120) {
      if (lat > 50) return 'Asia/Yakutsk';
      if (lat > 35) return 'Asia/Shanghai';
      if (lat > 10) return 'Asia/Ho_Chi_Minh';
      return 'Asia/Jakarta';
    }
    if (lng >= 120 && lng < 135) {
      if (lat > 50) return 'Asia/Vladivostok';
      if (lat > 35) return 'Asia/Shanghai';
      if (lat > 10) return 'Asia/Manila';
      return 'Asia/Makassar';
    }
    if (lng >= 135 && lng < 150) {
      if (lat > 45) return 'Asia/Sakhalin';
      if (lat > 30) return 'Asia/Tokyo';
      if (lat > 0) return 'Asia/Manila';
      return 'Australia/Darwin';
    }
    if (lng >= 150 && lng < 165) {
      if (lat > 0) return 'Asia/Tokyo';
      if (lat > -25) return 'Australia/Brisbane';
      return 'Australia/Sydney';
    }
    if (lng >= 165 && lng <= 180) {
      return 'Pacific/Auckland';
    }
    return 'UTC';
  };

  // Fetch astronomy data from WeatherAPI.com
  useEffect(() => {
    const fetchAstronomy = async () => {
      if (!placeDetails?.latitude || !placeDetails?.longitude) return;

      try {
        const { data, error } = await supabase.functions.invoke('get-astronomy', {
          body: {
            latitude: placeDetails.latitude,
            longitude: placeDetails.longitude,
          },
        });

        if (error) {
          console.error('Astronomy fetch error:', error);
          return;
        }

        if (data && !data.error) {
          setAstronomyData(data);
        }
      } catch (err) {
        console.error('Astronomy fetch failed:', err);
      }
    };

    fetchAstronomy();
  }, [placeDetails?.latitude, placeDetails?.longitude]);

  // Fetch world clock data — waits for astronomy to provide the correct timezone,
  // falls back to coordinate lookup only if astronomy hasn't returned one
  useEffect(() => {
    const fetchWorldClockData = async () => {
      if (placeDetails?.latitude === undefined || placeDetails?.latitude === null ||
        placeDetails?.longitude === undefined || placeDetails?.longitude === null) {
        return;
      }

      setIsLoading(true);
      try {
        const originTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Prefer astronomy-provided timezone (accurate), fall back to coordinate guess
        const destinationTimezone = astronomyData?.timezone || getTimezoneFromCoordinates(placeDetails.latitude, placeDetails.longitude);

        const data = await invokeFunction<Record<string, unknown>>('get-world-clock', {
          originTimeZone: originTimezone,
          destinationTimeZone: destinationTimezone
        });

        const payload = (data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object')
          ? (data.data as Record<string, unknown>)
          : data;
        const isErrorResponse = payload && typeof payload === 'object' && typeof (payload as { error?: unknown }).error === 'string';
        const hasExpectedShape = payload && typeof payload === 'object' && 'origin' in payload && 'destination' in payload && 'timeDifferenceText' in payload;

        if (hasExpectedShape && !isErrorResponse) {
          setWorldClockData(payload as WorldClockData);
        } else if (isErrorResponse) {
          console.error('World clock API returned error:', (payload as { error: string }).error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('TimeZoneContainer —', message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorldClockData();
  }, [placeDetails, astronomyData]);

  // Compute current hour in destination timezone
  const getCurrentHourInDestination = (): number => {
    const tz = astronomyData?.timezone || (worldClockData?.destination as { timeZone?: string } | undefined)?.timeZone;
    if (!tz) return 12;
    try {
      const now = new Date();
      const parts = now.toLocaleTimeString('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
      const [h, m] = parts.split(':').map(Number);
      return h + m / 60;
    } catch {
      return 12;
    }
  };

  // Build sun data from real astronomy or fallback to mock
  const sunriseHour = astronomyData?.sunriseHour ?? mockSunData.sunriseHour;
  const sunsetHour = astronomyData?.sunsetHour ?? mockSunData.sunsetHour;
  const currentHour = getCurrentHourInDestination();

  // Extract the destination CITY only — never use district/neighborhood names.
  // `destination` is formatted_address which may include districts like "San Isidro, Lima, Peru".
  // `placeDetails.region` is typically the city/state level.
  // Strategy: parse comma-separated parts, skip the last (country), use the second-to-last
  // as the city if there are 3+ parts (district, city, country). Otherwise use the first part.
  const parts = destination.split(',').map((s: string) => s.trim());
  let destinationCity: string;
  if (parts.length >= 3) {
    // "San Isidro, Lima, Peru" → "Lima"
    destinationCity = parts[parts.length - 2];
  } else if (parts.length === 2) {
    // "Lima, Peru" → "Lima"
    destinationCity = parts[0];
  } else {
    destinationCity = placeDetails?.name || destination || 'Unknown';
  }
  const destinationCountryCode = (placeDetails?.country_code || '').toUpperCase();

  // Timezone abbreviation: prefer world clock API response (derived from IANA tz),
  // never from astronomy location name
  const tzAbbreviation = worldClockData?.destination?.abbreviation || '';

  // Defensive defaults — ensure every field the presenter touches is a safe value
  const fallbackOrigin = { time: '00:00', time12: '12:00 AM', abbreviation: '' };
  const fallbackDest = { time: '00:00', time12: '12:00 AM', abbreviation: '' };

  const rawOrigin = worldClockData?.origin;
  const rawDest = worldClockData?.destination;

  const safeOrigin = {
    time: rawOrigin?.time ?? fallbackOrigin.time,
    time12: rawOrigin?.time12 ?? fallbackOrigin.time12,
    abbreviation: rawOrigin?.abbreviation ?? fallbackOrigin.abbreviation,
  };
  const safeDest = {
    time: rawDest?.time ?? fallbackDest.time,
    time12: rawDest?.time12 ?? fallbackDest.time12,
    abbreviation: rawDest?.abbreviation ?? fallbackDest.abbreviation,
  };

  const transformedData = {
    origin: safeOrigin,
    destination: safeDest,
    timeDifferenceText: worldClockData?.timeDifferenceText || 'Same time',
    isLoading,
    destinationName: destination || placeDetails?.name || 'Unknown',
    destinationCity: destinationCity || 'Unknown',
    destinationCountryCode: destinationCountryCode || '',
    tzAbbreviation: tzAbbreviation || '',
    destinationTimeZone: astronomyData?.timezone ?? (rawDest as { timeZone?: string } | undefined)?.timeZone ?? null,
    sunData: {
      sunrise: String(astronomyData?.sunrise ?? mockSunData.sunrise ?? '6:00 AM'),
      sunset: String(astronomyData?.sunset ?? mockSunData.sunset ?? '6:00 PM'),
      currentHour: typeof currentHour === 'number' && isFinite(currentHour) ? currentHour : 12,
      sunriseHour: typeof sunriseHour === 'number' && isFinite(sunriseHour) ? sunriseHour : 6,
      sunsetHour: typeof sunsetHour === 'number' && isFinite(sunsetHour) ? sunsetHour : 18,
      moonPhase: astronomyData?.moonPhase ?? null,
      moonIllumination: astronomyData?.moonIllumination ?? null,
      isSunUp: astronomyData?.isSunUp ?? null,
      isMoonUp: astronomyData?.isMoonUp ?? null,
      moonrise: astronomyData?.moonrise ?? null,
      moonset: astronomyData?.moonset ?? null,
      isLive: !!astronomyData,
    },
  };

  return (
    <TimeZoneErrorBoundary>
      <TimeZonePresenter data={transformedData} />
    </TimeZoneErrorBoundary>
  );
};

export default TimeZoneContainer;
