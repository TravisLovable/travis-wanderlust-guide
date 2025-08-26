
// Mapping of country codes (ISO 3166-1 alpha-2) to their currencies
export const countryCodeToCurrency: { [key: string]: { code: string; symbol: string; name: string } } = {
  // Americas
  'US': { code: 'USD', symbol: '$', name: 'US Dollar' },
  'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  'MX': { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  'BR': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  'AR': { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  'CL': { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  'CO': { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  'PE': { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },

  // Europe
  'GB': { code: 'GBP', symbol: '£', name: 'British Pound' },
  'DE': { code: 'EUR', symbol: '€', name: 'Euro' },
  'FR': { code: 'EUR', symbol: '€', name: 'Euro' },
  'ES': { code: 'EUR', symbol: '€', name: 'Euro' },
  'IT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'NL': { code: 'EUR', symbol: '€', name: 'Euro' },
  'BE': { code: 'EUR', symbol: '€', name: 'Euro' },
  'AT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'PT': { code: 'EUR', symbol: '€', name: 'Euro' },
  'GR': { code: 'EUR', symbol: '€', name: 'Euro' },
  'CH': { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  'NO': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  'SE': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  'DK': { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  'RU': { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  'TR': { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },

  // Asia Pacific
  'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  'CN': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  'JP': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  'KR': { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  'TH': { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  'SG': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  'NZ': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  'ID': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  'MY': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  'PH': { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  'VN': { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },

  // Middle East & Africa
  'AE': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'SA': { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  'IL': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  'ZA': { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  'EG': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  'NG': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  'KE': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  'MA': { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' }
};

// Legacy mapping for backward compatibility (country names to currencies)
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

// Primary function: Get currency from country code (most reliable)
export const getCurrencyFromCountryCode = (countryCode: string) => {
  if (!countryCode) return { code: 'USD', symbol: '$', name: 'US Dollar' };

  const upperCode = countryCode.toUpperCase();
  return countryCodeToCurrency[upperCode] || { code: 'USD', symbol: '$', name: 'US Dollar' };
};

// Fallback function: Extract country from destination string
export const extractCountryFromDestination = (destination: string): string => {
  // Split by comma and get the last part (usually the country)
  const parts = destination.split(',').map(part => part.trim());
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return destination;
};

// Legacy function: Get currency from destination string parsing (less reliable)
export const getCurrencyFromDestination = (destination: string) => {
  const country = extractCountryFromDestination(destination);
  return countryToCurrency[country] || { code: 'USD', symbol: '$', name: 'US Dollar' };
};

// Main function: Get currency with country code preference, fallback to string parsing
export const getCurrencyFromPlace = (placeDetails: { country_code?: string; formatted_address?: string; name?: string }) => {
  // Try country code first (most reliable)
  if (placeDetails.country_code) {
    return getCurrencyFromCountryCode(placeDetails.country_code);
  }

  // Fallback to parsing destination string
  const destination = placeDetails.formatted_address || placeDetails.name || '';
  return getCurrencyFromDestination(destination);
};
