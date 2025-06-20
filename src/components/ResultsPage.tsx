
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Thermometer, Clock, CreditCard, Plane, Car, Shield, Mountain, Wifi, TrendingUp, Users, Zap, Pin, PinOff, CalendarDays, Plug, Palette, Church, Globe, Heart, Utensils } from 'lucide-react';
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
import TravisChatbot from './TravisChatbot';
import AccommodationHeatMap from './AccommodationHeatMap';

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
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Brazil-focused mock data
  const mockData = {
    currency: { rate: 5.15, symbol: 'R$', name: 'Brazilian Real' },
    time: { current: '14:42', offset: '-3', dst: false },
    weather: { temp: 24, condition: 'Partly Cloudy', humidity: 65 },
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
    if (value.length > 1) {
      const filtered = brazilianDestinations.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setDestinationSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
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

  const formatDateRange = (checkin: Date, checkout: Date) => {
    const checkinFormatted = format(checkin, 'EEEE MMMM do');
    const checkoutFormatted = format(checkout, 'EEEE MMMM do');
    return `${checkinFormatted} - ${checkoutFormatted}`;
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/30 sticky top-0 z-40">
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
                    <MapPin className="w-7 h-7 mr-3 text-blue-400" />
                    {destination}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePinDestination(destination)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Pin className="w-5 h-5" />
                  </Button>
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
                        <p className="text-sm font-medium mb-2">Check-in Date</p>
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
                        <p className="text-sm font-medium mb-2">Check-out Date</p>
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
            <div className="text-2xl font-bold text-foreground tracking-tight">TRAVIS</div>
          </div>

          {/* Pinned Destinations - Brazil focused */}
          {pinnedDestinations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground font-medium">PINNED:</span>
                <div className="flex space-x-2 flex-wrap">
                  {pinnedDestinations.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => setNewDestination(dest)}
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
                <div className="flex space-x-2">
                  {['Rio de Janeiro', 'Salvador', 'Brasília', 'Fortaleza'].map((city) => (
                    <button
                      key={city}
                      onClick={() => handlePinDestination(`${city}, Brazil`)}
                      className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-300 hover:bg-green-500/30 transition-colors"
                      title="Click to pin"
                    >
                      + {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar with Auto-suggestions */}
          <div className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-lg relative">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder="Change destination"
                  value={newDestination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => newDestination.length > 1 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-11 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full"
                />
                {showSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {destinationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNewDestination(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors text-sm border-b border-border/20 last:border-b-0"
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleNewSearch}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-r-full"
              >
                Search
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

        {/* Cultural Insights Section */}
        <Card className="travis-card mb-8 bg-white shadow-lg">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Currency Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-3">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Currency Exchange
                <TrendingUp className="w-4 h-4 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <span className="font-semibold text-lg">1 USD</span>
                <span className="text-green-400 font-bold text-xl">
                  {mockData.currency.rate} {mockData.currency.symbol}
                </span>
              </div>
              <div className="flex space-x-3">
                <Input
                  type="number"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                  className="flex-1 bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl"
                />
                <div className="px-4 py-2 bg-secondary/50 rounded-xl border border-border/50 font-mono">
                  {mockData.currency.symbol}
                </div>
              </div>
              <p className="text-lg font-semibold text-green-400">
                = {mockData.currency.symbol}{(currencyAmount * mockData.currency.rate).toFixed(2)} {mockData.currency.name}
              </p>
              <div className="text-sm text-muted-foreground">
                Live rate • Updated 2 min ago
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Heat Map */}
          <AccommodationHeatMap />

          {/* World Adapters Widget - 3D floating effect */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Time Zone Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Weather Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                Weather Intel
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                  className="ml-auto text-orange-400 hover:text-orange-300"
                >
                  °{tempUnit}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="text-4xl font-bold text-orange-400 mb-2">
                  {convertTemp(mockData.weather.temp)}°{tempUnit}
                </div>
                <div className="text-lg text-muted-foreground mb-2">{mockData.weather.condition}</div>
                <div className="text-sm text-muted-foreground">Humidity: {mockData.weather.humidity}%</div>
              </div>
              
              {/* 14-day forecast */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">14-Day Forecast</p>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {fourteenDayForecast.map((forecast, idx) => (
                    <div key={idx} className="text-center p-2 bg-secondary/30 rounded">
                      <div className="font-medium text-xs truncate">{forecast.day}</div>
                      <div className="text-orange-400 font-semibold">
                        {convertTemp(forecast.temp)}°
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Holidays Widget - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Airport Info Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Transportation Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Visa & Entry Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Emergency Info Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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

          {/* Connectivity Card - Updated for Brazil */}
          <Card className="travis-card travis-interactive group bg-white shadow-lg">
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
          <Card className="travis-card lg:col-span-2 xl:col-span-3 bg-white shadow-lg">
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
      </main>

      {/* Travis Chatbot */}
      <TravisChatbot />
    </div>
  );
};

export default ResultsPage;
