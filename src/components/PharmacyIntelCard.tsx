import * as React from "react";
import { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import { useTravelContext } from "@/contexts/TravelContext";
import { SubcardFrame } from "@/components/travis/results/SubcardFrame";

interface Medication {
  source: string;
  equivalent: string;
  status: string;
}

interface PharmacyResponse {
  medications?: Medication[];
  // Actual Edge Function shape (captured 2026-05-14):
  items?: Array<{
    home_name?: unknown;
    destination_name?: unknown;
    secondary_name?: unknown;
    access?: unknown;
    context?: unknown;
  }>;
  footer_note?: unknown;
  summary?: unknown;
  error?: unknown;
}

interface PharmacyIntelCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

function statusKind(status: string): "ok" | "warn" | "stop" | "neutral" {
  const s = status.toLowerCase();
  if (s === "otc") return "ok";
  if (s === "restricted") return "warn";
  if (s === "rx" || s === "prescription") return "stop";
  return "neutral";
}

function statusColor(kind: ReturnType<typeof statusKind>): string {
  if (kind === "ok") return "var(--signal-ok)";
  if (kind === "warn") return "var(--signal-warn)";
  if (kind === "stop") return "var(--signal-stop)";
  return "var(--ink-3)";
}

function normalizeMedications(data: PharmacyResponse | null): Medication[] {
  if (!data) return [];
  // Prefer the new shape if present.
  if (Array.isArray(data.medications)) {
    return data.medications
      .map((m) => ({
        source: asString(m?.source) ?? "",
        equivalent: asString(m?.equivalent) ?? "",
        status: asString(m?.status) ?? "",
      }))
      .filter((m) => m.source || m.equivalent);
  }
  // Fall back to the Edge Function's current shape: `items` array.
  if (Array.isArray(data.items)) {
    return data.items
      .map((it) => {
        const access = asString(it?.access);
        const status = access === "Prescription" ? "Rx" : (access ?? "");
        return {
          source: (asString(it?.home_name) ?? "").replace(/Pepto-Bismol/gi, "Pepto"),
          equivalent: (asString(it?.destination_name) ?? "").replace(/Pepto-Bismol/gi, "Pepto"),
          status,
        };
      })
      .filter((m) => m.source || m.equivalent);
  }
  return [];
}

const PharmacyIntelCard: React.FC<PharmacyIntelCardProps> = ({ placeDetails }) => {
  const { passport } = useTravelContext();
  const [data, setData] = React.useState<PharmacyResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const destination = placeDetails?.formatted_address || placeDetails?.name || "";

  React.useEffect(() => {
    if (!destination || !passport) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pharmacy-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination, origin: passport }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Pharmacy API: ${res.status}`);
        return res.json();
      })
      .then((result: PharmacyResponse) => {
        if (cancelled) return;
        if (asString(result?.error)) throw new Error(String(result.error));
        setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destination, passport]);

  const meds = normalizeMedications(data).slice(0, 4);
  const footnote =
    asString(data?.footer_note) ??
    asString(data?.summary) ??
    "Availability varies by pharmacy.";

  return (
    <SubcardFrame label="Pharmacy · Medication equivalents" footnote={footnote}>
      <div style={{ padding: "12px 20px" }}>
        {loading && meds.length === 0 && (
          <div
            className="font-travis"
            style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}
          >
            Resolving equivalents…
          </div>
        )}
        {!loading && (error || meds.length === 0) && (
          <div
            className="font-travis"
            style={{ color: "var(--ink-4)", fontSize: 13, padding: "8px 0" }}
          >
            —
          </div>
        )}
        {meds.map((med, i) => {
          const isLast = i === meds.length - 1;
          const kind = statusKind(med.status);
          return (
            <div
              key={i}
              className="grid items-baseline"
              style={{
                gridTemplateColumns: "1fr 14px 1fr auto",
                gap: 10,
                padding: "10px 0",
                borderBottom: isLast ? "none" : "1px dashed var(--hair)",
              }}
            >
              <span
                className="font-travis truncate"
                style={{
                  color: "var(--ink-3)",
                  fontSize: 12,
                  letterSpacing: "-0.005em",
                }}
                title={med.source}
              >
                {asString(med.source) ?? "—"}
              </span>
              <span
                className="font-travis-mono"
                style={{ color: "var(--ink-4)", fontSize: 10, textAlign: "center" }}
              >
                →
              </span>
              <span
                className="font-travis truncate"
                style={{
                  color: "var(--ink)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
                title={med.equivalent}
              >
                {asString(med.equivalent) ?? "—"}
              </span>
              <span
                className="font-travis-mono uppercase"
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.12em",
                  color: statusColor(kind),
                }}
              >
                {asString(med.status) ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </SubcardFrame>
  );
};

export default PharmacyIntelCard;
