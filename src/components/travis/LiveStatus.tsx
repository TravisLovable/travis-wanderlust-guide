import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Source = {
  name: string;
  verified: string;
};

type LiveStatusProps = {
  sources?: Source[];
  lastVerified?: string;
  className?: string;
};

const DEFAULT_SOURCES: Source[] = [
  { name: "IATA",       verified: "11h ago" },
  { name: "WHO",        verified: "9h ago" },
  { name: "ECB",        verified: "live" },
  { name: "OpenWeather", verified: "1h ago" },
  { name: "Gov",        verified: "today" },
];

export function LiveStatus({
  sources = DEFAULT_SOURCES,
  lastVerified = "11h ago",
  className,
}: LiveStatusProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 font-travis-mono uppercase",
            "bg-transparent border-0 cursor-pointer",
            className,
          )}
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--ink-3)",
            padding: "6px 8px",
          }}
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
          Live · {sources.length} sources
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink-2 p-3 w-64"
      >
        <div
          className="font-travis-mono uppercase mb-2"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.12em",
            color: "var(--ink-4)",
          }}
        >
          Last verified {lastVerified}
        </div>
        <ul className="space-y-1">
          {sources.map((s) => (
            <li
              key={s.name}
              className="flex justify-between font-travis-mono"
              style={{ fontSize: 11 }}
            >
              <span style={{ color: "var(--ink)" }}>{s.name}</span>
              <span style={{ color: "var(--ink-3)" }}>{s.verified}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
