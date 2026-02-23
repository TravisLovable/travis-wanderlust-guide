import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Calendar, Pin, Search, MapPin, Clock, DollarSign, Plane, Sun, Cloud, CloudRain, Sunrise, Sunset } from 'lucide-react';
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
import {
  getMockWeather,
  getMockCurrency,
  getMockTimezone,
  getMockSunData,
  getMockVisa,
  getMockHolidays,
  getMockTransport,
} from '@/utils/mockData';
import LocalEventsCard from '@/components/LocalEventsCard';
import WaterSafetyWidget from '@/components/WaterSafetyWidget';
import PowerAdaptorWidget from '@/components/PowerAdaptorWidget';
import UVIndexCard from '@/components/UVIndexCard';
import HealthEntryCard from '@/components/HealthEntryCard';
import PharmacyIntelCard from '@/components/PharmacyIntelCard';
import { CulturalContainer } from '@/components/widgets';
import { InsightLine } from '@/components/InsightLine';
import { InsightsProvider } from '@/contexts/InsightsContext';
import { useTravisInsights } from '@/hooks/useTravisInsights';
import { useTripWindow } from '@/hooks/useTripWindow';
import { toLocalMidnight, formatDateOnlyLocal } from '@/lib/dates';

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
  const [useFahrenheit, setUseFahrenheit] = useState(true);
  const [sunRevealed, setSunRevealed] = useState(false);

  const t = (c: number) => useFahrenheit ? Math.round(c * 9 / 5 + 32) : c;
  const unit = useFahrenheit ? '°F' : '°C';

  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  // Get mock data (memoized to prevent re-randomizing on every keystroke re-render)
  const weather = useMemo(() => getMockWeather(destination), [destination]);
  const currency = useMemo(() => getMockCurrency(destination), [destination]);
  const timezone = useMemo(() => getMockTimezone(destination), [destination]);
  const sunData = useMemo(() => getMockSunData(destination), [destination]);
  const visa = useMemo(() => getMockVisa(destination), [destination]);
  const holidays = useMemo(() => getMockHolidays(destination, dates), [destination, dates]);
  const transport = useMemo(() => getMockTransport(destination), [destination]);

  const tripDuration = differenceInDays(toLocalMidnight(dates.checkout), toLocalMidnight(dates.checkin));
  const tripWindow = useTripWindow(dates.checkin, dates.checkout);

  // Travis AI insights
  const widgetData = useMemo(() => ({
    weather: { current: weather.current, forecastDays: weather.forecast.length },
    currency: { toCurrency: currency.toCurrency, rate: currency.rate },
    timezone: { timezone: timezone.timezone, offset: timezone.offset },
    visa: { required: visa.required, type: visa.type, maxStay: visa.maxStay },
    holidays: holidays.holidays.map(h => h.name),
    transport: { available: transport.available, services: transport.services.map(s => s.name) },
  }), [weather, currency, timezone, visa, holidays, transport]);

  const { insights, loading: insightsLoading, error: insightsError } = useTravisInsights({
    destination: {
      city: destinationName,
      country: countryName || '',
      lat: placeDetails?.latitude || 0,
      lng: placeDetails?.longitude || 0,
    },
    dates: { start: dates.checkin, end: dates.checkout },
    widgetData,
    enabled: !!destinationName,
  });

  // Temp ranges — ONLY for Option B (trips outside the 14-day forecast window)
  const tempRanges = (() => {
    if (tripWindow.isTripWithin14DayForecastWindow || weather.forecast.length === 0) return null;
    const highs = weather.forecast.map(d => d.high);
    const lows = weather.forecast.map(d => d.low);
    return {
      highMin: Math.min(...highs),
      highMax: Math.max(...highs),
      lowMin: Math.min(...lows),
      lowMax: Math.max(...lows),
    };
  })();

  // Google Places suggestions
  const { suggestions: placeSuggestions, isLoading: isLoadingSuggestions, hasApiAccess, getPlaceDetails } = useGooglePlaces(
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

  // Sync date picker state when URL params change (e.g. after new search navigation)
  useEffect(() => {
    setNewCheckinDate(toLocalMidnight(dates.checkin));
    setNewCheckoutDate(toLocalMidnight(dates.checkout));
  }, [dates.checkin, dates.checkout]);

  // Sun position reveal animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setSunRevealed(true), 150);
    return () => clearTimeout(timer);
  }, []);

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

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    const cls = "w-[18px] h-[18px] stroke-[1.6]";
    if (lower.includes('rain')) return <CloudRain className={`${cls} text-[#5B7A99]`} />;
    if (lower.includes('cloud')) return <Cloud className={`${cls} text-[#6B7280]`} />;
    return <Sun className={`${cls} text-[#D97706]`} />;
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

          {/* ROW 1 — ENVIRONMENTAL CONTEXT */}

          {/* Weather Widget */}
          <div className="widget-card animate-slide-up">
            <div className="widget-header">
              <div className="widget-icon bg-amber-500/10 text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="widget-title">Weather Intel</h3>
                <p className="widget-subtitle">During your trip</p>
              </div>
              <div className="flex items-center bg-secondary/60 rounded-full p-0.5">
                <button
                  onClick={() => setUseFahrenheit(true)}
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 transition-all ${useFahrenheit ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  °F
                </button>
                <button
                  onClick={() => setUseFahrenheit(false)}
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 transition-all ${!useFahrenheit ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  °C
                </button>
              </div>
            </div>

            {tripWindow.isTripWithin14DayForecastWindow ? (
              /* ── OPTION A: Within 14-day window ── Today ALWAYS + forecast strip */
              <>
                {/* Today section — ALWAYS rendered in Option A; "Today" label only when today is inside the trip */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="widget-value">
                      {t(weather.current.temp)}{unit}
                      {tripWindow.isTodayWithinTrip && (
                        <span className="text-sm font-normal text-muted-foreground/[0.62] ml-1.5">· Today</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{weather.current.condition}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground/[0.62]">
                    <p>Feels like {t(weather.current.feelsLike)}{unit}</p>
                    <p>Humidity {weather.current.humidity}%</p>
                  </div>
                </div>

                {/* Forecast strip */}
                <div className="relative">
                  <div
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide forecast-scroll"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
                      if (atEnd) el.setAttribute('data-scrolled-end', '');
                      else el.removeAttribute('data-scrolled-end');
                    }}
                  >
                    {weather.forecast.map((day, i) => (
                      <div key={i} className="flex-shrink-0 text-center p-2.5 rounded-xl bg-secondary/30 w-[calc((100%-12*0.5rem)/7)] min-w-[58px]">
                        <p className="text-[11px] text-muted-foreground/[0.62] mb-0.5">{day.day}</p>
                        <div className="mb-0.5">{getWeatherIcon(day.condition)}</div>
                        <p className="text-sm font-medium">{t(day.high)}°</p>
                        <p className="text-xs text-muted-foreground/[0.62]">{t(day.low)}°</p>
                      </div>
                    ))}
                  </div>
                  <div className="forecast-fade pointer-events-none" />
                </div>
              </>
            ) : (
              /* ── OPTION B: Beyond 14-day window ── Ranges only, NO forecast, NO Today */
              <div className="flex items-center justify-between">
                <div>
                  {tempRanges && (
                    <>
                      <p className="widget-value">
                        {t(tempRanges.highMin) === t(tempRanges.highMax)
                          ? `${t(tempRanges.highMin)}${unit}`
                          : `${t(tempRanges.highMin)}-${t(tempRanges.highMax)}${unit}`}
                      </p>
                      <p className="text-xs text-muted-foreground/[0.62]">
                        {t(tempRanges.lowMin) === t(tempRanges.lowMax)
                          ? `${t(tempRanges.lowMin)}${unit}`
                          : `${t(tempRanges.lowMin)}-${t(tempRanges.lowMax)}${unit}`}
                      </p>
                      <p className="text-xs text-muted-foreground/[0.62] mt-1">Historical averages for your travel dates</p>
                    </>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground/[0.62]">
                  <p>Humidity {weather.current.humidity}%</p>
                </div>
              </div>
            )}

            <InsightLine insight={insights?.weather} loading={insightsLoading} />
          </div>

          {/* Local Time Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.08s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-blue-500/10 text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Local Time</h3>
                <p className="widget-subtitle">{timezone.timezone}</p>
              </div>
            </div>

            <p className="widget-value mb-1">{timezone.currentTime}</p>
            <p className="text-xs text-muted-foreground/[0.62]">{timezone.offset}</p>

            {/* Sunrise / Sunset — shallow arc */}
            {(() => {
              const { sunriseHour, sunsetHour, currentHour } = sunData;
              const isDaytime = currentHour >= sunriseHour && currentHour <= sunsetHour;
              const rawPos = sunsetHour > sunriseHour
                ? (currentHour - sunriseHour) / (sunsetHour - sunriseHour)
                : 0.5;
              const p = Math.max(0, Math.min(1, rawPos));

              // Shallow arc: viewBox 0 0 100 20, quadratic bezier from (6,18) peak (50,2) to (94,18)
              const sx = 6, sy = 18, cx = 50, cy = 2, ex = 94, ey = 18;
              const t = p;
              const arcX = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
              const arcY = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey;
              const leftPct = arcX;
              const topPct = (arcY / 20) * 100;
              const startLeft = sx;
              const startTop = (sy / 20) * 100;

              return (
                <div className="border-t border-border/30 mt-3.5 pt-3">
                  <div className="relative">
                    <svg viewBox="0 0 100 20" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={`M ${sx},${sy} Q ${cx},${cy} ${ex},${ey}`}
                        stroke="hsl(var(--muted-foreground) / 0.12)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <div
                      className={`sun-indicator absolute w-2.5 h-2.5 rounded-full ${isDaytime ? 'bg-amber-400 sun-glow-pulse' : 'bg-muted-foreground/30'}`}
                      style={{
                        left: sunRevealed ? `${leftPct}%` : `${startLeft}%`,
                        top: sunRevealed ? `${topPct}%` : `${startTop}%`,
                        opacity: sunRevealed ? 1 : 0,
                        transform: 'translate(-50%, -50%)',
                        transition: 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1), top 1.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-out',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      <Sunrise className="w-3 h-3 text-amber-500" />{sunData.sunrise}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      {sunData.sunset}<Sunset className="w-3 h-3 text-orange-600" />
                    </span>
                  </div>
                </div>
              );
            })()}
            <InsightLine insight={insights?.localTime} loading={insightsLoading} />
          </div>

          {/* ROW 2 — TRIP GATE / COMPLIANCE */}

          {/* Visa + Health Entry — stacked vertically, rows match utility grid */}
          <div className="grid grid-rows-2 gap-3">
            {/* Visa Widget */}
            <div className="widget-card animate-slide-up" style={{ animationDelay: '0.14s' }}>
              <div className="widget-header">
                <div className={`widget-icon ${visa.required ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="widget-title">Visa Requirements</h3>
                  <p className="widget-subtitle">For US citizens</p>
                </div>
              </div>

              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${visa.required ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                {visa.required ? 'Visa Required' : 'Visa Free'}
              </div>

              <div className="space-y-1.5 text-sm">
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
              <InsightLine insight={insights?.visa} loading={insightsLoading} />
            </div>

            {/* Health Entry Widget */}
            <HealthEntryCard destination={destination} animationDelay="0.16s" />
          </div>

          {/* Utility 2×2 — Water Safety, UV Index, Pharmacy Intel, Power Adaptor */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <WaterSafetyWidget placeDetails={placeDetails} animationDelay="0.18s" />
            <UVIndexCard placeDetails={placeDetails} animationDelay="0.2s" />
            <PharmacyIntelCard placeDetails={placeDetails} animationDelay="0.22s" />
            <PowerAdaptorWidget placeDetails={placeDetails} animationDelay="0.24s" />
          </div>

          {/* ROW 3 — ECONOMICS + EXECUTION */}

          {/* Currency Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-green-500/10 text-green-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Currency</h3>
                <p className="widget-subtitle">USD to {currency.toCurrency}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <p className="widget-value">{currency.toSymbol}{currency.rate.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground/[0.62]">= $1</p>
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
            <InsightLine insight={insights?.currency} loading={insightsLoading} />
          </div>

          {/* Transportation Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.26s' }}>
            <div className="widget-header">
              <div className="widget-icon bg-cyan-500/10 text-cyan-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="widget-title">Transportation</h3>
                <p className="widget-subtitle">Getting around</p>
              </div>
            </div>

            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${transport.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {transport.available ? 'Ride-share Available' : 'Limited Options'}
            </div>

            <div className="space-y-1.5">
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
            <InsightLine insight={insights?.transportation} loading={insightsLoading} />
          </div>

          {/* ROW 4 — CONTEXTUAL SIGNALS */}

          {/* Local Holidays Widget */}
          <div className="widget-card animate-slide-up" style={{ animationDelay: '0.32s' }}>
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
              <div className="space-y-2">
                {holidays.holidays.map((holiday, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-xs text-muted-foreground">{holiday.type}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(toLocalMidnight(holiday.date), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No major holidays during your trip dates.</p>
            )}
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
          <p>Data shown is for demonstration purposes. Connect APIs for live information.</p>
        </div>
      </main>
    </div>
    </InsightsProvider>
  );
};

export default ResultsPage;
