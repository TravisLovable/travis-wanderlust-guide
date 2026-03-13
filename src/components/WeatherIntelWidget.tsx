import React, { useState, useMemo, useEffect } from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { getMockWeather } from '@/utils/mockData';
import { useTripWindow } from '@/hooks/useTripWindow';
import { InsightLine } from '@/components/InsightLine';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeatherDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon?: string;
}

interface WeatherData {
  current: { temp: number; feelsLike: number; humidity: number; condition: string };
  forecast: WeatherDay[];
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
      date: d.date,
      day: d.day,
      high: d.high,
      low: d.low,
      condition: d.condition,
    })),
  };
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
  destination,
  dates,
  latitude,
  longitude,
  insight,
  insightLoading = false,
}: WeatherIntelWidgetProps) {
  const [useFahrenheit, setUseFahrenheit] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const t = (c: number) => (useFahrenheit ? Math.round((c * 9) / 5 + 32) : c);
  const unit = useFahrenheit ? '°F' : '°C';

  const mockWeather = useMemo(() => getMockWeather(destination), [destination]);

  useEffect(() => {
    const fallback = () => {
      setWeather(mockToWeatherData(getMockWeather(destination)));
      setWeatherLoading(false);
    };

    if (!destination) {
      fallback();
      setWeatherError(null);
      return;
    }

    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError(null);

    const fetchUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-weather-low-tier`;

    fetch(fetchUrl, {
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
      .then((res) => {
        if (!res.ok) throw new Error(`Weather API: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          throw new Error(data.message || data.error);
        }
        const forecast: WeatherDay[] = (data.forecast || []).slice(0, 14).map((day: any) => ({
          date: day.date,
          day: day.day,
          high: day.high ?? day.temp ?? 20,
          low: day.low ?? day.temp ?? 15,
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
      .catch((err) => {
        if (!cancelled) {
          setWeatherError(err instanceof Error ? err.message : 'Failed to load weather');
          fallback();
        }
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, destination]);

  const displayWeather = weather ?? mockToWeatherData(mockWeather);
  const tripWindow = useTripWindow(dates.checkin, dates.checkout);
  const hasForecast = displayWeather.forecast.length > 0;

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    const cls = 'w-4 h-4 stroke-[1.5]';
    if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className={`${cls} text-blue-400/70`} />;
    if (lower.includes('cloud') || lower.includes('overcast')) return <Cloud className={`${cls} text-slate-400/70`} />;
    return <Sun className={`${cls} text-amber-400/70`} />;
  };

  return (
    <div className="widget-card animate-slide-up">
      <div className="widget-header">
        <div className="widget-icon bg-amber-500/10 text-amber-500">
          <Sun className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">Weather Intel</h3>
          <p className="widget-subtitle">10-Day Forecast</p>
        </div>
        <div className="flex items-center bg-secondary/40 rounded-lg p-0.5">
          <button
            onClick={() => setUseFahrenheit(true)}
            className={`text-[11px] font-medium rounded-md px-2 py-0.5 transition-all ${useFahrenheit ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}
          >
            °F
          </button>
          <button
            onClick={() => setUseFahrenheit(false)}
            className={`text-[11px] font-medium rounded-md px-2 py-0.5 transition-all ${!useFahrenheit ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}
          >
            °C
          </button>
        </div>
      </div>

      {weatherLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500/30 border-t-amber-500" />
        </div>
      ) : (
        <>
          {tripWindow.isTripWithin14DayForecastWindow && (
            <div className="mb-3">
              <div className="flex items-baseline justify-between">
                <p className="widget-value">
                  {t(displayWeather.current.temp)}{unit}
                  {tripWindow.isTodayWithinTrip && (
                    <span className="text-sm font-normal text-muted-foreground/[0.5] ml-1.5">· Today</span>
                  )}
                </p>
              </div>
              <p className="text-sm text-muted-foreground/60 mt-0.5">{displayWeather.current.condition}</p>
              <p className="text-[11px] text-muted-foreground/40 mt-1">
                Feels like {t(displayWeather.current.feelsLike)}{unit} · Humidity {displayWeather.current.humidity}%
              </p>
            </div>
          )}

          {hasForecast && (
            <div className="relative">
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide forecast-scroll">
                {displayWeather.forecast.map((day, i) => (
                  <div
                    key={`fc-${day.date}-${i}`}
                    className={`flex-shrink-0 text-center px-2 py-2 rounded-xl min-w-[54px] ${i === 0 ? 'bg-secondary/50 border border-border/30' : 'bg-secondary/30'}`}
                  >
                    <p className="text-[11px] text-muted-foreground/[0.62] mb-1">{day.day}</p>
                    <div className="flex justify-center mb-1">{getWeatherIcon(day.condition)}</div>
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

      {weatherError && (
        <p className="text-xs text-muted-foreground/80 mt-2">Using fallback data ({weatherError})</p>
      )}

      <InsightLine insight={insight} loading={insightLoading} />
    </div>
  );
}
