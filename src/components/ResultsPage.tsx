
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherWidget from '@/components/WeatherWidget';
import AccommodationHeatMap from '@/components/AccommodationHeatMap';
import PhotoSlideshow from '@/components/PhotoSlideshow';
import { Input } from '@/components/ui/input';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}

interface Holiday {
  name: string;
  date: string;
  type?: string;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [holidaysError, setHolidaysError] = useState<string | null>(null);
  const [accommodationData, setAccommodationData] = useState<any>(null);
  const [accommodationLoading, setAccommodationLoading] = useState(true);
  const [accommodationError, setAccommodationError] = useState<string | null>(null);
  const [newDestination, setNewDestination] = useState(destination);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const response = await fetch(`/api/weather?destination=${destination}`);
        if (!response.ok) {
          throw new Error('Unable to fetch weather data');
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (error: any) {
        setWeatherError(error.message);
      } finally {
        setWeatherLoading(false);
      }
    };

    const fetchHolidays = async () => {
      setHolidaysLoading(true);
      setHolidaysError(null);
      try {
        const response = await fetch(`/api/holidays?destination=${destination}&year=${new Date(dates.checkin).getFullYear()}`);
        if (!response.ok) {
          throw new Error('Unable to fetch holidays');
        }
        const data = await response.json();
        setHolidays(data);
      } catch (error: any) {
        setHolidaysError(error.message);
      } finally {
        setHolidaysLoading(false);
      }
    };

    const fetchAccommodationData = async () => {
      setAccommodationLoading(true);
      setAccommodationError(null);
      try {
        const response = await fetch(`/api/accommodation?destination=${destination}`);
        if (!response.ok) {
          throw new Error('Unable to fetch accommodation data');
        }
        const data = await response.json();
        setAccommodationData(data);
      } catch (error: any) {
        setAccommodationError(error.message);
      } finally {
        setAccommodationLoading(false);
      }
    };

    fetchWeatherData();
    fetchHolidays();
    fetchAccommodationData();
  }, [destination, dates.checkin]);

  const handleNewSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    onNewSearch(newDestination, dates, true);
    setIsSearchBarVisible(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">{destination}</h1>
          <div></div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search Bar */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-start pl-10"
              onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
            >
              Edit Search
            </Button>

            {isSearchBarVisible && (
              <div className="absolute top-0 left-0 w-full mt-12">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="New destination"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleNewSearch}>Search</Button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Weather & Holidays */}
            <div className="space-y-6">
              {/* Weather Widget */}
              <WeatherWidget destination={destination} />

              {/* Holiday Calendar */}
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Holiday Calendar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {holidaysLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading holidays...</p>
                    </div>
                  ) : holidaysError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-500">Unable to load holidays</p>
                    </div>
                  ) : holidays && holidays.length > 0 ? (
                    <div className={`grid gap-3 ${holidays.length > 6 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                      {holidays.map((holiday, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {holiday.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(holiday.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              {holiday.type && (
                                <p className="text-xs text-blue-600 mt-1 capitalize">
                                  {holiday.type.replace('_', ' ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No holidays found for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Accommodation Heat Map */}
            <AccommodationHeatMap />

            {/* Right Column - Placeholder for future components */}
            <div className="space-y-6">
              {/* Currency Converter - Commented out until component is available */}
              {/* <CurrencyConverter /> */}
              
              {/* Chat Widget - Commented out until component is available */}
              {/* <ChatWidget /> */}
              
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle>Additional Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Currency converter and chat features will be available soon.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Photo Slideshow */}
          <PhotoSlideshow destination={destination} />
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
