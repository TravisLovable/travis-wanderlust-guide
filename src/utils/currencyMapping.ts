
// Mapping of countries to their currencies
export const countryToCurrency: { [key: string]: { code: string; symbol: string; name: string } } = {
  'Brazil': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  'United States': { code: 'USD', symbol: '$', name: 'US Dollar' },
  'United Kingdom': { code: 'GBP', symbol: '£', name: 'British Pound' },
  'Canada': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  'Australia': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  'Japan': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  'Germany': { code: 'EUR', symbol: '€', name: 'Euro' },
  'France': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Spain': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Italy': { code: 'EUR', symbol: '€', name: 'Euro' },
  'Mexico': { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  'Argentina': { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  'Chile': { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  'Colombia': { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  'Peru': { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  'India': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  'China': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  'South Korea': { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  'Thailand': { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  'Singapore': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  'Switzerland': { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  'Norway': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  'Sweden': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  'Denmark': { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  'Russia': { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  'Turkey': { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  'South Africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  'Egypt': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  'Israel': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  'UAE': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'United Arab Emirates': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'Saudi Arabia': { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' }
};

export const extractCountryFromDestination = (destination: string): string => {
  // Split by comma and get the last part (usually the country)
  const parts = destination.split(',').map(part => part.trim());
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return destination;
};

export const getCurrencyFromDestination = (destination: string) => {
  const country = extractCountryFromDestination(destination);
  return countryToCurrency[country] || { code: 'USD', symbol: '$', name: 'US Dollar' };
};
