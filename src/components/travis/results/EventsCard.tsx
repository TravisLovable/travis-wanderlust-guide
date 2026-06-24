import * as React from "react";
import { SubcardFrame } from "./SubcardFrame";
import { useEvents } from "@/hooks/useEvents";
import type { TravisEvent } from "@/services/events";
import type { SelectedPlace } from "@/types/place";

type EventsCardProps = {
  placeDetails: SelectedPlace | null;
  dates: { checkin: string; checkout: string };
  destination: string;
};

const MAX_ROWS = 8;

/**
 * Events cell ("During your stay").
 *
 * Backed by the provider-merge events service (src/services/events):
 *   - Nager.Date   — public holidays/observances, direct keyless client call
 *   - Ticketmaster — ticketed events, via the ticketmaster-events Edge Function
 *
 * The service normalizes, dedupes, and ranks; this card only formats + renders.
 * No fabrication: when no provider returns anything we show an honest empty
 * state rather than inventing events.
 */
export function EventsCard({ placeDetails, dates, destination }: EventsCardProps) {
  const city = asString(placeDetails?.name) ?? asString(destination) ?? "";
  const countryCode = placeDetails?.country_code?.trim().toUpperCase();

  const { events, isLoading } = useEvents(
    dates.checkin && dates.checkout && (countryCode || city)
      ? {
          city,
          countryCode,
          latitude: placeDetails?.latitude,
          longitude: placeDetails?.longitude,
          startDate: dates.checkin,
          endDate: dates.checkout,
        }
      : null,
  );

  const rows = events.slice(0, MAX_ROWS);

  return (
    <SubcardFrame label="During your stay">
      <div style={{ padding: 0 }}>
        {isLoading && rows.length === 0 && (
          <div
            className="font-travis"
            style={{ padding: "16px 20px", color: "var(--ink-3)", fontSize: 13 }}
          >
            Resolving events…
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div
            className="font-travis"
            style={{ padding: "16px 20px", color: "var(--ink-4)", fontSize: 13 }}
          >
            No major events found for these dates.
          </div>
        )}

        {rows.map((item, i) => (
          <Row key={item.id} item={item} last={i === rows.length - 1} />
        ))}
      </div>
    </SubcardFrame>
  );
}

function Row({ item, last }: { item: TravisEvent; last: boolean }) {
  const dateLabel = formatRange(item.startDate, item.endDate);
  const note = noteFor(item);
  const titleEl = (
    <span
      className="font-travis truncate"
      style={{ color: "var(--ink)", fontSize: 13.5, fontWeight: 500 }}
    >
      {item.title}
    </span>
  );

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid var(--hair)",
      }}
    >
      <div className="flex justify-between items-baseline gap-3">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate"
            style={{ textDecoration: "none" }}
          >
            {titleEl}
          </a>
        ) : (
          titleEl
        )}
        <span
          className="font-travis-mono shrink-0"
          style={{ color: "var(--ink-3)", fontSize: 11, letterSpacing: "0.04em" }}
        >
          {dateLabel}
        </span>
      </div>
      {note && (
        <div
          className="font-travis"
          style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 3 }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

/** Secondary line: category, plus venue when known. */
function noteFor(item: TravisEvent): string | undefined {
  const cat = item.category === "holiday" ? "Holiday" : asString(item.category);
  const parts = [cat, asString(item.venue)].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

function formatShort(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRange(startIso: string, endIso: string | undefined): string {
  const start = formatShort(startIso);
  if (!endIso || endIso === startIso) return start;
  return `${start} → ${formatShort(endIso)}`;
}
