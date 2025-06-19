
import React, { useState } from 'react';
import { Search, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface HomePageProps {
  onSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pinnedDestinations, setPinnedDestinations] = useState(['Tokyo', 'Osaka', 'Kyoto']);

  // Mock destination suggestions - Japan focused
  const suggestions = [
    'Tokyo, Japan',
    'Osaka, Japan', 
    'Kyoto, Japan',
    'Nagoya, Japan',
    'Yokohama, Japan',
    'Hiroshima, Japan',
    'Sapporo, Japan',
    'Fukuoka, Japan',
    'Sendai, Japan',
    'Nara, Japan'
  ].filter(city => 
    city.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      onSearch(destination, { 
        checkin: format(checkinDate, 'yyyy-MM-dd'), 
        checkout: format(checkoutDate, 'yyyy-MM-dd') 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePinDestination = (dest: string) => {
    if (!pinnedDestinations.includes(dest)) {
      setPinnedDestinations([...pinnedDestinations, dest]);
    }
  };

  const removePinnedDestination = (dest: string) => {
    setPinnedDestinations(pinnedDestinations.filter(d => d !== dest));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Alex Chen</h3>
                  <p className="text-sm text-muted-foreground">alex.chen@email.com</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preferred Airline</span>
                  <span className="text-sm font-medium text-foreground">Delta Airlines</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Travel Type</span>
                  <span className="text-sm font-medium text-foreground">Luxury Traveler</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nationality</span>
                  <span className="text-sm font-medium text-foreground">United States</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-emerald-400">Premium Member</span>
                </div>
              </div>
              
              <DropdownMenuSeparator className="my-4" />
              
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Saved Destinations</DropdownMenuItem>
              <DropdownMenuItem>Travel Preferences</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Pinned Destinations */}
      {pinnedDestinations.length > 0 && (
        <div className="px-6 py-4 border-b border-border/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground font-medium">PINNED:</span>
              <div className="flex space-x-2">
                {pinnedDestinations.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setDestination(dest)}
                    className="group flex items-center space-x-2 px-3 py-1 bg-secondary/30 border border-border/30 rounded-full text-sm text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <span>{dest}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePinnedDestination(dest);
                      }}
                      className="w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-float">
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-4 tracking-tighter">
              The World Awaits
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-light">
              Data-driven insights for the modern explorer
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
          </div>

          {/* Google-style Search Form */}
          <form onSubmit={handleSearch} className="mb-16 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-2xl travis-glow">
              <div className="flex items-center gap-2">
                {/* Destination Input */}
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors z-10" />
                  <Input
                    type="text"
                    placeholder="Tokyo, Japan"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full"
                    required
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setDestination(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span>{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Date Inputs */}
                <div className="flex gap-1">
                  <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                      >
                        {checkinDate ? format(checkinDate, 'MMM dd') : 'Check-in'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkinDate}
                        onSelect={(date) => {
                          if (date) setCheckinDate(date);
                          setCheckinOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                      >
                        {checkoutDate ? format(checkoutDate, 'MMM dd') : 'Check-out'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkoutDate}
                        onSelect={(date) => {
                          if (date) setCheckoutDate(date);
                          setCheckoutOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < (checkinDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-r-full border-l border-border/30"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Discovery Destinations */}
          <div className="space-y-6">
            <p className="text-muted-foreground font-medium tracking-wide">DISCOVER NEW HORIZONS</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Sapporo', 'Fukuoka'].map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  onDoubleClick={() => handlePinDestination(city)}
                  className="px-6 py-4 bg-secondary/30 border border-border/30 rounded-xl text-foreground hover:bg-secondary/60 hover:border-blue-400/50 transition-all duration-300 font-medium tracking-wide travis-interactive"
                  title="Double-click to pin"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground font-light tracking-wide">
            Powered by <span className="text-foreground font-medium">Travis</span> • Your intelligent travel companion
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
