import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import { TransitCard } from "./TransitCard";
import { CurrencyCard } from "./CurrencyCard";
import type { SelectedPlace } from "@/types/place";
import type { TravisInsights } from "@/types/insights";

type LogisticsSectionProps = {
  placeDetails: SelectedPlace | null;
  /** Kept for API stability — no longer rendered in this section. */
  insights?: TravisInsights | null;
  insightsLoading?: boolean;
};

/**
 * Section 02 — Logistics.
 *
 * TransitCard (uber-availability) + CurrencyCard (useCurrencyExchange).
 * Data sources unchanged from the legacy widgets; only the presentation
 * is new. Empty fields render "—" — no static-per-country supplementation
 * in this checkpoint (queued for a follow-up).
 */
export function LogisticsSection({ placeDetails }: LogisticsSectionProps) {
  return (
    <>
      <SectionHeader
        n="02"
        title="Logistics"
        sub="Airport transit and how money works on the ground."
      />
      <SectionErrorBoundary label="Logistics">
        <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-4">
            <TransitCard placeDetails={placeDetails} />
            <CurrencyCard placeDetails={placeDetails} />
          </div>
        </div>
      </SectionErrorBoundary>
    </>
  );
}
