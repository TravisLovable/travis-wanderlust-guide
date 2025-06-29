import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Wifi, Car, Utensils, Dumbbell, Waves, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import PhotoSlideshow from './PhotoSlideshow';
import UserProfileDropdown from './UserProfileDropdown';
import { User, Session } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  // Authentication state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchWorldClock = async (destination: string) => {
    try {
      const response = await fetch(`https://sioicdmsphfigulrufim.supabase.co/functions/v1/get-world-clock?destination=${encodeURIComponent(destination)}`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2ljZG1zcGhmaWd1bHJ1ZmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjA3ODcsImV4cCI6MjA2NjAzNjc4N30.jeiXaHM_wjCOs29jfePSKYTJXouR17BsTBfC-Oym8uk`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch world clock data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching world clock:', error);
      return null;
    }
  };

  const fetchHolidays = async (destination: string) => {
    try {
      const response = await fetch(`https://sioicdmsphfigulrufim.supabase.co/functions/v1/get-holidays?destination=${encodeURIComponent(destination)}`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2ljZG1zcGhmaWd1bHJ1ZmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjA3ODcsImV4cCI6MjA2NjAzNjc4N30.jeiXaHM_wjCOs29jfePSKYTJXouR17BsTBfC-Oym8uk`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch holidays data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return null;
    }
  };

  const { data: worldClockData } = useQuery({
    queryKey: ['worldClock', destination],
    queryFn: () => fetchWorldClock(destination),
    enabled: !!destination,
  });

  const { data: holidaysData } = useQuery({
    queryKey: ['holidays', destination],
    queryFn: () => fetchHolidays(destination),
    enabled: !!destination,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const accommodations = [
    {
      id: 1,
      name: "Luxury Oceanview Resort",
      image: "/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png",
      price: "$299",
      rating: 4.8,
      reviews: 1245,
      amenities: ["Wifi", "Pool", "Spa", "Restaurant", "Gym"],
      location: "Beachfront District"
    },
    {
      id: 2,
      name: "Historic Downtown Hotel",
      image: "/lovable-uploads/522158cc-d3f5-459c-9d11-8cdd6e223c43.png",
      price: "$189",
      rating: 4.6,
      reviews: 892,
      amenities: ["Wifi", "Restaurant", "Bar", "Parking"],
      location: "City Center"
    },
    {
      id: 3,
      name: "Cozy Mountain Lodge",
      image: "/lovable-uploads/f5b79e39-5a50-4bbe-967b-6217be330912.png",
      price: "$159",
      rating: 4.7,
      reviews: 634,
      amenities: ["Wifi", "Fireplace", "Hiking", "Restaurant"],
      location: "Mountain View"
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'parking': case 'car': return <Car className="h-4 w-4" />;
      case 'restaurant': case 'bar': return <Utensils className="h-4 w-4" />;
      case 'gym': return <Dumbbell className="h-4 w-4" />;
      case 'pool': case 'spa': return <Waves className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">{destination}</h1>
              </div>
            </div>
            
            {/* Profile Dropdown - only show if user is signed in */}
            {user && (
              <div className="flex items-center">
                <UserProfileDropdown user={user} userProfile={userProfile} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Trip Details */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{formatDate(dates.checkin)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{formatDate(dates.checkout)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium">2 Adults</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => onNewSearch(destination, dates, true)}
                  variant="outline"
                >
                  Modify Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photo Slideshow */}
        <div className="mb-8">
          <PhotoSlideshow destination={destination} />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Weather Widget */}
          <div>
            <WeatherWidget destination={destination} />
          </div>
          
          {/* Time & Holidays Widget */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Local Information</h3>
                
                {/* Local Time */}
                {worldClockData && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Current Time</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {worldClockData.time}
                    </p>
                    <p className="text-sm text-gray-500">
                      {worldClockData.timezone} ({worldClockData.date})
                    </p>
                  </div>
                )}

                {/* Holidays */}
                {holidaysData && holidaysData.holidays && holidaysData.holidays.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Upcoming Holidays</h4>
                    <div className="space-y-2">
                      {holidaysData.holidays.slice(0, 3).map((holiday: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{holiday.name}</span>
                          <span className="text-sm text-gray-500">{holiday.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Accommodation Heat Map */}
          <div>
            <AccommodationHeatMap destination={destination} />
          </div>
        </div>

        {/* Accommodations Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Accommodations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodations.map((accommodation) => (
              <Card key={accommodation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={accommodation.image}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg shadow-md">
                    <span className="text-lg font-bold text-green-600">{accommodation.price}</span>
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{accommodation.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{accommodation.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{accommodation.location}</p>
                  <p className="text-xs text-gray-400 mb-3">{accommodation.reviews} reviews</p>
                  <div className="flex flex-wrap gap-2">
                    {accommodation.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs flex items-center space-x-1">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
