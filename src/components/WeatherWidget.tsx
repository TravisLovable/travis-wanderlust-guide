
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeatherData } from '@/hooks/useWeatherData';

interface WeatherWidgetProps {
  destination: string;
  currentLocation?: string;
  tempUnit: 'C' | 'F';
  onTempUnitToggle: () => void;
}

const WeatherWidget = ({ destination, currentLocation = 'Current Location', tempUnit, onTempUnitToggle }: WeatherWidgetProps) => {
  const { weatherData: destinationWeather, isLoading: destinationLoading, error: destinationError } = useWeatherData(destination);
  const { weatherData: currentWeather, isLoading: currentLoading, error: currentError } = useWeatherData(currentLocation);

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

  const WeatherCard = ({ weather, location, isLoading, error }: any) => {
    if (isLoading) {
      return (
        <div className="flex-1 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-muted-foreground">{location}</span>
          </div>
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
          </div>
        </div>
      );
    }

    if (error || !weather) {
      return (
        <div className="flex-1 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-muted-foreground">{location}</span>
          </div>
          <div className="text-center text-orange-400">
            <p className="text-sm">Unable to load</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-muted-foreground">{location}</span>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {convertTemp(weather.current.temp)}°{tempUnit}
          </div>
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-lg">{getWeatherEmoji(weather.current.condition)}</span>
            <span className="text-xs text-muted-foreground">{weather.current.condition}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Humidity: {weather.current.humidity}%
          </div>
        </div>
      </div>
    );
  };

  if (destinationLoading && currentLoading) {
    return (
      <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
              <Thermometer className="w-5 h-5 text-white" />
            </div>
            Weather Intel
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
            <Thermometer className="w-5 h-5 text-white" />
          </div>
          Weather Intel
          <Button
            onClick={onTempUnitToggle}
            variant="outline"
            size="sm"
            className="ml-auto bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 text-orange-300 hover:text-orange-200 font-medium px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
          >
            °{tempUnit} ⇄ °{tempUnit === 'C' ? 'F' : 'C'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weather Comparison */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Current Weather Comparison</p>
          <div className="flex gap-4">
            <WeatherCard 
              weather={currentWeather} 
              location={currentLocation}
              isLoading={currentLoading}
              error={currentError}
            />
            <WeatherCard 
              weather={destinationWeather} 
              location={destination}
              isLoading={destinationLoading}
              error={destinationError}
            />
          </div>
        </div>
        
        {/* 7-Day Forecast for Destination */}
        {destinationWeather && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">7-Day Forecast - {destination}</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {destinationWeather.forecast.slice(0, 7).map((forecast, idx) => (
                <div key={idx} className="flex-shrink-0 text-center p-3 bg-secondary/30 rounded-lg min-w-[80px]">
                  <div className="font-medium text-xs text-muted-foreground mb-1">
                    {forecast.day}
                  </div>
                  <div className="text-xl mb-1">
                    {getWeatherEmoji(forecast.condition)}
                  </div>
                  <div className="text-orange-400 font-semibold text-sm">
                    {convertTemp(forecast.high)}°
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {convertTemp(forecast.low)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
