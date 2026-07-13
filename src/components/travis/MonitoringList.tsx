import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePinnedLocationsDb,
  type PinnedLocationRow,
} from "@/hooks/usePinnedLocationsDb";
import { ChevronDownIcon } from "./IconSet";

type MonitoringListProps = {
  onPick: (row: PinnedLocationRow) => void;
};

type StatusKind = "cleared" | "note" | "blocker" | "idle";

const STATUS_COLOR: Record<StatusKind, string> = {
  cleared: "var(--signal-ok)",
  note: "var(--signal-warn)",
  blocker: "var(--signal-stop)",
  idle: "var(--ink-3)",
};

/** A single monitored destination as the row renders it. */
type RowVM = {
  key: string;
  flag: string;
  title: string;
  /** Mono secondary line — trip date range, or region for real pins. */
  meta: string;
  statusKind: StatusKind;
  statusLabel: string;
  onPick?: () => void;
};

/**
 * Logged-out preview rows. These are illustrative, not real monitoring — the
 * sign-in CTA below them is the conversion path. Day counts match each range.
 */
const MOCK_ROWS: RowVM[] = [
  {
    key: "lisbon",
    flag: "🇵🇹",
    title: "Lisbon, Portugal",
    meta: "May 7 → May 21",
    statusKind: "cleared",
    statusLabel: "Clear to enter · 14 days",
  },
  {
    key: "tokyo",
    flag: "🇯🇵",
    title: "Tokyo, Japan",
    meta: "Jun 15 → Jun 24",
    statusKind: "cleared",
    statusLabel: "Visa-free · 9 days",
  },
  {
    key: "mexico-city",
    flag: "🇲🇽",
    title: "Mexico City, Mexico",
    meta: "Aug 3 → Aug 10",
    statusKind: "note",
    statusLabel: "Tourist card · 7 days",
  },
  {
    key: "reykjavik",
    flag: "🇮🇸",
    title: "Reykjavik, Iceland",
    meta: "Sep 12 → Sep 19",
    statusKind: "note",
    statusLabel: "ETIAS required · 7 days",
  },
];

export function MonitoringList({ onPick }: MonitoringListProps) {
  const { isAuthenticated, loading: authLoading, openAuthModal } = useAuth();
  const { rows, loading, error } = usePinnedLocationsDb();
  const [collapsed, setCollapsed] = React.useState(false);

  const realRows: RowVM[] = rows.map((row) => ({
    key: row.id,
    flag: row.country_code ? countryCodeToFlag(row.country_code) : "📍",
    title: row.name,
    meta: row.region ?? row.formatted_address,
    statusKind: "idle",
    statusLabel: `Monitored · ${timeSince(row.pinned_at)}`,
    onPick: () => onPick(row),
  }));

  const busy = authLoading || loading;
  // Signed out the rows are illustrative, so the slot reads "sample" rather than a
  // count — a number here is indistinguishable from real tracked destinations.
  const countLabel = busy ? "0" : !isAuthenticated ? "Sample" : String(realRows.length);

  return (
    <section
      className="mt-16 md:mt-24 pt-7 border-t border-travis-hair"
      style={{ borderColor: "var(--hair)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-12">
        <div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1.5 bg-transparent border-0 cursor-pointer font-travis-mono uppercase p-0"
            style={{ fontSize: 9, letterSpacing: "0.16em" }}
          >
            <span style={{ color: "rgba(255,255,255,0.32)" }}>Monitoring</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span style={{ color: "var(--ink-3)" }}>{countLabel}</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span style={{ color: "var(--ink-3)" }}>{collapsed ? "Show" : "Hide"}</span>
            <ChevronDownIcon
              width={9}
              height={9}
              style={{
                color: "var(--ink-3)",
                transform: collapsed ? "none" : "rotate(180deg)",
              }}
            />
          </button>
          <p
            className="font-travis mt-3"
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              lineHeight: 1.5,
              maxWidth: 200,
            }}
          >
            Travis will flag changes before they affect your trip.
          </p>
        </div>

        {!collapsed && (
          <div>
            {busy ? (
              <StateRow label="Loading…" />
            ) : !isAuthenticated ? (
              <>
                <RowList rows={MOCK_ROWS} sample />
                <EmptyState
                  label="Sign in to track destinations"
                  cta={{ label: "Get started", onClick: openAuthModal }}
                />
              </>
            ) : error ? (
              <StateRow label={`Error · ${error}`} tone="warn" />
            ) : realRows.length === 0 ? (
              <StateRow label="No destinations monitored yet. Search a destination to start." />
            ) : (
              <RowList rows={realRows} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RowList({ rows, sample = false }: { rows: RowVM[]; sample?: boolean }) {
  return (
    <div>
      {rows.map((row) => (
        <Row key={row.key} row={row} sample={sample} />
      ))}
    </div>
  );
}

function Row({ row, sample = false }: { row: RowVM; sample?: boolean }) {
  const interactive = !!row.onPick;
  const Tag = interactive ? "button" : "div";
  return (
    <Tag
      {...(interactive ? { type: "button" as const, onClick: row.onPick } : {})}
      className={[
        "w-full text-left bg-transparent border-0 transition-colors",
        interactive ? "cursor-pointer hover:bg-white/[0.02]" : "",
      ].join(" ")}
      style={{
        display: "block",
        padding: "16px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 18, opacity: 0.9, lineHeight: 1 }}>{row.flag}</span>
        <span
          className="font-travis flex-1 truncate"
          style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}
        >
          {row.title}
        </span>
        {sample && (
          <span
            className="font-travis-mono uppercase shrink-0"
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              color: "var(--ink-4)",
              border: "1px solid var(--hair)",
              borderRadius: 4,
              padding: "2px 5px",
            }}
          >
            Example
          </span>
        )}
      </div>
      <div
        className="flex items-center justify-between gap-3 mt-1.5"
        style={{ paddingLeft: 28 }}
      >
        <span
          className="font-travis-mono shrink-0"
          style={{ fontSize: 11, letterSpacing: "0.04em", color: "var(--ink-3)" }}
        >
          {row.meta}
        </span>
        <span
          className="font-travis inline-flex items-center gap-1.5 min-w-0"
          style={{ fontSize: 11, color: "var(--ink-2)" }}
        >
          <span
            aria-hidden
            className="shrink-0"
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: STATUS_COLOR[row.statusKind],
              display: "inline-block",
            }}
          />
          <span className="truncate">{row.statusLabel}</span>
        </span>
      </div>
    </Tag>
  );
}

function EmptyState({
  label,
  cta,
}: {
  label: string;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className="font-travis flex flex-col gap-4 items-start"
      style={{
        padding: "40px 0 0",
        color: "var(--ink-3)",
        fontSize: 13,
      }}
    >
      <span>{label}</span>
      {cta && (
        <button
          type="button"
          onClick={cta.onClick}
          className="cursor-pointer border border-travis-hair-strong bg-transparent font-travis-mono uppercase"
          style={{
            padding: "6px 12px",
            fontSize: 10.5,
            letterSpacing: "0.1em",
            color: "var(--ink-2)",
            borderRadius: 4,
          }}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}

function StateRow({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "warn";
}) {
  return (
    <div
      className="font-travis"
      style={{
        padding: "16px 0",
        color: tone === "warn" ? "var(--signal-warn)" : "var(--ink-3)",
        fontSize: 13,
      }}
    >
      {label}
    </div>
  );
}

function timeSince(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.floor((now - then) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 14) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 8) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

function countryCodeToFlag(code: string): string {
  const c = code.trim().toUpperCase();
  if (c.length !== 2) return "";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(A + c.charCodeAt(0) - base, A + c.charCodeAt(1) - base);
}
