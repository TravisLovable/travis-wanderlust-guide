import { useState, useEffect } from 'react';

export interface CountryData {
    code: string;
    name: string;
    flag: string;
    currency?: string;
    currencySymbol?: string;
    timezone?: string;
    region?: string;
    subregion?: string;
}

export interface CountryApiResponse {
    name: {
        common: string;
        official: string;
    };
    cca2: string;
    cca3: string;
    currencies?: Record<string, { name: string; symbol: string }>;
    timezones?: string[];
    region: string;
    subregion?: string;
    flags: {
        png: string;
        svg: string;
    };
}

export const useCountryData = () => {
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all countries
    const fetchAllCountries = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,currencies,timezones,region,subregion,flags');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CountryApiResponse[] = await response.json();

            // Transform API response to our format
            const transformedCountries: CountryData[] = data
                .sort((a, b) => a.name.common.localeCompare(b.name.common))
                .map(country => ({
                    code: country.cca2,
                    name: country.name.common,
                    flag: country.flags.svg,
                    currency: country.currencies ? Object.keys(country.currencies)[0] : undefined,
                    currencySymbol: country.currencies ? Object.values(country.currencies)[0]?.symbol : undefined,
                    timezone: country.timezones?.[0],
                    region: country.region,
                    subregion: country.subregion
                }));

            setCountries(transformedCountries);
        } catch (err) {
            console.error('Error fetching countries:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch countries');
        } finally {
            setIsLoading(false);
        }
    };

    // Get country by code
    const getCountryByCode = async (countryCode: string): Promise<CountryData | null> => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,cca2,cca3,currencies,timezones,region,subregion,flags`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CountryApiResponse[] = await response.json();
            if (data.length === 0) return null;

            const country = data[0];
            return {
                code: country.cca2,
                name: country.name.common,
                flag: country.flags.svg,
                currency: country.currencies ? Object.keys(country.currencies)[0] : undefined,
                currencySymbol: country.currencies ? Object.values(country.currencies)[0]?.symbol : undefined,
                timezone: country.timezones?.[0],
                region: country.region,
                subregion: country.subregion
            };
        } catch (err) {
            console.error('Error fetching country by code:', err);
            return null;
        }
    };

    // Search countries by name
    const searchCountries = (query: string): CountryData[] => {
        if (!query.trim()) return countries;

        const lowerQuery = query.toLowerCase();
        return countries.filter(country =>
            country.name.toLowerCase().includes(lowerQuery) ||
            country.code.toLowerCase().includes(lowerQuery)
        );
    };

    // Get countries by region
    const getCountriesByRegion = (region: string): CountryData[] => {
        return countries.filter(country => country.region === region);
    };

    useEffect(() => {
        fetchAllCountries();
    }, []);

    return {
        countries,
        isLoading,
        error,
        refetch: fetchAllCountries,
        getCountryByCode,
        searchCountries,
        getCountriesByRegion
    };
};
