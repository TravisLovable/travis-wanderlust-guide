
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Thermometer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Destination } from '@/types/destination';

interface WeatherWidgetProps {
  destination: Destination;
  currentLocation?: string;
  tempUnit: 'C' | 'F';
  onTempUnitToggle: () => void;
}

const WeatherWidget = ({ destination, currentLocation = 'Current Location', tempUnit, onTempUnitToggle }: WeatherWidgetProps) => {
  const { weatherData: destinationWeather, isLoading: destinationLoading, error: destinationError } = useWeatherData(destination.displayName);
  const { weatherData: currentWeather, isLoading: currentLoading, error: currentError } = useWeatherData(currentLocation);

  const convertTemp = (temp: number) => {
    return tempUnit === 'F' ? Math.round((temp * 9 / 5) + 32) : Math.round(temp);
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
        <div className="flex-1 p-3 bg-black border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{location}</span>
          </div>
          <div className="flex justify-center items-center h-12">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        </div>
      );
    }

    if (error || !weather) {
      return (
        <div className="flex-1 p-3 bg-black border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{location}</span>
          </div>
          <div className="text-center text-muted-foreground">
            <p className="text-xs">Unable to load</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-3 bg-black border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{location}</span>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-foreground mb-1">
            {convertTemp(weather.current.temp)}°{tempUnit}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-lg">{getWeatherEmoji(weather.current.condition)}</span>
            <span className="text-xs font-medium text-muted-foreground">{weather.current.condition}</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            Humidity: {weather.current.humidity}%
          </div>
        </div>
      </div>
    );
  };

  if (destinationLoading && currentLoading) {
    return (
      <Card className="travis-card w-full col-span-full max-w-4xl mx-auto">
        <CardHeader className="p-5 pb-2">
          <div className="widget-header">
            <div className="widget-icon bg-amber-500/10 text-amber-500">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="widget-title">Weather Intel</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6 pt-0">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="travis-card w-full col-span-full max-w-4xl mx-auto">
        <CardHeader className="p-5 pb-2">
          <div className="widget-header">
            <div className="widget-icon bg-amber-500/10 text-amber-500">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="widget-title">Weather Intel</h3>
            </div>
            <Button
              onClick={onTempUnitToggle}
              variant="outline"
              size="sm"
              className="bg-secondary/60 hover:bg-secondary border-border font-semibold px-2.5 py-1 rounded-full text-xs"
            >
              °{tempUnit} ⇄ °{tempUnit === 'C' ? 'F' : 'C'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5 pt-0">
          {/* Current Weather Comparison */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Current Weather Comparison</h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <WeatherCard
                weather={currentWeather}
                location={currentLocation}
                isLoading={currentLoading}
                error={currentError}
              />
              <WeatherCard
                weather={destinationWeather}
                location={destination.displayName}
                isLoading={destinationLoading}
                error={destinationError}
              />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* 7-Day Forecast */}
          {destinationWeather && destinationWeather.forecast && destinationWeather.forecast.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">7-Day Forecast - {destination.displayName}</h3>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {destinationWeather.forecast.slice(0, 7).map((forecast, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div className="text-center p-3 bg-black border border-border rounded-xl cursor-pointer">
                        <div className="font-bold text-xs text-foreground mb-2 truncate">
                          {forecast.day}
                        </div>
                        <div className="text-xl mb-2">
                          {getWeatherEmoji(forecast.condition)}
                        </div>
                        <div className="text-foreground font-bold text-sm mb-1">
                          {convertTemp(forecast.high)}°
                        </div>
                        <div className="text-muted-foreground text-xs mb-2">
                          {convertTemp(forecast.low)}°
                        </div>
                        <div className="text-xs text-muted-foreground truncate font-medium">
                          {forecast.condition}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-semibold text-sm">{forecast.day}</p>
                        <p className="text-xs">{forecast.condition}</p>
                        <p className="text-xs">High: {convertTemp(forecast.high)}° | Low: {convertTemp(forecast.low)}°</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default WeatherWidget;
