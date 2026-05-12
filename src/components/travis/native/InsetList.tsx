import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "../IconSet";

type InsetListProps = {
  header?: React.ReactNode;
  dark?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function InsetList({ header, dark = false, children, className }: InsetListProps) {
  return (
    <div className={className}>
      {header && (
        <div
          className="font-travis"
          style={{
            fontSize: 13,
            color: dark ? "rgba(235,235,245,0.6)" : "rgba(60,60,67,0.6)",
            textTransform: "uppercase",
            padding: "8px 36px 6px",
            letterSpacing: "-0.08px",
          }}
        >
          {header}
        </div>
      )}
      <div
        style={{
          background: dark ? "#1C1C1E" : "#fff",
          borderRadius: 26,
          margin: "0 16px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

type InsetListRowProps = {
  title: React.ReactNode;
  detail?: React.ReactNode;
  icon?: React.ReactNode;
  chevron?: boolean;
  isLast?: boolean;
  dark?: boolean;
  onClick?: () => void;
  className?: string;
};

export function InsetListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false,
  onClick,
  className,
}: InsetListRowProps) {
  const text = dark ? "#fff" : "#000";
  const sec = dark ? "rgba(235,235,245,0.6)" : "rgba(60,60,67,0.6)";
  const ter = dark ? "rgba(235,235,245,0.3)" : "rgba(60,60,67,0.3)";
  const sep = dark ? "rgba(84,84,88,0.65)" : "rgba(60,60,67,0.12)";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn("relative font-travis", className)}
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 52,
        padding: "0 16px",
        fontSize: 17,
        letterSpacing: "-0.43px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {icon && (
        <div
          aria-hidden
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            marginRight: 12,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            background: "var(--travis-pip-bg, rgba(0,0,0,0.06))",
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, color: text }}>{title}</div>
      {detail !== undefined && (
        <span style={{ color: sec, marginRight: 6 }}>{detail}</span>
      )}
      {chevron && (
        <ChevronRightIcon
          width={8}
          height={14}
          style={{ color: ter, flexShrink: 0 }}
        />
      )}
      {!isLast && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: icon ? 58 : 16,
            height: 0.5,
            background: sep,
          }}
        />
      )}
    </div>
  );
}
