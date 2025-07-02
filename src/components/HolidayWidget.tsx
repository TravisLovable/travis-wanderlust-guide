
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HolidayWidgetProps {
  destination: string;
  dates: { checkin: string; checkout: string };
}

interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

interface HolidayData {
  country: string;
  year: number;
  totalHolidays: number;
  upcomingHolidays: Holiday[];
  allHolidays: Holiday[];
  source: string;
}

const getCountryCodeForDestination = (dest: string) => {
  const lowerDest = dest.toLowerCase();

  const countryCodeMap: { [key: string]: string } = {
    'brazil': 'BR',
    'são paulo': 'BR',
    'sao paulo': 'BR',
    'rio de janeiro': 'BR',
    'peru': 'PE',
    'lima': 'PE',
    'united states': 'US',
    'usa': 'US',
    'chicago': 'US',
    'new york': 'US',
    'los angeles': 'US',
    'miami': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'london': 'GB',
    'france': 'FR',
    'paris': 'FR',
    'germany': 'DE',
    'berlin': 'DE',
    'japan': 'JP',
    'tokyo': 'JP',
    'italy': 'IT',
    'rome': 'IT',
    'spain': 'ES',
    'madrid': 'ES',
    'canada': 'CA',
    'toronto': 'CA',
    'australia': 'AU',
    'sydney': 'AU',
    'mexico': 'MX',
    'mexico city': 'MX',
    'argentina': 'AR',
    'buenos aires': 'AR',
    'chile': 'CL',
    'santiago': 'CL',
    'colombia': 'CO',
    'bogota': 'CO',
    'cape town': 'ZA',
    'south africa': 'ZA',
    'johannesburg': 'ZA',
    'nairobi': 'KE',
    'kenya': 'KE',
    'egypt': 'EG',
    'cairo': 'EG'
  };

  // Try direct match first
  for (const key in countryCodeMap) {
    if (lowerDest.includes(key)) {
      return countryCodeMap[key];
    }
  }

  // Log fallback
  console.warn(`⚠️ No country code found for "${dest}". Skipping holiday fetch.`);
  return null; // Let the component handle null safely
};

const cleanHolidayName = (name: string): string => {
  // Remove common regional suffixes and state codes
  return name
    .replace(/\s*\([^)]*\)$/, '') // Remove anything in parentheses at the end
    .replace(/\s*(observed|substitute)$/i, '') // Remove "observed" or "substitute"
    .replace(/\s+,\s*[A-Z]{2}$/, '') // Remove state codes like ", TX"
    .replace(/\s*-\s*[A-Z]{2}$/, '') // Remove state codes like "- TX"
    .trim();
};

const HolidayWidget: React.FC<HolidayWidgetProps> = ({ destination, dates }) => {
  const [holidayData, setHolidayData] = useState<HolidayData | null>(null);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      if (!destination || !dates.checkin) return;

      setIsLoadingHolidays(true);
      console.log('🔍 Fetching holidays for destination:', destination);

      const countryCode = getCountryCodeForDestination(destination);
      if (!countryCode) {
        console.warn('No valid country code found. Aborting holiday API call.');
        setHolidayData({
          country: 'Unknown',
          year: new Date(dates.checkin).getFullYear(),
          totalHolidays: 0,
          upcomingHolidays: [],
          allHolidays: [],
          source: 'no-country-match'
        });
        setIsLoadingHolidays(false);
        return;
      }

      const year = new Date(dates.checkin).getFullYear();
      console.log(`📅 Using country code: ${countryCode} for year: ${year}`);

      try {
        const { data, error } = await supabase.functions.invoke('get-holidays', {
          body: { country: countryCode, year }
        });

        if (error) {
          console.error('❌ Supabase function error:', error);
          return;
        }

        if (data && data.length > 0) {
          const checkinDate = new Date(dates.checkin);
          const checkoutDate = new Date(dates.checkout);
          
          // Filter holidays during the stay
          const upcomingHolidays = data.filter((holiday: Holiday) => {
            const holidayDate = new Date(holiday.date);
            return holidayDate >= checkinDate && holidayDate <= checkoutDate;
          });

          const processedHolidays = upcomingHolidays.map((holiday: Holiday) => ({
            ...holiday,
            name: cleanHolidayName(holiday.name),
            localName: cleanHolidayName(holiday.localName)
          }));

          setHolidayData({
            country: countryCode,
            year,
            totalHolidays: data.length,
            upcomingHolidays: processedHolidays,
            allHolidays: data,
            source: 'api-success'
          });

          console.log(`✅ Found ${processedHolidays.length} holidays during stay:`, processedHolidays);
        } else {
          console.log('📭 No holidays found for this period');
          setHolidayData({
            country: countryCode,
            year,
            totalHolidays: 0,
            upcomingHolidays: [],
            allHolidays: [],
            source: 'api-empty'
          });
        }
      } catch (err) {
        console.error('❌ Holiday fetch error:', err);
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [destination, dates.checkin, dates.checkout]);

  if (isLoadingHolidays) {
    return <div className="text-sm text-gray-500">Loading holidays...</div>;
  }

  if (!holidayData || holidayData.source === 'no-country-match') {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Holidays</h3>
          </div>
          <p className="text-sm text-orange-700">
            Country not recognized for holiday lookup
          </p>
        </CardContent>
      </Card>
    );
  }

  if (holidayData.upcomingHolidays.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-green-800">Holidays</h3>
          </div>
          <p className="text-sm text-green-700">
            No public holidays during your stay
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-purple-800">
            {holidayData.upcomingHolidays.length} Holiday{holidayData.upcomingHolidays.length > 1 ? 's' : ''} During Stay
          </h3>
        </div>
        
        <div className="space-y-2">
          {holidayData.upcomingHolidays.slice(0, 3).map((holiday, index) => {
            const date = new Date(holiday.date);
            return (
              <div key={index} className="flex items-start space-x-2">
                <MapPin className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-800 truncate">
                    {holiday.name}
                  </p>
                  <p className="text-xs text-purple-600">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          
          {holidayData.upcomingHolidays.length > 3 && (
            <p className="text-xs text-purple-600 mt-2">
              +{holidayData.upcomingHolidays.length - 3} more holiday{holidayData.upcomingHolidays.length - 3 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayWidget;
