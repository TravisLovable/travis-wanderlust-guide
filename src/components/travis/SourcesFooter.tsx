import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Source = {
  name: string;
  description?: string;
  verified?: string;
};

type SourcesFooterProps = {
  sources: Source[];
  className?: string;
};

export function SourcesFooter({ sources, className }: SourcesFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 font-travis-mono uppercase",
        className,
      )}
      style={{
        fontSize: 10,
        letterSpacing: "0.12em",
        color: "var(--ink-4)",
      }}
    >
      <span>Sources:</span>
      {sources.map((source) => (
        <Popover key={source.name}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="cursor-pointer bg-transparent border-0 font-travis-mono uppercase"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--ink-3)",
                textDecoration: "underline dotted",
                textUnderlineOffset: 3,
                padding: 0,
              }}
            >
              {source.name}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="bg-travis-bg-raised border-travis-hair-strong p-3 w-72 font-travis text-travis-ink-2"
            style={{ fontSize: 12 }}
          >
            <div
              className="font-travis uppercase mb-1"
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "var(--ink)",
              }}
            >
              {source.name}
            </div>
            {source.description && (
              <p className="leading-snug" style={{ color: "var(--ink-2)" }}>
                {source.description}
              </p>
            )}
            {source.verified && (
              <div
                className="mt-2 font-travis-mono uppercase"
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.12em",
                  color: "var(--ink-4)",
                }}
              >
                Verified {source.verified}
              </div>
            )}
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
