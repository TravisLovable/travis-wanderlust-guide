import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import HealthEntryCard from "@/components/HealthEntryCard";
import WeatherIntelWidget from "@/components/WeatherIntelWidget";
import { VisaContainer, TimeZoneContainer } from "@/components/widgets";
import { InsightLine } from "@/components/InsightLine";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import type { TravisInsights } from "@/types/insights";

type MustKnowSectionProps = {
  placeDetails: SelectedPlace | null;
  dates: { checkin: string; checkout: string };
  destination: string;
  passport: string;
  insights: TravisInsights | null;
  insightsLoading: boolean;
};

/**
 * Section 01 — Must Know Before You Go.
 *
 * Four signals: Entry · Health · Weather · Time. Each cell renders the
 * existing data container/widget unchanged so Supabase queries and Edge
 * Function calls flow exactly as before. The cell frames adopt the Travis
 * design language; widget internals will be travis-ified in a later pass.
 */
export function MustKnowSection({
  placeDetails,
  dates,
  destination,
  passport,
  insights,
  insightsLoading,
}: MustKnowSectionProps) {
  return (
    <>
      <SectionHeader
        n="01"
        title="Must know before you go"
        sub="Entry, health, weather, and time."
      />
      <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <Cell label="Entry">
            <VisaContainer placeDetails={placeDetails} passport={passport} />
            <InsightLine insight={insights?.visa} loading={insightsLoading} />
          </Cell>

          <Cell label="Health">
            <HealthEntryCard
              destination={destination}
              passport={passport}
              animationDelay="0.05s"
            />
            <InsightLine insight={insights?.healthEntry} loading={insightsLoading} />
          </Cell>

          <Cell label="Weather">
            <WeatherIntelWidget
              destination={destination}
              dates={dates}
              latitude={placeDetails?.latitude}
              longitude={placeDetails?.longitude}
              insight={insights?.weather}
              insightLoading={insightsLoading}
            />
          </Cell>

          <Cell label="Time">
            <TimeZoneContainer placeDetails={placeDetails} destination={destination} />
            <InsightLine insight={insights?.localTime} loading={insightsLoading} />
          </Cell>
        </div>
      </div>
    </>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--hair)",
        borderRadius: 6,
        background: "var(--bg-raised)",
      }}
    >
      <div
        className="font-travis-mono uppercase flex justify-between items-center"
        style={{
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--ink)",
          padding: "12px 16px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        <span>{label}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
