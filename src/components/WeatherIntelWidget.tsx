import React, { useState, useMemo, useEffect } from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { getMockWeather } from '@/utils/mockData';
import { InsightLine } from '@/components/InsightLine';
import { supabase } from '@/integrations/supabase/client';
import { toLocalMidnight, todayLocal } from '@/lib/dates';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface WeatherDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
}

interface WeatherData {
  current: { temp: number; feelsLike: number; humidity: number; condition: string };
  forecast: WeatherDay[];
}

interface MonthSummary {
  month: string;
  avgHigh: number;
  avgLow: number;
  highRange: { min: number; max: number };
  lowRange: { min: number; max: number };
  conditionLabel: string;
}

interface HistoricalData {
  overall: {
    avgHigh: number;
    avgLow: number;
    highRange: { min: number; max: number };
    lowRange: { min: number; max: number };
    conditionLabel: string;
  };
  months: MonthSummary[];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return DAY_NAMES[d.getDay()];
}

function mockToWeatherData(mock: ReturnType<typeof getMockWeather>): WeatherData {
  return {
    current: {
      temp: mock.current.temp,
      feelsLike: mock.current.feelsLike,
      humidity: mock.current.humidity,
      condition: mock.current.condition,
    },
    forecast: mock.forecast.slice(0, 14).map((d) => ({
      date: d.date, day: d.day, high: d.high, low: d.low, condition: d.condition,
    })),
  };
}

function buildHistoricalDateRanges(checkin: string, checkout: string): { start: string; end: string }[] {
  const startDate = new Date(checkin);
  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ranges: { start: string; end: string }[] = [];

  // 7-day sample (1st–7th) for each of 12 months from last year
  const startMonth = startDate.getMonth();
  const lastYear = startDate.getFullYear() - 1;

  for (let i = 0; i < 12; i++) {
    const monthIdx = (startMonth + i) % 12;
    const year = (startMonth + i) >= 12 ? lastYear + 1 : lastYear;
    ranges.push({ start: toYMD(new Date(year, monthIdx, 1)), end: toYMD(new Date(year, monthIdx, 7)) });
  }

  // Also fetch the actual trip window from last year for the "Trip" tab
  const endDate = new Date(checkout);
  const tripHistStart = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate());
  const tripHistEnd = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
  let cursor = new Date(tripHistStart);
  while (cursor < tripHistEnd) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setDate(chunkEnd.getDate() + 6);
    if (chunkEnd > tripHistEnd) chunkEnd.setTime(tripHistEnd.getTime());
    ranges.push({ start: toYMD(cursor), end: toYMD(chunkEnd) });
    cursor = new Date(chunkEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  return ranges;
}

function formatTripRange(checkin: string, checkout: string): string {
  const s = toLocalMidnight(checkin);
  const e = toLocalMidnight(checkout);
  if (s.getMonth() === e.getMonth()) {
    return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
  }
  return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}–${MONTH_NAMES[e.getMonth()]} ${e.getDate()}`;
}

interface WeatherIntelWidgetProps {
  destination: string;
  dates: { checkin: string; checkout: string };
  latitude?: number | null;
  longitude?: number | null;
  insight?: string | null;
  insightLoading?: boolean;
}

export default function WeatherIntelWidget({
  destination, dates, latitude, longitude, insight, insightLoading = false,
}: WeatherIntelWidgetProps) {
  const [useFahrenheit, setUseFahrenheit] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const t = (c: number) => (useFahrenheit ? Math.round((c * 9) / 5 + 32) : c);
  const unit = useFahrenheit ? '°F' : '°C';
  const mockWeather = useMemo(() => getMockWeather(destination), [destination]);

  // === CORE THRESHOLD: 14 days ===
  const daysUntilDeparture = useMemo(() => {
    if (!dates.checkin) return 999;
    const today = todayLocal();
    const checkinDate = toLocalMidnight(dates.checkin);
    return Math.ceil((checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [dates.checkin]);

  const daysUntilReturn = useMemo(() => {
    if (!dates.checkout) return 999;
    const today = todayLocal();
    const checkoutDate = toLocalMidnight(dates.checkout);
    return Math.ceil((checkoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [dates.checkout]);

  // Three mutually exclusive modes
  const weatherMode: 'forecast' | 'historical' | 'hybrid' = useMemo(() => {
    if (daysUntilDeparture > 14) return 'historical';
    if (daysUntilReturn > 14) return 'hybrid';
    return 'forecast';
  }, [daysUntilDeparture, daysUntilReturn]);

  const isForecastMode = weatherMode === 'forecast';
  const isHistoricalMode = weatherMode === 'historical';
  const isHybridMode = weatherMode === 'hybrid';

  // Hybrid mode: toggle between forecast and historical views
  const [hybridView, setHybridView] = useState<'forecast' | 'historical'>('forecast');

  // Last forecast date (today + 13 days)
  const lastForecastDate = useMemo(() => {
    const d = todayLocal();
    d.setDate(d.getDate() + 13);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }, []);

  console.log('🌤️ WEATHER MODE:', { daysUntilDeparture, daysUntilReturn, weatherMode, checkin: dates.checkin, checkout: dates.checkout });

  // === FORECAST FETCH (forecast or hybrid mode) ===
  useEffect(() => {
    if (isHistoricalMode) {
      setWeather(null);
      setWeatherLoading(false);
      return;
    }

    const fallback = () => {
      setWeather(mockToWeatherData(getMockWeather(destination)));
      setWeatherLoading(false);
    };

    if (!destination) { fallback(); return; }

    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-weather-low-tier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        location: destination,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        days: 14,
      }),
    })
      .then((res) => { if (!res.ok) throw new Error(`Weather API: ${res.status}`); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.message || data.error);
        const forecast: WeatherDay[] = (data.forecast || []).slice(0, 14).map((day: any) => ({
          date: day.date, day: day.day,
          high: day.high ?? day.temp ?? 20, low: day.low ?? day.temp ?? 15,
          condition: day.condition || 'Partly Cloudy',
        }));
        setWeather({
          current: {
            temp: data.current?.temp ?? 20,
            feelsLike: data.current?.feels_like ?? data.current?.temp ?? 19,
            humidity: data.current?.humidity ?? 50,
            condition: data.current?.condition || 'Partly Cloudy',
          },
          forecast,
        });
        setWeatherError(null);
      })
      .catch((err) => { if (!cancelled) { setWeatherError(err instanceof Error ? err.message : 'Failed'); fallback(); } })
      .finally(() => { if (!cancelled) setWeatherLoading(false); });

    return () => { cancelled = true; };
  }, [latitude, longitude, destination, isHistoricalMode]);

  // === HISTORICAL FETCH (historical or hybrid mode) ===
  useEffect(() => {
    if (isForecastMode) {
      setHistoricalData(null);
      setHistoricalLoading(false);
      return;
    }

    if (!dates.checkin || !dates.checkout || (!latitude && !destination)) return;

    let cancelled = false;
    setHistoricalLoading(true);

    const dateRanges = buildHistoricalDateRanges(dates.checkin, dates.checkout);

    const payload = {
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      location: destination,
      dateRanges,
    };
    console.log('📡 Historical fetch payload:', payload);

    supabase.functions.invoke('get-weather-historical', { body: payload })
      .then(({ data, error }) => {
        console.log('📡 Historical response:', { data, error });
        if (cancelled) return;
        if (error || data?.error) { console.error('Historical weather error:', error || data?.error); return; }
        setHistoricalData(data);
      })
      .catch((err) => { console.error('Historical fetch failed:', err); })
      .finally(() => { if (!cancelled) setHistoricalLoading(false); });

    return () => { cancelled = true; };
  }, [latitude, longitude, destination, dates.checkin, dates.checkout, isForecastMode]);

  // Build 12 months starting from departure month, with Trip tab only if multi-month
  const monthTabs = useMemo(() => {
    if (!dates.checkin) return [];
    const startDate = toLocalMidnight(dates.checkin);
    const startMonthIdx = startDate.getMonth();
    const endDate = dates.checkout ? toLocalMidnight(dates.checkout) : startDate;
    const monthSpan = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const showTrip = monthSpan >= 3;
    const tabs: { key: string; short: string }[] = showTrip ? [{ key: 'Trip', short: 'Trip' }] : [];
    for (let i = 0; i < 12; i++) {
      const idx = (startMonthIdx + i) % 12;
      tabs.push({ key: MONTH_FULL[idx], short: MONTH_NAMES[idx] });
    }
    return tabs;
  }, [dates.checkin, dates.checkout]);

  // Default to Trip tab if available, otherwise first tab (departure month)
  useEffect(() => {
    if ((isHistoricalMode || isHybridMode) && monthTabs.length > 0 && !selectedMonth) {
      setSelectedMonth(monthTabs[0].key);
    }
  }, [isHistoricalMode, isHybridMode, monthTabs, selectedMonth]);

  // Derive data for selected month or Trip overview
  const selectedMonthData = useMemo(() => {
    if (!historicalData || !selectedMonth) return null;
    if (selectedMonth === 'Trip') {
      return {
        month: 'Trip',
        avgHigh: historicalData.overall.avgHigh,
        avgLow: historicalData.overall.avgLow,
        highRange: historicalData.overall.highRange,
        lowRange: historicalData.overall.lowRange,
        conditionLabel: historicalData.overall.conditionLabel,
      };
    }
    const monthData = historicalData.months.find(m => m.month === selectedMonth);
    if (monthData) return monthData;
    return null;
  }, [historicalData, selectedMonth]);

  const displayWeather = weather ?? mockToWeatherData(mockWeather);

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    const cls = 'w-4 h-4 stroke-[1.5]';
    if (lower.includes('rain')) return <CloudRain className={`${cls} text-blue-400/70`} />;
    if (lower.includes('cloud')) return <Cloud className={`${cls} text-slate-400/70`} />;
    return <Sun className={`${cls} text-amber-400/70`} />;
  };

  const tripRangeLabel = dates.checkin && dates.checkout ? formatTripRange(dates.checkin, dates.checkout) : '';

  // Subtitle logic
  const showHistoricalView = isHistoricalMode || (isHybridMode && hybridView === 'historical');

  return (
    <div className="widget-card animate-slide-up">
      {/* Header */}
      <div className="widget-header">
        <div className="widget-icon bg-amber-500/10 text-amber-500">
          <Sun className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">{showHistoricalView ? 'Historical Weather' : 'Weather Intel'}</h3>
          <p className="widget-subtitle">
            {(() => {
                if (showHistoricalView) {
                  if (!selectedMonth) return 'Historical climate';
                  if (selectedMonth === 'Trip') {
                    if (!dates.checkin || !dates.checkout) return 'Historical climate';
                    const s = new Date(dates.checkin);
                    const e = new Date(dates.checkout);
                    return `${MONTH_NAMES[s.getMonth()]}–${MONTH_NAMES[e.getMonth()]} climate`;
                  }
                  return `${selectedMonth} climate`;
                }
                return '14-Day Forecast';
              })()}
          </p>
        </div>
        <div className="flex items-center bg-secondary/40 rounded-lg p-0.5">
          <button
            onClick={() => setUseFahrenheit(true)}
            className={`text-[11px] font-medium rounded-md px-2 py-0.5 transition-all ${useFahrenheit ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}
          >°F</button>
          <button
            onClick={() => setUseFahrenheit(false)}
            className={`text-[11px] font-medium rounded-md px-2 py-0.5 transition-all ${!useFahrenheit ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}
          >°C</button>
        </div>
      </div>

      {/* ============ HYBRID MODE TOGGLE ============ */}
      {isHybridMode && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-0">
            <button
              onClick={() => setHybridView('forecast')}
              className={`text-[11px] tracking-wide px-2.5 py-1 relative transition-all duration-200 ${
                hybridView === 'forecast'
                  ? 'text-foreground/90 font-medium'
                  : 'text-muted-foreground/35 hover:text-muted-foreground/60'
              }`}
            >
              Forecast
              {hybridView === 'forecast' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-foreground/70 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setHybridView('historical')}
              className={`text-[11px] tracking-wide px-2.5 py-1 relative transition-all duration-200 ${
                hybridView === 'historical'
                  ? 'text-foreground/90 font-medium'
                  : 'text-muted-foreground/35 hover:text-muted-foreground/60'
              }`}
            >
              Historical
              {hybridView === 'historical' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-foreground/70 rounded-full" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============ FORECAST VIEW (forecast mode OR hybrid forecast) ============ */}
      {(isForecastMode || (isHybridMode && hybridView === 'forecast')) && (
        <>
          {weatherLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500/30 border-t-amber-500" />
            </div>
          ) : (
            <>
              <div className={isHybridMode ? 'mb-2' : 'mb-3'}>
                <p className="widget-value">{t(displayWeather.current.temp)}{unit}</p>
                {isHybridMode ? (
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                    {displayWeather.current.condition} · Feels like {t(displayWeather.current.feelsLike)}{unit} · Humidity {displayWeather.current.humidity}%
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground/60 mt-0.5">{displayWeather.current.condition}</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-1">
                      Feels like {t(displayWeather.current.feelsLike)}{unit} · Humidity {displayWeather.current.humidity}%
                    </p>
                  </>
                )}
              </div>

              {displayWeather.forecast.length > 0 && (
                <div className="relative">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide forecast-scroll">
                    {displayWeather.forecast.map((day, i) => (
                      <div
                        key={`fc-${day.date}-${i}`}
                        className={`flex-shrink-0 text-center p-2 rounded-xl min-w-[54px] ${i === 0 ? 'bg-secondary/50 border border-border/30' : 'bg-secondary/30'}`}
                      >
                        <p className="text-[11px] text-muted-foreground/[0.62] mb-0.5">{day.day}</p>
                        <div className="flex justify-center mb-0.5">{getWeatherIcon(day.condition)}</div>
                        <p className="text-sm font-medium">{t(day.high)}°</p>
                        <p className="text-[10px] text-muted-foreground/[0.62]">{t(day.low)}°</p>
                      </div>
                    ))}
                  </div>
                  <div className="forecast-fade pointer-events-none" />
                </div>
              )}

            </>
          )}
        </>
      )}

      {/* ============ HISTORICAL VIEW (historical mode OR hybrid historical) ============ */}
      {(isHistoricalMode || (isHybridMode && hybridView === 'historical')) && (
        <>
          {historicalLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500/30 border-t-amber-500" />
            </div>
          ) : historicalData ? (
            <div className={`${isHybridMode ? 'space-y-3' : 'mt-1 space-y-4'}`}>
              {/* Horizontal month selector — underline system */}
              <div className="relative -mx-1">
                <div className="flex gap-0 overflow-x-auto px-1 scrollbar-hide border-t border-border/20">
                  {monthTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedMonth(tab.key)}
                      className={`flex-shrink-0 text-[10px] tracking-wide px-2.5 pt-2 pb-1.5 transition-all duration-200 relative ${
                        selectedMonth === tab.key
                          ? 'text-foreground/90 font-medium'
                          : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                      }`}
                    >
                      {tab.short}
                      {selectedMonth === tab.key && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-foreground/70 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data rows */}
              {selectedMonthData ? (
                <div className="space-y-3 transition-opacity duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground/60">Highs</span>
                    <span className="text-xl font-semibold tracking-tight text-foreground">
                      {t(selectedMonthData.highRange.min)}°–{t(selectedMonthData.highRange.max)}°
                      <span className="text-[11px] font-normal text-muted-foreground/40 ml-1.5">(avg {t(selectedMonthData.avgHigh)}°)</span>
                    </span>
                  </div>
                  <div className="h-px bg-border/30" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground/60">Lows</span>
                    <span className="text-xl font-semibold tracking-tight text-foreground">
                      {t(selectedMonthData.lowRange.min)}°–{t(selectedMonthData.lowRange.max)}°
                      <span className="text-[11px] font-normal text-muted-foreground/40 ml-1.5">(avg {t(selectedMonthData.avgLow)}°)</span>
                    </span>
                  </div>
                  <div className="h-px bg-border/20" />
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-sm text-muted-foreground/60">Conditions</span>
                    <span className="text-sm text-muted-foreground/70">{selectedMonthData.conditionLabel}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/25 mt-2">
                    Historical climate averages · WeatherAPI
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/40 py-4 text-center">No data for this month</p>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground/50">Historical data unavailable</p>
            </div>
          )}
        </>
      )}

      {weatherError && isForecastMode && (
        <p className="text-xs text-muted-foreground/80 mt-2">Using fallback data</p>
      )}

      <InsightLine insight={insight} loading={insightLoading} />
    </div>
  );
}
