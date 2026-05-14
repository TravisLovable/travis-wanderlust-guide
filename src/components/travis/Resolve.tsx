import * as React from "react";
import { Topbar } from "./Topbar";
import { GlobePanel } from "./Globe";
import { CheckIcon } from "./IconSet";

type ResolveProps = {
  /** Destination display name, e.g. "Lisbon" or "Lisbon, Portugal". */
  destination: string;
  /** Destination latitude/longitude for the globe arc. */
  destLatLng: [number, number];
  /** Optional 3-letter destination code shown in the corner readout. */
  destCode?: string;
  /** Optional 3-letter origin code shown in the corner readout. */
  originCode?: string;
  /** ISO checkin / checkout. Rendered as a human-readable range. */
  checkin: string;
  checkout: string;
  /** Passport country (display label). */
  passport?: string;
  /** Fires when the timeline finishes its hold. */
  onDone: () => void;
};

const STEPS = [
  { k: "Passport rules",       detail: "Schengen 90/180 · entry window" },
  { k: "ETIAS enforcement",    detail: "Cross-ref EU rollout schedule" },
  { k: "CDC + WHO advisories", detail: "Destination + current month" },
  { k: "Weather patterns",     detail: "Climatology + 14-day forecast" },
  { k: "Airport transit",      detail: "Ranked options to city center" },
  { k: "FX mid-market",        detail: "USD pair · 7-day trend" },
  { k: "Local calendar",       detail: "Holidays, observances, festivals" },
  { k: "Cultural context",     detail: "Language, etiquette, pace" },
];

const TOTAL_MS = 8600;
const HOLD_MS = 1400;

export function Resolve({
  destination,
  destLatLng,
  destCode = "DEST",
  originCode = "NYC",
  checkin,
  checkout,
  passport = "US",
  onDone,
}: ResolveProps) {
  const [t, setT] = React.useState(0);

  React.useEffect(() => {
    let raf: number;
    const start = performance.now();
    const ease = (x: number) => 1 - Math.pow(1 - x, 2.2);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / TOTAL_MS);
      setT(ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  React.useEffect(() => {
    if (t < 1) return;
    const id = window.setTimeout(onDone, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [t, onDone]);

  const doneCount = React.useMemo(() => {
    let count = 0;
    for (let i = 0; i < STEPS.length; i++) {
      if (t >= (i + 1) / STEPS.length - 0.004) count++;
    }
    return count;
  }, [t]);
  const currentIdx = Math.min(STEPS.length - 1, Math.floor(t * STEPS.length));
  const progress = t;
  const elapsed = (t * 4.0).toFixed(1);

  const [city, country] = destination.split(",").map((s) => s.trim());
  const dateRange = formatDateRange(checkin, checkout);

  return (
    <div
      className="min-h-screen w-full font-travis"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <Topbar
        context={{ clockLocal: localClock(), passport, home: originCode }}
      />

      <div
        className="max-w-[1180px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20"
        style={{ padding: "60px 24px" }}
      >
        {/* Left: state + progress + globe */}
        <div>
          <div
            className="font-travis-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "var(--ink-4)",
              marginBottom: 20,
            }}
          >
            Resolving
          </div>

          <div
            className="font-travis-display uppercase"
            style={{
              fontWeight: 500,
              fontSize: "clamp(40px, 8vw, 70px)",
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
              marginBottom: 8,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {city.toUpperCase()}
            {country && (
              <>
                <span style={{ color: "var(--ink-4)" }}>,</span>{" "}
                <span style={{ fontWeight: 500, fontSize: "0.74em" }}>
                  {country.toUpperCase()}
                </span>
              </>
            )}
          </div>

          <div
            className="font-travis"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              marginBottom: 28,
            }}
          >
            {dateRange} · {passport} passport
          </div>

          <div style={{ marginBottom: 24 }}>
            <div
              className="grid font-travis-mono"
              style={{
                gridTemplateColumns: "auto 1fr auto",
                gap: 14,
                alignItems: "center",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "var(--ink-2)",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--ink)" }}>{originCode}</span>
              <span
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--ink-3)",
                }}
              >
                {doneCount}/{STEPS.length} RESOLVED · {elapsed}S / 4.0S
              </span>
              <span style={{ color: "var(--ink)" }}>{destCode}</span>
            </div>
            <div
              style={{
                position: "relative",
                height: 2,
                background: "var(--hair)",
              }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  background: "var(--signal-ok)",
                  transition: "width 60ms linear",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${progress * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: "var(--signal-ok)",
                  boxShadow: "0 0 0 4px color-mix(in oklch, var(--signal-ok) 18%, transparent)",
                }}
              />
            </div>
          </div>

          <GlobePanel dest={destLatLng} destLabel={`${destCode} · ${city.toUpperCase()}`} size={380} />
        </div>

        {/* Right: ledger */}
        <div>
          <div
            className="font-travis-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "var(--ink-4)",
              marginBottom: 20,
            }}
          >
            Resolver ledger
          </div>

          <div className="font-travis-mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
            {STEPS.map((s, i) => {
              const isDone = i < doneCount;
              const isCurrent = !isDone && i === currentIdx;
              const isPending = !isDone && !isCurrent;
              return (
                <div
                  key={s.k}
                  className={isCurrent ? "travis-fade" : ""}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 1fr auto",
                    gap: 14,
                    alignItems: "baseline",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--hair)",
                    opacity: isPending ? 0.3 : 1,
                    transition: "opacity 0.3s",
                  }}
                >
                  <span style={{ color: "var(--ink-4)", fontSize: 10 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <div
                      style={{
                        color: isDone
                          ? "var(--ink-2)"
                          : isCurrent
                            ? "var(--ink)"
                            : "var(--ink-3)",
                        fontSize: 12.5,
                      }}
                    >
                      {s.k}
                    </div>
                    <div
                      style={{
                        color: "var(--ink-4)",
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      {s.detail}
                    </div>
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: isDone
                        ? "var(--signal-ok)"
                        : isCurrent
                          ? "var(--signal-warn)"
                          : "var(--ink-4)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isDone && (
                      <>
                        <CheckIcon width={11} height={11} />
                        RESOLVED
                      </>
                    )}
                    {isCurrent && (
                      <>
                        <span
                          className="travis-pulse"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 99,
                            background: "var(--signal-warn)",
                          }}
                        />
                        RESOLVING
                      </>
                    )}
                    {isPending && "QUEUED"}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: "14px 16px",
              background: "var(--bg-inset)",
              border: "1px solid var(--hair)",
              borderRadius: 4,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              className="travis-pulse"
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: "var(--signal-ok)",
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div
              className="font-travis"
              style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}
            >
              Cross-checking with European Commission, Portuguese SEF, and WHO against the rules that
              applied on{" "}
              <span className="font-travis-mono" style={{ color: "var(--ink)" }}>
                {formatShortDate(checkin)}
              </span>
              . You'll see conclusions, not a dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateRange(checkin: string, checkout: string): string {
  if (!checkin || !checkout) return "";
  return `${formatShortDate(checkin)} → ${formatShortDate(checkout)}`;
}

function formatShortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function localClock(): string {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop() ?? "";
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return tz ? `${hh}:${mm} ${tz}` : `${hh}:${mm}`;
}
