import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Search, Plane, Users, Globe, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { useAuth } from '@/hooks/useAuth';
import OnboardingModal from '@/components/OnboardingModal';

interface HomePageProps {
  onSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const destinationRef = useRef<HTMLInputElement>(null);
  const { user, userProfile, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { suggestions, isLoading: isLoadingSuggestions } = useMapboxGeocoding(destination);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    setCheckinDate(tomorrow.toISOString().split('T')[0]);
    setCheckoutDate(dayAfter.toISOString().split('T')[0]);
  }, []);

  // Check if onboarding is needed
  useEffect(() => {
    if (user && user.email_confirmed_at && userProfile && !userProfile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [user, userProfile]);

  const handleSearch = () => {
    if (destination && checkinDate && checkoutDate) {
      onSearch(destination, { checkin: checkinDate, checkout: checkoutDate });
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setDestination(suggestion.place_name);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularDestinations = [
    { name: 'Paris, France', image: '🇫🇷', description: 'City of Light' },
    { name: 'Tokyo, Japan', image: '🇯🇵', description: 'Modern meets traditional' },
    { name: 'New York, USA', image: '🇺🇸', description: 'The Big Apple' },
    { name: 'London, UK', image: '🇬🇧', description: 'Historic charm' },
    { name: 'Bali, Indonesia', image: '🇮🇩', description: 'Tropical paradise' },
    { name: 'Dubai, UAE', image: '🇦🇪', description: 'Luxury destination' }
  ];

  const features = [
    {
      icon: <Plane className="w-8 h-8 text-blue-500" />,
      title: 'Smart Flight Search',
      description: 'AI-powered flight recommendations tailored to your preferences'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Personalized Experience',
      description: 'Customized travel suggestions based on your travel style'
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-500" />,
      title: 'Global Coverage',
      description: 'Access to destinations and accommodations worldwide'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'Premium Quality',
      description: 'Curated selection of top-rated hotels and experiences'
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Discover Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Adventure
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                AI-powered travel planning that understands your style. Find flights, hotels, and experiences tailored just for you.
              </p>

              {/* Search Form */}
              <div className="max-w-4xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Destination Input */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-white mb-2">
                          <MapPin className="inline w-4 h-4 mr-1" />
                          Where to?
                        </label>
                        <div className="relative">
                          <Input
                            ref={destinationRef}
                            type="text"
                            placeholder="Enter destination"
                            value={destination}
                            onChange={(e) => {
                              setDestination(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onKeyPress={handleKeyPress}
                            onFocus={() => setShowSuggestions(true)}
                            className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:bg-white/30"
                          />
                          
                          {/* Suggestions Dropdown */}
                          {showSuggestions && destination && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                              {suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{suggestion.text}</div>
                                  <div className="text-sm text-gray-600">{suggestion.place_name}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Check-in Date */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Check-in
                        </label>
                        <Input
                          type="date"
                          value={checkinDate}
                          onChange={(e) => setCheckinDate(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="bg-white/20 border-white/30 text-white focus:bg-white/30"
                        />
                      </div>

                      {/* Check-out Date */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Check-out
                        </label>
                        <Input
                          type="date"
                          value={checkoutDate}
                          onChange={(e) => setCheckoutDate(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="bg-white/20 border-white/30 text-white focus:bg-white/30"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSearch}
                      disabled={!destination || !checkinDate || !checkoutDate}
                      className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Trips
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Popular Destinations</h2>
            <p className="text-gray-300 text-lg">Discover trending places around the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((dest, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                onClick={() => setDestination(dest.name)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{dest.image}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{dest.name}</h3>
                  <p className="text-gray-300">{dest.description}</p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-5 h-5 text-blue-400 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Platform</h2>
            <p className="text-gray-300 text-lg">Experience the future of travel planning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border-white/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who trust our AI-powered platform to create unforgettable experiences.
              </p>
              <Button
                onClick={() => destinationRef.current?.focus()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg"
              >
                Start Planning Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
};

export default HomePage;
