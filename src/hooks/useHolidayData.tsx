
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Holiday {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties?: string[] | null;
  type: string;
  region: string;
}

interface HolidayData {
  country: string;
  year: number;
  totalHolidays: number;
  allHolidays: Holiday[];
  source: string;
}

const getCountryCodeFromDestination = (destination: string): string => {
  const countryMappings: { [key: string]: string } = {
    // Major countries
    'united states': 'US',
    'usa': 'US',
    'america': 'US',
    'canada': 'CA',
    'united kingdom': 'GB',
    'uk': 'GB',
    'england': 'GB',
    'britain': 'GB',
    'france': 'FR',
    'germany': 'DE',
    'italy': 'IT',
    'spain': 'ES',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'australia': 'AU',
    'brazil': 'BR',
    'mexico': 'MX',
    'argentina': 'AR',
    'chile': 'CL',
    'peru': 'PE',
    'colombia': 'CO',
    'venezuela': 'VE',
    'ecuador': 'EC',
    'bolivia': 'BO',
    'uruguay': 'UY',
    'paraguay': 'PY',
    'south africa': 'ZA',
    'nigeria': 'NG',
    'egypt': 'EG',
    'kenya': 'KE',
    'morocco': 'MA',
    'tunisia': 'TN',
    'algeria': 'DZ',
    'russia': 'RU',
    'poland': 'PL',
    'netherlands': 'NL',
    'belgium': 'BE',
    'switzerland': 'CH',
    'austria': 'AT',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'ireland': 'IE',
    'portugal': 'PT',
    'greece': 'GR',
    'turkey': 'TR',
    'israel': 'IL',
    'saudi arabia': 'SA',
    'uae': 'AE',
    'united arab emirates': 'AE',
    'qatar': 'QA',
    'kuwait': 'KW',
    'oman': 'OM',
    'bahrain': 'BH',
    'jordan': 'JO',
    'lebanon': 'LB',
    'syria': 'SY',
    'iraq': 'IQ',
    'iran': 'IR',
    'afghanistan': 'AF',
    'pakistan': 'PK',
    'bangladesh': 'BD',
    'sri lanka': 'LK',
    'myanmar': 'MM',
    'thailand': 'TH',
    'vietnam': 'VN',
    'cambodia': 'KH',
    'laos': 'LA',
    'malaysia': 'MY',
    'singapore': 'SG',
    'indonesia': 'ID',
    'philippines': 'PH',
    'south korea': 'KR',
    'north korea': 'KP',
    'mongolia': 'MN',
    'nepal': 'NP',
    'bhutan': 'BT',
    'maldives': 'MV',
    'new zealand': 'NZ'
  };

  const destinationLower = destination.toLowerCase();
  
  // Check for direct country matches first
  for (const [country, code] of Object.entries(countryMappings)) {
    if (destinationLower.includes(country)) {
      return code;
    }
  }

  // Check for city/region specific mappings
  if (destinationLower.includes('cape town') || destinationLower.includes('johannesburg') || 
      destinationLower.includes('durban') || destinationLower.includes('pretoria')) {
    return 'ZA';
  }
  if (destinationLower.includes('lima') || destinationLower.includes('cusco') || destinationLower.includes('arequipa')) {
    return 'PE';
  }
  if (destinationLower.includes('são paulo') || destinationLower.includes('rio de janeiro') || 
      destinationLower.includes('salvador') || destinationLower.includes('brasília')) {
    return 'BR';
  }
  if (destinationLower.includes('buenos aires') || destinationLower.includes('córdoba') || 
      destinationLower.includes('rosario') || destinationLower.includes('mendoza')) {
    return 'AR';
  }
  if (destinationLower.includes('santiago') || destinationLower.includes('valparaíso') || 
      destinationLower.includes('concepción')) {
    return 'CL';
  }
  if (destinationLower.includes('bogotá') || destinationLower.includes('medellín') || 
      destinationLower.includes('cali') || destinationLower.includes('cartagena')) {
    return 'CO';
  }
  if (destinationLower.includes('paris') || destinationLower.includes('marseille') || 
      destinationLower.includes('lyon') || destinationLower.includes('toulouse')) {
    return 'FR';
  }
  if (destinationLower.includes('london') || destinationLower.includes('manchester') || 
      destinationLower.includes('birmingham') || destinationLower.includes('liverpool')) {
    return 'GB';
  }
  if (destinationLower.includes('new york') || destinationLower.includes('los angeles') || 
      destinationLower.includes('chicago') || destinationLower.includes('miami')) {
    return 'US';
  }
  if (destinationLower.includes('tokyo') || destinationLower.includes('osaka') || 
      destinationLower.includes('kyoto') || destinationLower.includes('yokohama')) {
    return 'JP';
  }

  // Default fallback
  return 'US';
};

export const useHolidayData = (destination: string, dates: { checkin: string; checkout: string }) => {
  const [holidayData, setHolidayData] = useState<HolidayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolidayData = async () => {
      if (!destination || !dates.checkin || !dates.checkout) return;

      setIsLoading(true);
      setError(null);

      try {
        const countryCode = getCountryCodeFromDestination(destination);
        console.log(`Fetching holiday data for: ${destination}`);
        console.log(`Fetching holidays for country code: ${countryCode} based on destination: ${destination}`);

        const checkinYear = new Date(dates.checkin).getFullYear();
        const checkoutYear = new Date(dates.checkout).getFullYear();
        
        console.log(`Travel dates span from ${checkinYear} to ${checkoutYear}`);
        
        const yearsToFetch = [];
        for (let year = checkinYear; year <= checkoutYear; year++) {
          yearsToFetch.push(year);
        }
        
        console.log('Years to fetch:', yearsToFetch);

        let allHolidays: Holiday[] = [];
        
        for (const year of yearsToFetch) {
          console.log(`Fetching holidays for year ${year}`);
          
          const { data, error: functionError } = await supabase.functions.invoke('get-holidays', {
            body: { 
              country: countryCode,
              year: year
            }
          });

          if (functionError) {
            console.error(`Error fetching holidays for ${year}:`, functionError);
            continue;
          }

          if (data && data.allHolidays) {
            console.log(`Got ${data.allHolidays.length} holidays for ${year}`);
            allHolidays = [...allHolidays, ...data.allHolidays];
          }
        }

        console.log(`Total holidays fetched across all years: ${allHolidays.length}`);
        
        console.log('Travel dates:', dates);
        
        // Filter holidays that fall within travel dates
        const holidaysInRange = allHolidays.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          const checkinDate = new Date(dates.checkin);
          const checkoutDate = new Date(dates.checkout);
          
          const isInRange = holidayDate >= checkinDate && holidayDate <= checkoutDate;
          
          console.log(`Holiday ${holiday.name} (${holiday.date}): ${isInRange ? 'WITHIN' : 'OUTSIDE'} TRAVEL DATES`);
          
          return isInRange;
        });

        console.log('Holidays within travel dates:', holidaysInRange);

        const result: HolidayData = {
          country: countryCode,
          year: checkinYear,
          totalHolidays: allHolidays.length,
          allHolidays: holidaysInRange,
          source: 'api'
        };

        setHolidayData(result);
        console.log('Holiday data processed successfully:', result);
      } catch (err) {
        console.error('Error fetching holiday data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch holiday data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidayData();
  }, [destination, dates.checkin, dates.checkout]);

  return { holidayData, isLoading, error };
};
