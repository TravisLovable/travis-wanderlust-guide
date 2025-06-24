
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  MapPin, 
  Plane, 
  Calendar, 
  Thermometer, 
  Camera,
  Clock,
  FileText,
  Shield,
  Heart,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useHolidayData } from '@/hooks/useHolidayData';
import { useWorldClockData } from '@/hooks/useWorldClockData';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import WeatherWidget from '@/components/WeatherWidget';
import PhotoSlideshow from '@/components/PhotoSlideshow';
import TravisChatbot from '@/components/TravisChatbot';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [searchDestination, setSearchDestination] = useState(destination);
  const [searchDates, setSearchDates] = useState(dates);

  // Use hooks with dynamic destination
  const { weatherData: currentWeather } = useWeatherData('Current Location');
  const { weatherData: destinationWeather } = useWeatherData(destination);
  const { holidayData } = useHolidayData(destination, dates);
  const { worldClockData } = useWorldClockData(destination);
  const { exchangeData } = useCurrencyExchange(destination);

  const handleNewSearch = () => {
    onNewSearch(searchDestination, searchDates);
  };

  // Helper function to get pinned locations based on destination
  const getPinnedLocations = (dest: string) => {
    const destLower = dest.toLowerCase();
    
    if (destLower.includes('lima') || destLower.includes('peru')) {
      return ['Miraflores', 'San Isidro', 'Barranco', 'Cusco', 'Arequipa'];
    }
    if (destLower.includes('cape town') || destLower.includes('south africa')) {
      return ['V&A Waterfront', 'Table Mountain', 'Camps Bay', 'Stellenbosch', 'Hermanus'];
    }
    if (destLower.includes('são paulo') || destLower.includes('brazil')) {
      return ['Vila Madalena', 'Jardins', 'Liberdade', 'Centro Histórico', 'Ibirapuera'];
    }
    if (destLower.includes('paris') || destLower.includes('france')) {
      return ['Le Marais', 'Montmartre', 'Saint-Germain', 'Champs-Élysées', 'Latin Quarter'];
    }
    if (destLower.includes('tokyo') || destLower.includes('japan')) {
      return ['Shibuya', 'Shinjuku', 'Harajuku', 'Ginza', 'Asakusa'];
    }
    if (destLower.includes('london') || destLower.includes('uk')) {
      return ['Covent Garden', 'Shoreditch', 'Camden', 'Notting Hill', 'Greenwich'];
    }
    
    // Default locations
    return ['City Center', 'Historic District', 'Waterfront', 'Arts Quarter', 'Shopping District'];
  };

  const pinnedLocations = getPinnedLocations(destination);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">{destination}</h1>
              </div>
            </div>
            
            {/* Quick Search */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="New destination..."
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="w-48"
              />
              <Input
                type="date"
                value={searchDates.checkin}
                onChange={(e) => setSearchDates(prev => ({ ...prev, checkin: e.target.value }))}
                className="w-36"
              />
              <Input
                type="date"
                value={searchDates.checkout}
                onChange={(e) => setSearchDates(prev => ({ ...prev, checkout: e.target.value }))}
                className="w-36"
              />
              <Button onClick={handleNewSearch} className="bg-purple-600 hover:bg-purple-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Pinned Locations */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Popular areas in {destination}</h2>
          <div className="flex flex-wrap gap-2">
            {pinnedLocations.map((location, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-purple-100">
                {location}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WeatherWidget 
                weatherData={currentWeather} 
                title="Your Location" 
                isLoading={false}
              />
              <WeatherWidget 
                weatherData={destinationWeather} 
                title={destination} 
                isLoading={false}
              />
            </div>

            {/* Photo Slideshow */}
            {destination && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-purple-600" />
                    {destination} Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <PhotoSlideshow destination={destination} />
                </CardContent>
              </Card>
            )}

            {/* Time Zone Widget */}
            {worldClockData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Time Zones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Location</h3>
                      <div className="text-3xl font-bold text-gray-900">
                        {worldClockData.origin.time12}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {worldClockData.origin.time} ({worldClockData.origin.abbreviation})
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {worldClockData.origin.date}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">{destination}</h3>
                      <div className="text-3xl font-bold text-gray-900">
                        {worldClockData.destination.time12}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {worldClockData.destination.time} ({worldClockData.destination.abbreviation})
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {worldClockData.destination.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {worldClockData.timeDifferenceText}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Holidays Widget */}
            {holidayData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Holidays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    During your trip to {destination}:
                  </p>
                  {holidayData.allHolidays && holidayData.allHolidays.length > 0 ? (
                    <div className="space-y-3">
                      {holidayData.allHolidays.map((holiday, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-purple-50">
                          <h3 className="font-semibold text-gray-900">{holiday.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {holiday.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No major holidays during your travel dates.</p>
                  )}
                  <p className="text-xs text-gray-400 mt-4">
                    Source: Multi-year Holiday API
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Cultural Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  Cultural Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Discover local customs, traditions, and cultural highlights for {destination}. 
                  Learn about etiquette, local festivals, and unique experiences that will enhance your visit.
                </p>
                <Button variant="outline" className="mt-4">
                  Explore Culture
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Emergency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-red-600">Emergency: 911</p>
                    <p className="text-sm text-gray-600">Police, Fire, Medical</p>
                  </div>
                  <div>
                    <p className="font-semibold">US Embassy</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <p className="font-semibold">Tourist Hotline</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Airport Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Airport Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Main Airport</p>
                    <p className="text-sm text-gray-600">International flights and connections</p>
                  </div>
                  <div>
                    <p className="font-semibold">Distance to City</p>
                    <p className="text-sm text-gray-600">Approximately 30-45 minutes</p>
                  </div>
                  <div>
                    <p className="font-semibold">Transportation</p>
                    <p className="text-sm text-gray-600">Taxi, Bus, Metro available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Exchange */}
            {exchangeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Currency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {exchangeData.symbol}{exchangeData.rate}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      per 1 USD
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {exchangeData.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {exchangeData.lastUpdated}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visa Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Visa & Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">US Passport Holders</p>
                    <p className="text-sm text-gray-600">Check current requirements for {destination}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Duration</p>
                    <p className="text-sm text-gray-600">Tourist stay limits vary</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Check Requirements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Health & Safety */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Health & Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">Vaccinations</p>
                    <p className="text-sm text-gray-600">Check CDC recommendations</p>
                  </div>
                  <div>
                    <p className="font-semibold">Travel Insurance</p>
                    <p className="text-sm text-gray-600">Recommended for international travel</p>
                  </div>
                  <div>
                    <p className="font-semibold">Safety Level</p>
                    <p className="text-sm text-gray-600">Check current travel advisories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intelligence Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Intelligence Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Travel Trend</span>
                    <Badge variant="outline">Rising</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Season</span>
                    <Badge variant="outline">Current</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Price Level</span>
                    <Badge variant="outline">Moderate</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crowd Level</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Travis Chatbot */}
      <TravisChatbot destination={destination} />
    </div>
  );
};

export default ResultsPage;
