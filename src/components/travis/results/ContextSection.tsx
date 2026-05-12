import * as React from "react";
import { SectionHeader } from "./SectionHeader";
import { CulturalContainer, HolidayContainer } from "@/components/widgets";
import LocalEventsCard from "@/components/LocalEventsCard";
import { InsightLine } from "@/components/InsightLine";
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
 * Cultural posture · Events during stay · Insider aside. The design's
 * 5-item insider list isn't available from our current data layer
 * (useTravisInsights returns single strings per topic) so we show the
 * single culturalInsights line rather than mock five.
 */
export function ContextSection({
  placeDetails,
  dates,
  destination,
  insights,
  insightsLoading,
}: ContextSectionProps) {
  const insiderText = insights?.culturalInsights?.trim();

  return (
    <>
      <SectionHeader
        n="03"
        title="Context"
        sub="What isn't a blocker but will make the trip obvious."
      />
      <div className="max-w-[1180px] mx-auto w-full px-5 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-4">
          <Cell label="Cultural posture">
            <CulturalContainer destination={destination} animationDelay="0s" />
          </Cell>

          <Cell label="During your stay">
            <LocalEventsCard
              destination={destination}
              startDate={dates.checkin}
              endDate={dates.checkout}
            />
            <HolidayContainer placeDetails={placeDetails} dates={dates} />
            <InsightLine
              insight={insights?.localEvents}
              loading={insightsLoading}
            />
            <InsightLine
              insight={insights?.localHolidays}
              loading={insightsLoading}
            />
          </Cell>

          <Cell label="Insider aside">
            <div
              className="font-travis"
              style={{
                padding: "12px 16px",
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--ink-2)",
                minHeight: 80,
              }}
            >
              {insightsLoading && !insiderText ? (
                <span style={{ color: "var(--ink-4)" }}>Loading…</span>
              ) : insiderText ? (
                insiderText
              ) : (
                <span style={{ color: "var(--ink-4)" }}>—</span>
              )}
            </div>
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
