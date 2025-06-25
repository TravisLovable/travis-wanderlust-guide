import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Search, Users, Star, Globe, TrendingUp, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useAuth } from '@/hooks/useAuth';
import TravisChatbot from '@/components/TravisChatbot';
import WeatherWidget from '@/components/WeatherWidget';
import AccommodationHeatMap from '@/components/AccommodationHeatMap';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [weatherData, setWeatherData] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const { user, userProfile, signOut } = useAuth();

  useEffect(() => {
    const fetchWeatherData = async () => {
      const data = await useWeatherData(destination);
      setWeatherData(data);
    };

    const fetchExchangeRate = async () => {
      const rate = await useCurrencyExchange('USD', 'EUR');
      setExchangeRate(rate);
    };

    fetchWeatherData();
    fetchExchangeRate();
  }, [destination]);

  const handleNewSearch = (newDestination: string, newDates: { checkin: string; checkout: string }) => {
    onNewSearch(newDestination, newDates, true); // Skip transition
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Travel Results
            </h1>
            
            <div className="flex items-center space-x-4">
              {user && userProfile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {userProfile.full_name || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userProfile.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In / Create Account
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white dark:bg-gray-800 shadow">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Destination Input */}
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Destination
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="destination"
                    defaultValue={destination}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>

              {/* Date Range Picker */}
              <div>
                <label htmlFor="dates" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dates
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="dates"
                    value={`${format(parseISO(dates.checkin), 'MM/dd/yyyy')} - ${format(parseISO(dates.checkout), 'MM/dd/yyyy')}`}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    const newDestination = (document.getElementById('destination') as HTMLInputElement).value;
                    const newDates = {
                      checkin: dates.checkin,
                      checkout: dates.checkout
                    };
                    handleNewSearch(newDestination, newDates);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Update Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="md:col-span-2">
            <Card className="bg-white dark:bg-gray-800 shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                  Accommodation Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AccommodationHeatMap destination={destination} />
              </CardContent>
            </Card>
          </div>

          {/* Weather and Currency Section */}
          <div>
            <Card className="bg-white dark:bg-gray-800 shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                  Destination Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weatherData && (
                  <WeatherWidget weatherData={weatherData} />
                )}
                {exchangeRate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Currency Exchange Rate (USD to EUR)
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {exchangeRate}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white dark:bg-gray-800 shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Need Assistance?
              </h2>
              <Button onClick={() => setShowChatbot(!showChatbot)}>
                {showChatbot ? 'Hide Chatbot' : 'Show Chatbot'}
              </Button>
            </div>
            {showChatbot && <TravisChatbot />}
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-8">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ResultsPage;
