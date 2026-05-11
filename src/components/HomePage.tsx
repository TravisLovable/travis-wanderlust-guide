import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
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


const HomePage = ({ onSearch, isDarkMode: propIsDarkMode, toggleTheme: propToggleTheme }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const isDarkMode = propIsDarkMode ?? false;

  // Search bar state
  const [searchBarState, setSearchBarState] = useState<'idle' | 'active' | 'submitted'>('idle');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);


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


  const toggleTheme = () => propToggleTheme?.();

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
            <p className="ti-secondary mb-6 text-center mx-auto">
              Everything that matters before you travel.
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
