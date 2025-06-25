import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, Sun, Moon, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import SaoPauloAccommodationMap from './SaoPauloAccommodationMap';
import TravisChatbot from './TravisChatbot';
import { useMapboxGeocoding, SelectedPlace } from '@/hooks/useMapboxGeocoding';

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
  const [searchDestination, setSearchDestination] = useState(destination);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [searchDates, setSearchDates] = useState(dates);
  const [checkinDate, setCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Use Mapbox for destination suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions, hasApiAccess, getPlaceDetails } = useMapboxGeocoding(
    searchDestination,
    showSuggestions && searchDestination.length >= 2
  );

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

  const translations = {
    en: {
      searchPlaceholder: "Where to?",
      depart: "Depart",
      return: "Return",
      search: "Search",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Preferred Airline",
      travelType: "Travel Type",
      frequentFlyer: "Frequent Flyer #",
      nationality: "Nationality",
      status: "Status",
      profileSettings: "Profile Settings",
      savedDestinations: "Saved Destinations",
      travelPreferences: "Travel Preferences",
      signOut: "Sign Out",
      privacy: "Privacy",
      terms: "Terms",
      settings: "Settings"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

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

  // Use Mapbox suggestions if available, otherwise fall back to static list
  const staticSuggestions = globalDestinations.filter(city => 
    city.toLowerCase().includes(searchDestination.toLowerCase()) && searchDestination.length > 0
  );

  const suggestions = hasApiAccess && mapboxSuggestions.length > 0 ? mapboxSuggestions : [];
  const fallbackSuggestions = !hasApiAccess || mapboxSuggestions.length === 0 ? staticSuggestions : [];

  const handleSearch = () => {
    const formattedDates = {
      checkin: format(checkinDate, 'yyyy-MM-dd'),
      checkout: format(checkoutDate, 'yyyy-MM-dd')
    };
    onNewSearch(searchDestination, formattedDates, true);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleDestinationSelect = async (suggestion: any) => {
    // Handle both Mapbox suggestions and static suggestions
    if (suggestion.id && suggestion.place_name) {
      // Mapbox suggestion
      const placeDetails = await getPlaceDetails(suggestion);
      if (placeDetails) {
        setSearchDestination(placeDetails.formatted_address);
        setSelectedPlace(placeDetails);
        console.log('Selected place details:', placeDetails);
      } else {
        setSearchDestination(suggestion.place_name);
        setSelectedPlace(null);
      }
    } else {
      // Static suggestion fallback
      setSearchDestination(suggestion);
      setSelectedPlace(null);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <header className="px-6 py-4 border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-2xl font-bold text-foreground tracking-tight">TRAVIS</div>
          </div>

          {/* Compact Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="bg-white/5 backdrop-blur-sm border border-border/30 rounded-full p-1 shadow-lg">
              <div className="flex items-center gap-1">
                {/* Destination Input */}
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchDestination}
                    onChange={(e) => {
                      setSearchDestination(e.target.value);
                      setSelectedPlace(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-4 h-10 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm placeholder:text-muted-foreground/60 rounded-l-full"
                  />
                  {showSuggestions && (suggestions.length > 0 || fallbackSuggestions.length > 0) && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                      {!hasApiAccess && searchDestination.length >= 2 && (
                        <div className="p-2 text-xs text-yellow-500 bg-yellow-500/10 rounded-t-xl border-b border-border/30">
                          ⚠️ Using offline search. Connect Mapbox API for better results.
                        </div>
                      )}
                      {isLoadingSuggestions && hasApiAccess && (
                        <div className="p-4 text-center text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                        </div>
                      )}
                      {/* Mapbox suggestions */}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`mapbox-${index}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDestinationSelect(suggestion);
                          }}
                          className="w-full text-left px-4 py-3 suggestion-hover transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {suggestion.text}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {suggestion.place_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {/* Fallback static suggestions */}
                      {fallbackSuggestions.slice(0, 8).map((suggestion, index) => (
                        <button
                          key={`static-${index}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDestinationSelect(suggestion);
                          }}
                          className="w-full text-left px-4 py-3 suggestion-hover transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {suggestion}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Inputs */}
                <div className="flex">
                  <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-10 px-3 text-xs font-normal rounded-none border-l border-border/30",
                          !checkinDate && "text-muted-foreground"
                        )}
                      >
                        {checkinDate ? format(checkinDate, 'MMM dd') : 'Depart'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkinDate}
                        onSelect={(date) => {
                          if (date) setCheckinDate(date);
                          setCheckinOpen(false);
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-10 px-3 text-xs font-normal rounded-none border-l border-border/30",
                          !checkoutDate && "text-muted-foreground"
                        )}
                      >
                        {checkoutDate ? format(checkoutDate, 'MMM dd') : 'Return'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkoutDate}
                        onSelect={(date) => {
                          if (date) setCheckoutDate(date);
                          setCheckoutOpen(false);
                        }}
                        initialFocus
                        disabled={(date) => date < (checkinDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="h-10 px-4 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-5 h-5" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
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
              {isDarkMode ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
            </Button>
            
            {/* Auth placeholder container */}
            <div className="auth-placeholder">
              {/* TODO: Replace with authentication-aware component */}
              {/* If logged in: show profile dropdown */}
              {/* If not logged in: show "Sign In / Create Account" button */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weather Widget */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
              <WeatherWidget destination={destination} />
            </div>

            {/* Accommodation Map */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Accommodation Insights</h2>
              {destination.toLowerCase().includes('são paulo') || destination.toLowerCase().includes('sao paulo') ? (
                <SaoPauloAccommodationMap />
              ) : (
                <AccommodationHeatMap destination={destination} />
              )}
            </div>
          </div>

          {/* Right Column - Chatbot */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TravisChatbot destination={destination} dates={dates} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
