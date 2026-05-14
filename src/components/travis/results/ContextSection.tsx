import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import { CulturalPostureCard } from "./CulturalPostureCard";
import { EventsCard } from "./EventsCard";
import { InsiderCard } from "./InsiderCard";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import type { TravisInsights } from "@/types/insights";

type ContextSectionProps = {
  placeDetails: SelectedPlace | null;
  dates: { checkin: string; checkout: string };
  destination: string;
  insights: TravisInsights | null;
  insightsLoading: boolean;
};

/**
 * Section 03 — Context.
 *
 * Cultural posture · During your stay · Insider asides.
 * Each cell built on SubcardFrame + KeyValueRow primitives.
 * Wrapped in SectionErrorBoundary so a single card crash can't blank the page.
 */
export function ContextSection({
  placeDetails,
  dates,
  destination,
  insights,
  insightsLoading,
}: ContextSectionProps) {
  return (
    <>
      <SectionHeader
        n="03"
        title="Context"
        sub="What isn't a blocker but will make the trip obvious."
      />
      <SectionErrorBoundary label="Context">
        <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-4">
            <CulturalPostureCard destination={destination} />
            <EventsCard
              placeDetails={placeDetails}
              dates={dates}
              destination={destination}
            />
            <InsiderCard insights={insights} loading={insightsLoading} />
          </div>
        </div>
      </SectionErrorBoundary>
    </>
  );
}
