import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubcardFrame } from "./SubcardFrame";
import { useLocalEvents } from "@/hooks/useLocalEvents";
import type { SelectedPlace } from "@/types/place";

type EventsCardProps = {
  placeDetails: SelectedPlace | null;
  dates: { checkin: string; checkout: string };
  destination: string;
};

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

interface HolidaysResponse {
  country?: unknown;
  totalHolidays?: unknown;
  allHolidays?: unknown;
  source?: unknown;
}

interface NormalizedEvent {
  /** Sortable timestamp. */
  ts: number;
  title: string;
  dateLabel: string;
  note?: string;
  kind: "event" | "holiday";
}

/**
 * Events cell.
 *
 * Merges two data sources (unchanged):
 *   - useLocalEvents (mock; returns events for ~12 known destinations)
 *   - get-holidays Edge Function (timeanddate API; falls back to nager.at
 *     on HTTP error. Currently returns empty array when no API key is
 *     configured upstream — handled gracefully)
 *
 * Items normalized to {title, dateLabel, note}, sorted ascending by start
 * date. Empty state when neither source returns data.
 */
export function EventsCard({ placeDetails, dates, destination }: EventsCardProps) {
  const { events, isLoading: eventsLoading } = useLocalEvents({
    destination,
    startDate: dates.checkin,
    endDate: dates.checkout,
  });

  const [holidays, setHolidays] = React.useState<unknown[]>([]);
  const [holidaysLoading, setHolidaysLoading] = React.useState(false);

  const countryCode = placeDetails?.country_code?.toUpperCase();
  const tripYear = dates.checkin
    ? new Date(dates.checkin).getFullYear()
    : new Date().getFullYear();

  React.useEffect(() => {
    if (!countryCode) {
      setHolidays([]);
      return;
    }
    let cancelled = false;
    setHolidaysLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke<HolidaysResponse>(
          "get-holidays",
          { body: { country: countryCode, year: tripYear } },
        );
        if (cancelled) return;
        if (error || !data) setHolidays([]);
        else {
          const arr = (data as HolidaysResponse).allHolidays;
          setHolidays(Array.isArray(arr) ? arr : []);
        }
      } catch {
        if (!cancelled) setHolidays([]);
      } finally {
        if (!cancelled) setHolidaysLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [countryCode, tripYear]);

  // Normalize events.
  const normalizedEvents: NormalizedEvent[] = events
    .map((e): NormalizedEvent | null => {
      const title = asString(e?.name);
      const start = asString(e?.startDate);
      if (!title || !start) return null;
      const ts = new Date(start + "T00:00:00").getTime();
      if (!Number.isFinite(ts)) return null;
      const end = asString(e?.endDate);
      const dateLabel = formatRange(start, end);
      return { ts, title, dateLabel, note: asString(e?.category), kind: "event" };
    })
    .filter((x): x is NormalizedEvent => !!x);

  // Normalize holidays, optionally filtered to the trip window if both present.
  const tripStart = dates.checkin ? new Date(dates.checkin + "T00:00:00").getTime() : null;
  const tripEnd = dates.checkout ? new Date(dates.checkout + "T00:00:00").getTime() : null;

  const normalizedHolidays: NormalizedEvent[] = holidays
    .map((h): NormalizedEvent | null => {
      if (!h || typeof h !== "object") return null;
      const r = h as Record<string, unknown>;
      const date = asString(r.date);
      const title = asString(r.localName) ?? asString(r.name);
      if (!date || !title) return null;
      const ts = new Date(date + "T00:00:00").getTime();
      if (!Number.isFinite(ts)) return null;
      // If trip window known, only keep holidays inside it (with a +/- 14 day buffer).
      if (tripStart !== null && tripEnd !== null) {
        const buffer = 14 * 24 * 60 * 60 * 1000;
        if (ts < tripStart - buffer || ts > tripEnd + buffer) return null;
      }
      return {
        ts,
        title,
        dateLabel: formatShort(date),
        note: asString(r.type) ?? asString(r.region),
        kind: "holiday",
      };
    })
    .filter((x): x is NormalizedEvent => !!x);

  const merged: NormalizedEvent[] = [...normalizedEvents, ...normalizedHolidays]
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 6);

  const isLoading = eventsLoading || holidaysLoading;

  return (
    <SubcardFrame label="During your stay">
      <div style={{ padding: 0 }}>
        {isLoading && merged.length === 0 && (
          <div
            className="font-travis"
            style={{
              padding: "16px 20px",
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            Resolving events…
          </div>
        )}

        {!isLoading && merged.length === 0 && (
          <div
            className="font-travis"
            style={{
              padding: "16px 20px",
              color: "var(--ink-4)",
              fontSize: 13,
            }}
          >
            No major events detected.
          </div>
        )}

        {merged.map((item, i) => (
          <div
            key={`${item.kind}-${i}-${item.title}`}
            style={{
              padding: "14px 20px",
              borderBottom:
                i < merged.length - 1 ? "1px solid var(--hair)" : "none",
            }}
          >
            <div
              className="flex justify-between items-baseline gap-3"
            >
              <span
                className="font-travis truncate"
                style={{
                  color: "var(--ink)",
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              >
                {item.title}
              </span>
              <span
                className="font-travis-mono shrink-0"
                style={{
                  color: "var(--ink-3)",
                  fontSize: 11,
                  letterSpacing: "0.04em",
                }}
              >
                {item.dateLabel}
              </span>
            </div>
            {item.note && (
              <div
                className="font-travis"
                style={{
                  color: "var(--ink-3)",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {item.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </SubcardFrame>
  );
}

function formatShort(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRange(startIso: string, endIso: string | undefined): string {
  const start = formatShort(startIso);
  if (!endIso || endIso === startIso) return start;
  const end = formatShort(endIso);
  return `${start} → ${end}`;
}
