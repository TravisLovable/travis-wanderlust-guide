import * as React from "react";

type GlassPillProps = React.HTMLAttributes<HTMLDivElement> & {
  dark?: boolean;
  children?: React.ReactNode;
};

export function GlassPill({
  dark = false,
  children,
  style,
  ...rest
}: GlassPillProps) {
  return (
    <div
      {...rest}
      style={{
        height: 44,
        minWidth: 44,
        borderRadius: 9999,
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: dark
          ? "0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)"
          : "0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          background: dark ? "rgba(120,120,128,0.28)" : "rgba(255,255,255,0.5)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          boxShadow: dark
            ? "inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)"
            : "inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)",
          border: dark
            ? "0.5px solid rgba(255,255,255,0.15)"
            : "0.5px solid rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 4px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
