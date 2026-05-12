import * as React from "react";
import { GlassPill } from "./GlassPill";
import { ChevronLeftIcon } from "../IconSet";

type IOSNavBarProps = {
  title: string;
  dark?: boolean;
  onBack?: () => void;
  trailing?: React.ReactNode;
  /** Extra padding at the top to clear the iOS status bar / safe-area inset. */
  topInset?: number;
};

export function IOSNavBar({
  title,
  dark = false,
  onBack,
  trailing,
  topInset = 62,
}: IOSNavBarProps) {
  const muted = dark ? "rgba(255,255,255,0.6)" : "#404040";
  const text = dark ? "#fff" : "#000";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: topInset,
        paddingBottom: 10,
        position: "relative",
        zIndex: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        {onBack ? (
          <GlassPill dark={dark}>
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              style={{
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                color: muted,
              }}
            >
              <ChevronLeftIcon width={12} height={20} strokeWidth={2.5} />
            </button>
          </GlassPill>
        ) : (
          <span aria-hidden style={{ width: 44, height: 44 }} />
        )}
        {trailing ?? <span aria-hidden style={{ width: 44, height: 44 }} />}
      </div>
      <div
        className="font-travis"
        style={{
          padding: "0 16px",
          fontSize: 34,
          fontWeight: 700,
          lineHeight: "41px",
          color: text,
          letterSpacing: "0.4px",
        }}
      >
        {title}
      </div>
    </div>
  );
}
