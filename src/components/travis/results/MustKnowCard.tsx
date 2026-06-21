import * as React from "react";
import { StatusPip, type StatusKind } from "../StatusPip";
import { KeyValueRow } from "./KeyValueRow";

export type MustKnowDetailRow = {
  label: React.ReactNode;
  /** `null` / `undefined` / empty string renders "—". */
  value?: React.ReactNode;
};

type MustKnowCardProps = {
  /** Status pip kind (cleared / favorable / note / attention / blocker). */
  kind: StatusKind;
  /** Eyebrow column label (Entry / Health / Weather / Time). */
  label: React.ReactNode;
  /** Large summary text (e.g. "Visa-free", "14°–23°C"). Renders "—" if empty. */
  headline?: React.ReactNode;
  /** Smaller line under the headline. */
  sub?: React.ReactNode;
  /** Up to 4 key-value rows. Missing values render "—". */
  details: MustKnowDetailRow[];
  /** Source / verification footnote (e.g. "Source: WHO, synced today"). */
  footnote?: React.ReactNode;
  /** Optional control rendered in the status row, left of the pip (e.g. a unit toggle). */
  headerAction?: React.ReactNode;
  /** Whether this is the rightmost cell in the strip. Removes the right divider. */
  isLast?: boolean;
};

/**
 * One cell of the Must Know strip. The strip itself is rendered by
 * MustKnowSection — this component only renders cell contents (no outer
 * border) so the four cells can share a single unified bordered container
 * with internal dividers.
 *
 * Vertical structure inside one cell:
 *   ┌─ eyebrow ─────────── pip ─┐  ← status row
 *   ├───────────────────────────┤
 *   │ HEADLINE                  │  ← conclusion row
 *   │ sub                       │
 *   ├───────────────────────────┤
 *   │ label    ........  value  │  ← detail rows
 *   │ label    ........  value  │
 *   │ label    ........  value  │
 *   │ label    ........  value  │
 *   │                           │
 *   │ footnote                  │
 *   └───────────────────────────┘
 */
export function MustKnowCard({
  kind,
  label,
  headline,
  sub,
  details,
  footnote,
  headerAction,
  isLast = false,
}: MustKnowCardProps) {
  const hasHeadline =
    headline !== null && headline !== undefined && headline !== "";
  const headlineColor =
    kind === "cleared"
      ? "var(--ink)"
      : kind === "favorable"
        ? "var(--signal-ok)"
        : kind === "note" || kind === "attention"
          ? "var(--signal-warn)"
          : "var(--signal-stop)";

  return (
    <div
      className="flex flex-col"
      style={{
        borderRight: isLast ? 0 : "1px solid var(--hair)",
      }}
    >
      {/* Status row: eyebrow + pip */}
      <div
        className="flex items-baseline justify-between"
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        <span
          className="font-travis-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "var(--ink)",
          }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2.5">
          {headerAction}
          <StatusPip kind={kind} />
        </div>
      </div>

      {/* Conclusion row: big headline + sub */}
      <div
        style={{
          padding: "24px 22px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        <div
          className="font-travis"
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: hasHeadline ? headlineColor : "var(--ink-4)",
            lineHeight: 1.05,
            marginBottom: 4,
          }}
        >
          {hasHeadline ? headline : "—"}
        </div>
        {sub && (
          <div
            className="font-travis"
            style={{
              color: "var(--ink-3)",
              fontSize: 12.5,
              fontWeight: 400,
            }}
          >
            {sub}
          </div>
        )}
      </div>

      {/* Detail rows + footnote */}
      <div className="flex-1" style={{ padding: "16px 22px 18px" }}>
        <div className="grid" style={{ gap: 0 }}>
          {details.map((row, i) => (
            <KeyValueRow
              key={i}
              label={row.label}
              value={row.value}
              noBorder={i === details.length - 1}
            />
          ))}
        </div>
        {footnote && (
          <div
            className="font-travis-mono"
            style={{
              marginTop: 14,
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--ink-4)",
            }}
          >
            {footnote}
          </div>
        )}
      </div>
    </div>
  );
}
