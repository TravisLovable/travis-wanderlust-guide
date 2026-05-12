import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import WaterSafetyWidget from "@/components/WaterSafetyWidget";
import UVIndexCard from "@/components/UVIndexCard";
import PharmacyIntelCard from "@/components/PharmacyIntelCard";
import PowerAdaptorWidget from "@/components/PowerAdaptorWidget";
import EmergencyContactsCard from "@/components/EmergencyContactsCard";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";

type DetailsSectionProps = {
  placeDetails: SelectedPlace | null;
};

/**
 * Section 04 — Details.
 *
 * Houses the widgets that don't have a slot in the design's three core
 * sections. Decision 4 in the plan: keep them, render below Context,
 * restyled with section chrome. Internals unchanged.
 */
export function DetailsSection({ placeDetails }: DetailsSectionProps) {
  return (
    <>
      <SectionHeader
        n="04"
        title="Details"
        sub="What else Travis monitors."
      />
      <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Cell label="Water safety">
            <WaterSafetyWidget placeDetails={placeDetails} animationDelay="0s" />
          </Cell>
          <Cell label="UV index">
            <UVIndexCard placeDetails={placeDetails} animationDelay="0.04s" />
          </Cell>
          <Cell label="Pharmacy">
            <PharmacyIntelCard placeDetails={placeDetails} animationDelay="0.08s" />
          </Cell>
          <Cell label="Power adapter">
            <PowerAdaptorWidget placeDetails={placeDetails} animationDelay="0.12s" />
          </Cell>
          <Cell label="Emergency">
            <EmergencyContactsCard placeDetails={placeDetails} animationDelay="0.16s" />
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
        background: "var(--bg-inset)",
      }}
    >
      <div
        className="font-travis-mono uppercase"
        style={{
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--ink)",
          padding: "12px 16px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        {label}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
