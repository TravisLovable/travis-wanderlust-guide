
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';

interface HomeWeatherWidgetProps {
  homeLocation: string;
  tempUnit: 'C' | 'F';
}

const HomeWeatherWidget = ({ homeLocation, tempUnit }: HomeWeatherWidgetProps) => {
  const { weatherData, isLoading, error } = useWeatherData(homeLocation);

  const convertTemp = (temp: number) => {
    return tempUnit === 'F' ? Math.round((temp * 9/5) + 32) : Math.round(temp);
  };

  const getWeatherEmoji = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return '⛈️';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️';
    return '🌤️';
  };

  if (isLoading) {
    return (
      <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <Home className="w-5 h-5 text-white" />
            </div>
            Home Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <Home className="w-5 h-5 text-white" />
            </div>
            Home Weather
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-blue-400 p-4">
          <p>Unable to load home weather</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
            <Home className="w-5 h-5 text-white" />
          </div>
          Home Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {convertTemp(weatherData.current.temp)}°{tempUnit}
          </div>
          <div className="text-lg text-muted-foreground mb-2 flex items-center justify-center gap-2">
            <span className="text-2xl">{getWeatherEmoji(weatherData.current.condition)}</span>
            {weatherData.current.condition}
          </div>
          <div className="text-sm text-muted-foreground">
            Humidity: {weatherData.current.humidity}%
          </div>
        </div>
        
        {/* 7-Day Forecast */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">7-Day Forecast</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weatherData.forecast.slice(0, 7).map((forecast, idx) => (
              <div key={idx} className="flex-shrink-0 text-center p-3 bg-secondary/30 rounded-lg min-w-[80px]">
                <div className="font-medium text-xs text-muted-foreground mb-1">
                  {forecast.day}
                </div>
                <div className="text-xl mb-1">
                  {getWeatherEmoji(forecast.condition)}
                </div>
                <div className="text-blue-400 font-semibold text-sm">
                  {convertTemp(forecast.high)}°
                </div>
                <div className="text-muted-foreground text-xs">
                  {convertTemp(forecast.low)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeWeatherWidget;
