import { CountryData } from '@/hooks/useCountryData';

/**
 * Get the user's country code from the country data
 * @param countryData - The country data object from the user profile
 * @returns The country code (e.g., "US") or null if not available
 */
export const getUserCountryCode = (countryData: CountryData | null): string | null => {
    return countryData?.code || null;
};

/**
 * Get the user's country name from the country data
 * @param countryData - The country data object from the user profile
 * @returns The country name (e.g., "United States") or null if not available
 */
export const getUserCountryName = (countryData: CountryData | null): string | null => {
    return countryData?.name || null;
};

/**
 * Get the user's currency from the country data
 * @param countryData - The country data object from the user profile
 * @returns The currency code (e.g., "USD") or null if not available
 */
export const getUserCurrency = (countryData: CountryData | null): string | null => {
    return countryData?.currency || null;
};

/**
 * Get the user's timezone from the country data
 * @param countryData - The country data object from the user profile
 * @returns The timezone (e.g., "America/New_York") or null if not available
 */
export const getUserTimezone = (countryData: CountryData | null): string | null => {
    return countryData?.timezone || null;
};

/**
 * Check if a user is from a specific region
 * @param countryData - The country data object from the user profile
 * @param region - The region to check (e.g., "Americas", "Europe")
 * @returns True if the user is from the specified region
 */
export const isUserFromRegion = (countryData: CountryData | null, region: string): boolean => {
    return countryData?.region === region;
};

/**
 * Get a display string for the user's country
 * @param countryData - The country data object from the user profile
 * @param includeFlag - Whether to include the flag emoji/URL
 * @returns A formatted string like "🇺🇸 United States (US)" or "United States (US)"
 */
export const getCountryDisplayString = (countryData: CountryData | null, includeFlag: boolean = true): string => {
    if (!countryData) return 'Unknown';

    const flag = includeFlag ? `${countryData.flag} ` : '';
    return `${flag}${countryData.name} (${countryData.code})`;
};

/**
 * Get country data for a specific country code
 * @param countryCode - The ISO country code (e.g., "US")
 * @param countries - Array of all available countries
 * @returns The country data object or null if not found
 */
export const getCountryByCode = (countryCode: string, countries: CountryData[]): CountryData | null => {
    return countries.find(country => country.code === countryCode) || null;
};
