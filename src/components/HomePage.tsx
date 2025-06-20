import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Globe, Sun, Moon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HomePageProps {
  onSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [checkinDate, setCheckinDate] = useState<Date | undefined>(undefined);
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(undefined);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const popularDestinations = [
    'Paris, France',
    'Tokyo, Japan',
    'Rome, Italy',
    'New York, USA',
    'Rio de Janeiro, Brazil',
  ];

  const handleSearch = () => {
    if (destination && checkinDate && checkoutDate) {
      onSearch(destination, {
        checkin: format(checkinDate, 'yyyy-MM-dd'),
        checkout: format(checkoutDate, 'yyyy-MM-dd'),
      });
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length > 2) {
      // Mocked suggestions
      const mockedSuggestions = [
        `${value}, France`,
        `${value}, Italy`,
        `${value}, Spain`,
      ];
      setSuggestions(mockedSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: isDarkMode 
            ? `url('https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?auto=format&fit=crop&w=1920&q=80')` // Rio at night
            : `url('https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-white">TRAVIS</h1>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === 'EN' ? 'ES' : 'EN')}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <Globe className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/10 rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png" alt="Profile" />
                  <AvatarFallback>BJ</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-card border-border shadow-lg" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Brittany J.</p>
                  <p className="text-xs leading-none premium-glow font-medium">Premium Member</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="text-xs">
                  <strong>Preferred Airline:</strong> Delta Airlines
                </div>
                <div className="text-xs">
                  <strong>Travel Type:</strong> Luxury
                </div>
                <div className="text-xs">
                  <strong>Frequent Flyer #:</strong> DL89472156
                </div>
                <div className="text-xs">
                  <strong>Country:</strong> United States
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h1 className={`text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white ${isDarkMode ? 'premium-glow' : ''}`}>
              The World Awaits
            </h1>
            <p className={`text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'premium-glow' : ''}`}>
              Data-driven intelligence for the modern explorer
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 shadow-lg travis-glow max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Where would you like to go?"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => destination.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="h-14 bg-transparent border-0 text-white placeholder:text-white/70 text-lg px-6 rounded-l-full no-focus-outline"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setDestination(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 suggestion-hover transition-colors text-sm border-b border-border/20 last:border-b-0"
                      >
                        <span>{suggestion}</span>
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
                      className="h-14 px-4 bg-transparent hover:bg-white/5 rounded-none text-white/90 text-base justify-start font-normal border-l border-white/20"
                    >
                      {checkinDate ? format(checkinDate, 'MMM dd') : 'Depart'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={checkinDate}
                      onSelect={(date) => {
                        setCheckinDate(date);
                        setCheckinOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-14 px-4 bg-transparent hover:bg-white/5 rounded-none text-white/90 text-base justify-start font-normal border-l border-white/20"
                    >
                      {checkoutDate ? format(checkoutDate, 'MMM dd') : 'Return'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={checkoutDate}
                      onSelect={(date) => {
                        setCheckoutDate(date);
                        setCheckoutOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleSearch}
                className="h-14 px-4 bg-white/10 backdrop-blur-sm text-white rounded-r-full border-l border-white/20 search-btn-hover"
              >
                <Search className="w-6 h-6 search-icon-glow" />
              </Button>
            </div>
          </div>

          {/* Quick Destinations */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {popularDestinations.map((dest) => (
              <Button
                key={dest}
                variant="secondary"
                className="bg-white/5 text-white hover:bg-white/10 travis-interactive"
                onClick={() => {
                  setDestination(dest);
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                {dest}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
