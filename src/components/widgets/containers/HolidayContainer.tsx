import React, { useState, useEffect } from 'react';
import HolidayPresenter from '../presenters/HolidayPresenter';
import { supabase } from '@/integrations/supabase/client';

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
}

interface HolidayContainerProps {
    destination: string;
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

    // Fetch holiday data - Updated to handle multiple years
    useEffect(() => {
        const fetchHolidayData = async () => {
            setIsLoadingHolidays(true);
            try {
                console.log('Fetching holiday data for:', destination);

                // Get country code for destination - improved mapping
                const getCountryCodeForDestination = (dest: string) => {
                    const lowerDest = dest.toLowerCase();

                    // Map destinations to ISO country codes
                    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro') || lowerDest.includes('salvador') || lowerDest.includes('brasília')) {
                        return 'BR';
                    }
                    if (lowerDest.includes('peru') || lowerDest.includes('lima') || lowerDest.includes('cusco') || lowerDest.includes('arequipa') || lowerDest.includes('trujillo')) {
                        return 'PE';
                    }
                    if (lowerDest.includes('united states') || lowerDest.includes('usa') || lowerDest.includes('chicago') || lowerDest.includes('new york') || lowerDest.includes('los angeles') || lowerDest.includes('miami')) {
                        return 'US';
                    }
                    if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london') || lowerDest.includes('manchester') || lowerDest.includes('edinburgh')) {
                        return 'GB';
                    }
                    if (lowerDest.includes('france') || lowerDest.includes('paris') || lowerDest.includes('lyon') || lowerDest.includes('marseille')) {
                        return 'FR';
                    }
                    if (lowerDest.includes('germany') || lowerDest.includes('berlin') || lowerDest.includes('munich') || lowerDest.includes('hamburg')) {
                        return 'DE';
                    }
                    if (lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('osaka') || lowerDest.includes('kyoto')) {
                        return 'JP';
                    }
                    if (lowerDest.includes('italy') || lowerDest.includes('rome') || lowerDest.includes('milan') || lowerDest.includes('florence')) {
                        return 'IT';
                    }
                    if (lowerDest.includes('spain') || lowerDest.includes('madrid') || lowerDest.includes('barcelona') || lowerDest.includes('seville')) {
                        return 'ES';
                    }
                    if (lowerDest.includes('canada') || lowerDest.includes('toronto') || lowerDest.includes('vancouver') || lowerDest.includes('montreal')) {
                        return 'CA';
                    }
                    if (lowerDest.includes('australia') || lowerDest.includes('sydney') || lowerDest.includes('melbourne') || lowerDest.includes('brisbane')) {
                        return 'AU';
                    }
                    if (lowerDest.includes('mexico') || lowerDest.includes('mexico city') || lowerDest.includes('cancun') || lowerDest.includes('guadalajara')) {
                        return 'MX';
                    }
                    if (lowerDest.includes('argentina') || lowerDest.includes('buenos aires') || lowerDest.includes('cordoba') || lowerDest.includes('mendoza')) {
                        return 'AR';
                    }
                    if (lowerDest.includes('chile') || lowerDest.includes('santiago') || lowerDest.includes('valparaiso')) {
                        return 'CL';
                    }
                    if (lowerDest.includes('colombia') || lowerDest.includes('bogota') || lowerDest.includes('medellin') || lowerDest.includes('cartagena')) {
                        return 'CO';
                    }

                    // Default fallback - try to extract country code from destination string
                    const parts = dest.split(',');
                    if (parts.length > 1) {
                        const lastPart = parts[parts.length - 1].trim();
                        // Simple country name to code mapping
                        const countryMap: { [key: string]: string } = {
                            'Brazil': 'BR',
                            'Peru': 'PE',
                            'United States': 'US',
                            'USA': 'US',
                            'United Kingdom': 'GB',
                            'UK': 'GB',
                            'France': 'FR',
                            'Germany': 'DE',
                            'Japan': 'JP',
                            'Italy': 'IT',
                            'Spain': 'ES',
                            'Canada': 'CA',
                            'Australia': 'AU',
                            'Mexico': 'MX',
                            'Argentina': 'AR',
                            'Chile': 'CL',
                            'Colombia': 'CO'
                        };
                        return countryMap[lastPart] || 'US'; // Default to US if no match
                    }

                    return 'US'; // Final fallback
                };

                const countryCode = getCountryCodeForDestination(destination);
                const checkinDate = new Date(dates.checkin);
                const checkoutDate = new Date(dates.checkout);
                const startYear = checkinDate.getFullYear();
                const endYear = checkoutDate.getFullYear();

                console.log(`Fetching holidays for country code: ${countryCode} based on destination: ${destination}`);
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

                    // Update the data with filtered holidays
                    const updatedData = {
                        country: countryCode,
                        year: startYear, // Use start year as primary
                        totalHolidays: relevantHolidays.length,
                        upcomingHolidays: relevantHolidays.slice(0, 10), // Show up to 10 holidays within travel dates
                        allHolidays: relevantHolidays,
                        source: 'multi-year-fetch'
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

    // Data transformation logic
    const transformedData = {
        holidays: holidayData?.upcomingHolidays || [],
        totalHolidays: holidayData?.totalHolidays || 0,
        country: holidayData?.country || 'Unknown',
        isLoading: isLoadingHolidays,
        hasData: !!holidayData && holidayData.totalHolidays > 0
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
