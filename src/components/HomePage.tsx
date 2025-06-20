
import React, { useState } from 'react';
import { Search, Calendar, MapPin, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  // Mock destination suggestions
  const suggestions = [
    'Tokyo, Japan',
    'Dubai, UAE', 
    'Singapore',
    'Zurich, Switzerland',
    'Monaco',
    'Aspen, Colorado',
    'Bali, Indonesia',
    'Santorini, Greece',
    'Maldives',
    'Patagonia, Chile'
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">Travis</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Saved Destinations</DropdownMenuItem>
              <DropdownMenuItem>Travel Preferences</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-float">
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-6 tracking-tighter">
              The World
            </h1>
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-8 tracking-tighter">
              Awaits.
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
          </div>
          
          <p className="text-2xl text-muted-foreground mb-4 font-light tracking-wide">
            Explore Confidently
          </p>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            Real-time intelligence for the modern explorer
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="travis-card p-8 md:p-12 mb-16 travis-glow">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors z-10" />
                <Input
                  type="text"
                  placeholder="Where to next?"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-12 h-14 bg-secondary/50 border-border/50 focus:border-blue-400 focus:bg-secondary/80 rounded-xl text-lg transition-all duration-300"
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
              
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors z-10" />
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full pl-12 h-14 bg-secondary/50 border-border/50 focus:border-blue-400 hover:bg-secondary/80 rounded-xl text-lg justify-start font-normal"
                    >
                      {checkinDate ? format(checkinDate, 'MMM dd, yyyy') : 'Check-in'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkinDate}
                      onSelect={(date) => {
                        setCheckinDate(date);
                        setCheckinOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors z-10" />
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full pl-12 h-14 bg-secondary/50 border-border/50 focus:border-blue-400 hover:bg-secondary/80 rounded-xl text-lg justify-start font-normal"
                    >
                      {checkoutDate ? format(checkoutDate, 'MMM dd, yyyy') : 'Check-out'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkoutDate}
                      onSelect={(date) => {
                        setCheckoutDate(date);
                        setCheckoutOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date < (checkinDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">Press Enter to search</p>
          </form>

          {/* Discovery Destinations */}
          <div className="space-y-6">
            <p className="text-muted-foreground font-medium tracking-wide">DISCOVERY AWAITS</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Tokyo', 'Dubai', 'Singapore', 'Zurich', 'Monaco', 'Aspen'].map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="px-6 py-4 bg-secondary/30 border border-border/30 rounded-xl text-foreground hover:bg-secondary/60 hover:border-blue-400/50 transition-all duration-300 font-medium tracking-wide travis-interactive"
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
