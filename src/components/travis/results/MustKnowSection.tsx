import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import { EntryCard } from "./EntryCard";
import { HealthCard } from "./HealthCard";
import { WeatherCard } from "./WeatherCard";
import { TimeCard } from "./TimeCard";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import type { TravisInsights } from "@/types/insights";

type MustKnowSectionProps = {
  placeDetails: SelectedPlace | null;
  dates: { checkin: string; checkout: string };
  destination: string;
  passport: string;
  /** Kept for API stability — passed by ResultsPage but no longer rendered
   *  here (the section's per-row insight text is folded into card sub lines
   *  / footnotes where it has a home in the design's structure). */
  insights?: TravisInsights | null;
  insightsLoading?: boolean;
};

/**
 * Section 01 — Must Know Before You Go.
 *
 * Four cells in a single unified bordered strip: Entry · Health · Weather ·
 * Time. Each cell is a MustKnowCard that fetches its own data via the same
 * Edge Functions the legacy containers used (visa-requirements, health-data,
 * useWeatherData, get-astronomy + get-world-clock). Data sources are
 * unchanged; only the presentation is new.
 *
 * The mobile breakpoint collapses the 4 columns into stacked cells, but
 * still inside the same bordered strip — so the visual identity of the
 * strip survives on phone widths.
 */
export function MustKnowSection({
  placeDetails,
  destination,
  passport,
}: MustKnowSectionProps) {
  return (
    <>
      <SectionHeader
        n="01"
        title="Must know before you go"
        sub="Entry, health, weather, and time."
      />
      <SectionErrorBoundary label="Must Know">
        <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
          <div
            className="overflow-hidden grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            style={{
              border: "1px solid var(--hair-strong)",
              borderRadius: 6,
              background: "var(--bg-raised)",
            }}
          >
            <EntryCard placeDetails={placeDetails} passport={passport} />
            <HealthCard destination={destination} passport={passport} />
            <WeatherCard placeDetails={placeDetails} />
            <TimeCard placeDetails={placeDetails} isLast />
          </div>
        </div>
      </SectionErrorBoundary>
    </>
  );
}
