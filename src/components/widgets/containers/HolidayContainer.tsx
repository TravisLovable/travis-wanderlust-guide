import React, { useState, useEffect } from 'react';
import HolidayPresenter from '../presenters/HolidayPresenter';
import { supabase } from '@/integrations/supabase/client';
import { Destination } from '@/types/destination';

// Helper function to get region from country code
const getRegionFromCountryCode = (countryCode: string): string => {
    const regionMap: { [key: string]: string } = {
        'US': 'Americas', 'CA': 'Americas', 'MX': 'Americas', 'BR': 'Americas', 'AR': 'Americas', 'CL': 'Americas', 'CO': 'Americas', 'PE': 'Americas',
        'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'NL': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'DK': 'Europe', 'FI': 'Europe',
        'JP': 'Asia', 'KR': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'TH': 'Asia', 'SG': 'Asia', 'MY': 'Asia', 'ID': 'Asia', 'VN': 'Asia',
        'AU': 'Oceania', 'NZ': 'Oceania', 'FJ': 'Oceania', 'PG': 'Oceania'
    };
    return regionMap[countryCode] || 'Unknown';
};

// Helper function to get travel advice based on user context
const getTravelAdvice = (userCountry: any, destinationCountry: string, holidayCount: number): string => {
    if (userCountry.code === destinationCountry) {
        return 'You\'re traveling within your home country!';
    }

    if (userCountry.region === getRegionFromCountryCode(destinationCountry)) {
        return `You\'re traveling within ${userCountry.region} - similar cultural context`;
    }

    if (holidayCount > 5) {
        return 'Many holidays during your trip - plan accordingly!';
    } else if (holidayCount > 0) {
        return 'Some holidays during your trip - check local schedules';
    } else {
        return 'No major holidays during your trip';
    }
};

interface HolidayData {
    country: string;
    year: number;
    totalHolidays: number;
    upcomingHolidays: Array<{
        date: string;
        name: string;
        localName: string;
        countryCode: string;
        fixed: boolean;
        global: boolean;
        counties: string[] | null;
        type: string;
        region?: string;
    }>;
    allHolidays: Array<{
        date: string;
        name: string;
        localName: string;
        countryCode: string;
        fixed: boolean;
        global: boolean;
        counties: string[] | null;
        type: string;
        region?: string;
    }>;
    source?: string;
    userContext?: {
        homeCountry: string;
        homeRegion: string;
        homeCurrency: string;
        insights: {
            isHomeCountry: boolean;
            regionSimilarity: boolean;
            travelAdvice: string;
        };
    } | null;
}

interface HolidayContainerProps {
    destination: Destination;
    dates: {
        checkin: string;
        checkout: string;
    };
}

const HolidayContainer: React.FC<HolidayContainerProps> = ({
    destination,
    dates
}) => {
    const [holidayData, setHolidayData] = useState<HolidayData | null>(null);
    const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
    const [userCountry, setUserCountry] = useState<any>(null);
    const [userLoading, setUserLoading] = useState(true);

    // Fetch user's country data for holiday preferences
    useEffect(() => {
        const fetchUserCountry = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserLoading(false);

                    // Fetch user's country data
                    const { data: userCountry, error } = await supabase
                        .from('users')
                        .select('country_data')
                        .eq('auth_id', user.id);

                    if (userCountry && userCountry[0]?.country_data) {
                        console.log('🌍 User country data for holidays:', userCountry[0].country_data);
                        setUserCountry(userCountry[0].country_data);
                    } else {
                        console.log('❌ No user country data found for holidays');
                    }
                }
            } catch (error) {
                console.error('Error fetching user country for holidays:', error);
            }
        };

        fetchUserCountry();
    }, []);

    // Fetch holiday data - Updated to handle multiple years and use user country context
    useEffect(() => {
        const fetchHolidayData = async () => {
            setIsLoadingHolidays(true);
            try {
                console.log('Fetching holiday data for:', destination);

                // Get country code for destination using user country context and smart parsing
                const getCountryCodeForDestination = (dest: string, userCountryData?: any): string => {
                    console.log('🔍 Determining country code for destination:', dest);
                    console.log('👤 User country context:', userCountryData);

                    // First, try to extract country from destination string
                    const parts = dest.split(',').map(part => part.trim());
                    const lastPart = parts[parts.length - 1];

                    // Check if destination contains common country indicators
                    const lowerDest = dest.toLowerCase();

                    // Priority 1: Direct country matches
                    const countryMatches: { [key: string]: string } = {
                        'brazil': 'BR', 'peru': 'PE', 'united states': 'US', 'usa': 'US',
                        'united kingdom': 'GB', 'uk': 'GB', 'france': 'FR', 'germany': 'DE',
                        'japan': 'JP', 'italy': 'IT', 'spain': 'ES', 'canada': 'CA',
                        'australia': 'AU', 'mexico': 'MX', 'argentina': 'AR', 'chile': 'CL',
                        'colombia': 'CO', 'netherlands': 'NL', 'sweden': 'SE', 'norway': 'NO',
                        'denmark': 'DK', 'finland': 'FI', 'switzerland': 'CH', 'austria': 'AT',
                        'belgium': 'BE', 'portugal': 'PT', 'greece': 'GR', 'poland': 'PL',
                        'czech republic': 'CZ', 'hungary': 'HU', 'romania': 'RO', 'bulgaria': 'BG',
                        'croatia': 'HR', 'slovenia': 'SI', 'slovakia': 'SK', 'lithuania': 'LT',
                        'latvia': 'LV', 'estonia': 'EE', 'iceland': 'IS', 'ireland': 'IE'
                    };

                    for (const [countryName, countryCode] of Object.entries(countryMatches)) {
                        if (lowerDest.includes(countryName)) {
                            console.log(`✅ Found country match: ${countryName} -> ${countryCode}`);
                            return countryCode;
                        }
                    }

                    // Priority 2: Check if last part of destination is a country
                    if (countryMatches[lastPart.toLowerCase()]) {
                        console.log(`✅ Found country in last part: ${lastPart} -> ${countryMatches[lastPart.toLowerCase()]}`);
                        return countryMatches[lastPart.toLowerCase()];
                    }

                    // Priority 3: Use user's home country as context for similar regions
                    if (userCountryData?.code) {
                        console.log(`🌍 Using user's home country as context: ${userCountryData.code}`);

                        // If user is from a specific region, suggest similar countries
                        const regionSuggestions: { [key: string]: string[] } = {
                            'Americas': ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
                            'Europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI'],
                            'Asia': ['JP', 'KR', 'CN', 'IN', 'TH', 'SG', 'MY', 'ID', 'VN'],
                            'Oceania': ['AU', 'NZ', 'FJ', 'PG']
                        };

                        const userRegion = userCountryData.region;
                        if (regionSuggestions[userRegion]) {
                            console.log(`🌍 User is from ${userRegion}, suggesting similar countries`);
                            // For now, return user's country as fallback
                            return userCountryData.code;
                        }
                    }

                    // Priority 4: Default to US if no match found
                    console.log('⚠️ No country match found, defaulting to US');
                    return 'US';
                };

                const countryCode = getCountryCodeForDestination(destination.displayName, userCountry);
                const checkinDate = new Date(dates.checkin);
                const checkoutDate = new Date(dates.checkout);
                const startYear = checkinDate.getFullYear();
                const endYear = checkoutDate.getFullYear();

                console.log(`Fetching holidays for country code: ${countryCode} based on destination: ${destination.displayName}`);
                console.log(`Travel dates span from ${startYear} to ${endYear}`);

                // Fetch holidays for all years in the travel date range
                const years = [];
                for (let year = startYear; year <= endYear; year++) {
                    years.push(year);
                }

                console.log('Years to fetch:', years);

                // Fetch holidays for each year
                const allHolidaysData = [];
                for (const year of years) {
                    try {
                        console.log(`Fetching holidays for year ${year}`);
                        const { data, error } = await supabase.functions.invoke('get-holidays', {
                            body: {
                                country: countryCode,
                                year: year
                            }
                        });

                        if (error) {
                            console.error(`Error fetching holiday data for ${year}:`, error);
                            continue;
                        }

                        if (data && data.allHolidays) {
                            console.log(`Got ${data.allHolidays.length} holidays for ${year}`);
                            allHolidaysData.push(...data.allHolidays);
                        }
                    } catch (yearError) {
                        console.error(`Failed to fetch holidays for year ${year}:`, yearError);
                    }
                }

                console.log(`Total holidays fetched across all years: ${allHolidaysData.length}`);

                // Filter holidays to show ONLY holidays that fall within the travel period
                if (allHolidaysData.length > 0) {
                    console.log('Travel dates:', {
                        checkin: checkinDate.toISOString().split('T')[0],
                        checkout: checkoutDate.toISOString().split('T')[0]
                    });

                    // Filter to show ONLY holidays that fall within the exact travel dates
                    const relevantHolidays = allHolidaysData.filter((holiday: any) => {
                        const holidayDate = new Date(holiday.date);
                        const isWithinTravelDates = holidayDate >= checkinDate && holidayDate <= checkoutDate;

                        console.log(`Holiday ${holiday.name} (${holiday.date}): ${isWithinTravelDates ? 'WITHIN TRAVEL DATES' : 'OUTSIDE TRAVEL DATES'}`);

                        return isWithinTravelDates;
                    });

                    console.log('Holidays within travel dates:', relevantHolidays);

                    // Update the data with filtered holidays and user context
                    const updatedData = {
                        country: countryCode,
                        year: startYear, // Use start year as primary
                        totalHolidays: relevantHolidays.length,
                        upcomingHolidays: relevantHolidays.slice(0, 10), // Show up to 10 holidays within travel dates
                        allHolidays: relevantHolidays,
                        source: 'multi-year-fetch',
                        userContext: userCountry ? {
                            homeCountry: userCountry.code,
                            homeRegion: userCountry.region,
                            homeCurrency: userCountry.currency,
                            insights: {
                                isHomeCountry: userCountry.code === countryCode,
                                regionSimilarity: userCountry.region === getRegionFromCountryCode(countryCode),
                                travelAdvice: getTravelAdvice(userCountry, countryCode, relevantHolidays.length)
                            }
                        } : null
                    };

                    setHolidayData(updatedData);
                } else {
                    // No holidays found
                    setHolidayData({
                        country: countryCode,
                        year: startYear,
                        totalHolidays: 0,
                        upcomingHolidays: [],
                        allHolidays: [],
                        source: 'multi-year-fetch'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch holiday data:', error);
                // Keep existing fallback data if API fails
            } finally {
                setIsLoadingHolidays(false);
            }
        };

        fetchHolidayData();
    }, [destination, dates.checkin, dates.checkout]);

    // Debug logging
    console.log('🎉 HolidayContainer Debug:', {
        destination,
        userCountry,
        holidayData,
        userLoading
    });

    // Data transformation logic
    const transformedData = {
        holidays: holidayData?.upcomingHolidays || [],
        totalHolidays: holidayData?.totalHolidays || 0,
        country: holidayData?.country || 'Unknown',
        isLoading: isLoadingHolidays,
        hasData: !!holidayData && holidayData.totalHolidays > 0,
        userContext: holidayData?.userContext || null
    };

    return (
        <HolidayPresenter
            data={transformedData}
            destination={destination}
            dates={dates}
        />
    );
};

export default HolidayContainer;
