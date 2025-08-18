import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';

interface WeatherData {
    current: any;
    forecast: any[];
    location: string;
    isLoading: boolean;
    error: string | null;
}

interface WeatherPresenterProps {
    data: WeatherData;
    tempUnit: 'C' | 'F';
    onTempUnitToggle: () => void;
}

const WeatherPresenter: React.FC<WeatherPresenterProps> = ({
    data,
    tempUnit,
    onTempUnitToggle
}) => {
    const { current, forecast, location, isLoading, error } = data;

    const getWeatherIcon = (condition: string) => {
        const lowerCondition = condition.toLowerCase();
        if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return Sun;
        if (lowerCondition.includes('cloudy') || lowerCondition.includes('overcast')) return Cloud;
        if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return CloudRain;
        if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return CloudLightning;
        return Cloud;
    };

    const convertTemp = (temp: number) => {
        return tempUnit === 'F' ? Math.round((temp * 9 / 5) + 32) : temp;
    };

    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-2">
                            <Thermometer className="w-4 h-4 text-white" />
                        </div>
                        Weather
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-400"></div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-2">
                            <Thermometer className="w-4 h-4 text-white" />
                        </div>
                        Weather
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4">
                    <p className="text-orange-400 text-sm">Unable to load weather data</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-2">
                            <Thermometer className="w-4 h-4 text-white" />
                        </div>
                        Weather
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onTempUnitToggle}
                        className="text-xs px-2 py-1 h-auto"
                    >
                        °{tempUnit}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Weather */}
                {current && (
                    <div className="text-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <div className="text-2xl font-bold text-orange-400">
                            {convertTemp(current.temp)}°{tempUnit}
                        </div>
                        <div className="text-sm text-muted-foreground">{current.condition}</div>
                        <div className="text-xs text-muted-foreground mt-1">{location}</div>
                    </div>
                )}

                {/* Forecast */}
                {forecast && forecast.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">7-Day Forecast</h4>
                        <div className="grid grid-cols-7 gap-1">
                            {forecast.slice(0, 7).map((day, index) => {
                                const Icon = getWeatherIcon(day.condition);
                                return (
                                    <div key={index} className="text-center p-2 bg-secondary/20 rounded-lg">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {index === 0 ? 'Today' : day.day}
                                        </div>
                                        <Icon className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                                        <div className="text-xs font-medium">
                                            {convertTemp(day.temp)}°
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WeatherPresenter;
