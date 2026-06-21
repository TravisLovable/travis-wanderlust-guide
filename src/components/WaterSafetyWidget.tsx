import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWaterSafety } from "@/hooks/useWaterSafety";
import { resolveIso3 } from "@/utils/countryIso3";
import { SelectedPlace } from "@/types/place";
import { SubcardFrame } from "@/components/travis/results/SubcardFrame";
import { KeyValueRow } from "@/components/travis/results/KeyValueRow";

interface WaterSafetyWidgetProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const GLOBAL_AVG = 74;

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

function valueColor(pct: number | null): string {
  if (pct === null) return "var(--ink-4)";
  if (pct >= 90) return "var(--signal-ok)";
  if (pct >= 60) return "var(--signal-warn)";
  return "var(--signal-stop)";
}

const WaterSafetyWidget: React.FC<WaterSafetyWidgetProps> = ({ placeDetails }) => {
  const iso3 = resolveIso3(
    placeDetails?.country_code,
    placeDetails?.formatted_address || placeDetails?.name,
  );
  const { data, isLoading, error } = useWaterSafety(iso3);

  const hasValue = data?.value_pct != null;
  const rounded = hasValue ? Math.round((data!.value_pct as number)) : null;
  const diff = rounded !== null ? Math.round(rounded - GLOBAL_AVG) : null;

  const comparison =
    diff === null
      ? undefined
      : diff > 1
        ? `+${diff} pts above global`
        : diff < -1
          ? `${diff} pts below global`
          : "On par with global";

  const definition =
    asString(data?.definition) ??
    "Population drinking water from an improved, on-premises source.";
  const sourceName = asString(data?.source_name) ?? "WHO/UNICEF JMP";
  const year = data?.year;

  return (
    <SubcardFrame
      label="Water safety"
      meta={
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="font-travis-mono uppercase cursor-pointer bg-transparent border-0"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: "var(--ink-3)",
                textDecoration: "underline dotted",
                textUnderlineOffset: 3,
              }}
              aria-label="What this means"
            >
              {year ? `Data ${year}` : "Info"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink-2 p-3 w-72"
            style={{ fontSize: 12, lineHeight: 1.5 }}
          >
            <p>{definition}</p>
          </PopoverContent>
        </Popover>
      }
      footnote={`Source: ${sourceName}${year ? ` · ${year}` : ""}`}
    >
      <div style={{ padding: "16px 20px" }}>
        {isLoading && !hasValue ? (
          <div
            className="font-travis"
            style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}
          >
            Resolving…
          </div>
        ) : error || !hasValue ? (
          <div>
            <div
              className="font-travis-mono tabular-nums"
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "var(--ink-4)",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              —
            </div>
            <div
              className="font-travis"
              style={{ color: "var(--ink-4)", fontSize: 12 }}
            >
              {iso3 ? `No WHO data for ${iso3}` : "Country code unresolved"}
            </div>
          </div>
        ) : (
          <>
            <div
              className="font-travis-mono tabular-nums"
              style={{
                fontSize: 36,
                fontWeight: 500,
                color: valueColor(rounded),
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {rounded}
              <span
                className="font-travis-mono"
                style={{
                  fontSize: 16,
                  color: "var(--ink-3)",
                  marginLeft: 4,
                  letterSpacing: "0",
                }}
              >
                %
              </span>
            </div>
            <div
              className="font-travis"
              style={{
                fontSize: 12.5,
                color: "var(--ink-3)",
                marginBottom: 12,
              }}
            >
              Safely managed drinking water
            </div>
            <KeyValueRow label="Global average" value={`${GLOBAL_AVG}%`} />
            <KeyValueRow label="Vs global" value={asString(comparison)} mono={false} noBorder />
          </>
        )}
      </div>
    </SubcardFrame>
  );
};

export default WaterSafetyWidget;
