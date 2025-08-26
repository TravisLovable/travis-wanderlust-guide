import React, { useState, useEffect } from 'react';
import WeatherPresenter from '../presenters/WeatherPresenter';
import { useWeatherData } from '@/hooks/useWeatherData';
import { supabase } from '@/integrations/supabase/client';
import { Destination } from '@/types/destination';

interface WeatherContainerProps {
    destination: Destination;
}

const WeatherContainer: React.FC<WeatherContainerProps> = ({
    destination
}) => {
    const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

    // Determine user's preferred temperature unit based on country
    const getUserPreferredTempUnit = (countryCode: string): 'C' | 'F' => {
        // Countries that typically use Fahrenheit
        const fahrenheitCountries = ['US'];
        return fahrenheitCountries.includes(countryCode) ? 'F' : 'C';
    };
    const [userCountry, setUserCountry] = useState<any>(null);
    const [userLoading, setUserLoading] = useState(true);

    // Fetch user's country data for weather preferences
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
                        const countryData = userCountry[0].country_data;
                        setUserCountry(countryData);

                        // Set preferred temperature unit based on user's country
                        const preferredUnit = getUserPreferredTempUnit(countryData.code);
                        setTempUnit(preferredUnit);
                        console.log(`🌡️ Set preferred temperature unit to: ${preferredUnit} (${countryData.code})`);
                    } else {
                        console.log('❌ No user country data found for weather');
                    }
                }
            } catch (error) {
                console.error('Error fetching user country for weather:', error);
            }
        };

        fetchUserCountry();
    }, []);

    // Debug logging
    console.log('🌤️ WeatherContainer Debug:', {
        destination: destination.displayName,
        userCountry,
        tempUnit,
        userLoading
    });

    // Data fetching logic - now with user country context
    const { weatherData, isLoading, error } = useWeatherData(destination.displayName, userCountry);

    // Data transformation logic
    const transformedData = {
        current: weatherData?.current || null,
        forecast: weatherData?.forecast || [],
        location: weatherData?.location || destination.displayName,
        isLoading,
        error
    };

    return (
        <WeatherPresenter
            data={transformedData}
            tempUnit={tempUnit}
            onTempUnitToggle={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
        />
    );
};

export default WeatherContainer;
