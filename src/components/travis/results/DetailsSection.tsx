import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import WaterSafetyWidget from "@/components/WaterSafetyWidget";
import UVIndexCard from "@/components/UVIndexCard";
import PharmacyIntelCard from "@/components/PharmacyIntelCard";
import PowerAdaptorWidget from "@/components/PowerAdaptorWidget";
import EmergencyContactsCard from "@/components/EmergencyContactsCard";
import type { SelectedPlace } from "@/types/place";

type DetailsSectionProps = {
  placeDetails: SelectedPlace | null;
};

/**
 * Section 04 — Details.
 *
 * Houses the five widgets that have no slot in the design's three core
 * sections (Decision 4). Each widget was restyled in place during
 * Checkpoint D to use SubcardFrame + KeyValueRow + Travis tokens — they
 * own their own card chrome now, so this section is a plain responsive grid.
 */
export function DetailsSection({ placeDetails }: DetailsSectionProps) {
  return (
    <>
      <SectionHeader
        n="04"
        title="Details"
        sub="What else Travis monitors."
      />
      <SectionErrorBoundary label="Details">
        <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <WaterSafetyWidget placeDetails={placeDetails} />
            <UVIndexCard placeDetails={placeDetails} />
            <PharmacyIntelCard placeDetails={placeDetails} />
            <PowerAdaptorWidget placeDetails={placeDetails} />
            <EmergencyContactsCard placeDetails={placeDetails} />
          </div>
        </div>
      </SectionErrorBoundary>
    </>
  );
}
