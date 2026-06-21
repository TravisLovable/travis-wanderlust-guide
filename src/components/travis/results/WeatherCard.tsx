import * as React from "react";
import { MustKnowCard } from "./MustKnowCard";
import { useWeatherData } from "@/hooks/useWeatherData";
import type { SelectedPlace } from "@/types/place";
import type { StatusKind } from "../StatusPip";

type WeatherCardProps = {
  placeDetails: SelectedPlace | null;
  isLast?: boolean;
};

type TempUnit = "C" | "F";
const UNIT_KEY = "travis.tempUnit";

function readUnit(): TempUnit {
  if (typeof window === "undefined") return "C";
  return window.localStorage.getItem(UNIT_KEY) === "F" ? "F" : "C";
}

/**
 * Weather cell of the Must Know strip.
 *
 * Temps arrive from useWeatherData in Celsius (WeatherAPI temp_c). A °C/°F
 * toggle in the card header (persisted in localStorage as `travis.tempUnit`)
 * converts at render time. Renders "—" on error/missing data; no fabrication.
 */
export function WeatherCard({ placeDetails, isLast }: WeatherCardProps) {
  const { weatherData, isLoading, error } = useWeatherData(placeDetails ?? undefined);
  const [unit, setUnit] = React.useState<TempUnit>(readUnit);

  const setUnitPersist = (u: TempUnit) => {
    setUnit(u);
    try {
      window.localStorage.setItem(UNIT_KEY, u);
    } catch {
      /* ignore (private mode / unavailable) */
    }
  };

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

  // Raw Celsius from the API; conv()/deg() convert + label for the chosen unit.
  const maxHighC = highs.length ? Math.round(Math.max(...highs)) : null;
  const minLowC = lows.length ? Math.round(Math.min(...lows)) : null;
  const currentTempC = currentTempFrom(current);
  const condition = currentConditionFrom(current);

  const conv = (c: number | null): number | null =>
    c === null ? null : unit === "F" ? Math.round((c * 9) / 5 + 32) : c;
  const deg = (c: number | null): string | undefined =>
    c === null ? undefined : `${conv(c)}°${unit}`;

  const headline = isLoading
    ? null
    : formatRangeHeadline(conv(minLowC), conv(maxHighC), conv(currentTempC), unit);
  const kind = deriveKind(headline, condition);

  const unitToggle = (
    <div
      className="inline-flex font-travis-mono uppercase"
      style={{ fontSize: 9, letterSpacing: "0.1em" }}
    >
      {(["C", "F"] as TempUnit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => setUnitPersist(u)}
          aria-pressed={unit === u}
          aria-label={`Show temperatures in degrees ${u === "C" ? "Celsius" : "Fahrenheit"}`}
          style={{
            padding: "1px 5px",
            color: unit === u ? "var(--ink)" : "var(--ink-4)",
            background: "transparent",
            border: 0,
            cursor: "pointer",
          }}
        >
          °{u}
        </button>
      ))}
    </div>
  );

  return (
    <MustKnowCard
      kind={kind}
      label="Weather"
      headerAction={unitToggle}
      headline={headline}
      sub={condition || undefined}
      details={[
        { label: "Forecast high", value: deg(maxHighC) },
        { label: "Forecast low", value: deg(minLowC) },
        { label: "Current", value: deg(currentTempC) },
        { label: "Forecast days", value: forecastDays.length || undefined },
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
  unit: TempUnit,
): React.ReactNode {
  const u = `°${unit}`;
  if (low !== null && high !== null && low !== high) return `${low}–${high}${u}`;
  if (high !== null) return `${high}${u}`;
  if (low !== null) return `${low}${u}`;
  if (currentTemp !== null) return `${currentTemp}${u}`;
  return null;
}

function deriveKind(headline: React.ReactNode, condition: string | null): StatusKind {
  if (!headline) return "note";
  // Conservative default. Without a structured weather-quality signal we
  // call most trips "favorable"; extreme keywords flip to attention.
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
