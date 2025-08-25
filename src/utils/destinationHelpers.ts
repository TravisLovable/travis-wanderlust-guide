import { Destination } from '@/types/destination';

// Country name to code mapping
const countryMappings: Record<string, string> = {
  'brazil': 'BR',
  'peru': 'PE',
  'italy': 'IT',
  'france': 'FR',
  'spain': 'ES',
  'japan': 'JP',
  'united kingdom': 'GB',
  'uk': 'GB',
  'germany': 'DE',
  'australia': 'AU',
  'canada': 'CA',
  'usa': 'US',
  'united states': 'US',
  'united states of america': 'US',
  'china': 'CN',
  'india': 'IN',
  'russia': 'RU',
  'south africa': 'ZA',
  'egypt': 'EG',
  'nigeria': 'NG',
  'kenya': 'KE',
  'morocco': 'MA',
  'tunisia': 'TN',
  'ghana': 'GH',
  'ethiopia': 'ET',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'rwanda': 'RW',
  'senegal': 'SN',
  'madagascar': 'MG',
  'zimbabwe': 'ZW',
  'botswana': 'BW',
  'namibia': 'NA',
  'zambia': 'ZM',
  'malawi': 'MW',
  'mozambique': 'MZ',
  'angola': 'AO',
  'netherlands': 'NL',
  'belgium': 'BE',
  'switzerland': 'CH',
  'austria': 'AT',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'iceland': 'IS',
  'poland': 'PL',
  'czech republic': 'CZ',
  'hungary': 'HU',
  'greece': 'GR',
  'portugal': 'PT',
  'turkey': 'TR',
  'israel': 'IL',
  'south korea': 'KR',
  'thailand': 'TH',
  'singapore': 'SG',
  'malaysia': 'MY',
  'indonesia': 'ID',
  'philippines': 'PH',
  'vietnam': 'VN',
  'new zealand': 'NZ',
  'mexico': 'MX',
  'argentina': 'AR',
  'chile': 'CL',
  'colombia': 'CO',
  'venezuela': 'VE',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'hong kong': 'HK',
};

export const getCountryCodeFromName = (countryName: string): string | undefined => {
  if (!countryName) return undefined;
  return countryMappings[countryName.toLowerCase()];
};

export const getCountryFlag = (destination: Destination | string): string | null => {
  let countryCode: string | undefined;
  
  if (typeof destination === 'string') {
    // Legacy string-based approach
    const lowerDest = destination.toLowerCase();
    
    // Check each country mapping
    for (const [country, code] of Object.entries(countryMappings)) {
      if (lowerDest.includes(country)) {
        countryCode = code;
        break;
      }
    }
  } else {
    // Use the structured destination object
    countryCode = destination.countryCode || getCountryCodeFromName(destination.country);
  }
  
  return countryCode ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` : null;
};

export const formatDestinationDisplay = (destination: Destination): string => {
  if (destination.country && destination.name !== destination.country) {
    return `${destination.name}, ${destination.country}`;
  }
  return destination.name;
};

export const isDestinationEqual = (dest1: Destination | null, dest2: Destination | null): boolean => {
  if (!dest1 || !dest2) return dest1 === dest2;
  return dest1.id === dest2.id || dest1.displayName === dest2.displayName;
};

export const createDestinationFromString = (destinationString: string): Destination => {
  const parts = destinationString.split(',').map(part => part.trim());
  const city = parts[0] || destinationString;
  const country = parts[1] || '';
  
  const id = destinationString.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return {
    id,
    name: city,
    displayName: destinationString,
    country,
    countryCode: getCountryCodeFromName(country),
  };
};