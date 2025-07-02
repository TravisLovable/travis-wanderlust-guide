import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface HolidayWidgetProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
}

interface Holiday {
  date: string;
  name: string;
  localName?: string;
  type?: string;
  region?: string;
  countryCode?: string;
}

const HolidayWidget = ({ destination, dates }: HolidayWidgetProps) => {
  // Extract country from destination (improved approach)
  const getCountryCode = (dest: string) => {
    const countryMappings: { [key: string]: string } = {
      // South Africa variations
      'south africa': 'ZA',
      'cape town': 'ZA',
      'johannesburg': 'ZA',
      'durban': 'ZA',
      'pretoria': 'ZA',
      // Handle "SA" abbreviation carefully - could be South Africa or Saudi Arabia
      'cape town, sa': 'ZA',
      'johannesburg, sa': 'ZA',
      ', sa': 'ZA', // If it ends with ", sa" it's likely South Africa
      // Other countries
      'brazil': 'BR',
      'usa': 'US',
      'united states': 'US',
      'uk': 'GB',
      'united kingdom': 'GB',
      'england': 'GB',
      'france': 'FR',
      'germany': 'DE',
      'italy': 'IT',
      'spain': 'ES',
      'japan': 'JP',
      'canada': 'CA',
      'australia': 'AU',
      'new zealand': 'NZ',
      'india': 'IN',
      'china': 'CN',
      'mexico': 'MX',
      'argentina': 'AR',
      'chile': 'CL',
      'peru': 'PE',
      'colombia': 'CO',
      'venezuela': 'VE',
      // Add more mappings as needed
    };
    
    const lowerDest = dest.toLowerCase();
    
    // Check for exact matches first (more specific)
    for (const [country, code] of Object.entries(countryMappings)) {
      if (lowerDest === country || lowerDest.includes(country)) {
        return code;
      }
    }
    
    return 'US'; // Default fallback
  };

  const countryCode = getCountryCode(destination);
  const year = new Date(dates.checkin).getFullYear();

  console.log('Holiday Widget - Destination:', destination, 'Detected Country Code:', countryCode);

  const { data: holidays, isLoading, error } = useQuery({
    queryKey: ['holidays', countryCode, year],
    queryFn: async () => {
      console.log('Fetching holidays for:', countryCode, year);
      const response = await fetch('https://sioicdmsphfigulrufim.supabase.co/functions/v1/get-holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2ljZG1zcGhmaWd1bHJ1ZmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjA3ODcsImV4cCI6MjA2NjAzNjc4N30.jeiXaHM_wjCOs29jfePSKYTJXouR17BsTBfC-Oym8uk`
        },
        body: JSON.stringify({ country: countryCode, year })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }
      
      const data = await response.json();
      console.log('Holiday API Response:', data);
      return data;
    },
    enabled: !!countryCode
  });

  // Clean up holiday data - remove state abbreviations and regional details
  const cleanHolidayName = (name: string, region?: string) => {
    // Remove everything after the first occurrence of "US-"
    let cleanName = name.split('US-')[0];
    
    // Remove trailing comma and spaces
    cleanName = cleanName.replace(/,\s*$/, '').trim();
    
    // Remove date patterns that might be mixed in
    cleanName = cleanName.replace(/\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/g, '');
    
    // Remove any remaining trailing punctuation
    cleanName = cleanName.replace(/[,\s]+$/, '').trim();
    
    return cleanName || name; // Fallback to original name if cleaning results in empty string
  };

  // Filter holidays during travel period
  const getRelevantHolidays = (holidayData: any) => {
    if (!holidayData?.allHolidays) return [];
    
    const checkinDate = new Date(dates.checkin);
    const checkoutDate = new Date(dates.checkout);
    
    return holidayData.allHolidays
      .filter((holiday: Holiday) => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= checkinDate && holidayDate <= checkoutDate;
      })
      .map((holiday: Holiday) => ({
        ...holiday,
        name: cleanHolidayName(holiday.name, holiday.region),
        displayDate: new Date(holiday.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
      }))
      .slice(0, 5); // Limit to 5 most relevant holidays
  };

  const relevantHolidays = holidays ? getRelevantHolidays(holidays) : [];

  if (isLoading) {
    return (
      <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Holiday Intel
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !holidays) {
    return (
      <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Holiday Intel
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-purple-400">
          <p className="text-sm">Unable to load holiday information</p>
        </CardContent>
      </Card>
    );
  }

  if (relevantHolidays.length === 0) {
    return (
      <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Holiday Intel
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">No major holidays during your travel period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="travis-card travis-interactive group bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 shadow-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          Holiday Intel
          <div className="ml-auto flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            {destination}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {relevantHolidays.map((holiday, idx) => (
          <div 
            key={idx}
            className="p-3 bg-gradient-to-br from-purple-500/8 to-pink-500/8 border border-purple-500/15 rounded-xl hover:bg-gradient-to-br hover:from-purple-500/15 hover:to-pink-500/15 hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-purple-300 text-sm mb-1">
                  {holiday.name}
                </h3>
                <p className="text-xs text-muted-foreground/80">
                  {holiday.displayDate}
                </p>
                {holiday.type && holiday.type !== 'Public' && (
                  <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {holiday.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground/60">
            Public holidays may affect business hours and availability
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayWidget;
