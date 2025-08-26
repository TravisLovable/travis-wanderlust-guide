import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Pin, Globe, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import PhotoSlideshow from './PhotoSlideshow';
// import SaoPauloAccommodationMap from './SaoPauloAccommodationMap';
import {
  WeatherContainer,
  HolidayContainer,
  TimeZoneContainer,
  CurrencyContainer,
  VisaContainer,
  ConnectivityWidget,
  UberAvailabilityWidget
} from './widgets';
import { useMapboxGeocoding, SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { getContextualDestinations } from '@/utils/contextualDestinationSuggestions';

interface ResultsPageProps {
  placeDetails: SelectedPlace | null;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}



const ResultsPage = ({ placeDetails, dates, onBack, onNewSearch }: ResultsPageProps) => {
  // Extract destination string for backwards compatibility (display purposes)
  const destination = placeDetails?.formatted_address || placeDetails?.name || 'Unknown Destination';

  // const [selectedWidgets, setSelectedWidgets] = useState(['currency', 'weather', 'time']);
  const [pinnedDestinations, setPinnedDestinations] = useState([destination]);
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // const [isAdapterSpinning, setIsAdapterSpinning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // const [isDarkMode, setIsDarkMode] = useState(true);

  // Header scroll state
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Search input ref for focusing
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Function to handle search bar click - scroll to top and expand header
  const handleSearchBarClick = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Expand header if collapsed
    if (isHeaderCollapsed) {
      setIsTransitioning(true);
      setIsHeaderCollapsed(false);

      // Focus on search input after header expansion
      setTimeout(() => {
        searchInputRef.current?.focus();
        setIsTransitioning(false);
      }, 300); // Wait for header expansion animation
    } else {
      // If header is already expanded, just focus on input
      searchInputRef.current?.focus();
    }
  };

  // Scroll handler for header minimization with improved hysteresis
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;
    let transitionTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking && !isTransitioning) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;

          // Determine scroll direction
          const direction = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : null;

          // Only update if direction actually changed
          if (direction && direction !== scrollDirection) {
            setScrollDirection(direction);
          }

          // Collapse header when scrolling down more than 100px
          if (currentScrollY > 100) {
            if (direction === 'down' && scrollDelta > 20 && !isHeaderCollapsed) {
              // Scrolling down significantly - collapse header
              setIsTransitioning(true);
              setIsHeaderCollapsed(true);

              // Prevent rapid state changes for 300ms
              clearTimeout(transitionTimeout);
              transitionTimeout = setTimeout(() => setIsTransitioning(false), 300);
            } else if (direction === 'up' && scrollDelta < -20 && isHeaderCollapsed) {
              // Scrolling up significantly - expand header
              setIsTransitioning(true);
              setIsHeaderCollapsed(false);

              // Prevent rapid state changes for 300ms
              clearTimeout(transitionTimeout);
              transitionTimeout = setTimeout(() => setIsTransitioning(false), 300);
            }
          } else {
            // Always show full header when near top
            if (isHeaderCollapsed) {
              setIsTransitioning(true);
              setIsHeaderCollapsed(false);
              clearTimeout(transitionTimeout);
              transitionTimeout = setTimeout(() => setIsTransitioning(false), 300);
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(transitionTimeout);
    };
  }, [isHeaderCollapsed, scrollDirection, isTransitioning]);


  // Use Mapbox geocoding for destination suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions } = useMapboxGeocoding(
    newDestination,
    showSuggestions && newDestination.length >= 2
  );



  // Update pinned destinations when placeDetails changes
  useEffect(() => {
    if (!pinnedDestinations.includes(destination)) {
      setPinnedDestinations(prev => [destination, ...prev.slice(0, 4)]); // Keep max 5 pinned destinations
    }
  }, [placeDetails, destination]);

  // Update newDestination when placeDetails prop changes
  useEffect(() => {
    setNewDestination(destination);
  }, [placeDetails, destination]);





  // Dynamic flag mapping based on destination
  const getCountryFlag = (dest: string) => {
    const lowerDest = dest.toLowerCase();

    // African countries
    if (lowerDest.includes('south africa') || lowerDest.includes('cape town') || lowerDest.includes('johannesburg') || lowerDest.includes('durban')) {
      return 'https://flagcdn.com/w40/za.png';
    }
    if (lowerDest.includes('egypt') || lowerDest.includes('cairo') || lowerDest.includes('alexandria')) {
      return 'https://flagcdn.com/w40/eg.png';
    }
    if (lowerDest.includes('nigeria') || lowerDest.includes('lagos') || lowerDest.includes('abuja')) {
      return 'https://flagcdn.com/w40/ng.png';
    }
    if (lowerDest.includes('kenya') || lowerDest.includes('nairobi') || lowerDest.includes('mombasa')) {
      return 'https://flagcdn.com/w40/ke.png';
    }
    if (lowerDest.includes('morocco') || lowerDest.includes('marrakech') || lowerDest.includes('casablanca') || lowerDest.includes('rabat')) {
      return 'https://flagcdn.com/w40/ma.png';
    }
    if (lowerDest.includes('tunisia') || lowerDest.includes('tunis')) {
      return 'https://flagcdn.com/w40/tn.png';
    }
    if (lowerDest.includes('ghana') || lowerDest.includes('accra')) {
      return 'https://flagcdn.com/w40/gh.png';
    }
    if (lowerDest.includes('ethiopia') || lowerDest.includes('addis ababa')) {
      return 'https://flagcdn.com/w40/et.png';
    }
    if (lowerDest.includes('tanzania') || lowerDest.includes('dar es salaam') || lowerDest.includes('dodoma')) {
      return 'https://flagcdn.com/w40/tz.png';
    }
    if (lowerDest.includes('uganda') || lowerDest.includes('kampala')) {
      return 'https://flagcdn.com/w40/ug.png';
    }
    if (lowerDest.includes('rwanda') || lowerDest.includes('kigali')) {
      return 'https://flagcdn.com/w40/rw.png';
    }
    if (lowerDest.includes('senegal') || lowerDest.includes('dakar')) {
      return 'https://flagcdn.com/w40/sn.png';
    }
    if (lowerDest.includes('madagascar') || lowerDest.includes('antananarivo')) {
      return 'https://flagcdn.com/w40/mg.png';
    }
    if (lowerDest.includes('zimbabwe') || lowerDest.includes('harare')) {
      return 'https://flagcdn.com/w40/zw.png';
    }
    if (lowerDest.includes('botswana') || lowerDest.includes('gaborone')) {
      return 'https://flagcdn.com/w40/bw.png';
    }
    if (lowerDest.includes('namibia') || lowerDest.includes('windhoek')) {
      return 'https://flagcdn.com/w40/na.png';
    }
    if (lowerDest.includes('zambia') || lowerDest.includes('lusaka')) {
      return 'https://flagcdn.com/w40/zm.png';
    }
    if (lowerDest.includes('malawi') || lowerDest.includes('lilongwe')) {
      return 'https://flagcdn.com/w40/mw.png';
    }
    if (lowerDest.includes('mozambique') || lowerDest.includes('maputo')) {
      return 'https://flagcdn.com/w40/mz.png';
    }
    if (lowerDest.includes('angola') || lowerDest.includes('luanda')) {
      return 'https://flagcdn.com/w40/ao.png';
    }

    // Existing non-African countries
    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro')) {
      return 'https://flagcdn.com/w40/br.png';
    }
    if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
      return 'https://flagcdn.com/w40/pe.png';
    }
    if (lowerDest.includes('italy') || lowerDest.includes('rome') || lowerDest.includes('milan')) {
      return 'https://flagcdn.com/w40/it.png';
    }
    if (lowerDest.includes('france') || lowerDest.includes('paris')) {
      return 'https://flagcdn.com/w40/fr.png';
    }
    if (lowerDest.includes('spain') || lowerDest.includes('madrid') || lowerDest.includes('barcelona')) {
      return 'https://flagcdn.com/w40/es.png';
    }
    if (lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('osaka')) {
      return 'https://flagcdn.com/w40/jp.png';
    }
    if (lowerDest.includes('united kingdom') || lowerDest.includes('london') || lowerDest.includes('uk')) {
      return 'https://flagcdn.com/w40/gb.png';
    }
    if (lowerDest.includes('germany') || lowerDest.includes('berlin') || lowerDest.includes('munich')) {
      return 'https://flagcdn.com/w40/de.png';
    }
    if (lowerDest.includes('australia') || lowerDest.includes('sydney') || lowerDest.includes('melbourne')) {
      return 'https://flagcdn.com/w40/au.png';
    }
    if (lowerDest.includes('canada') || lowerDest.includes('toronto') || lowerDest.includes('vancouver')) {
      return 'https://flagcdn.com/w40/ca.png';
    }
    // Default to world icon if no country match
    return null;
  };


  const getRegionalDestinations = (currentDest: string) => {
    return getContextualDestinations(currentDest);
  };

  const handleDestinationChange = (value: string) => {
    setNewDestination(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleDestinationSelect = (suggestion: any) => {
    setNewDestination(suggestion.place_name);
    setShowSuggestions(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newDestination && newCheckinDate && newCheckoutDate) {
      // Create a basic placeDetails object if we don't have the full details
      const newPlaceDetails: SelectedPlace = {
        name: newDestination,
        formatted_address: newDestination,
        latitude: 0,
        longitude: 0,
        place_id: `search_${Date.now()}`
      };

      // Pass skipTransition as true to avoid loading screen
      onNewSearch(newPlaceDetails, {
        checkin: format(newCheckinDate, 'yyyy-MM-dd'),
        checkout: format(newCheckoutDate, 'yyyy-MM-dd')
      }, true);
      setShowSuggestions(false); // Hide suggestions after search
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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



  // COMMENTED OUT: Not in Phase 1 scope - Power adapter functionality
  // const handleAdapterClick = () => {
  //   setIsAdapterSpinning(!isAdapterSpinning);
  // };

  // COMMENTED OUT: Not used in ResultsPage
  // const toggleTheme = () => {
  //   setIsDarkMode(!isDarkMode);
  //   document.documentElement.classList.toggle('dark');
  // };

  const formatDateRange = (checkin: Date, checkout: Date) => {
    const departFormatted = format(checkin, 'EEEE MMMM do');
    const returnFormatted = format(checkout, 'EEEE MMMM do');
    return `Depart: ${departFormatted} • Return: ${returnFormatted}`;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
      {/* Header - Clean and Mobile-First with Scroll-Based Minimization */}
      <header className={`bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm sticky top-0 z-40 transition-all duration-500 ease-out ${isHeaderCollapsed ? 'py-2 shadow-lg' : 'py-3 sm:py-4'
        } ${isTransitioning ? 'pointer-events-none' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Scroll Indicator - Subtle visual feedback */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out ${isHeaderCollapsed ? 'opacity-100' : 'opacity-0'
            }`} />

          {/* Main Header Row - Collapsible */}
          <div className={`flex items-center justify-between transition-all duration-500 ease-out ${isHeaderCollapsed ? 'mb-2' : 'mb-3 sm:mb-4'
            }`}>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2 hover:bg-secondary/50 rounded-xl travis-interactive cursor-pointer pointer-events-auto"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="min-w-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <h1 className={`font-bold text-foreground flex items-center tracking-tight truncate transition-all duration-500 ease-out ${isHeaderCollapsed ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'
                    }`}>
                    {destination}
                    {getCountryFlag(destination) ? (
                      <img
                        src={getCountryFlag(destination)!}
                        alt="Country Flag"
                        className={`rounded shadow-sm flex-shrink-0 transition-all duration-500 ease-out ${isHeaderCollapsed ? 'w-5 h-4 sm:w-6 sm:h-5 ml-2' : 'w-6 h-4 sm:w-8 sm:h-6 ml-2 sm:ml-3 mr-1 sm:mr-2'
                          }`}
                      />
                    ) : (
                      <Globe className={`text-blue-400 flex-shrink-0 transition-all duration-500 ease-out ${isHeaderCollapsed ? 'w-5 h-4 sm:w-6 sm:h-5 ml-2' : 'w-6 h-4 sm:w-8 sm:h-6 ml-2 sm:ml-3 mr-1 sm:mr-2'
                        }`} />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePinDestination(destination)}
                      className="text-blue-400 hover:text-blue-300 ml-1 sm:ml-2"
                    >
                      <Pin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </h1>
                </div>

                {/* Date Range - Collapsible */}
                <div className={`transition-all duration-500 ease-out ${isHeaderCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                  }`}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-xs sm:text-sm text-muted-foreground flex items-center font-light p-0 h-auto hover:text-foreground transition-colors mt-1"
                      >
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="truncate">
                          {formatDateRange(newCheckinDate, newCheckoutDate)}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Depart Date</p>
                          <CalendarComponent
                            mode="single"
                            selected={newCheckinDate}
                            onSelect={(date) => {
                              if (date) setNewCheckinDate(date);
                            }}
                            className="pointer-events-auto"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Return Date</p>
                          <CalendarComponent
                            mode="single"
                            selected={newCheckoutDate}
                            onSelect={(date) => {
                              if (date) setNewCheckoutDate(date);
                            }}
                            className="pointer-events-auto"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Pinned Destinations - Collapsible */}
          <div className={`transition-all duration-500 ease-out ${isHeaderCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-3 sm:mb-4'
            }`}>
            {pinnedDestinations.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">PINNED:</span>
                <div className="flex flex-wrap gap-2">
                  {pinnedDestinations.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => setNewDestination(dest)}
                      className="group flex items-center space-x-2 px-2 sm:px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-xs sm:text-sm text-white hover:bg-blue-700/40 transition-colors shadow-sm"
                    >
                      <span className="truncate max-w-[120px] sm:max-w-[150px]">{dest}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePinnedDestination(dest);
                        }}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>

                {/* Regional Suggestions - Compact on mobile */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {getRegionalDestinations(destination).map((city) => (
                    <button
                      key={city}
                      onClick={() => handlePinDestination(city)}
                      className="px-2 py-1 bg-green-600/30 border border-green-500/30 rounded text-xs text-white hover:bg-green-700/40 transition-colors shadow-sm"
                      title="Click to pin"
                    >
                      + {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Airbnb-Style Search Bar - Always Visible but Compact when Collapsed */}
          <form onSubmit={handleSearch} className={`relative transition-all duration-500 ease-out ${isHeaderCollapsed ? '' : ''
            }`}>
            <div className={`bar bg-white shadow-lg transition-all duration-500 ease-out ${isHeaderCollapsed ? 'h-12' : 'h-14'
              }`} style={{ 
                width: '650px', 
                height: isHeaderCollapsed ? '48px' : '55px',
                borderRadius: '100vw',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '0.6rem',
                maxWidth: '100%',
                margin: '0 auto'
              }}>

              {/* Location Section */}
              <div 
                className={`location relative transition-all duration-250 hover:bg-gray-100 ${isHeaderCollapsed ? 'px-2 py-2' : 'px-6 py-3'
                }`} 
                style={{
                  width: '34%',
                  borderRadius: 'inherit',
                  padding: isHeaderCollapsed ? '0.5rem 0.8rem' : '0.8rem 1.5rem',
                  transition: 'background 250ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(0 0% 94%)';
                  // Hide separator on hover
                  const nextSibling = e.currentTarget.nextElementSibling;
                  if (nextSibling) {
                    const separator = nextSibling.querySelector('.separator');
                    if (separator) separator.style.background = 'transparent';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  // Show separator when not hovering
                  const nextSibling = e.currentTarget.nextElementSibling;
                  if (nextSibling && !isHeaderCollapsed) {
                    const separator = nextSibling.querySelector('.separator');
                    if (separator) separator.style.background = 'hsl(0 0% 90%)';
                  }
                }}
              >
                <div className="relative">
                  <p className={`text-xs font-semibold text-gray-900 mb-1 transition-all duration-500 ${isHeaderCollapsed ? 'text-[10px]' : 'text-xs'
                    }`}>Location</p>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Where are you going?"
                    value={newDestination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => newDestination.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className={`bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full transition-all duration-500 ${isHeaderCollapsed ? 'text-xs' : 'text-sm'
                      }`}
                    style={{ fontSize: '0.75rem', background: 'none', border: 'none', padding: '0.2rem 0 0 0' }}
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && mapboxSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {isLoadingSuggestions && (
                        <div className="p-4 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                        </div>
                      )}
                      {mapboxSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleDestinationSelect(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {suggestion.text}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.place_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Check In Section */}
              <div 
                className={`check-in relative transition-all duration-250 hover:bg-gray-100 ${isHeaderCollapsed ? 'opacity-0 w-0 overflow-hidden px-0' : 'opacity-100'
                }`} 
                style={{
                  width: isHeaderCollapsed ? '0%' : '22%',
                  borderRadius: 'inherit',
                  padding: isHeaderCollapsed ? '0' : '0.8rem 1.5rem',
                  transition: 'background 250ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!isHeaderCollapsed) {
                    e.currentTarget.style.background = 'hsl(0 0% 94%)';
                    // Hide separator on hover
                    const separator = e.currentTarget.querySelector('.separator');
                    if (separator) separator.style.background = 'transparent';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHeaderCollapsed) {
                    e.currentTarget.style.background = 'transparent';
                    // Show separator when not hovering
                    const separator = e.currentTarget.querySelector('.separator');
                    if (separator) separator.style.background = 'hsl(0 0% 90%)';
                  }
                }}
              >
                {/* Separator */}
                <div 
                  className="separator absolute left-0 top-1/2 transform -translate-y-1/2 w-px bg-gray-300"
                  style={{
                    height: '55%',
                    background: isHeaderCollapsed ? 'transparent' : 'hsl(0 0% 90%)'
                  }}
                ></div>
                <p className="text-xs font-semibold text-gray-900 mb-1">Check in</p>
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full text-left text-sm"
                      style={{ fontSize: '0.75rem', background: 'none', border: 'none', padding: '0.2rem 0 0 0' }}
                    >
                      {newCheckinDate ? format(newCheckinDate, 'MMM dd') : 'Add dates'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newCheckinDate}
                      onSelect={(date) => {
                        if (date) setNewCheckinDate(date);
                        setCheckinOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check Out Section */}
              <div 
                className={`check-out relative transition-all duration-250 hover:bg-gray-100 ${isHeaderCollapsed ? 'opacity-0 w-0 overflow-hidden px-0' : 'opacity-100'
                }`} 
                style={{
                  width: isHeaderCollapsed ? '0%' : '22%',
                  borderRadius: 'inherit',
                  padding: isHeaderCollapsed ? '0' : '0.8rem 1.5rem',
                  transition: 'background 250ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!isHeaderCollapsed) {
                    e.currentTarget.style.background = 'hsl(0 0% 94%)';
                    // Hide separator on hover
                    const separator = e.currentTarget.querySelector('.separator');
                    if (separator) separator.style.background = 'transparent';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHeaderCollapsed) {
                    e.currentTarget.style.background = 'transparent';
                    // Show separator when not hovering
                    const separator = e.currentTarget.querySelector('.separator');
                    if (separator) separator.style.background = 'hsl(0 0% 90%)';
                  }
                }}
              >
                {/* Separator */}
                <div 
                  className="separator absolute left-0 top-1/2 transform -translate-y-1/2 w-px bg-gray-300"
                  style={{
                    height: '55%',
                    background: isHeaderCollapsed ? 'transparent' : 'hsl(0 0% 90%)'
                  }}
                ></div>
                <p className="text-xs font-semibold text-gray-900 mb-1">Check out</p>
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full text-left text-sm"
                      style={{ fontSize: '0.75rem', background: 'none', border: 'none', padding: '0.2rem 0 0 0' }}
                    >
                      {newCheckoutDate ? format(newCheckoutDate, 'MMM dd') : 'Add dates'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newCheckoutDate}
                      onSelect={(date) => {
                        if (date) setNewCheckoutDate(date);
                        setCheckoutOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Section (replacing "Guests" from Airbnb) */}
              <div 
                className={`guests relative transition-all duration-250 hover:bg-gray-100 ${isHeaderCollapsed ? 'px-2 py-2' : ''
                }`} 
                style={{
                  width: '22%',
                  borderRadius: 'inherit',
                  padding: isHeaderCollapsed ? '0.5rem 0.8rem' : '0.8rem 1.5rem',
                  transition: 'background 250ms ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(0 0% 94%)';
                  // Hide separator on hover
                  const separator = e.currentTarget.querySelector('.separator');
                  if (separator) separator.style.background = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  // Show separator when not hovering
                  const separator = e.currentTarget.querySelector('.separator');
                  if (separator) separator.style.background = 'hsl(0 0% 90%)';
                }}
              >
                {/* Separator */}
                <div 
                  className="separator absolute left-0 top-1/2 transform -translate-y-1/2 w-px bg-gray-300"
                  style={{
                    height: '55%',
                    background: 'hsl(0 0% 90%)'
                  }}
                ></div>
                <p className={`text-xs font-semibold text-gray-900 mb-1 transition-all duration-500 ${isHeaderCollapsed ? 'text-[10px]' : 'text-xs'
                  }`}>Search</p>
                <input
                  type="text"
                  placeholder="Find destination"
                  value=""
                  readOnly
                  className={`bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full transition-all duration-500 ${isHeaderCollapsed ? 'text-xs' : 'text-sm'
                    }`}
                  style={{ fontSize: '0.75rem', background: 'none', border: 'none', padding: '0.2rem 0 0 0' }}
                />
                <span 
                  onClick={handleSearch}
                  className="cursor-pointer"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    background: '#FF385C',
                    color: 'white',
                    fontSize: isHeaderCollapsed ? '0.6rem' : '0.8rem',
                    padding: isHeaderCollapsed ? '0.5rem' : '0.7rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Search className={`transition-all duration-500 ${isHeaderCollapsed ? 'w-3 h-3' : 'w-4 h-4'
                    }`} />
                </span>
              </div>
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Hero Section with Photo Slideshow */}
        <div className="mb-6 sm:mb-8">
          <PhotoSlideshow placeDetails={placeDetails} />
        </div>

        {/* Essential Travel Information - Mobile First Grid with Equal Heights */}
        <div className="space-y-6 sm:space-y-8">

          {/* Row 1: Core Travel Essentials - Full Width on Mobile, 2 Columns on Tablet+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Currency Converter - Essential for travel planning */}
            <div className="order-1 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                <CurrencyContainer placeDetails={placeDetails} />
              </div>
            </div>

            {/* Time Zone - Critical for scheduling */}
            <div className="order-2 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                <TimeZoneContainer placeDetails={placeDetails} />
              </div>
            </div>
          </div>

          {/* Row 2: Weather & Transportation - Stack on Mobile, Side by Side on Larger */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {/* Weather Widget - Takes 2 columns on larger screens for better visibility */}
            <div className="lg:col-span-2 order-1 transform transition-all duration-300 hover:scale-[1.01] flex flex-col">
              <div className="flex-1 flex flex-col">
                <WeatherContainer placeDetails={placeDetails} />
              </div>
            </div>
            <div className="order-1 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                <HolidayContainer placeDetails={placeDetails} dates={dates} />
              </div>
            </div>
          </div>

          {/* Row 3: Local Information & Holidays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">


            <div className="order-1 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                <VisaContainer placeDetails={placeDetails} />
              </div>
            </div>

            {/* Uber Availability - Important for ground transportation */}
            <div className="order-2 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                <UberAvailabilityWidget placeDetails={placeDetails} />
              </div>
            </div>
          </div>


          {/* Row 5: Connectivity & Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Connectivity Info - Important for modern travelers */}
            <div className="order-1 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                <ConnectivityWidget />
              </div>
            </div>

            {/* Future expansion slot */}
            <div className="order-2 transform transition-all duration-300 hover:scale-[1.02] flex flex-col">
              <div className="flex-1 flex flex-col">
                {/* This space reserved for future widgets */}
                <div className="h-full"></div>
              </div>
            </div>
          </div>

          {/* Row 6: Future Features Placeholder - Subtle indication of what's coming */}
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 px-6 py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm sm:text-base text-blue-600 dark:text-blue-300 font-medium">
                  More travel intelligence features coming soon
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-500/70 dark:text-blue-400/70">
                <span>•</span>
                <span>Emergency contacts</span>
                <span>•</span>
                <span>Accommodation maps</span>
                <span>•</span>
                <span>Power adapters</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
