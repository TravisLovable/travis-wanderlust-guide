import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { CurrencyContainer, UberAvailabilityWidget } from "@/components/widgets";
import { InsightLine } from "@/components/InsightLine";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import type { TravisInsights } from "@/types/insights";

type LogisticsSectionProps = {
  placeDetails: SelectedPlace | null;
  insights: TravisInsights | null;
  insightsLoading: boolean;
};

/**
 * Section 02 — Logistics.
 *
 * Transit (airport → city) and currency. Each cell wraps the existing
 * widget container with a Travis section frame; data fetching is
 * unchanged. The four-mode ranked transit list from the design has no
 * existing data source yet — UberAvailabilityWidget is the closest
 * present-day analog; a full transit ranking is queued for later.
 */
export function LogisticsSection({
  placeDetails,
  insights,
  insightsLoading,
}: LogisticsSectionProps) {
  return (
    <>
      <SectionHeader
        n="02"
        title="Logistics"
        sub="Airport transit and how money works on the ground."
      />
      <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-4">
          <Cell label="Airport → City">
            <UberAvailabilityWidget placeDetails={placeDetails} />
            <InsightLine
              insight={insights?.transportation}
              loading={insightsLoading}
            />
          </Cell>

          <Cell label="Currency · live mid-market">
            <CurrencyContainer placeDetails={placeDetails} />
            <InsightLine
              insight={insights?.currency}
              loading={insightsLoading}
            />
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
          padding: "12px 20px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        {label}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
