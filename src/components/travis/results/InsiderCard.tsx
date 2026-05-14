import * as React from "react";
import { SubcardFrame } from "./SubcardFrame";
import type { TravisInsights } from "@/types/insights";

type InsiderCardProps = {
  insights: TravisInsights | null;
  loading?: boolean;
};

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

const SLOT_COUNT = 5;

/**
 * Insider asides cell.
 *
 * Renders the design's 5-slot numbered list. Today the data layer
 * (useTravisInsights) returns a single `culturalInsights` string —
 * that occupies slot 01; slots 02–05 show "—".
 *
 * Step 6.5 updates the Anthropic prompt to return
 * `insiderAsides: string[]` of up to 5 items. Once that ships, this
 * card reads from the array.
 *
 * Defensive: if `insights.insiderAsides` already arrives as an array
 * (out-of-order ship), it's preferred over the legacy single string.
 */
export function InsiderCard({ insights, loading }: InsiderCardProps) {
  // Defensive: prefer a future-shipped array if present.
  const asidesRaw = (insights as unknown as { insiderAsides?: unknown })
    ?.insiderAsides;
  const asArray = Array.isArray(asidesRaw)
    ? asidesRaw.map(asString).filter((x): x is string => !!x)
    : null;

  const singleString = asString(insights?.culturalInsights);

  const items: Array<string | undefined> = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (asArray && asArray.length > 0) {
      items.push(asArray[i]);
    } else if (i === 0) {
      items.push(singleString);
    } else {
      items.push(undefined);
    }
  }

  const meta = asArray ? undefined : (
    <span
      className="font-travis-mono uppercase"
      style={{
        fontSize: 9.5,
        letterSpacing: "0.12em",
        color: "var(--ink-4)",
      }}
    >
      Tone: dry
    </span>
  );

  return (
    <SubcardFrame label="Insider asides" meta={meta}>
      <div style={{ padding: "4px 0" }}>
        {loading && items.every((x) => !x) && (
          <div
            className="font-travis"
            style={{
              padding: "16px 20px",
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            Resolving…
          </div>
        )}
        {(!loading || items.some((x) => !!x)) &&
          items.map((item, i) => {
            const hasValue = !!item;
            const isLast = i === items.length - 1;
            return (
              <div
                key={i}
                className="grid items-baseline"
                style={{
                  gridTemplateColumns: "28px 1fr",
                  padding: "12px 20px",
                  borderBottom: isLast
                    ? "none"
                    : "1px dashed var(--hair)",
                  gap: 10,
                }}
              >
                <span
                  className="font-travis-mono"
                  style={{
                    color: "var(--ink-4)",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-travis"
                  style={{
                    color: hasValue ? "var(--ink-2)" : "var(--ink-4)",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    fontWeight: hasValue ? 400 : 400,
                  }}
                >
                  {item ?? "—"}
                </span>
              </div>
            );
          })}
      </div>
    </SubcardFrame>
  );
}
