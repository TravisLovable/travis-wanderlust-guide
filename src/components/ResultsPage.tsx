import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Thermometer, Clock, CreditCard, Car, Shield, Wifi, TrendingUp, Users, Zap, Pin, PinOff, Palette, Globe, User, ChevronDown, Search, Sun, Moon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import PhotoSlideshow from './PhotoSlideshow';
import SaoPauloAccommodationMap from './SaoPauloAccommodationMap';
import {
  WeatherContainer,
  HolidayContainer,
  TimeZoneContainer,
  CurrencyContainer,
  AirportContainer,
  VisaContainer,
  CulturalContainer,
  TransportWidget,
  PowerAdapterWidget,
  EmergencyWidget,
  ConnectivityWidget
} from './widgets';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { getContextualDestinations } from '@/utils/contextualDestinationSuggestions';

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

  const [selectedWidgets, setSelectedWidgets] = useState(['currency', 'weather', 'time']);
  const [pinnedDestinations, setPinnedDestinations] = useState([destination]);
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [isAdapterSpinning, setIsAdapterSpinning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);


  // Use Mapbox geocoding for destination suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions } = useMapboxGeocoding(
    newDestination,
    showSuggestions && newDestination.length >= 2
  );



  // Update pinned destinations when destination changes
  useEffect(() => {
    if (!pinnedDestinations.includes(destination)) {
      setPinnedDestinations(prev => [destination, ...prev.slice(0, 4)]); // Keep max 5 pinned destinations
    }
  }, [destination]);

  // Update newDestination when destination prop changes
  useEffect(() => {
    setNewDestination(destination);
  }, [destination]);





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

  // Check if destination has accommodation map support
  const getSupportedAccommodationDestinations = () => {
    return ['são paulo', 'sao paulo', 'brazil'];
  };

  const hasAccommodationMapSupport = (dest: string) => {
    const lowerDest = dest.toLowerCase();
    return getSupportedAccommodationDestinations().some(supported =>
      lowerDest.includes(supported)
    );
  };

  // Dynamic airport data based on destination
  const getAirportData = (dest: string) => {
    const lowerDest = dest.toLowerCase();

    if (lowerDest.includes('lima') || lowerDest.includes('peru')) {
      return {
        code: 'LIM',
        name: 'Jorge Chávez International Airport',
        address: 'Lima, Peru',
        distance: '11 km',
        travelTime: '30-60 min',
        options: 'Bus, Taxi, Uber'
      };
    }

    if (lowerDest.includes('são paulo') || lowerDest.includes('sao paulo') || lowerDest.includes('brazil')) {
      return {
        code: 'GRU',
        name: 'São Paulo/Guarulhos International Airport',
        address: 'Guarulhos, São Paulo',
        distance: '25 km',
        travelTime: '45-90 min',
        options: 'Metro, Bus, Taxi'
      };
    }

    if (lowerDest.includes('london') || lowerDest.includes('uk') || lowerDest.includes('united kingdom')) {
      return {
        code: 'LHR',
        name: 'London Heathrow Airport',
        address: 'London, United Kingdom',
        distance: '24 km',
        travelTime: '45-75 min',
        options: 'Tube, Bus, Taxi'
      };
    }

    if (lowerDest.includes('paris') || lowerDest.includes('france')) {
      return {
        code: 'CDG',
        name: 'Charles de Gaulle Airport',
        address: 'Paris, France',
        distance: '25 km',
        travelTime: '45-75 min',
        options: 'RER, Bus, Taxi'
      };
    }

    if (lowerDest.includes('tokyo') || lowerDest.includes('japan')) {
      return {
        code: 'NRT',
        name: 'Narita International Airport',
        address: 'Tokyo, Japan',
        distance: '60 km',
        travelTime: '60-90 min',
        options: 'Train, Bus, Taxi'
      };
    }

    // Generic fallback
    return {
      code: 'N/A',
      name: 'Primary Airport',
      address: `${dest}`,
      distance: 'Variable',
      travelTime: 'Variable',
      options: 'Multiple options available'
    };
  };

  // Dynamic power adapter data based on destination
  const getPowerAdapterData = (dest: string) => {
    const lowerDest = dest.toLowerCase();

    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
      return { type: 'Type C & N', voltage: '220V', frequency: '60Hz' };
    }

    if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
      return { type: 'Type A & C', voltage: '220V', frequency: '60Hz' };
    }

    if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london')) {
      return { type: 'Type G', voltage: '230V', frequency: '50Hz' };
    }

    if (lowerDest.includes('france') || lowerDest.includes('paris')) {
      return { type: 'Type C & E', voltage: '230V', frequency: '50Hz' };
    }

    if (lowerDest.includes('japan') || lowerDest.includes('tokyo')) {
      return { type: 'Type A & B', voltage: '100V', frequency: '50Hz/60Hz' };
    }

    // Default fallback
    return { type: 'Various', voltage: 'Check locally', frequency: 'Check locally' };
  };

  // Dynamic emergency numbers based on destination
  const getEmergencyNumbers = (dest: string) => {
    const lowerDest = dest.toLowerCase();

    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
      return { police: '190', fire: '193', medical: '192' };
    }

    if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
      return { police: '105', fire: '116', medical: '117' };
    }

    if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london')) {
      return { police: '999', fire: '999', medical: '999' };
    }

    if (lowerDest.includes('france') || lowerDest.includes('paris')) {
      return { police: '17', fire: '18', medical: '15' };
    }

    if (lowerDest.includes('japan') || lowerDest.includes('tokyo')) {
      return { police: '110', fire: '119', medical: '119' };
    }

    // Default fallback
    return { police: '911', fire: '911', medical: '911' };
  };

  // Dynamic transport data based on destination
  const getTransportData = (dest: string) => {
    const lowerDest = dest.toLowerCase();

    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
      return {
        primary: 'Metro',
        secondary: 'Uber/99',
        metroPass: 'R$12.00',
        busFare: 'R$4.40',
        card: 'Bilhete Único'
      };
    }

    if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
      return {
        primary: 'Metropolitano',
        secondary: 'Taxi/Uber',
        metroPass: 'S/2.50',
        busFare: 'S/1.20',
        card: 'Tarjeta Lima'
      };
    }

    if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london')) {
      return {
        primary: 'Tube',
        secondary: 'Bus/Uber',
        metroPass: '£2.80',
        busFare: '£1.75',
        card: 'Oyster Card'
      };
    }

    // Generic fallback
    return {
      primary: 'Public Transit',
      secondary: 'Taxi/Ride-share',
      metroPass: 'Variable',
      busFare: 'Variable',
      card: 'Local transit card'
    };
  };

  // Get dynamic data based on destination
  const airportData = getAirportData(destination);
  const powerData = getPowerAdapterData(destination);
  const emergencyData = getEmergencyNumbers(destination);
  const transportData = getTransportData(destination);





  const widgetOptions = [
    { id: 'currency', name: 'Currency', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
    { id: 'weather', name: 'Weather', icon: Thermometer, color: 'from-orange-500 to-red-600' },
    { id: 'time', name: 'Time', icon: Clock, color: 'from-blue-500 to-cyan-600' },
    { id: 'transport', name: 'Transport', icon: Car, color: 'from-purple-500 to-violet-600' },
    { id: 'emergency', name: 'Emergency', icon: Shield, color: 'from-red-500 to-pink-600' },
    { id: 'connectivity', name: 'Wi-Fi', icon: Wifi, color: 'from-teal-500 to-cyan-600' }
  ];

  // Dynamic destination suggestions based on the current destination region
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
      // Pass skipTransition as true to avoid loading screen
      onNewSearch(newDestination, {
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



  const handleAdapterClick = () => {
    setIsAdapterSpinning(!isAdapterSpinning);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const formatDateRange = (checkin: Date, checkout: Date) => {
    const departFormatted = format(checkin, 'EEEE MMMM do');
    const returnFormatted = format(checkout, 'EEEE MMMM do');
    return `Depart: ${departFormatted} • Return: ${returnFormatted}`;
  };

  const handleSignOut = () => {
    // Navigate to sign out/sign in page
    window.location.href = '/auth';
  };



  return (
    <div className="min-h-screen bg-gray-400 dark:bg-black">
      {/* Header - More transparent */}
      <header className="bg-black/5 dark:bg-black/5 backdrop-blur-sm border-b border-white/5 shadow-lg shadow-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2 hover:bg-secondary/50 rounded-xl travis-interactive"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-foreground flex items-center tracking-tight">
                    {destination}
                    {getCountryFlag(destination) ? (
                      <img
                        src={getCountryFlag(destination)!}
                        alt="Country Flag"
                        className="w-8 h-6 ml-3 mr-2 rounded shadow-sm"
                      />
                    ) : (
                      <Globe className="w-8 h-6 ml-3 mr-2 text-blue-400" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePinDestination(destination)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Pin className="w-5 h-5" />
                    </Button>
                  </h1>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground flex items-center font-light p-0 h-auto hover:text-foreground transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDateRange(newCheckinDate, newCheckoutDate)}
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

          {/* Pinned Destinations - More transparent */}
          {pinnedDestinations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground font-medium">PINNED:</span>
                <div className="flex space-x-2 flex-wrap">
                  {pinnedDestinations.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => setNewDestination(dest)}
                      className="group flex items-center space-x-2 px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-sm text-white hover:bg-blue-700/40 transition-colors shadow-sm"
                    >
                      <span>{dest}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePinnedDestination(dest);
                        }}
                        className="w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
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
            </div>
          )}

          {/* Search Bar with Mapbox Auto-suggestions */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-sm border border-border/20 rounded-full p-2 shadow-lg relative travis-glow-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search any destination worldwide..."
                  value={newDestination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => newDestination.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full"
                />
                {showSuggestions && mapboxSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isLoadingSuggestions && (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                      </div>
                    )}
                    {mapboxSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleDestinationSelect(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors text-sm border-b border-border/20 last:border-b-0"
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
                      {newCheckinDate ? format(newCheckinDate, 'MMM dd') : 'Depart'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
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

                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                    >
                      {newCheckoutDate ? format(newCheckoutDate, 'MMM dd') : 'Return'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
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

              <Button
                type="submit"
                className="h-12 px-4 bg-white/20 hover:bg-white/30 text-white rounded-r-full border-l border-border/30 search-icon-glow"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Photo Slideshow */}
        <div className="mb-6">
          <PhotoSlideshow />
        </div>

        {/* Optimized Widget Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">

          {/* Row 1: Primary Info Widgets - Reordered as requested */}
          {/* Time Zone - First position */}
          <TimeZoneContainer destination={destination} />

          {/* Currency - Second position */}
          <CurrencyContainer destination={destination} />

          {/* Airport Info - Third position - Now Dynamic */}
          <AirportContainer destination={destination} />

          {/* Visa & Entry - Fourth position */}
          <VisaContainer destination={destination} />
        </div>

        {/* Row 2: Weather Widget - Integrated into grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Weather Widget - Takes 2 columns on larger screens */}
          <div className="lg:col-span-2 xl:col-span-2">
            <WeatherContainer
              destination={destination}
            />
          </div>

          {/* Transportation Widget */}
          <TransportWidget transportData={transportData} />

          {/* Holiday Widget */}
          <HolidayContainer
            destination={destination}
            dates={dates}
          />
        </div>

        {/* Row 3: Secondary Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Power Adapter Widget */}
          <PowerAdapterWidget
            powerData={powerData}
            isAdapterSpinning={isAdapterSpinning}
            onAdapterClick={handleAdapterClick}
          />

          {/* Emergency Widget */}
          <EmergencyWidget emergencyData={emergencyData} />

          {/* Connectivity Widget */}
          <ConnectivityWidget />

          {/* Placeholder for future widget */}
          <div className="hidden xl:block"></div>
        </div>

        {/* Row 4: Conditional Accommodation Map */}
        <div className="mb-6">
          {hasAccommodationMapSupport(destination) ? (
            <SaoPauloAccommodationMap />
          ) : (
            <Card className="travis-card travis-interactive group xl:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-semibold">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    Accommodation Map
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Accommodation data is currently unavailable for this region.</h3>
                  <p className="text-muted-foreground">
                    We're working to expand our accommodation mapping to more destinations.
                    Check back soon for detailed accommodation options for {destination}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Row 5: Intelligence Dashboard - Full Width */}
        <Card className="travis-card bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                <Palette className="w-4 h-4 text-white" />
              </div>
              Intelligence Dashboard
              <Users className="w-4 h-4 ml-auto text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Configure your travel intelligence dashboard:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {widgetOptions.map((widget) => {
                const Icon = widget.icon;
                const isSelected = selectedWidgets.includes(widget.id);
                return (
                  <button
                    key={widget.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedWidgets(selectedWidgets.filter(id => id !== widget.id));
                      } else {
                        setSelectedWidgets([...selectedWidgets, widget.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all duration-300 travis-interactive ${isSelected
                      ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                      : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50 hover:border-border'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs font-medium">{widget.name}</div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-purple-300 font-medium text-sm">
                {selectedWidgets.length} modules selected for your travel intelligence dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Insights Section - Now fully dynamic */}
        <CulturalContainer destination={destination} />
      </main>
    </div>
  );
};

export default ResultsPage;
