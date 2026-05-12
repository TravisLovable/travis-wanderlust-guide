import * as React from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Two-digit section number, e.g. "01". */
  n: string;
  /** Section title. */
  title: string;
  /** One-line description shown below the title. */
  sub: string;
  className?: string;
};

export function SectionHeader({ n, title, sub, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-[1180px] mx-auto w-full grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 md:gap-12 mt-16 md:mt-20 mb-5",
        className,
      )}
      style={{
        borderTop: "1px solid var(--hair)",
        paddingTop: 28,
        alignItems: "baseline",
      }}
    >
      <div
        className="font-travis-mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--ink-3)",
          textTransform: "uppercase",
        }}
      >
        Section {n}
      </div>
      <div>
        <h2
          className="font-travis"
          style={{
            fontWeight: 500,
            fontSize: "clamp(22px, 3.2vw, 28px)",
            letterSpacing: "-0.01em",
            margin: 0,
            color: "var(--ink)",
          }}
        >
          {title}
        </h2>
        <div
          className="font-travis"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}
