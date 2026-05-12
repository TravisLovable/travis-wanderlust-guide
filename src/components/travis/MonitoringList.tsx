import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePinnedLocationsDb,
  type PinnedLocationRow,
} from "@/hooks/usePinnedLocationsDb";

type MonitoringListProps = {
  onPick: (row: PinnedLocationRow) => void;
};

export function MonitoringList({ onPick }: MonitoringListProps) {
  const { isAuthenticated, loading: authLoading, openAuthModal } = useAuth();
  const { rows, loading, error } = usePinnedLocationsDb();

  return (
    <section
      className="mt-12 md:mt-24 pt-7 border-t border-travis-hair"
      style={{ borderColor: "var(--hair)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-12">
        <div>
          <div
            className="font-travis-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.32)",
            }}
          >
            Monitoring
          </div>
          <p
            className="font-travis mt-2.5"
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

        <div>
          {authLoading || loading ? (
            <StateRow label="Loading…" />
          ) : !isAuthenticated ? (
            <EmptyState
              label="Sign in to track destinations"
              cta={{ label: "Sign in", onClick: openAuthModal }}
            />
          ) : error ? (
            <StateRow label={`Error · ${error}`} tone="warn" />
          ) : rows.length === 0 ? (
            <EmptyState label="No destinations monitored yet. Search a destination to start." />
          ) : (
            <RowList rows={rows} onPick={onPick} />
          )}
        </div>
      </div>
    </section>
  );
}

function RowList({
  rows,
  onPick,
}: {
  rows: PinnedLocationRow[];
  onPick: (row: PinnedLocationRow) => void;
}) {
  return (
    <div>
      <div
        className="hidden md:grid font-travis-mono uppercase"
        style={{
          gridTemplateColumns: "22px 1.3fr 1fr 1.2fr 0.8fr",
          gap: 16,
          padding: "0 0 8px 0",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        <span />
        <span>Destination</span>
        <span>Region</span>
        <span>Status</span>
        <span>Pinned</span>
      </div>

      {rows.map((row) => (
        <RowItem key={row.id} row={row} onClick={() => onPick(row)} />
      ))}
    </div>
  );
}

function RowItem({
  row,
  onClick,
}: {
  row: PinnedLocationRow;
  onClick: () => void;
}) {
  const flag = row.country_code ? countryCodeToFlag(row.country_code) : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left cursor-pointer bg-transparent border-0 hover:bg-white/[0.02] transition-colors"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 4,
        padding: "14px 0",
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <div className="md:hidden flex items-center gap-2">
        <span style={{ fontSize: 16, opacity: 0.9 }}>{flag}</span>
        <span
          className="font-travis"
          style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}
        >
          {row.name}
        </span>
      </div>
      <div className="md:hidden font-travis flex justify-between" style={{ fontSize: 12, color: "var(--ink-3)" }}>
        <span className="truncate">{row.region ?? row.formatted_address}</span>
        <span className="font-travis-mono shrink-0 pl-3" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--ink-4)" }}>
          {timeSince(row.pinned_at)}
        </span>
      </div>

      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: "22px 1.3fr 1fr 1.2fr 0.8fr",
          gap: 16,
          alignItems: "center",
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 15, opacity: 0.9, lineHeight: 1 }}>{flag}</span>
        <span
          className="font-travis truncate"
          style={{ color: "var(--ink)", fontWeight: 500, fontSize: 14 }}
        >
          {row.name}
        </span>
        <span
          className="font-travis-mono truncate"
          style={{ color: "var(--ink-2)" }}
        >
          {row.region ?? row.formatted_address}
        </span>
        <span
          className="font-travis"
          style={{ fontSize: 12.5, color: "var(--ink-3)" }}
        >
          Monitored · set trip dates to resolve
        </span>
        <span
          className="font-travis-mono"
          style={{
            color: "var(--ink-3)",
            fontSize: 11,
            letterSpacing: "0.04em",
          }}
        >
          {timeSince(row.pinned_at)}
        </span>
      </div>
    </button>
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
      className="font-travis flex flex-col gap-3 items-start"
      style={{
        padding: "20px 0",
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
