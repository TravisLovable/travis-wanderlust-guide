import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubcardFrame } from "./SubcardFrame";
import { ArrowIcon } from "../IconSet";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";

type TransitCardProps = {
  placeDetails: SelectedPlace | null;
  origin?: string;
};

/**
 * Actual `uber-availability` response shape (captured 2026-05-13).
 * Diverges from the function's schema — we adapt to reality.
 */
interface TransitResponse {
  primary_provider?: unknown;
  status?: unknown;
  airport_to_city_time?: unknown;
  available_services?: unknown;
  local_alternatives?: unknown;
  insight?: unknown;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

const asStringArray = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  return v.map(asString).filter((x): x is string => !!x);
};

type Row = {
  mode: string;
  route?: string;
  time?: string;
  cost?: string;
  recommended?: boolean;
};

export function TransitCard({ placeDetails, origin }: TransitCardProps) {
  const [data, setData] = React.useState<TransitResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!placeDetails) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const destination = placeDetails.formatted_address || placeDetails.name;

    (async () => {
      try {
        const { data: resp, error } = await supabase.functions.invoke<TransitResponse>(
          "uber-availability",
          { body: { destination, ...(origin ? { origin } : {}) } },
        );
        if (cancelled) return;
        setData(error ? null : resp ?? null);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placeDetails, origin]);

  const primary = asString(data?.primary_provider);
  const status = asString(data?.status);
  const time = asString(data?.airport_to_city_time);
  const services = asStringArray(data?.available_services);
  const alternatives = asStringArray(data?.local_alternatives);
  const insight = asString(data?.insight);

  const rows: Row[] = [];
  if (primary) {
    rows.push({
      mode: primary,
      route: services.length > 0 ? services.join(" · ") : undefined,
      time,
      cost: undefined,
      recommended: true,
    });
  }
  for (const alt of alternatives) {
    rows.push({ mode: alt });
  }

  const meta = status ? <StatusPill label={status} /> : undefined;
  const footnote = insight ?? (loading ? undefined : "No transit details available");

  return (
    <SubcardFrame label="Airport → City" meta={meta} footnote={footnote}>
      <Table rows={rows} loading={loading} />
    </SubcardFrame>
  );
}

function StatusPill({ label }: { label: string }) {
  const active = label.toLowerCase() === "active";
  const color = active ? "var(--signal-ok)" : "var(--ink-3)";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-travis-mono uppercase"
      style={{ fontSize: 10, letterSpacing: "0.12em", color }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

function Table({ rows, loading }: { rows: Row[]; loading: boolean }) {
  const cols = "28px 1fr 1.3fr 70px 70px 18px";

  if (loading && rows.length === 0) {
    return (
      <div
        className="font-travis"
        style={{ padding: "16px 20px", color: "var(--ink-3)", fontSize: 13 }}
      >
        Resolving transit options…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className="font-travis"
        style={{ padding: "16px 20px", color: "var(--ink-4)", fontSize: 13 }}
      >
        —
      </div>
    );
  }

  return (
    <div>
      <div
        className="font-travis-mono uppercase"
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 12,
          padding: "10px 20px",
          borderBottom: "1px solid var(--hair)",
          fontSize: 9.5,
          letterSpacing: "0.12em",
          color: "var(--ink-4)",
        }}
      >
        <span>#</span>
        <span>Mode</span>
        <span>Route</span>
        <span style={{ textAlign: "right" }}>Time</span>
        <span style={{ textAlign: "right" }}>Cost</span>
        <span />
      </div>

      {rows.map((row, i) => {
        const isLast = i === rows.length - 1;
        return (
          <div
            key={`${row.mode}-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: 12,
              padding: "12px 20px",
              alignItems: "center",
              borderBottom: isLast ? 0 : "1px solid var(--hair)",
              background: row.recommended
                ? "color-mix(in oklch, var(--signal-ok) 6%, transparent)"
                : "transparent",
            }}
          >
            <span
              className="font-travis-mono"
              style={{ color: "var(--ink-4)", fontSize: 11 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div>
              <div
                className="font-travis"
                style={{ color: "var(--ink)", fontSize: 14, fontWeight: 500 }}
              >
                {row.mode}
              </div>
              {row.recommended && (
                <div
                  className="font-travis-mono uppercase"
                  style={{
                    color: "var(--signal-ok)",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    marginTop: 2,
                  }}
                >
                  Recommended
                </div>
              )}
            </div>

            <div
              className="font-travis truncate"
              style={{ color: "var(--ink-2)", fontSize: 12.5 }}
              title={row.route ?? undefined}
            >
              {row.route ?? "—"}
            </div>

            <div
              className="font-travis-mono tabular-nums"
              style={{
                textAlign: "right",
                color: row.time ? "var(--ink)" : "var(--ink-4)",
                fontSize: 12.5,
              }}
            >
              {row.time ?? "—"}
            </div>

            <div
              className="font-travis-mono tabular-nums"
              style={{
                textAlign: "right",
                color: row.cost ? "var(--ink)" : "var(--ink-4)",
                fontSize: 12.5,
              }}
            >
              {row.cost ?? "—"}
            </div>

            <div style={{ color: "var(--ink-4)" }}>
              <ArrowIcon width={12} height={12} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
