
import React, { useState } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HomePageProps {
  onSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      onSearch(destination, { checkin: checkinDate, checkout: checkoutDate });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">Travis</div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Explore</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Guides</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Help</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4">
            The World
          </h1>
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-8">
            Awaits.
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto">
            Discover everything you need to know about your destination before you go.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 rounded-lg"
                  required
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 rounded-lg"
                  required
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 rounded-lg"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore Destination
            </Button>
          </form>

          {/* Popular Destinations */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">Popular destinations</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Tokyo', 'Paris', 'New York', 'London', 'Dubai', 'Barcelona'].map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 Travis. Your intelligent travel companion.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
