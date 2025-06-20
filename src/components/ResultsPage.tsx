import React, { useState } from 'react';
import { Search, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [searchQuery, setSearchQuery] = useState(destination);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Comprehensive global destination suggestions
  const globalDestinations = [
    // Brazil
    'São Paulo, Brazil',
    'Rio de Janeiro, Brazil',
    'Brasília, Brazil',
    'Salvador, Brazil',
    'Fortaleza, Brazil',
    'Belo Horizonte, Brazil',
    'Manaus, Brazil',
    'Curitiba, Brazil',
    'Recife, Brazil',
    'Porto Alegre, Brazil',
    // Major Global Cities
    'New York, USA',
    'Los Angeles, USA',
    'Chicago, USA',
    'Miami, USA',
    'Las Vegas, USA',
    'San Francisco, USA',
    'London, UK',
    'Paris, France',
    'Rome, Italy',
    'Barcelona, Spain',
    'Madrid, Spain',
    'Berlin, Germany',
    'Munich, Germany',
    'Amsterdam, Netherlands',
    'Vienna, Austria',
    'Zurich, Switzerland',
    'Tokyo, Japan',
    'Osaka, Japan',
    'Kyoto, Japan',
    'Seoul, South Korea',
    'Beijing, China',
    'Shanghai, China',
    'Hong Kong',
    'Singapore',
    'Bangkok, Thailand',
    'Dubai, UAE',
    'Istanbul, Turkey',
    'Cairo, Egypt',
    'Cape Town, South Africa',
    'Johannesburg, South Africa',
    'Sydney, Australia',
    'Melbourne, Australia',
    'Auckland, New Zealand',
    'Vancouver, Canada',
    'Toronto, Canada',
    'Montreal, Canada',
    'Mexico City, Mexico',
    'Buenos Aires, Argentina',
    'Lima, Peru',
    'Santiago, Chile',
    'Bogotá, Colombia',
    'Caracas, Venezuela',
    'Mumbai, India',
    'Delhi, India',
    'Bangalore, India',
    'Jakarta, Indonesia',
    'Manila, Philippines',
    'Kuala Lumpur, Malaysia',
    'Ho Chi Minh City, Vietnam',
    'Hanoi, Vietnam',
    'Tel Aviv, Israel',
    'Moscow, Russia',
    'St. Petersburg, Russia',
    'Warsaw, Poland',
    'Prague, Czech Republic',
    'Budapest, Hungary',
    'Athens, Greece',
    'Lisbon, Portugal',
    'Stockholm, Sweden',
    'Oslo, Norway',
    'Copenhagen, Denmark',
    'Helsinki, Finland',
    'Reykjavik, Iceland'
  ];

   const suggestions = globalDestinations.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleNewSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery) {
      onNewSearch(searchQuery, dates);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">TRAVIS</div>
            
            {/* Search Bar with auto-suggestions */}
            <div className="relative">
              <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search destinations..."
                  className="bg-transparent outline-none text-sm w-64"
                />
                <button 
                  onClick={handleNewSearch}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              
              {/* Auto-suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                        onNewSearch(suggestion, dates);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <span className="text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-cover bg-center rounded-full object-cover" style={{
                    backgroundImage: 'url(/lovable-uploads/57f6a72e-9b61-46d9-815f-aa82e892afeb.png)',
                    backgroundPosition: 'center center'
                  }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-cover bg-center rounded-full object-cover" style={{
                    backgroundImage: 'url(/lovable-uploads/57f6a72e-9b61-46d9-815f-aa82e892afeb.png)',
                    backgroundPosition: 'center center'
                  }} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">Brittany J.</h3>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preferred Airline</span>
                    <span className="text-sm font-medium text-gray-900">Delta Airlines</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Travel Type</span>
                    <span className="text-sm font-medium text-gray-900">Luxury</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Frequent Flyer #</span>
                    <span className="text-sm font-medium text-gray-900">DL89472156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Passport</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">United States</span>
                      <span className="text-lg">🇺🇸</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-emerald-600">Premium Member</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900">Profile Settings</button>
                    <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900">Saved Destinations</button>
                    <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900">Travel Preferences</button>
                    <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900">Sign Out</button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button onClick={onBack} variant="outline" className="bg-white/80 hover:bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.22.53l-4 4a.75.75 0 01-1.06-1.06l3.22-3.22H5.75a.75.75 0 010-1.5h7.19L9.72 6.53a.75.75 0 011.06-1.06l4 4a.75.75 0 01.22.53z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Button>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">
          Results for {destination}
        </h1>

        {/* Placeholder for results */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <p className="text-gray-600">
              No results found. Please try a different search.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p className="text-sm">
            &copy; 2023 Travis. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResultsPage;
