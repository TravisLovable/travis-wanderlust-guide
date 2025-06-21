
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, MapPin, Droplets } from 'lucide-react';
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
        <div className="flex-1 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-orange-500/20">
              <MapPin className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-lg font-semibold text-foreground">{location}</span>
          </div>
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        </div>
      );
    }

    if (error || !weather) {
      return (
        <div className="flex-1 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-orange-500/20">
              <MapPin className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-lg font-semibold text-foreground">{location}</span>
          </div>
          <div className="text-center text-orange-400">
            <p className="text-base">Unable to load weather</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl backdrop-blur-sm hover:from-orange-500/15 hover:to-red-500/15 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-orange-500/20">
            <MapPin className="w-5 h-5 text-orange-400" />
          </div>
          <span className="text-lg font-semibold text-foreground">{location}</span>
        </div>
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-orange-400 mb-2">
            {convertTemp(weather.current.temp)}°{tempUnit}
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">{getWeatherEmoji(weather.current.condition)}</span>
            <span className="text-sm text-muted-foreground font-medium">{weather.current.condition}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Droplets className="w-4 h-4" />
            <span>Humidity: {weather.current.humidity}%</span>
          </div>
        </div>
      </div>
    );
  };

  if (destinationLoading && currentLoading) {
    return (
      <Card className="w-full max-w-7xl mx-auto travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-2xl dark:shadow-gray-500/20">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center text-2xl font-bold">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-4 shadow-lg">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            Weather Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-2xl dark:shadow-gray-500/20">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center text-2xl font-bold">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-4 shadow-lg">
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          Weather Intelligence
          <Button
            onClick={onTempUnitToggle}
            variant="outline"
            size="lg"
            className="ml-auto bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-500/60 text-orange-300 hover:text-orange-200 font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/25"
          >
            <Thermometer className="w-4 h-4 mr-2" />
            °{tempUnit} ⇄ °{tempUnit === 'C' ? 'F' : 'C'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {/* Current Weather Comparison */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-foreground">Current Weather Comparison</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-foreground">7-Day Forecast - {destination}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {destinationWeather.forecast.slice(0, 7).map((forecast, idx) => (
                <div key={idx} className="text-center p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border border-secondary/30 rounded-2xl hover:from-secondary/50 hover:to-secondary/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                    {forecast.day}
                  </div>
                  <div className="text-3xl mb-3 transform hover:scale-110 transition-transform duration-200">
                    {getWeatherEmoji(forecast.condition)}
                  </div>
                  <div className="text-orange-400 font-bold text-lg mb-1">
                    {convertTemp(forecast.high)}°
                  </div>
                  <div className="text-muted-foreground text-sm font-medium">
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
