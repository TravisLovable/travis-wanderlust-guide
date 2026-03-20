import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Calendar, Pin, Search, MapPin, Pencil, X } from 'lucide-react';
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
import { useTravelContext, COUNTRIES } from '@/contexts/TravelContext';

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
  const { passport, origin, setPassport, setOrigin } = useTravelContext();
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [editPassport, setEditPassport] = useState(passport);
  const [editOrigin, setEditOrigin] = useState(origin);
  const [updateConfirmed, setUpdateConfirmed] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<{ place_name: string }[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const originDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOriginSuggestions = (query: string) => {
    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);
    if (query.length < 2) { setOriginSuggestions([]); return; }
    originDebounceRef.current = setTimeout(async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=place,country,region&limit=5&access_token=${token}`
        );
        const data = await res.json();
        setOriginSuggestions(data.features || []);
        setShowOriginSuggestions(true);
      } catch {
        setOriginSuggestions([]);
      }
    }, 250);
  };

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
  const scrollTick = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const effectiveMinimized = isHeaderMinimized && !isMobile;
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

  // Scroll handler for header minimization: desktop only (disabled on mobile to avoid touch-scroll flicker)
  const MOBILE_BREAKPOINT = 768;
  useEffect(() => {
    const MIN_SCROLL_TO_MINIMIZE = 120;
    const SCROLL_UP_DELTA_TO_EXPAND = 50;
    const SCROLL_TOP_TO_EXPAND = 60;

    const updateMinimized = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        if (isHeaderMinimizedRef.current) {
          isHeaderMinimizedRef.current = false;
          setIsHeaderMinimized(false);
        }
        scrollTick.current = null;
        return;
      }

      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollY.current;
      const scrollingDown = currentScrollY > prevScrollY;
      lastScrollY.current = currentScrollY;

      const shouldMinimize = currentScrollY > MIN_SCROLL_TO_MINIMIZE && scrollingDown;
      const scrollUpDelta = prevScrollY - currentScrollY;
      const shouldExpand = scrollUpDelta > SCROLL_UP_DELTA_TO_EXPAND || currentScrollY < SCROLL_TOP_TO_EXPAND;

      const nextMinimized = shouldExpand ? false : shouldMinimize ? true : isHeaderMinimizedRef.current;
      if (nextMinimized !== isHeaderMinimizedRef.current) {
        isHeaderMinimizedRef.current = nextMinimized;
        setIsHeaderMinimized(nextMinimized);
      }
      scrollTick.current = null;
    };

    const handleScroll = () => {
      if (scrollTick.current == null) {
        scrollTick.current = requestAnimationFrame(updateMinimized);
      }
    };

    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile && isHeaderMinimizedRef.current) {
        isHeaderMinimizedRef.current = false;
        setIsHeaderMinimized(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (scrollTick.current != null) cancelAnimationFrame(scrollTick.current);
    };
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
        <header
          className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/60 transition-[padding] duration-300 ${effectiveMinimized ? 'py-1.5' : 'py-3'}`}
          style={{ contain: 'layout style' }}
        >
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

                <div className={`transition-all duration-300 ${effectiveMinimized ? 'hidden' : 'block'}`}>
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
                  <button
                    onClick={() => { setEditPassport(passport); setEditOrigin(origin); setOriginQuery(''); setShowOriginSuggestions(false); setTravelModalOpen(true); }}
                    className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors mt-0.5 flex items-center gap-1"
                  >
                    {origin ? `From ${origin}` : 'Set origin'} · {passport} passport
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Travel context modal */}
                {travelModalOpen && createPortal(
                  <div
                    className="fixed inset-0 flex items-center justify-center"
                    style={{ zIndex: 99999, background: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setTravelModalOpen(false)}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: 340,
                        background: '#121215',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                        padding: '24px',
                      }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[15px] font-medium text-foreground">Travel details</h3>
                        <button onClick={() => setTravelModalOpen(false)} className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] text-muted-foreground/40 tracking-wide block mb-1.5">Passport</label>
                          <select
                            value={editPassport}
                            onChange={(e) => setEditPassport(e.target.value)}
                            className="w-full text-[13px] text-foreground/90 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 outline-none focus:border-white/[0.12] transition-colors"
                          >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div className="relative">
                          <label className="text-[11px] text-muted-foreground/40 tracking-wide block mb-1.5">Traveling from</label>
                          <input
                            type="text"
                            value={originQuery || editOrigin}
                            onChange={(e) => {
                              setOriginQuery(e.target.value);
                              setEditOrigin(e.target.value);
                              fetchOriginSuggestions(e.target.value);
                            }}
                            onFocus={() => { if (originSuggestions.length > 0) setShowOriginSuggestions(true); }}
                            placeholder="City or country"
                            className="w-full text-[13px] text-foreground/90 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 outline-none focus:border-white/[0.12] transition-colors placeholder:text-muted-foreground/25"
                          />
                          {showOriginSuggestions && originSuggestions.length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: 4,
                                background: '#1a1a1f',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 10,
                                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                                overflow: 'hidden',
                                zIndex: 10,
                              }}
                            >
                              {originSuggestions.map((s, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setEditOrigin(s.place_name);
                                    setOriginQuery('');
                                    setShowOriginSuggestions(false);
                                    setOriginSuggestions([]);
                                  }}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    color: 'rgba(255,255,255,0.7)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 100ms, color 100ms',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                >
                                  {s.place_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        disabled={updateConfirmed}
                        onClick={() => {
                          setUpdateConfirmed(true);
                          // Brief loading phase, then confirm
                          setTimeout(() => {
                            setPassport(editPassport);
                            setOrigin(editOrigin);
                            setWidgetKey(k => k + 1);
                          }, 600);
                          setTimeout(() => {
                            setUpdateConfirmed(false);
                            setTravelModalOpen(false);
                          }, 1400);
                        }}
                        className={`w-full mt-5 text-[13px] font-medium rounded-lg py-2.5 transition-all duration-300 flex items-center justify-center gap-2 ${
                          updateConfirmed
                            ? 'bg-emerald-500 text-white'
                            : 'text-background bg-foreground/90 hover:bg-foreground'
                        }`}
                      >
                        {updateConfirmed ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Updating...
                          </>
                        ) : 'Update'}
                      </button>

                      <p className="text-[10px] text-muted-foreground/25 text-center mt-3">
                        Requirements based on {editPassport} passport traveling from {editOrigin || 'your location'}
                      </p>
                    </div>
                  </div>,
                  document.body
                )}

                {/* Minimized title */}
                <div className={`transition-all duration-300 flex items-center ${effectiveMinimized ? 'flex' : 'hidden'}`}>
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

                <div className={`flex items-center gap-1 transition-all duration-300 ${effectiveMinimized ? 'hidden md:flex' : 'flex'}`}>
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
            {pinnedLocations.length > 0 && !effectiveMinimized && (
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
          <div key={widgetKey} className="grid grid-cols-1 md:grid-cols-2 gap-3">

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
                <VisaContainer placeDetails={placeDetails} passport={passport} />
                <InsightLine insight={insights?.visa} loading={insightsLoading} />
              </div>
              <HealthEntryCard destination={destination} passport={passport} animationDelay="0.16s" />
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
