
import React, { useState } from 'react';
import { Search, Calendar, MapPin, User, Sun, Moon, Globe } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' }
  ];

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground tracking-tight">The World Awaits</div>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.name)}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-cover bg-center rounded-full" style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80)'
                  }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-cover bg-center rounded-full" style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80)'
                  }} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">Chris Upchurch</h3>
                      <span className="text-lg">🇺🇸</span>
                    </div>
                    <p className="text-sm text-muted-foreground">chris.upchurch@email.com</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preferred Airline</span>
                    <span className="text-sm font-medium text-foreground">Delta Airlines</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Travel Type</span>
                    <span className="text-sm font-medium text-foreground">Luxury</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Frequent Flyer #</span>
                    <span className="text-sm font-medium text-foreground">DL89472156</span>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-32 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-4 tracking-tighter">
              TRAVIS
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-light">
              Data-driven insights for the modern explorer
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
          </div>

          {/* Google-style Search Form */}
          <form onSubmit={handleSearch} className="mb-32 max-w-5xl mx-auto">
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
                        {checkinDate ? format(checkinDate, 'MMM dd') : 'Depart'}
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
                        {checkoutDate ? format(checkoutDate, 'MMM dd') : 'Return'}
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
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-muted-foreground font-light tracking-wide text-xs">
            Powered by <span className="text-foreground font-medium">TRAVIS</span>
          </p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Privacy</button>
            <button className="hover:text-foreground transition-colors">Terms</button>
            <button className="hover:text-foreground transition-colors">Settings</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
