import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';

interface WeatherData {
    current: any;
    forecast: any[];
    location: string;
    isLoading: boolean;
    error: string | null;
    userCountry?: any;
    homeWeather?: {
        country: string;
        region: string;
        timezone: string;
        insights?: {
            isWarmer: boolean;
            isColder: boolean;
            seasonalContext: string;
        };
    } | null;
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
    const { current, forecast, location, isLoading, error, userCountry, homeWeather } = data;

    const getWeatherIcon = (condition: string) => {
        const lowerCondition = condition.toLowerCase();
        if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return Sun;
        if (lowerCondition.includes('cloudy') || lowerCondition.includes('overcast')) return Cloud;
        if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return CloudRain;
        if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return CloudLightning;
        return Cloud;
    };

    const convertTemp = (temp: number | undefined | null) => {
        if (temp === null || temp === undefined || isNaN(temp)) {
            return tempUnit === 'F' ? 68 : 20; // Fallback temperature
        }
        return tempUnit === 'F' ? Math.round((temp * 9 / 5) + 32) : Math.round(temp);
    };

    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group">
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-amber-500/10 text-amber-500">
                            <Thermometer className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Weather</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-4 pt-0">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-400"></div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="travis-card travis-interactive group">
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-amber-500/10 text-amber-500">
                            <Thermometer className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Weather</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="text-center p-4 pt-0">
                    <p className="text-orange-400 text-sm">Unable to load weather data</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="travis-card travis-interactive group h-full flex flex-col">
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-amber-500/10 text-amber-500">
                        <Thermometer className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Weather</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onTempUnitToggle}
                        className="text-xs px-2 py-1 h-auto"
                    >
                        °{tempUnit}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 p-0 pt-0">
                {/* User's Home Country Context */}
                {homeWeather && (
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="text-xs text-blue-400 font-medium mb-1">
                            🌍 Your Home: {homeWeather.country}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {homeWeather.region} • {homeWeather.timezone}
                        </div>
                        {homeWeather.insights && (
                            <div className="text-xs text-blue-300 mt-1">
                                💡 {homeWeather.insights.seasonalContext}
                            </div>
                        )}
                    </div>
                )}

                {/* Current Weather */}
                {current && (
                    <div className="text-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                        <div className="text-2xl font-bold text-orange-400">
                            {convertTemp(current.temp)}°{tempUnit}
                        </div>
                        <div className="text-sm text-muted-foreground">{current.condition}</div>
                        <div className="text-xs text-muted-foreground mt-1">{location}</div>

                        {/* Temperature comparison with user's home */}
                        {homeWeather && homeWeather.insights && (
                            <div className="mt-2 pt-2 border-t border-orange-500/20">
                                <div className="text-xs text-orange-300">
                                    {homeWeather.insights.isWarmer ? '🔥 Warmer than your home' :
                                        homeWeather.insights.isColder ? '❄️ Colder than your home' :
                                            '🌡️ Similar to your home'}
                                </div>
                            </div>
                        )}
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
