import * as React from "react";
import { cn } from "@/lib/utils";

type KeyValueRowProps = {
  /** Left-column label (muted). */
  label: React.ReactNode;
  /** Right-column value. `null` / `undefined` / empty string renders as "—". */
  value?: React.ReactNode;
  /** Drop the dotted bottom border. Useful for the last row in a list. */
  noBorder?: boolean;
  /** Render the value in monospace + tabular-nums. Default true. */
  mono?: boolean;
  className?: string;
};

/**
 * The recurring two-column row used by Must Know detail blocks, Cultural
 * posture, Currency detail rows, Power adapter rows, and Emergency
 * contacts. Left label muted, right value mono and right-aligned, dashed
 * hairline divider between rows. Honest about missing data: null/undefined/
 * empty values render "—" in ink-4.
 */
export function KeyValueRow({
  label,
  value,
  noBorder = false,
  mono = true,
  className,
}: KeyValueRowProps) {
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div
      className={cn("grid items-baseline", className)}
      style={{
        gridTemplateColumns: "1fr auto",
        gap: 10,
        padding: "5px 0",
        borderBottom: noBorder ? undefined : "1px dashed var(--hair)",
      }}
    >
      <span
        className="font-travis"
        style={{
          color: "var(--ink-3)",
          fontSize: 11.5,
          fontWeight: 400,
        }}
      >
        {label}
      </span>
      <span
        className={mono ? "font-travis-mono tabular-nums" : "font-travis"}
        style={{
          color: hasValue ? "var(--ink)" : "var(--ink-4)",
          fontSize: 11,
          fontWeight: hasValue ? 500 : 400,
          textAlign: "right",
        }}
      >
        {hasValue ? value : "—"}
      </span>
    </div>
  );
}
