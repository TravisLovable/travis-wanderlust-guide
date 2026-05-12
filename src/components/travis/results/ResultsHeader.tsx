import * as React from "react";
import { ChevronLeftIcon } from "../IconSet";
import { differenceInDays, format } from "date-fns";

type ResultsHeaderProps = {
  /** City name (left of the comma). */
  city: string;
  /** Country name (right of the comma) — optional. */
  country?: string | null;
  /** Checkin ISO date string. */
  checkin: string;
  /** Checkout ISO date string. */
  checkout: string;
  /** Origin three-letter code, e.g. NYC. */
  originCode?: string;
  /** Destination three-letter code, e.g. LIS. */
  destCode?: string;
  /** Optional ISO 3166-1 alpha-2 country code, lowercase or uppercase. */
  countryCode?: string | null;
  /** Click handler for the "← New query" pill. */
  onNewQuery: () => void;
};

export function ResultsHeader({
  city,
  country,
  checkin,
  checkout,
  originCode,
  destCode,
  countryCode,
  onNewQuery,
}: ResultsHeaderProps) {
  const start = toDate(checkin);
  const end = toDate(checkout);
  const duration =
    start && end ? Math.max(1, differenceInDays(end, start)) : null;
  const dateRange =
    start && end
      ? `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
      : "";

  return (
    <section
      className="px-5 md:px-8 py-7 md:py-10 border-b"
      style={{
        background: "var(--bg)",
        borderColor: "var(--hair)",
        color: "var(--ink)",
      }}
    >
      <div className="max-w-[1180px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 md:items-end">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={onNewQuery}
                className="inline-flex items-center gap-1 cursor-pointer bg-transparent font-travis-mono uppercase"
                style={{
                  border: "1px solid var(--hair-strong)",
                  borderRadius: 4,
                  color: "var(--ink-3)",
                  padding: "4px 10px 4px 8px",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                }}
              >
                <ChevronLeftIcon width={11} height={11} />
                New query
              </button>
              <span
                className="font-travis-mono uppercase inline-flex items-center gap-2"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  color: "var(--signal-ok)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    background: "var(--signal-ok)",
                  }}
                />
                Cleared for departure
              </span>
            </div>

            <h1
              className="font-travis-display uppercase"
              style={{
                fontWeight: 500,
                fontSize: "clamp(48px, 10vw, 116px)",
                letterSpacing: "-0.035em",
                lineHeight: 0.9,
                margin: "6px 0 10px",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {city.toUpperCase()}
            </h1>

            <div
              className="font-travis-display uppercase flex flex-wrap items-baseline gap-x-2"
              style={{
                fontWeight: 500,
                fontSize: 18,
                letterSpacing: "0.02em",
                color: "rgba(255,255,255,0.55)",
                margin: "0 0 14px",
              }}
            >
              {country && <span>{country.toUpperCase()}</span>}
              {country && dateRange && (
                <span style={{ color: "var(--ink-4)" }}>·</span>
              )}
              {dateRange && <span>{dateRange.toUpperCase()}</span>}
            </div>

            <div
              className="font-travis-mono tabular-nums flex flex-wrap items-center gap-x-3 gap-y-1"
              style={{
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {originCode && destCode && (
                <>
                  <span>
                    {originCode} → {destCode}
                  </span>
                  <span style={{ color: "var(--ink-4)" }}>·</span>
                </>
              )}
              {duration !== null && (
                <>
                  <span>
                    {duration} day{duration === 1 ? "" : "s"}
                  </span>
                  {countryCode && <span style={{ color: "var(--ink-4)" }}>·</span>}
                </>
              )}
              {countryCode && <span>{countryCode.toUpperCase()}</span>}
            </div>
          </div>

          <div className="md:text-right">
            <div
              className="font-travis-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.32)",
                marginBottom: 4,
              }}
            >
              Trip
            </div>
            <div
              className="font-travis-mono tabular-nums"
              style={{
                fontSize: 26,
                color: "var(--ink)",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              {duration ?? "—"}
              <span
                className="ml-2"
                style={{
                  fontSize: 13,
                  color: "var(--ink-3)",
                  letterSpacing: "0.04em",
                }}
              >
                day{duration === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function toDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return Number.isNaN(d.getTime()) ? null : d;
}
