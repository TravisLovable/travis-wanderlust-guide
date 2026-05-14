import * as React from "react";
import { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import { SubcardFrame } from "@/components/travis/results/SubcardFrame";
import { KeyValueRow } from "@/components/travis/results/KeyValueRow";

// Data source unchanged — synchronous mock derived from destination string.
// TODO: replace with WeatherAPI UV index endpoint (out of redesign scope).

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

function getMockUV(destination: string): {
  index: number;
  level: string;
  peakStart: string;
  peakEnd: string;
  recommendation: string;
} {
  const lower = (destination || "").toLowerCase();
  let index: number;
  if (["bali", "thailand", "singapore", "hawaii", "caribbean", "miami", "kenya", "ecuador"].some((k) => lower.includes(k))) {
    index = 8 + Math.floor(Math.abs(hashDest(lower)) % 3);
  } else if (["iceland", "norway", "sweden", "finland", "alaska", "canada", "scotland"].some((k) => lower.includes(k))) {
    index = 1 + Math.floor(Math.abs(hashDest(lower)) % 3);
  } else if (["spain", "italy", "greece", "portugal", "australia", "dubai", "uae"].some((k) => lower.includes(k))) {
    index = 6 + Math.floor(Math.abs(hashDest(lower)) % 3);
  } else {
    index = 4 + Math.floor(Math.abs(hashDest(lower)) % 3);
  }
  const band = uvBand(index);
  const recommendations: Record<string, string> = {
    Low: "Minimal protection needed.",
    Moderate: "Wear sunglasses on bright days.",
    High: "Sunscreen essential. Seek shade midday.",
    "Very high": "Avoid midday sun. SPF 30+ required.",
    Extreme: "Stay indoors midday. Full protection needed.",
  };
  return {
    index,
    level: band.label,
    peakStart: "12:00 PM",
    peakEnd: "2:00 PM",
    recommendation: recommendations[band.label] ?? "",
  };
}

function hashDest(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (((h << 5) - h) + s.charCodeAt(i)) | 0;
  return h;
}

const UVIndexCard: React.FC<UVIndexCardProps> = ({ placeDetails }) => {
  const uv = getMockUV(placeDetails?.formatted_address || placeDetails?.name || "");
  const band = uvBand(uv.index);
  const peak = `${asString(uv.peakStart) ?? "—"} – ${asString(uv.peakEnd) ?? "—"}`;

  return (
    <SubcardFrame
      label="UV index"
      meta={
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
      }
      footnote="Source: WeatherAPI · current day"
    >
      <div style={{ padding: "16px 20px" }}>
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
          {uv.index}
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
                  background: band.segColor(seg),
                  borderRadius: i === 0 ? "2px 0 0 2px" : i === 10 ? "0 2px 2px 0" : 0,
                  opacity: seg <= uv.index ? 1 : 0.35,
                }}
              />
            );
          })}
        </div>

        <KeyValueRow label="Peak hours" value={asString(peak)} mono={false} />
        <KeyValueRow
          label="Guidance"
          value={asString(uv.recommendation)}
          mono={false}
          noBorder
        />
      </div>
    </SubcardFrame>
  );
};

export default UVIndexCard;
