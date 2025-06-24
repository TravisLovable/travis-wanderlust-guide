
import React, { useState } from 'react';
import { ArrowLeft, Search, Calendar, MapPin, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TravisChatbot from '@/components/TravisChatbot';
import WeatherWidget from '@/components/WeatherWidget';
import SaoPauloAccommodationMap from '@/components/SaoPauloAccommodationMap';

// Import all widget components
import TimeZoneWidget from '@/components/TimeZoneWidget';
import CurrencyWidget from '@/components/CurrencyExchangeWidget';
import AirportWidget from '@/components/AirportWidget';
import VisaEntryWidget from '@/components/VisaEntryWidget';
import EmergencyWidget from '@/components/EmergencyWidget';
import LocalEventsWidget from '@/components/LocalEventsWidget';
import PhotoSlideshow from '@/components/PhotoSlideshow';

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
  const [searchValue, setSearchValue] = useState(destination);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  // Parse destination to get city and country
  const parseDestination = (dest: string) => {
    const parts = dest.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0],
        country: parts[parts.length - 1]
      };
    }
    return {
      city: dest,
      country: dest
    };
  };

  const { city, country } = parseDestination(destination);

  // Get country code for flag (simplified mapping)
  const getCountryCode = (countryName: string) => {
    const countryMap: { [key: string]: string } = {
      'Brazil': 'BR',
      'United States': 'US',
      'USA': 'US',
      'United Kingdom': 'GB',
      'UK': 'GB',
      'France': 'FR',
      'Germany': 'DE',
      'Italy': 'IT',
      'Spain': 'ES',
      'Japan': 'JP',
      'Australia': 'AU',
      'Canada': 'CA',
      'Mexico': 'MX',
      'Argentina': 'AR',
      'Chile': 'CL',
      'Peru': 'PE',
      'Colombia': 'CO',
      'Ecuador': 'EC',
      'Uruguay': 'UY',
      'Paraguay': 'PY',
      'Bolivia': 'BO',
      'Venezuela': 'VE',
      'Guyana': 'GY',
      'Suriname': 'SR',
      'French Guiana': 'GF',
      'South Africa': 'ZA',
      'India': 'IN',
      'China': 'CN',
      'Thailand': 'TH',
      'Singapore': 'SG',
      'Malaysia': 'MY',
      'Indonesia': 'ID',
      'Philippines': 'PH',
      'Vietnam': 'VN',
      'South Korea': 'KR',
      'Taiwan': 'TW',
      'Hong Kong': 'HK'
    };
    
    // Try exact match first
    if (countryMap[countryName]) {
      return countryMap[countryName];
    }
    
    // Try partial match
    for (const [name, code] of Object.entries(countryMap)) {
      if (countryName.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(countryName.toLowerCase())) {
        return code;
      }
    }
    
    return 'US'; // Default fallback
  };

  const countryCode = getCountryCode(country);

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSearch = () => {
    if (searchValue.trim() && searchValue !== destination) {
      onNewSearch(searchValue.trim(), dates, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Generate contextual suggestions based on current destination
  const getContextualSuggestions = () => {
    const suggestions = [];
    
    // Add regional suggestions based on current destination
    if (destination.toLowerCase().includes('brazil') || destination.toLowerCase().includes('são paulo')) {
      suggestions.push('Rio de Janeiro, Brazil', 'Salvador, Brazil', 'Brasília, Brazil');
    } else if (destination.toLowerCase().includes('south africa')) {
      suggestions.push('Cape Town, South Africa', 'Durban, South Africa', 'Port Elizabeth, South Africa');
    } else if (destination.toLowerCase().includes('united states') || destination.toLowerCase().includes('usa')) {
      suggestions.push('New York, USA', 'Los Angeles, USA', 'Chicago, USA');
    } else {
      // Default international suggestions
      suggestions.push('Paris, France', 'Tokyo, Japan', 'London, UK');
    }
    
    return suggestions;
  };

  const pinnedSuggestions = getContextualSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Destination Info */}
            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="flex items-center space-x-2">
                <img 
                  src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                  alt={`${country} flag`}
                  className="w-6 h-4 rounded-sm shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <Flag className="w-4 h-4 text-blue-300" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white">{city}</h1>
                <p className="text-blue-200 text-sm">{country}</p>
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2 text-white bg-white/10 px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium">
                {formatDate(dates.checkin)} - {formatDate(dates.checkout)}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search new destination..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300 focus:bg-white/20"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Search
            </Button>
          </div>

          {/* Pinned Suggestions */}
          <div className="mt-3 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">Quick suggestions:</span>
            <div className="flex space-x-2">
              {pinnedSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchValue(suggestion);
                    onNewSearch(suggestion, dates, true);
                  }}
                  className="text-xs text-blue-200 hover:text-white hover:bg-blue-600/50 px-3 py-1 h-auto rounded-full"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Row Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <TimeZoneWidget destination={destination} />
          <CurrencyWidget destination={destination} />
          <AirportWidget destination={destination} />
          <VisaEntryWidget destination={destination} />
        </div>

        {/* Weather Widget - Full Width */}
        <div className="mb-6">
          <WeatherWidget
            destination={destination}
            tempUnit={tempUnit}
            onTempUnitToggle={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
          />
        </div>

        {/* Photo Slideshow */}
        <div className="mb-6">
          <PhotoSlideshow destination={destination} />
        </div>

        {/* Middle Row Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EmergencyWidget destination={destination} />
          <LocalEventsWidget destination={destination} dates={dates} />
        </div>

        {/* Accommodation Map */}
        <div className="mb-6">
          <SaoPauloAccommodationMap />
        </div>
      </div>

      {/* Travis Chatbot */}
      <TravisChatbot />
    </div>
  );
};

export default ResultsPage;
