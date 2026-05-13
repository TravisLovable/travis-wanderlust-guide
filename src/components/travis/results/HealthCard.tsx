import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { MustKnowCard, type MustKnowDetailRow } from "./MustKnowCard";
import type { StatusKind } from "../StatusPip";

type HealthCardProps = {
  destination: string;
  passport?: string;
  isLast?: boolean;
};

/**
 * The actual response shape from `health-data` (captured 2026-05-13).
 * The Edge Function's system prompt requests `{status, details, summary}`
 * but the upstream LLM returns this richer nested shape. We adapt rather
 * than modify the Edge Function (data sources untouched per plan).
 */
interface HealthSummary {
  health_clearance?: unknown;
  risk_level?: unknown;
  key_action?: unknown;
}
interface HealthRequiredForEntry {
  covid_vaccination?: unknown;
  covid_test?: unknown;
  health_declaration_form?: unknown;
  quarantine?: unknown;
  entry_screening?: unknown;
}
interface HealthRecommended {
  vaccines?: unknown;
  malaria_prophylaxis?: unknown;
  mosquito_protection?: unknown;
  food_water_precautions?: unknown;
}
interface HealthRegionalRisks {
  malaria_risk_areas?: unknown;
  mosquito_borne_illness?: unknown;
  other_advisories?: unknown;
}
interface HealthResponse {
  summary?: HealthSummary | string;
  required_for_entry?: HealthRequiredForEntry;
  recommended?: HealthRecommended;
  regional_risks?: HealthRegionalRisks;
  source?: unknown;
  last_updated?: unknown;
  // Older intended shape — kept as fallback if the Edge Function changes back.
  status?: unknown;
}

/** Guarantee a value is a non-empty trimmed string, else undefined. */
function asString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

export function HealthCard({ destination, passport, isLast }: HealthCardProps) {
  const [data, setData] = React.useState<HealthResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!destination) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const nationality = passport || "United States";

    (async () => {
      try {
        const { data: resp, error } = await supabase.functions.invoke<HealthResponse>(
          "health-data",
          { body: { destination, passport: nationality } },
        );
        if (cancelled) return;
        if (error) setData(null);
        else setData(resp ?? null);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [destination, passport]);

  // Pull summary fields, handling both the object shape and the legacy string fallback.
  const summary = data?.summary;
  const summaryAsString = asString(summary);
  const summaryAsObject =
    summary && typeof summary === "object" && !Array.isArray(summary)
      ? (summary as HealthSummary)
      : null;

  const headlineRaw =
    summaryAsString
    ?? asString(summaryAsObject?.health_clearance)
    ?? asString(data?.status);

  const subRaw = asString(summaryAsObject?.key_action);
  const riskLevel = asString(summaryAsObject?.risk_level)?.toLowerCase();

  const required = data?.required_for_entry;
  const recommended = data?.recommended;
  const regional = data?.regional_risks;

  const vaccines = Array.isArray(recommended?.vaccines)
    ? (recommended.vaccines as unknown[])
        .map((v) => asString(v))
        .filter((v): v is string => !!v)
    : [];
  const vaccinesValue = vaccines.length > 0 ? vaccines.join(", ") : undefined;

  const requiresCovid =
    required?.covid_vaccination === true || required?.covid_test === true;
  const requiresDeclaration = required?.health_declaration_form === true;
  const requiresQuarantine = required?.quarantine === true;

  const covidValue = required
    ? requiresCovid ? "Required" : "Not required"
    : undefined;
  const declarationValue = required
    ? requiresDeclaration ? "Required" : "Not required"
    : undefined;

  const regionalRiskValue =
    asString(regional?.malaria_risk_areas)
    ?? asString(regional?.mosquito_borne_illness)
    ?? asString(regional?.other_advisories);

  const detailRows: MustKnowDetailRow[] = [
    { label: "Recommended vaccines", value: asString(vaccinesValue) },
    { label: "Health declaration", value: asString(declarationValue) },
    { label: "COVID entry rules", value: asString(covidValue) },
    { label: "Regional risk", value: asString(regionalRiskValue) },
  ];

  const sourceStr = asString(data?.source);
  const lastUpdatedStr = asString(data?.last_updated);
  const footnoteRaw =
    sourceStr && lastUpdatedStr
      ? `Source: ${sourceStr} · ${lastUpdatedStr}`
      : sourceStr
        ? `Source: ${sourceStr}`
        : undefined;

  const kind: StatusKind = deriveKind({
    riskLevel,
    requiresCovid,
    requiresDeclaration,
    requiresQuarantine,
    loading,
  });

  return (
    <MustKnowCard
      kind={kind}
      label="Health"
      headline={asString(loading && !headlineRaw ? null : headlineRaw)}
      sub={asString(subRaw)}
      details={detailRows}
      footnote={asString(footnoteRaw) ?? "Source: WHO + CDC"}
      isLast={isLast}
    />
  );
}

function deriveKind(args: {
  riskLevel: string | undefined;
  requiresCovid: boolean;
  requiresDeclaration: boolean;
  requiresQuarantine: boolean;
  loading: boolean;
}): StatusKind {
  if (args.loading) return "note";
  if (args.requiresQuarantine) return "attention";
  if (args.requiresCovid || args.requiresDeclaration) return "attention";
  if (args.riskLevel === "high" || args.riskLevel === "elevated") return "attention";
  if (args.riskLevel === "moderate" || args.riskLevel === "medium") return "note";
  if (args.riskLevel === "low" || args.riskLevel === "none" || args.riskLevel === "minimal") {
    return "cleared";
  }
  return "note";
}
