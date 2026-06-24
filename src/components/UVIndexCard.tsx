import * as React from "react";
import { SelectedPlace } from "@/types/place";
import { SubcardFrame } from "@/components/travis/results/SubcardFrame";
import { KeyValueRow } from "@/components/travis/results/KeyValueRow";
import { useUVIndex } from "@/hooks/useUVIndex";

// Real UV data from Open-Meteo, keyed off the destination's existing
// coordinates (the same lat/lng the globe and weather use). No fabrication:
// loading shows "Resolving…", any failure shows "—".

interface UVIndexCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

function uvBand(index: number): {
  label: string;
  pipColor: string;
  segColor: (seg: number) => string;
} {
  if (index <= 2) {
    return {
      label: "Low",
      pipColor: "var(--signal-ok)",
      segColor: (seg) => (seg <= 2 ? "var(--signal-ok)" : "var(--hair-strong)"),
    };
  }
  if (index <= 5) {
    return {
      label: "Moderate",
      pipColor: "var(--signal-warn)",
      segColor: (seg) => {
        if (seg > index) return "var(--hair-strong)";
        if (seg <= 2) return "var(--signal-ok)";
        return "var(--signal-warn)";
      },
    };
  }
  if (index <= 7) {
    return {
      label: "High",
      pipColor: "var(--signal-warn)",
      segColor: (seg) => {
        if (seg > index) return "var(--hair-strong)";
        if (seg <= 2) return "var(--signal-ok)";
        return "var(--signal-warn)";
      },
    };
  }
  if (index <= 10) {
    return {
      label: "Very high",
      pipColor: "var(--signal-stop)",
      segColor: (seg) => {
        if (seg > index) return "var(--hair-strong)";
        if (seg <= 2) return "var(--signal-ok)";
        if (seg <= 7) return "var(--signal-warn)";
        return "var(--signal-stop)";
      },
    };
  }
  return {
    label: "Extreme",
    pipColor: "var(--signal-stop)",
    segColor: (seg) => (seg <= 10 ? "var(--signal-stop)" : "var(--signal-stop)"),
  };
}

// Guidance is keyed to the day's peak exposure — the actionable planning signal.
const RECOMMENDATIONS: Record<string, string> = {
  Low: "Minimal protection needed.",
  Moderate: "Wear sunglasses on bright days.",
  High: "Sunscreen essential. Seek shade midday.",
  "Very high": "Avoid midday sun. SPF 30+ required.",
  Extreme: "Stay indoors midday. Full protection needed.",
};

const UVIndexCard: React.FC<UVIndexCardProps> = ({ placeDetails }) => {
  const { data, isLoading, error } = useUVIndex(
    placeDetails?.latitude,
    placeDetails?.longitude,
  );

  // Guard defensively so no stale value renders under a failure.
  const nowVal = error ? null : data?.now ?? null;
  const maxVal = error ? null : data?.max ?? null;

  const hasNow = nowVal != null && Number.isFinite(nowVal);
  const hasMax = maxVal != null && Number.isFinite(maxVal);

  const nowIndex = hasNow ? Math.round(nowVal as number) : null;
  const maxIndex = hasMax ? Math.round(maxVal as number) : null;

  // Headline reflects the current hour; if that one hour is unavailable but the
  // day's peak is known, fall back to the peak rather than showing nothing.
  const displayIndex = nowIndex ?? maxIndex;
  const band = displayIndex != null ? uvBand(displayIndex) : null;
  const maxBand = maxIndex != null ? uvBand(maxIndex) : null;

  const dailyMax =
    maxIndex != null && maxBand ? `${maxIndex} · ${maxBand.label}` : undefined;
  const guidance = maxBand
    ? RECOMMENDATIONS[maxBand.label]
    : band
      ? RECOMMENDATIONS[band.label]
      : undefined;

  const hasData = displayIndex != null;

  return (
    <SubcardFrame
      label="UV index"
      meta={
        band ? (
          <span
            className="inline-flex items-center gap-1.5 font-travis-mono uppercase"
            style={{ fontSize: 10, letterSpacing: "0.12em", color: band.pipColor }}
          >
            <span
              aria-hidden
              style={{ width: 6, height: 6, background: band.pipColor, display: "inline-block" }}
            />
            {band.label}
          </span>
        ) : undefined
      }
      footnote="Source: Open-Meteo"
    >
      <div style={{ padding: "16px 20px" }}>
        {isLoading && !hasData ? (
          <div
            className="font-travis"
            style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}
          >
            Resolving…
          </div>
        ) : !hasData ? (
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
            <div className="font-travis" style={{ color: "var(--ink-4)", fontSize: 12 }}>
              {placeDetails?.latitude != null && placeDetails?.longitude != null
                ? "UV data unavailable"
                : "Location unavailable"}
            </div>
          </div>
        ) : (
          <>
            <div
              className="font-travis-mono tabular-nums"
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              {displayIndex}
              <span
                className="font-travis-mono"
                style={{ fontSize: 14, color: "var(--ink-4)", marginLeft: 6, letterSpacing: "0.04em" }}
              >
                / 11
              </span>
            </div>

            {/* 11-segment scale bar */}
            <div className="flex gap-[2px] mb-4">
              {Array.from({ length: 11 }, (_, i) => {
                const seg = i + 1;
                return (
                  <div
                    key={i}
                    style={{
                      height: 6,
                      flex: 1,
                      background: band!.segColor(seg),
                      borderRadius: i === 0 ? "2px 0 0 2px" : i === 10 ? "0 2px 2px 0" : 0,
                      opacity: seg <= (displayIndex as number) ? 1 : 0.35,
                    }}
                  />
                );
              })}
            </div>

            <KeyValueRow label="Daily max" value={asString(dailyMax)} />
            <KeyValueRow
              label="Guidance"
              value={asString(guidance)}
              mono={false}
              noBorder
            />
          </>
        )}
      </div>
    </SubcardFrame>
  );
};

export default UVIndexCard;
