import * as React from "react";
import { cn } from "@/lib/utils";

type SubcardFrameProps = {
  /** Eyebrow label shown in the card header (mono uppercase). */
  label: React.ReactNode;
  /** Optional right-aligned slot in the header — pip, badge, live indicator. */
  meta?: React.ReactNode;
  /** Body content. */
  children: React.ReactNode;
  /** Optional small footnote rendered below the body. */
  footnote?: React.ReactNode;
  /** Drop background — useful when the surrounding section already provides one. */
  flat?: boolean;
  className?: string;
};

/**
 * Generic bordered cell. Used by Logistics, Context, and Details sections.
 * Not used by Must Know (which is a unified bordered strip — see
 * MustKnowCard + MustKnowSection).
 *
 * Renders:
 *   ┌─ eyebrow ─────────── meta ─┐
 *   │ body                       │
 *   ├────────────────────────────┤
 *   │ footnote (if any)          │
 *   └────────────────────────────┘
 */
export function SubcardFrame({
  label,
  meta,
  children,
  footnote,
  flat = false,
  className,
}: SubcardFrameProps) {
  return (
    <div
      className={cn("overflow-hidden flex flex-col", className)}
      style={{
        border: "1px solid var(--hair)",
        borderRadius: 6,
        background: flat ? "transparent" : "var(--bg-inset)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        <span
          className="font-travis-mono uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "var(--ink)",
          }}
        >
          {label}
        </span>
        {meta && (
          <span
            className="font-travis-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--ink-3)",
            }}
          >
            {meta}
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
      {footnote && (
        <div
          className="font-travis-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.06em",
            color: "var(--ink-4)",
            padding: "10px 20px 12px",
            borderTop: "1px solid var(--hair)",
          }}
        >
          {footnote}
        </div>
      )}
    </div>
  );
}
