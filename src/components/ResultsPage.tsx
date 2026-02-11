import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Pin, Globe, Search, MapPin, Clock, DollarSign, Plane, Sun, Cloud, Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
import { useMapboxGeocoding, SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { usePinnedLocations, PinnedLocation } from '@/hooks/usePinnedLocations';
import {
  getMockWeather,
  getMockCurrency,
  getMockTimezone,
  getMockVisa,
  getMockHolidays,
  getMockTransport,
} from '@/utils/mockData';

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
  const destination = placeDetails?.formatted_address || placeDetails?.name || 'Unknown Destination';
  const destinationName = placeDetails?.name || destination.split(',')[0];

  const { pinnedLocations, pinLocation, unpinLocation, isPinned, toSelectedPlace } = usePinnedLocations();
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  // Get mock data
  const weather = getMockWeather(destination);
  const currency = getMockCurrency(destination);
  const timezone = getMockTimezone(destination);
  const visa = getMockVisa(destination);
  const holidays = getMockHolidays(destination, dates);
  const transport = getMockTransport(destination);

  const tripDuration = differenceInDays(new Date(dates.checkout), new Date(dates.checkin));

  // Mapbox suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions } = useMapboxGeocoding(
    newDestination,
    showSuggestions && newDestination.length >= 2
  );

  // Scroll handler for header minimization
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        setIsHeaderMinimized(true);
      } else if (currentScrollY < lastScrollY.current - 20 || currentScrollY < 50) {
        setIsHeaderMinimized(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNewDestination(destination);
  }, [destination]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newDestination && newCheckinDate && newCheckoutDate) {
      const newPlaceDetails: SelectedPlace = {
        name: newDestination,
        formatted_address: newDestination,
        latitude: 0,
        longitude: 0,
        place_id: `search_${Date.now()}`
      };
      onNewSearch(newPlaceDetails, {
        checkin: format(newCheckinDate, 'yyyy-MM-dd'),
        checkout: format(newCheckoutDate, 'yyyy-MM-dd')
      }, true);
      setShowSuggestions(false);
    }
  };

  const handleDestinationSelect = (suggestion: any) => {
    setNewDestination(suggestion.place_name);
    setShowSuggestions(false);
  };

  const handlePinnedLocationClick = (pinnedLocation: PinnedLocation) => {
    const selectedPlace = toSelectedPlace(pinnedLocation);
    onNewSearch(selectedPlace, dates, true);
  };

  const handleTogglePin = () => {
    if (placeDetails) {
      if (isPinned(placeDetails)) {
        const pinnedLocation = pinnedLocations.find(p =>
          p.formatted_address === placeDetails.formatted_address ||
          (p.place_id && placeDetails.place_id && p.place_id === placeDetails.place_id)
        );
        if (pinnedLocation) {
          unpinLocation(pinnedLocation.id);
        }
      } else {
        pinLocation(placeDetails);
      }
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return <Umbrella className="w-5 h-5" />;
    if (lower.includes('cloud')) return <Cloud className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ${isHeaderMinimized ? 'py-2' : 'py-4'}`}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className={`transition-all duration-300 ${isHeaderMinimized ? 'hidden' : 'block'}`}>
                <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  {destinationName}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTogglePin}
                    className={`h-8 w-8 rounded-full ${placeDetails && isPinned(placeDetails) ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Pin className={`w-4 h-4 ${placeDetails && isPinned(placeDetails) ? 'fill-current' : ''}`} />
                  </Button>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(dates.checkin), 'MMM d')} - {format(new Date(dates.checkout), 'MMM d, yyyy')} ({tripDuration} days)
                </p>
              </div>

              {/* Minimized title */}
              <div className={`transition-all duration-300 ${isHeaderMinimized ? 'block' : 'hidden'}`}>
                <span className="font-medium text-foreground">{destinationName}</span>
                <span className="text-muted-foreground mx-2">|</span>
                <span className="text-sm text-muted-foreground">{tripDuration} days</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={`search-bar p-1.5 transition-all duration-300 ${isHeaderMinimized ? 'max-w-xl' : 'max-w-full'}`}>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search destination..."
                  value={newDestination}
                  onChange={(e) => {
                    setNewDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(newDestination.length >= 2)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-9 h-10 bg-transparent border-0 text-sm"
                />

                {showSuggestions && mapboxSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {mapboxSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDestinationSelect(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-secondary/50 transition-colors text-sm"
                      >
                        <div className="font-medium truncate">{suggestion.text}</div>
                        <div className="text-xs text-muted-foreground truncate">{suggestion.place_name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-1 transition-all duration-300 ${isHeaderMinimized ? 'hidden md:flex' : 'flex'}`}>
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-10 px-3 text-sm font-normal">
                      <Calendar className="w-4 h-4 mr-1.5 text-muted-foreground" />
                      {format(newCheckinDate, 'MMM d')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={newCheckinDate}
                      onSelect={(date) => {
                        if (date) {
                          setNewCheckinDate(date);
                          setCheckinOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">-</span>

                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-10 px-3 text-sm font-normal">
                      {format(newCheckoutDate, 'MMM d')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={newCheckoutDate}
                      onSelect={(date) => {
                        if (date) {
                          setNewCheckoutDate(date);
                          setCheckoutOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-primary">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Pinned Locations */}
          {pinnedLocations.length > 0 && !isHeaderMinimized && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              <span className="text-xs text-muted-foreground shrink-0">Saved:</span>
              {pinnedLocations.slice(0, 4).map((location) => (
                <button
                  key={location.id}
                  onClick={() => handlePinnedLocationClick(location)}
                  className="pill-button text-xs py-1 shrink-0"
                >
                  {location.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Image Placeholder */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/20 to-primary/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Destination photos loading...</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="font-semibold text-foreground">{destinationName}</p>
            <p className="text-sm text-muted-foreground">{destination}</p>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Weather Widget */}
          <div className="widget-card lg:col-span-2 animate-slide-up">
            <div className="widget-header">
              <div className="widget-icon bg-amber-500/10 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Weather</h3>
                <p className="widget-subtitle">Current conditions & forecast</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="widget-value">{weather.current.temp}°C</p>
                <p className="text-sm text-muted-foreground">{weather.current.condition}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Feels like {weather.current.feelsLike}°C</p>
                <p>Humidity {weather.current.humidity}%</p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {weather.forecast.slice(0, 7).map((day, i) => (
                <div key={i} className="flex-shrink-0 text-center p-3 rounded-xl bg-secondary/30 min-w-[70px]">
                  <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                  <div className="text-amber-500 mb-1">{getWeatherIcon(day.condition)}</div>
                  <p className="text-sm font-medium">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                </div>
              ))}
            </div>
          </div>

          {/* Time Zone Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-blue-500/10 text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Local Time</h3>
                <p className="widget-subtitle">{timezone.timezone}</p>
              </div>
            </div>

            <p className="widget-value mb-2">{timezone.currentTime}</p>
            <p className="text-sm text-muted-foreground">{timezone.offset}</p>
          </div>

          {/* Currency Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-green-500/10 text-green-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Currency</h3>
                <p className="widget-subtitle">USD to {currency.toCurrency}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <p className="widget-value">{currency.toSymbol}{currency.rate.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">= $1</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">$10</p>
                <p className="font-medium">{currency.toSymbol}{(10 * currency.rate).toFixed(0)}</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/30">
                <p className="text-muted-foreground">$100</p>
                <p className="font-medium">{currency.toSymbol}{(100 * currency.rate).toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Visa Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="widget-header">
              <div className={`widget-icon ${visa.required ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Visa Requirements</h3>
                <p className="widget-subtitle">For US citizens</p>
              </div>
            </div>

            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${visa.required ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
              {visa.required ? 'Visa Required' : 'Visa Free'}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{visa.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Stay</span>
                <span className="font-medium">{visa.maxStay}</span>
              </div>
              {visa.required && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Cost</span>
                  <span className="font-medium">{visa.cost}</span>
                </div>
              )}
            </div>
          </div>

          {/* Holidays Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-purple-500/10 text-purple-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Local Holidays</h3>
                <p className="widget-subtitle">During your trip</p>
              </div>
            </div>

            {holidays.holidays.length > 0 ? (
              <div className="space-y-3">
                {holidays.holidays.map((holiday, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-xs text-muted-foreground">{holiday.type}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(holiday.date), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No major holidays during your trip dates.</p>
            )}
          </div>

          {/* Transport Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-cyan-500/10 text-cyan-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Transportation</h3>
                <p className="widget-subtitle">Getting around</p>
              </div>
            </div>

            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${transport.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {transport.available ? 'Ride-share Available' : 'Limited Options'}
            </div>

            <div className="space-y-2">
              {transport.services.map((service, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm">
                  <span className="font-medium">{service.name}</span>
                  <div className="text-right">
                    <p className="text-muted-foreground">{service.estimatedPrice}</p>
                    <p className="text-xs text-muted-foreground">{service.estimatedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Data shown is for demonstration purposes. Connect APIs for live information.</p>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
