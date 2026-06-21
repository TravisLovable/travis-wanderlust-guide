import * as React from "react";
import { SelectedPlace } from "@/types/place";
import { useTravelContext } from "@/contexts/TravelContext";
import { SubcardFrame } from "@/components/travis/results/SubcardFrame";
import { KeyValueRow } from "@/components/travis/results/KeyValueRow";

interface PowerAdaptorWidgetProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

// ── Per-country power info (ISO 3166-1 alpha-2) ─────────────────────────────
// Source: IEC World Plugs / various — values stable enough not to fetch.
interface PowerInfo {
  plugTypes: string[];
  voltage: number;
  frequency: number;
}

const POWER: Record<string, PowerInfo> = {
  US: { plugTypes: ["A", "B"], voltage: 120, frequency: 60 },
  CA: { plugTypes: ["A", "B"], voltage: 120, frequency: 60 },
  MX: { plugTypes: ["A", "B"], voltage: 127, frequency: 60 },
  GB: { plugTypes: ["G"], voltage: 230, frequency: 50 },
  IE: { plugTypes: ["G"], voltage: 230, frequency: 50 },
  FR: { plugTypes: ["C", "E"], voltage: 230, frequency: 50 },
  DE: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  IT: { plugTypes: ["C", "F", "L"], voltage: 230, frequency: 50 },
  ES: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  PT: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  NL: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  GR: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  CH: { plugTypes: ["J"], voltage: 230, frequency: 50 },
  AT: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  SE: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  NO: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  DK: { plugTypes: ["C", "E", "F", "K"], voltage: 230, frequency: 50 },
  IS: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  JP: { plugTypes: ["A", "B"], voltage: 100, frequency: 50 },
  KR: { plugTypes: ["C", "F"], voltage: 220, frequency: 60 },
  CN: { plugTypes: ["A", "C", "I"], voltage: 220, frequency: 50 },
  HK: { plugTypes: ["G"], voltage: 220, frequency: 50 },
  TW: { plugTypes: ["A", "B"], voltage: 110, frequency: 60 },
  TH: { plugTypes: ["A", "B", "C"], voltage: 220, frequency: 50 },
  VN: { plugTypes: ["A", "C"], voltage: 220, frequency: 50 },
  SG: { plugTypes: ["G"], voltage: 230, frequency: 50 },
  MY: { plugTypes: ["G"], voltage: 240, frequency: 50 },
  ID: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
  PH: { plugTypes: ["A", "B", "C"], voltage: 220, frequency: 60 },
  IN: { plugTypes: ["C", "D", "M"], voltage: 230, frequency: 50 },
  AE: { plugTypes: ["G"], voltage: 230, frequency: 50 },
  SA: { plugTypes: ["G"], voltage: 230, frequency: 60 },
  EG: { plugTypes: ["C", "F"], voltage: 220, frequency: 50 },
  MA: { plugTypes: ["C", "E"], voltage: 220, frequency: 50 },
  ZA: { plugTypes: ["C", "M", "N"], voltage: 230, frequency: 50 },
  KE: { plugTypes: ["G"], voltage: 240, frequency: 50 },
  NG: { plugTypes: ["D", "G"], voltage: 230, frequency: 50 },
  BR: { plugTypes: ["C", "N"], voltage: 127, frequency: 60 },
  AR: { plugTypes: ["C", "I"], voltage: 220, frequency: 50 },
  CL: { plugTypes: ["C", "L"], voltage: 220, frequency: 50 },
  CO: { plugTypes: ["A", "B"], voltage: 110, frequency: 60 },
  PE: { plugTypes: ["A", "B", "C"], voltage: 220, frequency: 60 },
  AU: { plugTypes: ["I"], voltage: 230, frequency: 50 },
  NZ: { plugTypes: ["I"], voltage: 230, frequency: 50 },
  CU: { plugTypes: ["A", "B", "C", "L"], voltage: 110, frequency: 60 },
  IL: { plugTypes: ["C", "H", "M"], voltage: 230, frequency: 50 },
  TR: { plugTypes: ["C", "F"], voltage: 230, frequency: 50 },
};

function compatible(home?: string, dest?: string): boolean | null {
  if (!home || !dest) return null;
  const h = POWER[home.toUpperCase()];
  const d = POWER[dest.toUpperCase()];
  if (!h || !d) return null;
  // Compatible if plug types overlap AND voltage matches within tolerance.
  const plugOverlap = h.plugTypes.some((t) => d.plugTypes.includes(t));
  const voltageOk = Math.abs(h.voltage - d.voltage) <= 10;
  // "needs adapter" === NOT compatible
  return !(plugOverlap && voltageOk);
}

const PowerAdaptorWidget: React.FC<PowerAdaptorWidgetProps> = ({ placeDetails }) => {
  const destCc = placeDetails?.country_code?.toUpperCase();
  const power = destCc ? POWER[destCc] : undefined;

  const { resolvedBaselineCountry } = useTravelContext();
  const homeCc = resolvedBaselineCountry?.code?.toUpperCase();
  const needs = compatible(homeCc, destCc);

  const pipColor =
    needs === null ? "var(--ink-3)" : needs ? "var(--signal-warn)" : "var(--signal-ok)";
  const pipLabel =
    needs === null ? "Unknown" : needs ? "Adapter needed" : "Compatible";

  const plug = power ? `Type ${power.plugTypes.join(", ")}` : undefined;
  const voltage = power ? `${power.voltage} V` : undefined;
  const frequency = power ? `${power.frequency} Hz` : undefined;

  return (
    <SubcardFrame
      label="Power adapter"
      meta={
        <span
          className="inline-flex items-center gap-1.5 font-travis-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: pipColor }}
        >
          <span
            aria-hidden
            style={{ width: 6, height: 6, background: pipColor, display: "inline-block" }}
          />
          {pipLabel}
        </span>
      }
      footnote={destCc && homeCc ? `${homeCc} → ${destCc}` : undefined}
    >
      <div style={{ padding: "12px 20px" }}>
        <KeyValueRow label="Plug type" value={asString(plug)} />
        <KeyValueRow label="Voltage" value={asString(voltage)} />
        <KeyValueRow label="Frequency" value={asString(frequency)} noBorder />
      </div>
    </SubcardFrame>
  );
};

export default PowerAdaptorWidget;
