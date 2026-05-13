import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { MustKnowCard } from "./MustKnowCard";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import type { StatusKind } from "../StatusPip";

type EntryCardProps = {
  placeDetails: SelectedPlace | null;
  passport?: string;
  isLast?: boolean;
};

interface VisaResponse {
  visaRequired?: boolean | string;
  maxStay?: string;
  passportValidity?: string;
  yellowFever?: string;
  notes?: string;
  reason?: string;
  processingTime?: string;
  cost?: string;
  exceptions?: string;
  requiresETA?: boolean;
  recommendation?: string;
  dataSource?: string;
  lastUpdated?: string;
}

/**
 * Entry cell of the Must Know strip.
 *
 * Fetches from the existing `visa-requirements` Edge Function (same URL,
 * same body as VisaContainer — we don't touch the legacy container). When
 * the response is available, derives a status pip, headline, sub line, and
 * up to 4 detail rows. Missing fields render "—".
 */
export function EntryCard({ placeDetails, passport, isLast }: EntryCardProps) {
  const [data, setData] = React.useState<VisaResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!placeDetails) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const destination = placeDetails.formatted_address || placeDetails.name;
    const nationality = passport || "US";

    (async () => {
      try {
        const { data: resp, error } = await supabase.functions.invoke<VisaResponse>(
          "visa-requirements",
          {
            body: {
              destination,
              userNationality: nationality,
              streamResponse: false,
            },
          },
        );
        if (cancelled) return;
        if (error) {
          setData(null);
        } else {
          setData(resp ?? null);
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placeDetails, passport]);

  const kind = deriveKind(data);
  const headline = deriveHeadline(data, loading);
  const sub = deriveSub(data);
  const footnote = deriveFootnote(data);

  return (
    <MustKnowCard
      kind={kind}
      label="Entry"
      headline={headline}
      sub={sub}
      details={[
        { label: "Passport validity", value: data?.passportValidity },
        { label: "Max stay", value: data?.maxStay },
        { label: "Processing time", value: data?.processingTime },
        { label: "Cost", value: data?.cost },
      ]}
      footnote={footnote}
      isLast={isLast}
    />
  );
}

function deriveKind(data: VisaResponse | null): StatusKind {
  if (!data) return "note";
  const req = data.visaRequired;
  if (req === false) return "cleared";
  if (req === true) return "attention";
  return "note";
}

function deriveHeadline(
  data: VisaResponse | null,
  loading: boolean,
): React.ReactNode {
  if (loading) return null;
  if (!data) return null;
  const req = data.visaRequired;
  if (req === false) return "Visa-free";
  if (req === true) {
    if (data.requiresETA) return "ETA required";
    return "Visa required";
  }
  return null;
}

function deriveSub(data: VisaResponse | null): React.ReactNode {
  if (!data) return null;
  if (data.maxStay) return `Up to ${data.maxStay}`;
  if (data.recommendation) return data.recommendation;
  return null;
}

function deriveFootnote(data: VisaResponse | null): React.ReactNode {
  if (!data) return null;
  const parts: string[] = [];
  if (data.dataSource) parts.push(`Source: ${data.dataSource}`);
  if (data.lastUpdated) parts.push(`synced ${formatRelative(data.lastUpdated)}`);
  return parts.length ? parts.join(", ") : null;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
