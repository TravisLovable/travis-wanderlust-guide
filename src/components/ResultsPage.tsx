import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Pin, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { usePinnedLocations, PinnedLocation } from '@/hooks/usePinnedLocations';
import LocalEventsCard from '@/components/LocalEventsCard';
import WaterSafetyWidget from '@/components/WaterSafetyWidget';
import PowerAdaptorWidget from '@/components/PowerAdaptorWidget';
import UVIndexCard from '@/components/UVIndexCard';
import HealthEntryCard from '@/components/HealthEntryCard';
import PharmacyIntelCard from '@/components/PharmacyIntelCard';
import {
  CulturalContainer,
  // WeatherContainer, // current implementation (commented out – client's WeatherWidget used below)
  TimeZoneContainer,
  CurrencyContainer,
  VisaContainer,
  HolidayContainer,
  UberAvailabilityWidget,
} from '@/components/widgets';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import WeatherContainer from '@/components/widgets/containers/WeatherContainer';
import type { Destination } from '@/types/destination';
import { InsightLine } from '@/components/InsightLine';
import { InsightsProvider } from '@/contexts/InsightsContext';
import { useTravisInsights } from '@/hooks/useTravisInsights';
import WeatherIntelWidget from '@/components/WeatherIntelWidget';
import { toLocalMidnight } from '@/lib/dates';

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
  const countryName = destination.includes(',') ? destination.split(',').pop()!.trim() : null;
  const countryCode = placeDetails?.country_code?.toUpperCase() || null;
  const flagUrl = countryCode ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` : null;

  const { pinnedLocations, pinLocation, unpinLocation, isPinned, toSelectedPlace } = usePinnedLocations();
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(toLocalMidnight(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(toLocalMidnight(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);
  const isHeaderMinimizedRef = useRef(false);
  isHeaderMinimizedRef.current = isHeaderMinimized;

  // Client's weather widget expects a Destination (kept for commented implementation)
  const weatherDestination: Destination = {
    id: placeDetails?.place_id ?? 'dest',
    displayName: destinationName || destination,
    shortName: destinationName || destination.split(',')[0] || 'Destination',
    fullName: destination,
    addressComponents: { country: countryName ?? undefined, countryCode: countryCode ?? undefined },
    source: { type: 'geocoded' },
    createdAt: new Date(),
  };

  const tripDuration = differenceInDays(toLocalMidnight(dates.checkout), toLocalMidnight(dates.checkin));

  // Travis AI insights (widgetData left empty; widgets fetch their own data)
  const { insights, loading: insightsLoading, error: insightsError } = useTravisInsights({
    destination: {
      city: destinationName,
      country: countryName || '',
      lat: placeDetails?.latitude || 0,
      lng: placeDetails?.longitude || 0,
    },
    dates: { start: dates.checkin, end: dates.checkout },
    widgetData: {},
    enabled: !!destinationName,
  });

  // Google Places suggestions
  const { suggestions: placeSuggestions, isLoading: isLoadingSuggestions, hasApiAccess, getPlaceDetails } = useGooglePlaces(
    newDestination,
    showSuggestions && newDestination.length >= 2
  );

  // Scroll handler for header minimization (only setState when value changes to avoid layout→scroll→state loop)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      const shouldMinimize = currentScrollY > 100 && scrollingDown;
      const shouldExpand = currentScrollY < lastScrollY.current - 20 || currentScrollY < 50;
      lastScrollY.current = currentScrollY;

      const nextMinimized = shouldExpand ? false : shouldMinimize ? true : isHeaderMinimizedRef.current;
      if (nextMinimized !== isHeaderMinimizedRef.current) {
        isHeaderMinimizedRef.current = nextMinimized;
        setIsHeaderMinimized(nextMinimized);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNewDestination(destination);
  }, [destination]);

  // Sync date picker state when URL params change (e.g. after new search navigation)
  useEffect(() => {
    setNewCheckinDate(toLocalMidnight(dates.checkin));
    setNewCheckoutDate(toLocalMidnight(dates.checkout));
  }, [dates.checkin, dates.checkout]);

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

  const handleDestinationSelect = async (suggestion: any) => {
    setNewDestination(suggestion.description || suggestion.place_id);
    setShowSuggestions(false);

    if (suggestion.place_id) {
      const place = await getPlaceDetails(suggestion.place_id);
      if (place) {
        setNewDestination(place.formatted_address);
        onNewSearch(place, {
          checkin: format(newCheckinDate, 'yyyy-MM-dd'),
          checkout: format(newCheckoutDate, 'yyyy-MM-dd'),
        }, true);
      }
    }
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

  return (
    <InsightsProvider value={{ insights, loading: insightsLoading, error: insightsError }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/60 transition-all duration-300 ${isHeaderMinimized ? 'py-1.5' : 'py-3'}`}>
          <div className="max-w-6xl mx-auto px-4">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-2">
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
                  {insights?.greeting && (
                    <p className="text-sm text-muted-foreground/70 italic mb-0.5">{insights.greeting}</p>
                  )}
                  <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    {destinationName}{countryName && <>,<span className="font-normal text-muted-foreground"> {countryName}</span></>}
                    {flagUrl && (
                      <img
                        src={flagUrl}
                        alt=""
                        className="inline-block h-[17px] rounded-[2px] ml-0.5"
                        style={{ opacity: 0.55, outline: '1px solid hsl(var(--muted-foreground) / 0.4)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleTogglePin}
                      className={`h-8 w-8 rounded-full ${placeDetails && isPinned(placeDetails) ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <Pin className={`w-4 h-4 ${placeDetails && isPinned(placeDetails) ? 'fill-current' : ''}`} />
                    </Button>
                  </h1>
                  <p className="text-xs text-muted-foreground/80">
                    {format(toLocalMidnight(dates.checkin), 'MMM d')} - {format(toLocalMidnight(dates.checkout), 'MMM d, yyyy')} · {tripDuration} days
                  </p>
                </div>

                {/* Minimized title */}
                <div className={`transition-all duration-300 flex items-center ${isHeaderMinimized ? 'flex' : 'hidden'}`}>
                  <span className="font-medium text-foreground">{destinationName}{countryName && <>,<span className="font-normal text-muted-foreground"> {countryName}</span></>}</span>
                  {flagUrl && (
                    <img
                      src={flagUrl}
                      alt=""
                      className="inline-block h-[14px] rounded-[2px] ml-1.5"
                      style={{ opacity: 0.55, outline: '1px solid hsl(var(--muted-foreground) / 0.4)' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <span className="text-muted-foreground mx-2">|</span>
                  <span className="text-sm text-muted-foreground">{tripDuration} days</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-bar p-1.5">
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

                  {showSuggestions && newDestination.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                      {isLoadingSuggestions && hasApiAccess && (
                        <div className="p-3 text-center text-muted-foreground">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                        </div>
                      )}

                      {placeSuggestions.map((suggestion, index) => (
                        <button
                          key={`place-${index}`}
                          type="button"
                          onClick={() => handleDestinationSelect(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-secondary/50 transition-colors text-sm flex items-center gap-2"
                        >
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{suggestion.structured_formatting.main_text}</div>
                            <div className="text-xs text-muted-foreground truncate">{suggestion.structured_formatting.secondary_text}</div>
                          </div>
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

                <Button type="submit" size="icon" className="h-9 w-9 rounded-full bg-foreground/85 hover:bg-foreground/95 text-background shadow-none transition-colors duration-150">
                  <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
                </Button>
              </div>
            </form>

            {/* Pinned Locations */}
            {pinnedLocations.length > 0 && !isHeaderMinimized && (
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
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
        <main className="max-w-6xl mx-auto px-4 py-4">
          {/* Widgets Grid — Cognitive priority: Culture → Environment → Permission → Economics → Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* ROW 0 — CULTURAL CONTEXT (full width, collapsible) */}
            <CulturalContainer destination={destination} animationDelay="0.04s" />

            {/* ROW 1 — ENVIRONMENTAL CONTEXT (real data from Edge Functions) */}

            {/* Weather Widget — Open-Meteo historical for checkin–checkout dates when lat/lng present */}
            <WeatherIntelWidget
              destination={destination}
              dates={dates}
              latitude={placeDetails?.latitude}
              longitude={placeDetails?.longitude}
              insight={insights?.weather}
              insightLoading={insightsLoading}
            />

            {/* My implementation (commented out):
          <div className="animate-slide-up">
            <WeatherContainer placeDetails={placeDetails} />
            <InsightLine insight={insights?.weather} loading={insightsLoading} />
          </div>
          */}


            {/* Client's WeatherWidget (commented out):
          <div className="animate-slide-up">
            <WeatherWidget
              destination={weatherDestination}
              currentLocation="Current Location"
              tempUnit={tempUnit}
              onTempUnitToggle={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
            />
            <InsightLine insight={insights?.weather} loading={insightsLoading} />
          </div>
          */}

            <div className="animate-slide-up" style={{ animationDelay: '0.08s' }}>
              <TimeZoneContainer placeDetails={placeDetails} destination={destination} />
              <InsightLine insight={insights?.localTime} loading={insightsLoading} />
            </div>

            {/* ROW 2 — TRIP GATE / COMPLIANCE */}

            {/* Visa + Health Entry */}
            <div className="grid grid-rows-2 gap-3">
              <div className="animate-slide-up" style={{ animationDelay: '0.14s' }}>
                <VisaContainer placeDetails={placeDetails} />
                <InsightLine insight={insights?.visa} loading={insightsLoading} />
              </div>
              <HealthEntryCard destination={destination} animationDelay="0.16s" />
            </div>

            {/* Utility 2×2 — Water Safety, UV Index, Pharmacy Intel, Power Adaptor */}
            <div className="grid grid-cols-2 grid-rows-2 gap-3">
              <WaterSafetyWidget placeDetails={placeDetails} animationDelay="0.18s" />
              <UVIndexCard placeDetails={placeDetails} animationDelay="0.2s" />
              <PharmacyIntelCard placeDetails={placeDetails} animationDelay="0.22s" />
              <PowerAdaptorWidget placeDetails={placeDetails} animationDelay="0.24s" />
            </div>

            {/* ROW 3 — ECONOMICS + EXECUTION (real data from Edge Functions) */}

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CurrencyContainer placeDetails={placeDetails} />
              <InsightLine insight={insights?.currency} loading={insightsLoading} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.26s' }}>
              <UberAvailabilityWidget placeDetails={placeDetails} />
              <InsightLine insight={insights?.transportation} loading={insightsLoading} />
            </div>

            {/* ROW 4 — CONTEXTUAL SIGNALS */}

            <div className="animate-slide-up" style={{ animationDelay: '0.32s' }}>
              <HolidayContainer placeDetails={placeDetails} dates={dates} />
              <InsightLine insight={insights?.localHolidays} loading={insightsLoading} />
            </div>

            {/* Local Events Widget */}
            <LocalEventsCard
              destination={destination}
              startDate={dates.checkin}
              endDate={dates.checkout}
              animationDelay="0.38s"
            />

          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center text-xs text-muted-foreground/60">
            <p>Weather, currency, time zone, visa, holidays, and transport use live data from our APIs.</p>
          </div>
        </main>
      </div>
    </InsightsProvider>
  );
};

export default ResultsPage;
