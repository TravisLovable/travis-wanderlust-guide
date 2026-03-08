import React, { useState, useMemo, useEffect } from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { getMockWeather } from '@/utils/mockData';
import { InsightLine } from '@/components/InsightLine';


const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
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
    forecast: mock.forecast.slice(0, 7).map((d) => ({
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

  // Fetch 7-day forecast from Open-Meteo
  useEffect(() => {
    const hasCoords = latitude != null && longitude != null && !Number.isNaN(latitude) && !Number.isNaN(longitude);
    const fallback = () => {
      setWeather(mockToWeatherData(getMockWeather(destination)));
      setWeatherLoading(false);
    };
    if (!hasCoords) {
      fallback();
      setWeatherError(null);
      return;
    }

    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError(null);

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily: 'temperature_2m_max,temperature_2m_min',
      forecast_days: '7',
      timezone: 'auto',
    });

    fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Open-Meteo: ${res.status}`);
        return res.json();
      })
      .then((data: { daily?: { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[] } }) => {
        if (cancelled) return;
        const daily = data.daily;
        if (!daily?.time?.length || !daily.temperature_2m_max || !daily.temperature_2m_min) {
          fallback();
          return;
        }
        const forecast: WeatherDay[] = daily.time.map((dateStr, i) => ({
          date: dateStr,
          day: formatDayLabel(dateStr),
          high: daily.temperature_2m_max![i] ?? 0,
          low: daily.temperature_2m_min![i] ?? 0,
          condition: 'Partly Cloudy',
        }));
        const firstHigh = forecast[0]?.high ?? 20;
        const firstLow = forecast[0]?.low ?? 10;
        const mock = getMockWeather(destination);
        setWeather({
          current: {
            temp: Math.round((firstHigh + firstLow) / 2),
            feelsLike: Math.round((firstHigh + firstLow) / 2) - 1,
            humidity: mock.current.humidity,
            condition: mock.current.condition,
          },
          forecast,
        });
        setWeatherError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setWeatherError(err instanceof Error ? err.message : 'Failed to load weather');
          setWeather(mockToWeatherData(getMockWeather(destination)));
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
  const hasForecast = displayWeather.forecast.length > 0;

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    const cls = 'w-[18px] h-[18px] stroke-[1.6]';
    if (lower.includes('rain')) return <CloudRain className={`${cls} text-[#5B7A99]`} />;
    if (lower.includes('cloud')) return <Cloud className={`${cls} text-[#6B7280]`} />;
    return <Sun className={`${cls} text-[#D97706]`} />;
  };

  return (
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

      {weatherLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500/30 border-t-amber-500" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="widget-value">
                {t(displayWeather.current.temp)}{unit}
              </p>
              <p className="text-sm text-muted-foreground">{displayWeather.current.condition}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground/[0.62]">
              <p>Feels like {t(displayWeather.current.feelsLike)}{unit}</p>
              <p>Humidity {displayWeather.current.humidity}%</p>
            </div>
          </div>

          {hasForecast && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {displayWeather.forecast.map((day, i) => (
                <div
                  key={`fc-${day.date}-${i}`}
                  className="flex-shrink-0 text-center px-1.5 py-1.5 rounded-lg bg-secondary/30 min-w-[44px]"
                >
                  <p className="text-[10px] text-muted-foreground/[0.62] mb-0.5">{day.day}</p>
                  <p className="text-xs font-semibold">{t(day.high)}°</p>
                  <p className="text-[10px] text-muted-foreground/[0.62]">{t(day.low)}°</p>
                </div>
              ))}
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
