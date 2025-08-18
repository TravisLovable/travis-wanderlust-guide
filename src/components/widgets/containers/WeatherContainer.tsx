import React, { useState } from 'react';
import WeatherPresenter from '../presenters/WeatherPresenter';
import { useWeatherData } from '@/hooks/useWeatherData';

interface WeatherContainerProps {
    destination: string;
}

const WeatherContainer: React.FC<WeatherContainerProps> = ({
    destination
}) => {
    const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

    // Data fetching logic
    const { weatherData, isLoading, error } = useWeatherData(destination);

    // Data transformation logic
    const transformedData = {
        current: weatherData?.current || null,
        forecast: weatherData?.forecast || [],
        location: weatherData?.location || destination,
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
