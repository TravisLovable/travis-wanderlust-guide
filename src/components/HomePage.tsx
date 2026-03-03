import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Calendar, MapPin, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useGooglePlaces, SelectedPlace } from '@/hooks/useGooglePlaces';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PrivacyModal from './PrivacyModal';
import { todayLocal } from '@/lib/dates';
import TermsModal from './TermsModal';
import SettingsModal from './SettingsModal';

interface HomePageProps {
  onSearch: (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

// Surprise Me destinations with compelling insights and hero images
const surpriseDestinations = [
  {
    name: 'Paris, France',
    insight: 'The City of Light has 37 bridges crossing the Seine, each with its own romantic story spanning centuries of history.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Tokyo, Japan',
    insight: 'Where ancient temples stand beside neon-lit streets, and 13 million people navigate the world\'s most punctual transit system.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Barcelona, Spain',
    insight: 'Gaudí\'s Sagrada Família has been under construction for over 140 years—longer than the Egyptian pyramids took to build.',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Bali, Indonesia',
    insight: 'The Island of the Gods is home to over 10,000 temples and celebrates more religious ceremonies than anywhere else on Earth.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Reykjavik, Iceland',
    insight: 'The northernmost capital city, where summer brings 24 hours of daylight and winter offers nature\'s greatest light show.',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Cusco, Peru',
    insight: 'The ancient Incan capital sits at 11,152 feet elevation, serving as the gateway to Machu Picchu and the Sacred Valley.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Marrakech, Morocco',
    insight: 'The Red City\'s medina has remained virtually unchanged for 1,000 years, with over 600 riads hidden behind unassuming doors.',
    image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&h=800&fit=crop&q=80'
  },
  {
    name: 'Cape Town, South Africa',
    insight: 'Where two oceans meet beneath Table Mountain, creating one of the world\'s most biodiverse marine environments.',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&h=800&fit=crop&q=80'
  },
];

const HomePage = ({ onSearch, isDarkMode: propIsDarkMode, toggleTheme: propToggleTheme }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(propIsDarkMode ?? false);

  // Search bar state
  const [searchBarState, setSearchBarState] = useState<'idle' | 'active' | 'submitted'>('idle');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Surprise Me state
  const [surpriseState, setSurpriseState] = useState<'idle' | 'thinking' | 'revealed'>('idle');
  const [surpriseDestination, setSurpriseDestination] = useState<typeof surpriseDestinations[0] | null>(null);

  const navigate = useNavigate();
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const checkinButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

  // Google Places suggestions
  const { suggestions: placeSuggestions, isLoading: isLoadingSuggestions, hasApiAccess, getPlaceDetails } = useGooglePlaces(
    destination,
    showSuggestions && destination.length >= 2
  );

  console.log('hasApiAccess', hasApiAccess);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      destinationInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update search bar state based on input
  useEffect(() => {
    if (destination.length > 0) {
      setSearchBarState('active');
    } else {
      setSearchBarState('idle');
    }
  }, [destination]);

  const isSearchEnabled = destination && checkinDate && checkoutDate;

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      // Brief submitted state
      setSearchBarState('submitted');
      setTimeout(() => setSearchBarState('idle'), 150);

      const placeToUse = selectedPlace || {
        name: destination,
        formatted_address: destination,
        latitude: 0,
        longitude: 0,
        place_id: `manual_${Date.now()}`
      };

      onSearch(placeToUse, {
        checkin: format(checkinDate, 'yyyy-MM-dd'),
        checkout: format(checkoutDate, 'yyyy-MM-dd')
      });
    } else {
      toast({
        title: 'Missing information',
        description: 'Please enter a destination and select travel dates',
        variant: 'destructive'
      });
    }
  }, [destination, checkinDate, checkoutDate, selectedPlace, onSearch, toast]);

  const handleDestinationSelect = async (suggestion: any) => {
    if (suggestion.place_id) {
      const details = await getPlaceDetails(suggestion.place_id);
      if (details) {
        setDestination(details.formatted_address);
        setSelectedPlace(details);
      } else {
        setDestination(suggestion.description || suggestion.place_id);
        setSelectedPlace(null);
      }
    } else if (typeof suggestion === 'string') {
      setDestination(suggestion);
      setSelectedPlace(null);
    }
    setShowSuggestions(false);
    setTimeout(() => setCheckinOpen(true), 100);
  };

  const handleCheckinSelect = (date: Date | undefined) => {
    if (date) {
      setCheckinDate(date);
      setCheckinOpen(false);
      setTimeout(() => setCheckoutOpen(true), 100);
    }
  };

  const handleCheckoutSelect = (date: Date | undefined) => {
    if (date) {
      setCheckoutDate(date);
      setCheckoutOpen(false);
    }
  };

  // Global keyboard handler for search bar
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isSearchEnabled) {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === 'Escape') {
      setCheckinOpen(false);
      setCheckoutOpen(false);
      setShowSuggestions(false);
    }
  }, [isSearchEnabled, handleSearch]);

  const handleSurpriseMe = () => {
    setSurpriseState('thinking');

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * surpriseDestinations.length);
      setSurpriseDestination(surpriseDestinations[randomIndex]);
      setSurpriseState('revealed');
    }, 1500);
  };

  const handleSurpriseSelect = () => {
    if (surpriseDestination) {
      setDestination(surpriseDestination.name);
      setSelectedPlace(null);
      setSurpriseState('idle');
      setSurpriseDestination(null);
      setTimeout(() => setCheckinOpen(true), 100);
    }
  };

  const handleSurpriseClose = () => {
    setSurpriseState('idle');
    setSurpriseDestination(null);
  };

  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('dark');
    }
  };

  // Compute search bar classes based on state
  const searchBarClasses = [
    'search-bar',
    'py-1.5',
    'px-2.5',
    'max-w-[67rem]',
    'mx-auto',
    'mb-8',
    isSearchFocused && 'search-bar-focused',
    searchBarState === 'active' && 'search-bar-active',
    searchBarState === 'submitted' && 'search-bar-submitted',
  ].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Surprise Me Overlay */}
      {surpriseState !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300"
          onClick={surpriseState === 'revealed' ? handleSurpriseClose : undefined}
        >
          {surpriseState === 'thinking' && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
              <p className="text-lg text-muted-foreground">Travis is thinking...</p>
            </div>
          )}

          {surpriseState === 'revealed' && surpriseDestination && (
            <div
              className="w-full max-w-2xl mx-4 bg-card border border-border rounded-3xl shadow-2xl animate-fade-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero Image */}
              <div className="relative w-full h-64 sm:h-80 overflow-hidden">
                <img
                  src={surpriseDestination.image}
                  alt={surpriseDestination.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Destination label overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Compass className="w-4 h-4 text-white/80" />
                    <span className="text-sm text-white/80 font-medium">Your destination</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                    {surpriseDestination.name}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-6">
                  {surpriseDestination.insight}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSurpriseSelect}
                    className="flex-1 h-11"
                  >
                    Let's go
                  </Button>
                  <Button
                    onClick={handleSurpriseMe}
                    variant="outline"
                    className="flex-1 h-11"
                  >
                    Try another
                  </Button>
                </div>

                <button
                  onClick={handleSurpriseClose}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - Responsive positioning with optical lift */}
        <div className="flex-1 flex items-start justify-center px-4 pt-[12vh] sm:pt-[14vh] lg:pt-[15vh]">
          <div className="max-w-4xl w-full text-center lg:max-w-5xl xl:max-w-6xl 2xl:max-w-5xl">
            {/* Heading */}
            <h1 className="heading-display text-foreground mb-4">
              <span className="text-glow">The World Awaits</span>
            </h1>

            {/* Subtext */}
            <p className="ti-secondary mb-6">
              Travel Intelligence for the modern explorer
            </p>

            {/* Search Bar */}
            <div
              className={searchBarClasses}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                {/* Destination Input */}
                <div className="flex-1 relative search-field rounded-l-full">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={destinationInputRef}
                    type="text"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setSelectedPlace(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    tabIndex={1}
                    className="pl-12 h-10 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50"
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && destination.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      {isLoadingSuggestions && hasApiAccess && (
                        <div className="p-4 text-center text-muted-foreground">
                          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                        </div>
                      )}

                      {placeSuggestions.map((suggestion, index) => (
                        <button
                          key={`place-${index}`}
                          type="button"
                          onClick={() => handleDestinationSelect(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{suggestion.structured_formatting.main_text}</div>
                            <div className="text-xs text-muted-foreground truncate">{suggestion.structured_formatting.secondary_text}</div>
                          </div>
                        </button>
                      ))}

                      {!hasApiAccess && (
                        <div className="p-3 text-xs text-muted-foreground border-t border-border">
                          Search unavailable — check API key
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border/50" />

                {/* Check-in Date */}
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      ref={checkinButtonRef}
                      variant="ghost"
                      tabIndex={2}
                      className="search-field h-10 px-4 font-normal min-w-[100px]"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className={checkinDate ? 'text-foreground' : 'text-muted-foreground/50'}>
                        {checkinDate ? format(checkinDate, 'MMM d') : 'Depart'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={checkinDate}
                      onSelect={handleCheckinSelect}
                      disabled={(date) => date < todayLocal()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Divider */}
                <div className="w-px h-8 bg-border/50" />

                {/* Check-out Date */}
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      ref={checkoutButtonRef}
                      variant="ghost"
                      tabIndex={3}
                      className="search-field h-10 px-4 font-normal min-w-[100px]"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className={checkoutDate ? 'text-foreground' : 'text-muted-foreground/50'}>
                        {checkoutDate ? format(checkoutDate, 'MMM d') : 'Return'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={checkoutDate}
                      onSelect={handleCheckoutSelect}
                      disabled={(date) => date < (checkinDate || todayLocal())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Search Button */}
                <Button
                  ref={submitButtonRef}
                  type="submit"
                  tabIndex={4}
                  disabled={!isSearchEnabled}
                  className="h-9 w-9 rounded-full bg-foreground/85 hover:bg-foreground/95 text-background disabled:opacity-40 hover:cursor-pointer disabled:cursor-not-allowed shadow-none transition-colors duration-150"
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </Button>
              </form>
            </div>

            {/* Surprise Me Link */}
            <div className="mt-6">
              <button
                onClick={handleSurpriseMe}
                className="ti-secondary group no-underline"
                style={{ fontSize: '14px' }}
              >
                <span
                  className="inline-block mr-[0.3em] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-150 ease-out"
                  style={{ transform: 'translateX(2px)' }}
                  aria-hidden="true"
                >
                  <span className="inline-block group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 transition-transform duration-150 ease-out">
                    &rarr;
                  </span>
                </span>
                Not sure where to go?{' '}
                <span>
                  Surprise me.
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <span className="fixed bottom-6 left-8 z-10 text-xs font-medium select-none" style={{ color: '#2B2B2B' }}>
          &copy; 2026 Travis
        </span>

        {/* Utility links - bottom right */}
        <div className="fixed bottom-6 right-8 z-10 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#2B2B2B' }}>
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="hover:opacity-70 transition-opacity duration-150"
          >
            Privacy
          </button>
          <span className="opacity-60">·</span>
          <button
            onClick={() => setIsTermsModalOpen(true)}
            className="hover:opacity-70 transition-opacity duration-150"
          >
            Terms
          </button>
        </div>
      </main>

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentLanguage="en"
        setCurrentLanguage={() => {}}
      />
    </div>
  );
};

export default HomePage;
