import React, { useState, useEffect } from 'react';
import HolidayPresenter from '../presenters/HolidayPresenter';
import { supabase } from '@/integrations/supabase/client';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

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
    placeDetails: SelectedPlace | null;
    dates: {
        checkin: string;
        checkout: string;
    };
}

const HolidayContainer: React.FC<HolidayContainerProps> = ({
    placeDetails,
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
                const destinationName = placeDetails?.formatted_address || placeDetails?.name || 'Unknown';

                // Prefer placeDetails.country_code (from map/place API); otherwise parse destination string
                const getCountryCodeForDestination = (dest: string): string => {
                    const lowerDest = dest.toLowerCase();
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
                        'latvia': 'LV', 'estonia': 'EE', 'iceland': 'IS', 'ireland': 'IE',
                        'thailand': 'TH', 'vietnam': 'VN', 'india': 'IN', 'china': 'CN', 'south korea': 'KR',
                        'indonesia': 'ID', 'malaysia': 'MY', 'singapore': 'SG', 'new zealand': 'NZ'
                    };

                    for (const [countryName, countryCode] of Object.entries(countryMatches)) {
                        if (lowerDest.includes(countryName)) return countryCode;
                    }

                    const parts = dest.split(',').map(part => part.trim());
                    const lastPart = parts[parts.length - 1];
                    if (lastPart && countryMatches[lastPart.toLowerCase()]) {
                        return countryMatches[lastPart.toLowerCase()];
                    }

                    return 'US';
                };

                const countryCode = (placeDetails?.country_code?.toUpperCase() && placeDetails.country_code.length === 2)
                    ? placeDetails.country_code.toUpperCase()
                    : getCountryCodeForDestination(destinationName);
                const checkinDate = new Date(dates.checkin);
                const checkoutDate = new Date(dates.checkout);
                const startYear = checkinDate.getFullYear();
                const endYear = checkoutDate.getFullYear();



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
    }, [placeDetails, dates.checkin, dates.checkout]);

    const destinationName = placeDetails?.formatted_address || placeDetails?.name || 'Unknown';

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
            destination={{ name: destinationName }}
            dates={dates}
        />
    );
};

export default HolidayContainer;
