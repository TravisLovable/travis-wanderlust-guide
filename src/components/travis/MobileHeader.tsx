import * as React from "react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { ChevronDownIcon } from "./IconSet";

type MobileHeaderProps = {
  /** Passport country label (full or short); rendered as a 2–3 char ISO code. */
  passport: string;
  /** Home/origin city code, e.g. "NYC". */
  origin: string;
  /** Opens the travel-context picker. Omit on screens without one (selector is inert). */
  onContextClick?: () => void;
};

function shortPassport(p: string): string {
  return p === "United States" ? "US" : p.toUpperCase().slice(0, 3);
}

/**
 * Mobile-only persistent header (<768px); desktop uses the sticky Topbar.
 * Travis wordmark · LIVE pip · {ISO} · {city} context selector · account avatar.
 * Shared by the homepage and the resolve screen so the row stays identical.
 */
export function MobileHeader({ passport, origin, onContextClick }: MobileHeaderProps) {
  const code = shortPassport(passport);
  return (
    <header
      className="flex md:hidden items-center justify-between gap-3 px-5 border-b border-travis-hair"
      // Safe-area top so the wordmark clears the status bar / Dynamic Island.
      // Content row stays 56px; the inset is added on top (border-box).
      style={{ height: "calc(56px + var(--sat))", paddingTop: "var(--sat)" }}
    >
      <Logo />
      <div className="flex items-center gap-2.5">
        <span
          className="inline-flex items-center gap-1.5 font-travis-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-3)" }}
        >
          <span
            aria-hidden
            className="travis-pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: "var(--signal-ok)",
              display: "inline-block",
            }}
          />
          Live
        </span>
        <button
          type="button"
          onClick={onContextClick}
          aria-label="Travel context"
          className="inline-flex items-center gap-1.5 font-travis-mono uppercase cursor-pointer"
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--ink-2)",
            border: "1px solid var(--hair-strong)",
            borderRadius: 6,
            padding: "5px 8px",
            background: "var(--bg-inset)",
          }}
        >
          <span>{code}</span>
          <span style={{ color: "var(--ink-4)" }}>·</span>
          <span>{origin}</span>
          <ChevronDownIcon width={10} height={10} style={{ color: "var(--ink-3)" }} />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
