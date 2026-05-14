import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { LiveStatus } from "./LiveStatus";
import { ChevronDownIcon } from "./IconSet";

type SystemContext = {
  clockLocal?: string;
  passport?: string;
  home?: string;
};

type TopbarProps = {
  context?: SystemContext;
  onContextClick?: () => void;
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * Desktop top bar — 52px, sticky, glass background. Hidden under `md`;
 * the mobile shell uses IOSNavBar instead.
 */
export function Topbar({
  context,
  onContextClick,
  trailing,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "hidden md:flex sticky top-0 z-40 items-center justify-between gap-6",
        "border-b border-travis-hair backdrop-blur-md",
        className,
      )}
      style={{
        height: 52,
        padding: "0 24px",
        background: "color-mix(in oklch, var(--bg) 88%, transparent)",
      }}
    >
      <Logo />

      <div className="flex items-center gap-4">
        {context && (
          <button
            type="button"
            onClick={onContextClick}
            className="inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer font-travis-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--ink-3)",
              padding: "6px 8px",
            }}
          >
            {context.clockLocal && <span>{context.clockLocal}</span>}
            {context.passport && (
              <>
                <span style={{ color: "var(--ink-4)" }}>·</span>
                <span>{context.passport}</span>
              </>
            )}
            {context.home && (
              <>
                <span style={{ color: "var(--ink-4)" }}>·</span>
                <span>{context.home}</span>
              </>
            )}
            <ChevronDownIcon width={10} height={10} />
          </button>
        )}
        <LiveStatus />
        {trailing}
      </div>
    </header>
  );
}
