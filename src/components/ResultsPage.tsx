
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plane, Car, Train, Bus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TravisChatbot from '@/components/TravisChatbot';
import WeatherWidget from '@/components/WeatherWidget';
import AccommodationHeatMap from '@/components/AccommodationHeatMap';
import { format } from 'date-fns';

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
  const [newDestination, setNewDestination] = useState('');
  const [newCheckin, setNewCheckin] = useState('');
  const [newCheckout, setNewCheckout] = useState('');

  useEffect(() => {
    setNewDestination(destination);
    setNewCheckin(dates.checkin);
    setNewCheckout(dates.checkout);
  }, [destination, dates]);

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDestination && newCheckin && newCheckout) {
      onNewSearch(newDestination, { checkin: newCheckin, checkout: newCheckout }, true);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const transportOptions = [
    { icon: Plane, name: 'Flight', price: '$450', duration: '3h 45m', type: 'Fastest' },
    { icon: Car, name: 'Car Rental', price: '$89/day', duration: '6h 30m', type: 'Flexible' },
    { icon: Train, name: 'Train', price: '$125', duration: '8h 15m', type: 'Scenic' },
    { icon: Bus, name: 'Bus', price: '$45', duration: '12h 30m', type: 'Budget' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Travel Results</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Search Results for</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{destination}</h2>
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(dates.checkin)} - {formatDate(dates.checkout)}</span>
            </div>
          </div>
        </div>

        {/* New Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Modify Your Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNewSearch} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <Input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="Where to?"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </label>
                <Input
                  type="date"
                  value={newCheckin}
                  onChange={(e) => setNewCheckin(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </label>
                <Input
                  type="date"
                  value={newCheckout}
                  onChange={(e) => setNewCheckout(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Search
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weather Widget */}
            <WeatherWidget destination={destination} />

            {/* Transportation Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Transportation Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transportOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{option.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{option.duration}</span>
                              <Badge variant="secondary" className="text-xs">
                                {option.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{option.price}</div>
                          <Button size="sm" className="mt-1">
                            Select
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Accommodation Heat Map */}
            <AccommodationHeatMap destination={destination} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TravisChatbot destination={destination} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
