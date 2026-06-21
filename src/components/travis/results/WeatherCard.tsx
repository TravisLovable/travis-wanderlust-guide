import * as React from "react";
import { MustKnowCard } from "./MustKnowCard";
import { useWeatherData } from "@/hooks/useWeatherData";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import type { StatusKind } from "../StatusPip";

type WeatherCardProps = {
  placeDetails: SelectedPlace | null;
  isLast?: boolean;
};

/**
 * Weather cell of the Must Know strip.
 *
 * Uses the existing `useWeatherData` hook (no new fetch, no Edge Function
 * change). Reduces the legacy widget's 14-day forecast UI to a Must Know
 * cell: temp range, condition, 4 detail rows. Missing rows render "—".
 *
 * Note: the design's "May average high/low" requires climatology data that
 * the current weather hook doesn't expose. We render forecast-based highs
 * and lows instead; the row labels reflect what we actually have.
 */
export function WeatherCard({ placeDetails, isLast }: WeatherCardProps) {
  const { weatherData, isLoading, error } = useWeatherData(placeDetails ?? undefined);
  // On error the hook clears weatherData; guard defensively so no stale/fake
  // numbers ever render under a failure.
  const current = error ? null : (weatherData?.current ?? null);
  const forecastDays = error ? [] : (weatherData?.forecast ?? []);

  const highs = forecastDays
    .map((d) => Number(d?.high))
    .filter((n) => Number.isFinite(n));
  const lows = forecastDays
    .map((d) => Number(d?.low))
    .filter((n) => Number.isFinite(n));

  const maxHigh = highs.length ? Math.round(Math.max(...highs)) : null;
  const minLow = lows.length ? Math.round(Math.min(...lows)) : null;
  const currentTemp = currentTempFrom(current);
  const condition = currentConditionFrom(current);

  const headline = formatRangeHeadline(minLow, maxHigh, currentTemp);
  const kind = deriveKind(headline, condition);

  return (
    <MustKnowCard
      kind={kind}
      label="Weather"
      headline={isLoading ? null : headline}
      sub={condition || undefined}
      details={[
        {
          label: "Forecast high",
          value: maxHigh !== null ? `${maxHigh}°` : undefined,
        },
        {
          label: "Forecast low",
          value: minLow !== null ? `${minLow}°` : undefined,
        },
        {
          label: "Current",
          value: currentTemp !== null ? `${currentTemp}°` : undefined,
        },
        {
          label: "Forecast days",
          value: forecastDays.length || undefined,
        },
      ]}
      footnote={forecastDays.length ? "WeatherAPI · daily forecast" : undefined}
      isLast={isLast}
    />
  );
}

function currentTempFrom(
  current: { temp?: number } | null,
): number | null {
  if (!current) return null;
  const n = Number(current.temp);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function currentConditionFrom(
  current: { condition?: string } | null,
): string | null {
  return current?.condition ?? null;
}

function formatRangeHeadline(
  low: number | null,
  high: number | null,
  currentTemp: number | null,
): React.ReactNode {
  if (low !== null && high !== null && low !== high) return `${low}°–${high}°`;
  if (high !== null) return `${high}°`;
  if (low !== null) return `${low}°`;
  if (currentTemp !== null) return `${currentTemp}°`;
  return null;
}

function deriveKind(headline: React.ReactNode, condition: string | null): StatusKind {
  if (!headline) return "note";
  // Conservative default. Without a structured weather-quality signal we
  // call most trips "favorable"; extreme keywords flip to note.
  if (condition) {
    const c = condition.toLowerCase();
    if (
      c.includes("storm") ||
      c.includes("severe") ||
      c.includes("hurricane") ||
      c.includes("blizzard") ||
      c.includes("extreme")
    ) {
      return "attention";
    }
  }
  return "favorable";
}
