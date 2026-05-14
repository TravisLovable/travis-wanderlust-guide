import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusKind = "cleared" | "favorable" | "note" | "attention" | "blocker";

const META: Record<StatusKind, { label: string; color: string }> = {
  cleared:   { label: "CLEARED",   color: "var(--signal-ok)" },
  favorable: { label: "FAVORABLE", color: "var(--signal-ok)" },
  note:      { label: "NOTE",      color: "var(--signal-warn)" },
  attention: { label: "ATTENTION", color: "var(--signal-warn)" },
  blocker:   { label: "BLOCKER",   color: "var(--signal-stop)" },
};

type StatusPipProps = React.HTMLAttributes<HTMLSpanElement> & {
  kind: StatusKind;
  label?: string;
};

export function StatusPip({ kind, label, className, ...rest }: StatusPipProps) {
  const meta = META[kind];
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5 font-travis-mono uppercase",
        className,
      )}
      style={{
        fontSize: 9,
        letterSpacing: "0.12em",
        color: meta.color,
      }}
    >
      <span
        aria-hidden
        className="inline-block"
        style={{
          width: 6,
          height: 6,
          background: meta.color,
          boxShadow: `0 0 0 2px color-mix(in oklch, ${meta.color} 18%, transparent)`,
        }}
      />
      {label ?? meta.label}
    </span>
  );
}
