
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Thermometer, Clock, CreditCard, Plane, Car, Umbrella, Globe, Shield, Mountain, Wifi, TrendingUp, Users, Zap, Pin, PinOff, Search } from 'lucide-react';
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
  const [isPinned, setIsPinned] = useState(false);
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Mock data - in a real app, this would come from APIs
  const mockData = {
    currency: { rate: 0.85, symbol: '€', name: 'Euro' },
    time: { current: '15:42', offset: '+2', dst: true },
    weather: { temp: 22, condition: 'Sunny', humidity: 65 },
    airport: { code: 'CDG', name: 'Charles de Gaulle Airport', address: 'Roissy-en-France' },
    altitude: { elevation: '35m above sea level' },
    emergency: { police: '17', fire: '18', medical: '15' }
  };

  const widgetOptions = [
    { id: 'currency', name: 'Currency', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
    { id: 'weather', name: 'Weather', icon: Thermometer, color: 'from-orange-500 to-red-600' },
    { id: 'time', name: 'Time', icon: Clock, color: 'from-blue-500 to-cyan-600' },
    { id: 'transport', name: 'Transport', icon: Car, color: 'from-purple-500 to-violet-600' },
    { id: 'emergency', name: 'Emergency', icon: Shield, color: 'from-red-500 to-pink-600' },
    { id: 'connectivity', name: 'Wi-Fi', icon: Wifi, color: 'from-teal-500 to-cyan-600' }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/30 sticky top-0 z-40">
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
                    onClick={() => setIsPinned(!isPinned)}
                    className={`${isPinned ? 'text-blue-400' : 'text-muted-foreground'} hover:text-blue-400`}
                  >
                    {isPinned ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
                  </Button>
                </div>
                <p className="text-muted-foreground flex items-center font-light">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dates.checkin} to {dates.checkout}
                </p>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">Travis</div>
          </div>

          {/* Search Bar */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                type="text"
                placeholder="Change destination"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-blue-400 rounded-lg"
              />
            </div>
            
            <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 bg-secondary/30 border-border/50 focus:border-blue-400 hover:bg-secondary/50 rounded-lg justify-start font-normal"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(newCheckinDate, 'MMM dd')}
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
                  variant="outline"
                  className="h-12 bg-secondary/30 border-border/50 focus:border-blue-400 hover:bg-secondary/50 rounded-lg justify-start font-normal"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(newCheckoutDate, 'MMM dd')}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Photo Slideshow */}
        <div className="mb-8">
          <PhotoSlideshow />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Cultural Insights Card - Now First */}
          <Card className="travis-card travis-interactive group xl:col-span-3 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-semibold">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                Essential Cultural Knowledge
                <span className="ml-auto text-sm font-medium text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
                  Know Before You Go
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                    <h4 className="font-semibold text-teal-300 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                      Social Customs
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Greeting with two cheek kisses (la bise) is common among friends</li>
                      <li>• Maintain eye contact during conversations as a sign of respect</li>
                      <li>• "Bonjour" before any interaction, even in shops</li>
                      <li>• Dining starts late - lunch at 12:30, dinner after 8pm</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <h4 className="font-semibold text-amber-300 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                      Practical Etiquette
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Dress elegantly - casual wear is less common in cities</li>
                      <li>• Tipping 5-10% for good service, round up for cafés</li>
                      <li>• Speak softly in public transport and restaurants</li>
                      <li>• Always say "Au revoir" when leaving shops</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <h4 className="font-semibold text-purple-300 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      Cultural Timing
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Many shops close 12-2pm for lunch break</li>
                      <li>• Sundays: most stores closed, markets open mornings</li>
                      <li>• August: many restaurants/shops close for vacation</li>
                      <li>• Evening aperitif culture: 6-8pm social time</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-teal-300 mb-2">Local Wisdom</h4>
                <p className="text-muted-foreground text-sm italic">
                  "The French appreciate effort in speaking their language, even if imperfect. A simple 'Excusez-moi, parlez-vous anglais?' goes a long way in showing respect for local culture."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Currency Card */}
          <Card className="travis-card travis-interactive group">
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

          {/* Time Zone Card */}
          <Card className="travis-card travis-interactive group">
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
                  <div className="text-2xl font-bold text-blue-400">14:42</div>
                  <div className="text-xs text-muted-foreground font-mono">EST</div>
                </div>
                <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">{destination.toUpperCase()}</div>
                  <div className="text-2xl font-bold text-blue-300">{mockData.time.current}</div>
                  <div className="text-xs text-muted-foreground font-mono">CET {mockData.time.offset}</div>
                </div>
              </div>
              {mockData.time.dst && (
                <div className="flex items-center justify-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Mountain className="w-4 h-4 mr-2 text-amber-400" />
                  <span className="text-sm text-amber-400 font-medium">Daylight Saving Active</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                Weather Intel
                <Umbrella className="w-4 h-4 ml-auto text-orange-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="text-4xl font-bold text-orange-400 mb-2">{mockData.weather.temp}°C</div>
                <div className="text-lg text-muted-foreground mb-2">{mockData.weather.condition}</div>
                <div className="text-sm text-muted-foreground">Humidity: {mockData.weather.humidity}%</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { day: 'Tomorrow', temp: '25°C' },
                  { day: 'Thu', temp: '23°C' },
                  { day: 'Fri', temp: '27°C' }
                ].map((forecast, idx) => (
                  <div key={idx} className="text-center p-3 bg-secondary/30 rounded-xl">
                    <div className="font-medium text-sm">{forecast.day}</div>
                    <div className="text-orange-400 font-semibold">{forecast.temp}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Heat Map */}
          <AccommodationHeatMap />

          {/* Keep existing cards with minimal changes */}
          {/* Airport Info Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-3">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                Airport Information
                <Umbrella className="w-4 h-4 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
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
                <p><span className="font-medium">Travel time:</span> 35-45 minutes</p>
                <p><span className="font-medium">Transportation:</span> Train, Bus, Taxi</p>
              </div>
            </CardContent>
          </Card>

          {/* Transportation Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-3">
                  <Car className="w-5 h-5 text-white" />
                </div>
                Transportation
                <Umbrella className="w-4 h-4 ml-auto text-indigo-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                  <div className="font-medium text-indigo-700">Uber</div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                  <div className="font-medium text-indigo-700">Metro</div>
                  <div className="text-xs text-muted-foreground">Extensive</div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Local taxi:</span> +33 1 45 30 30 30</p>
                <p><span className="font-medium">Metro day pass:</span> €7.50</p>
                <p><span className="font-medium">Bike sharing:</span> Vélib' available</p>
              </div>
            </CardContent>
          </Card>

          {/* Visa & Entry Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Visa & Entry Requirements
                <Umbrella className="w-4 h-4 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-green-700 font-medium">✓ Visa-free entry</div>
                <div className="text-xs text-muted-foreground">For US passport holders</div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Max stay:</span> 90 days</p>
                <p><span className="font-medium">Passport validity:</span> 6+ months</p>
                <p><span className="font-medium">Required docs:</span> Return ticket</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Full Requirements
              </Button>
            </CardContent>
          </Card>

          {/* Cultural Insights Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                Cultural Insights
                <Umbrella className="w-4 h-4 ml-auto text-teal-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                    <h4 className="font-medium text-teal-700 mb-2">Etiquette Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Greeting with cheek kisses is common</li>
                      <li>• Dress modestly when visiting churches</li>
                      <li>• Tipping 10-15% at restaurants</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                    <h4 className="font-medium text-teal-700 mb-2">Upcoming Holidays</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Bastille Day - July 14</li>
                      <li>• Assumption Day - August 15</li>
                      <li>• All Saints' Day - November 1</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Info Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Emergency Information
                <Umbrella className="w-4 h-4 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700">{mockData.emergency.police}</div>
                  <div className="text-xs text-muted-foreground">Police</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700">{mockData.emergency.fire}</div>
                  <div className="text-xs text-muted-foreground">Fire</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700">{mockData.emergency.medical}</div>
                  <div className="text-xs text-muted-foreground">Medical</div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">US Embassy:</span> +33 1 43 12 22 22</p>
                <p><span className="font-medium">Tourist Police:</span> +33 1 53 71 53 71</p>
              </div>
            </CardContent>
          </Card>

          {/* Connectivity Card */}
          <Card className="travis-card travis-interactive group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                Connectivity & ATMs
                <Umbrella className="w-4 h-4 ml-auto text-teal-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <h4 className="font-medium text-cyan-700 mb-2">Free Wi-Fi Spots</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All major cafés and restaurants</li>
                  <li>• Metro stations and airports</li>
                  <li>• Public libraries and parks</li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">ATM Locations:</p>
                <p className="text-muted-foreground">Widely available. Major banks: BNP Paribas, Crédit Agricole, Société Générale</p>
              </div>
            </CardContent>
          </Card>

          {/* Intelligence Widget */}
          <Card className="travis-card lg:col-span-2 xl:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                Intelligence
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
