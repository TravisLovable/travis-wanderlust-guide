import React, { useState } from 'react';
import { ArrowLeft, Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AccommodationHeatMap from '@/components/AccommodationHeatMap';
import TravisChatbot from '@/components/TravisChatbot';
import WeatherWidget from '@/components/WeatherWidget';
import HomeWeatherWidget from '@/components/HomeWeatherWidget';

interface ResultsPageProps {
  destination: string;
  dates: { checkin: string; checkout: string };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [currencyAmount, setCurrencyAmount] = useState(100);
  const [selectedWidgets, setSelectedWidgets] = useState(['currency', 'weather', 'time']);
  const [pinnedDestinations, setPinnedDestinations] = useState([destination]);
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isAdapterSpinning, setIsAdapterSpinning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Use Mapbox geocoding for destination suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions } = useMapboxGeocoding(
    newDestination,
    showSuggestions && newDestination.length >= 2
  );

  // Use real currency exchange data with destination-based currency
  const { currencyData, isLoading: currencyLoading, error: currencyError } = useCurrencyExchange('USD', destination);

  // Profile data
  const profileData = {
    name: "Brittany J.",
    preferredAirline: "Delta Airlines",
    travelType: "Luxury",
    frequentFlyerNumber: "DL89472156",
    nationality: "American",
    country: "United States",
    status: "Premium Member"
  };

  // Dynamic flag mapping based on destination
  const getCountryFlag = (dest: string) => {
    const lowerDest = dest.toLowerCase();
    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro')) {
      return 'https://flagcdn.com/w40/br.png';
    }
    if (lowerDest.includes('italy') || lowerDest.includes('rome') || lowerDest.includes('milan')) {
      return 'https://flagcdn.com/w40/it.png';
    }
    if (lowerDest.includes('morocco') || lowerDest.includes('marrakech') || lowerDest.includes('casablanca')) {
      return 'https://flagcdn.com/w40/ma.png';
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

  // Brazil-focused mock data
  const mockData = {
    time: { current: '14:42', offset: '-3', dst: false },
    airport: { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', address: 'Guarulhos, São Paulo' },
    altitude: { elevation: '760m above sea level' },
    emergency: { police: '190', fire: '193', medical: '192' },
    holidays: [
      { name: 'Carnival', date: 'February 12-13, 2024' },
      { name: 'Independence Day', date: 'September 7, 2024' },
      { name: 'Christmas Day', date: 'December 25, 2024' }
    ],
    culture: {
      language: { primary: 'Portuguese', secondary: 'English (limited in tourist areas)' },
      religion: { primary: 'Roman Catholic (64.6%)', secondary: 'Protestant (22.2%), Other (13.2%)' },
      etiquette: [
        'Warm greetings with hugs and kisses on cheek',
        'Dress well, appearance matters',
        'Avoid discussing politics initially',
        'Always say "obrigado/obrigada" (thank you)',
        'Family values are very important'
      ],
      customs: [
        'Late dining (8-10 PM is normal)',
        'Strong coffee culture throughout day',
        'Soccer (futebol) is a national passion',
        'Music and dance are central to culture'
      ]
    }
  };

  const fourteenDayForecast = [
    { day: 'Today', temp: 24, condition: 'Partly Cloudy' },
    { day: 'Tomorrow', temp: 26, condition: 'Sunny' },
    { day: 'Wed', temp: 22, condition: 'Rainy' },
    { day: 'Thu', temp: 28, condition: 'Sunny' },
    { day: 'Fri', temp: 25, condition: 'Cloudy' },
    { day: 'Sat', temp: 27, condition: 'Sunny' },
    { day: 'Sun', temp: 23, condition: 'Rainy' },
    { day: 'Mon', temp: 29, condition: 'Sunny' },
    { day: 'Tue', temp: 24, condition: 'Partly Cloudy' },
    { day: 'Wed', temp: 26, condition: 'Sunny' },
    { day: 'Thu', temp: 25, condition: 'Cloudy' },
    { day: 'Fri', temp: 30, condition: 'Sunny' },
    { day: 'Sat', temp: 23, condition: 'Rainy' },
    { day: 'Sun', temp: 27, condition: 'Partly Cloudy' }
  ];

  const widgetOptions = [
    { id: 'currency', name: 'Currency', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
    { id: 'weather', name: 'Weather', icon: Thermometer, color: 'from-orange-500 to-red-600' },
    { id: 'time', name: 'Time', icon: Clock, color: 'from-blue-500 to-cyan-600' },
    { id: 'transport', name: 'Transport', icon: Car, color: 'from-purple-500 to-violet-600' },
    { id: 'emergency', name: 'Emergency', icon: Shield, color: 'from-red-500 to-pink-600' },
    { id: 'connectivity', name: 'Wi-Fi', icon: Wifi, color: 'from-teal-500 to-cyan-600' }
  ];

  // Brazilian destinations for suggestions
  const brazilianDestinations = [
    'São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Salvador, Brazil', 'Brasília, Brazil',
    'Fortaleza, Brazil', 'Belo Horizonte, Brazil', 'Manaus, Brazil', 'Curitiba, Brazil',
    'Recife, Brazil', 'Goiânia, Brazil', 'Belém, Brazil', 'Porto Alegre, Brazil',
    'Guarulhos, Brazil', 'Campinas, Brazil', 'São Luís, Brazil', 'São Gonçalo, Brazil',
    'Maceió, Brazil', 'Duque de Caxias, Brazil', 'Natal, Brazil', 'Florianópolis, Brazil'
  ];

  const handleDestinationChange = (value: string) => {
    setNewDestination(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleDestinationSelect = (suggestion: any) => {
    setNewDestination(suggestion.place_name);
    setShowSuggestions(false);
  };

  const handleNewSearch = () => {
    if (newDestination && newCheckinDate && newCheckoutDate) {
      onNewSearch(newDestination, {
        checkin: format(newCheckinDate, 'yyyy-MM-dd'),
        checkout: format(newCheckoutDate, 'yyyy-MM-dd')
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNewSearch();
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

  const convertTemp = (temp: number) => {
    return tempUnit === 'F' ? Math.round((temp * 9/5) + 32) : temp;
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
            <div className="flex items-center space-x-4">
              <span className="text-xl font-medium text-foreground">Welcome back, B!</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full profile-dropdown-glow">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png" alt="Profile" />
                      <AvatarFallback>BJ</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-card border-border shadow-lg profile-dropdown-glow" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profileData.name}</p>
                      <p className="text-xs leading-none premium-glow font-medium">{profileData.status}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-2">
                    <div className="text-xs">
                      <strong>Preferred Airline:</strong> {profileData.preferredAirline}
                    </div>
                    <div className="text-xs">
                      <strong>Travel Type:</strong> {profileData.travelType}
                    </div>
                    <div className="text-xs">
                      <strong>Frequent Flyer #:</strong> {profileData.frequentFlyerNumber}
                    </div>
                    <div className="text-xs">
                      <strong>Passport:</strong> {profileData.country}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">Dark Mode</span>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleTheme}
                        className="scale-75"
                      />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  {['Rio de Janeiro', 'Salvador', 'Brasília', 'Fortaleza'].map((city) => (
                    <button
                      key={city}
                      onClick={() => handlePinDestination(`${city}, Brazil`)}
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
          <div className="bg-white/10 backdrop-blur-sm border border-border/20 rounded-full p-2 shadow-lg relative travis-glow-white">
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
                onClick={handleNewSearch}
                className="h-12 px-4 bg-white/20 hover:bg-white/30 text-white rounded-r-full border-l border-border/30 search-icon-glow"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Photo Slideshow - Breathtaking Brazil landmarks */}
        <div className="mb-8">
          <PhotoSlideshow />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* 1. Visa & Entry Card - PRIORITY 1 */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Visa & Entry Requirements
                <Shield className="w-4 h-4 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-green-700 font-medium">✓ Visa-free entry</div>
                <div className="text-xs text-muted-foreground">For US passport holders</div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Max stay:</span> 90 days</p>
                <p><span className="font-medium">Passport validity:</span> 6 months minimum</p>
                <p><span className="font-medium">Yellow fever:</span> Vaccination recommended</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Full Requirements
              </Button>
            </CardContent>
          </Card>

          {/* 2. Currency Card - PRIORITY 2 */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-3">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Currency Exchange
                <TrendingUp className="w-4 h-4 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currencyLoading ? (
                <div className="flex justify-center items-center p-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <span className="font-semibold">1 USD</span>
                    <span className="text-green-400 font-bold">
                      {currencyData?.rate.toFixed(2)} {currencyData?.symbol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={currencyAmount}
                      onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                      className="flex-1 bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl h-10"
                    />
                    <span className="text-green-400 font-semibold">
                      = {currencyData?.symbol}{currencyData ? (currencyAmount * currencyData.rate).toFixed(2) : '-.--'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currencyError ? (
                      <span className="text-orange-400">API Error - Using fallback rate</span>
                    ) : (
                      `Live rate • Updated ${currencyData?.lastUpdated}`
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 3. Time Zone Card - PRIORITY 3 */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Time Intelligence
                <Zap className="w-4 h-4 ml-auto text-blue-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">YOUR TIME</div>
                  <div className="text-2xl font-bold text-blue-400">17:42</div>
                  <div className="text-xs text-muted-foreground font-mono">EST</div>
                </div>
                <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">SÃO PAULO</div>
                  <div className="text-2xl font-bold text-blue-300">{mockData.time.current}</div>
                  <div className="text-xs text-muted-foreground font-mono">BRT {mockData.time.offset}</div>
                </div>
              </div>
              {!mockData.time.dst && (
                <div className="flex items-center justify-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Clock className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">Standard Time Active</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Weather Card - Replace with WeatherWidget */}
          <WeatherWidget
            destination={destination}
            tempUnit={tempUnit}
            onTempUnitToggle={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
          />

          {/* 5. Local Holidays Widget - Now next to Weather */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-3">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                Local Holidays
                <Mountain className="w-4 h-4 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.holidays.map((holiday, idx) => (
                <div key={idx} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="font-medium text-purple-300">{holiday.name}</div>
                  <div className="text-sm text-muted-foreground">{holiday.date}</div>
                </div>
              ))}
              <div className="text-sm text-muted-foreground">
                <p><span className="font-medium">Note:</span> Many businesses close during major holidays like Carnival</p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Transportation Card - Now next to Local Holidays */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-3">
                  <Car className="w-5 h-5 text-white" />
                </div>
                Transportation
                <Car className="w-4 h-4 ml-auto text-indigo-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                  <div className="font-medium text-indigo-700">Metro</div>
                  <div className="text-xs text-muted-foreground">Extensive Network</div>
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                  <div className="font-medium text-indigo-700">Uber/99</div>
                  <div className="text-xs text-muted-foreground">Widely Available</div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Metro day pass:</span> R$12.00</p>
                <p><span className="font-medium">Bus fare:</span> R$4.40</p>
                <p><span className="font-medium">Bilhete Único:</span> Integrated transport card</p>
              </div>
            </CardContent>
          </Card>

          {/* São Paulo Accommodation Map */}
          <SaoPauloAccommodationMap />

          {/* World Adapters Widget - 3D floating effect */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mr-3">
                  <Plug className="w-5 h-5 text-white" />
                </div>
                Power Adapters
                <Zap className="w-4 h-4 ml-auto text-yellow-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl cursor-pointer perspective-1000"
                onClick={handleAdapterClick}
              >
                <div 
                  className={`w-16 h-20 mx-auto mb-3 relative transition-all duration-1000 transform-gpu ${
                    isAdapterSpinning ? 'animate-spin rotate-y-180' : 'hover:rotate-y-12 hover:-translate-y-2'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 50%, #9ca3af 100%)',
                    boxShadow: `
                      0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    borderRadius: '8px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 3D depth effect */}
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                      transform: 'translateZ(-2px)',
                    }}
                  />
                  
                  {/* Type C plug visual */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-1.5 h-8 bg-gray-700 rounded-full shadow-md"></div>
                    <div className="w-1.5 h-8 bg-gray-700 rounded-full shadow-md mt-1"></div>
                  </div>
                  
                  {/* Floating shadow */}
                  <div 
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-black/20 rounded-full blur-sm"
                    style={{ filter: 'blur(4px)' }}
                  />
                </div>
                <div className="font-bold text-lg text-yellow-400">Type C & N</div>
                <div className="text-sm text-muted-foreground">220V • 60Hz</div>
              </div>
              <div className="text-sm space-y-1 mt-2">
                <p><span className="font-medium">Voltage:</span> 220V (Higher than US)</p>
                <p><span className="font-medium">Frequency:</span> 60Hz</p>
                <p><span className="font-medium">Plug Type:</span> Type C (Europlug) & Type N</p>
              </div>
            </CardContent>
          </Card>

          {/* Airport Info Card */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-3">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                Airport Information
                <Plane className="w-4 h-4 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="font-bold text-lg text-purple-700">{mockData.airport.code}</div>
                <div className="text-sm font-medium">{mockData.airport.name}</div>
                <div className="text-xs text-muted-foreground">{mockData.airport.address}</div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Distance to city:</span> 25 km</p>
                <p><span className="font-medium">Travel time:</span> 45-90 minutes</p>
                <p><span className="font-medium">Transportation:</span> Metro, Bus, Taxi, Uber</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Info Card */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Emergency Information
                <Shield className="w-4 h-4 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700">{mockData.emergency.police}</div>
                  <div className="text-xs text-muted-foreground">Police</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700">{mockData.emergency.medical}</div>
                  <div className="text-xs text-muted-foreground">Medical/Fire</div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">US Consulate SP:</span> +55 11 5186-7000</p>
                <p><span className="font-medium">Tourist Police:</span> +55 11 3120-4417</p>
              </div>
            </CardContent>
          </Card>

          {/* Connectivity Card */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                Connectivity & ATMs
                <Wifi className="w-4 h-4 ml-auto text-teal-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <h4 className="font-medium text-cyan-700 mb-2">Free Wi-Fi Spots</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Shopping malls (most locations)</li>
                  <li>• Starbucks, McDonald's</li>
                  <li>• Metro stations (WiFi Livre SP)</li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">ATM Locations:</p>
                <p className="text-muted-foreground">Banco do Brasil, Bradesco, Itaú branches. International cards widely accepted.</p>
              </div>
            </CardContent>
          </Card>

          {/* Intelligence Dashboard Widget */}
          <Card className="travis-card lg:col-span-2 xl:col-span-3 bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-3">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                Intelligence Dashboard
                <Users className="w-4 h-4 ml-auto text-purple-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">Configure your travel intelligence dashboard:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                      className={`p-4 rounded-xl border transition-all duration-300 travis-interactive ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                          : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50 hover:border-border'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-sm font-medium">{widget.name}</div>
                    </button>
                  );
                })}
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-purple-300 font-medium">
                  {selectedWidgets.length} modules selected for your travel intelligence dashboard
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Cultural Insights Section - Moved to bottom */}
        <Card className="travis-card mt-8 bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-2xl font-semibold">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                <Globe className="w-5 h-5 text-white" />
              </div>
              Cultural Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-blue-700">Language</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Primary:</span> {mockData.culture.language.primary}</p>
                  <p className="text-sm"><span className="font-medium">Secondary:</span> {mockData.culture.language.secondary}</p>
                </div>
              </div>

              {/* Religion */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <Church className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-purple-700">Religion</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Primary:</span> {mockData.culture.religion.primary}</p>
                  <p className="text-sm"><span className="font-medium">Other:</span> {mockData.culture.religion.secondary}</p>
                </div>
              </div>

              {/* Cultural Etiquette */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-green-700">Cultural Etiquette</h3>
                </div>
                <div className="space-y-1">
                  {mockData.culture.etiquette.map((rule, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">• {rule}</p>
                  ))}
                </div>
              </div>

              {/* Local Customs */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-orange-700">Local Customs</h3>
                </div>
                <div className="space-y-1">
                  {mockData.culture.customs.map((custom, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">• {custom}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Travis Chatbot */}
      <TravisChatbot />
    </div>
  );
};

export default ResultsPage;
