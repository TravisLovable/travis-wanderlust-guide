import * as React from "react";
import type { TravisInsights } from "@/types/insights";

type BriefBlockProps = {
  insights: TravisInsights | null;
  loading: boolean;
};

const SKELETON_LINE = (
  <span
    aria-hidden
    className="travis-sweep"
    style={{
      display: "inline-block",
      width: "100%",
      height: 14,
      background: "var(--bg-inset)",
      borderRadius: 3,
    }}
  />
);

/**
 * AI Brief — single-paragraph memo plus a 4-cell micro-brief grid.
 *
 * Wired to useTravisInsights via the `insights` prop (passed in from
 * ResultsPage so we don't double-fetch). The paragraph uses
 * `insights.greeting` (the synthesizing one-liner). The 4-cell grid
 * exposes the four topic insights that map cleanly to the design's
 * "Entry / Weather / Health / Logistics" headers.
 *
 * No mock data — if a topic insight is missing, the cell renders a
 * skeleton or "—" rather than the design's example strings.
 */
export function BriefBlock({ insights, loading }: BriefBlockProps) {
  const greeting = insights?.greeting?.trim() ?? "";

  const cells = [
    { k: "Entry",     v: insights?.visa },
    { k: "Weather",   v: insights?.weather },
    { k: "Health",    v: insights?.healthEntry },
    { k: "Logistics", v: insights?.transportation },
  ];

  return (
    <section
      className="px-5 md:px-8 py-8 md:py-12"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="max-w-[1180px] mx-auto w-full grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-12">
        <div>
          <div
            className="font-travis-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "var(--signal-ok)",
              marginBottom: 8,
            }}
          >
            AI brief
          </div>
          <p
            className="font-travis"
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              lineHeight: 1.55,
              maxWidth: 220,
            }}
          >
            What Travis would tell a colleague in one paragraph.
          </p>
        </div>

        <div>
          <p
            className="font-travis"
            style={{
              fontSize: "clamp(17px, 2.6vw, 22px)",
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
              margin: "0 0 22px 0",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 400,
              textWrap: "pretty",
            }}
          >
            {loading && !greeting ? (
              <span className="inline-block w-full">{SKELETON_LINE}</span>
            ) : greeting ? (
              greeting
            ) : (
              <span style={{ color: "var(--ink-4)" }}>
                Brief unavailable. Travis will retry on next page load.
              </span>
            )}
          </p>

          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{
              border: "1px solid var(--hair)",
              borderRadius: 4,
              background: "var(--bg-inset)",
            }}
          >
            {cells.map((c, i) => (
              <div
                key={c.k}
                style={{
                  padding: "14px 18px",
                  borderRight:
                    i < cells.length - 1 ? "1px solid var(--hair)" : 0,
                  borderBottom: i < 2 ? "1px solid var(--hair)" : 0,
                }}
                className="md:border-b-0"
              >
                <div
                  className="font-travis-mono uppercase"
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    color: "var(--ink-3)",
                    marginBottom: 6,
                  }}
                >
                  {c.k}
                </div>
                <div
                  className="font-travis"
                  style={{ fontSize: 12, lineHeight: 1.45, color: "var(--ink-2)" }}
                >
                  {loading && !c.v ? (
                    SKELETON_LINE
                  ) : c.v ? (
                    c.v
                  ) : (
                    <span style={{ color: "var(--ink-4)" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
