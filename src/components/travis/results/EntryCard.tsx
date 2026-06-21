import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { MustKnowCard } from "./MustKnowCard";
import type { SelectedPlace } from "@/types/place";
import type { StatusKind } from "../StatusPip";

type EntryCardProps = {
  placeDetails: SelectedPlace | null;
  passport?: string;
  isLast?: boolean;
};

/** Layer 1 — synthesized headline from the visa_requirements cache. */
interface VisaData {
  status: string; // provider color category: green | blue | yellow | red
  statusLabel: string | null; // "eVisa", "Visa not required", "Visa required", "eTA"
  rule: string | null;
  maxStayDays: number | null;
  evisaLink: string | null;
  registrationNote: string | null; // e.g. "Arrival Card" (TDAC)
  passportValidity: string | null; // e.g. "6 months", "Valid for period of stay"
  source: string | null;
  syncedAt: string | null;
}

/** Layer 2 — curated official government verification link. */
interface OfficialSource {
  url: string;
  label: string;
  authority: string | null;
  language: string | null;
  notes: string | null;
}

interface VisaResponse {
  originCountryCode?: string;
  destinationCountryCode?: string | null;
  data?: VisaData | null;
  officialSource?: OfficialSource | null;
}

/**
 * Entry cell of the Must Know strip — three honest layers:
 *   1. Headline + stay: synthesized from the visa_requirements cache (Travel
 *      Buddy AI). Renders "—" on a cache miss; never fabricated.
 *   2. Official source: an always-present "Verify ↗" link to the destination's
 *      official government visa page. Shown even when the headline is missing,
 *      so verification never disappears.
 *   3. Provenance: source + synced date in the footnote, so users see this is
 *      synthesized data with a date attached.
 *
 * Sends destinationCountryCode (ISO alpha-2) from the selected place; the Edge
 * Function also accepts a legacy free-text destination as a fallback.
 */
export function EntryCard({ placeDetails, passport, isLast }: EntryCardProps) {
  const [resp, setResp] = React.useState<VisaResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!placeDetails) {
      setResp(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const destinationCountryCode = placeDetails.country_code
      ? placeDetails.country_code.toUpperCase()
      : undefined;
    const destination = placeDetails.formatted_address || placeDetails.name;
    const userNationality = passport || "US";

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke<VisaResponse>(
          "visa-requirements",
          { body: { destinationCountryCode, destination, userNationality } },
        );
        if (cancelled) return;
        setResp(error ? null : (data ?? null));
      } catch {
        if (!cancelled) setResp(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placeDetails, passport]);

  const visa = resp?.data ?? null;
  const official = resp?.officialSource ?? null;

  const kind = deriveKind(visa);
  const headline = loading ? null : (visa?.statusLabel ?? null);
  const sub = visa?.maxStayDays != null ? `Up to ${visa.maxStayDays} days` : null;

  return (
    <MustKnowCard
      kind={kind}
      label="Entry"
      headline={headline}
      sub={sub}
      details={[
        { label: "Passport validity", value: visa?.passportValidity ?? undefined },
        { label: "Registration", value: visa?.registrationNote ?? undefined },
        {
          label: "Official",
          value: official ? (
            <ExtLink href={official.url} title={official.notes ?? official.label}>
              Verify ↗
            </ExtLink>
          ) : undefined,
        },
      ]}
      footnote={deriveFootnote(visa)}
      isLast={isLast}
    />
  );
}

function deriveKind(visa: VisaData | null): StatusKind {
  if (!visa) return "note";
  switch (visa.status) {
    case "green":
      return "cleared"; // visa-free
    case "blue":
      return "note"; // eVisa
    case "yellow":
      return "note"; // eTA / visa-on-arrival
    case "red":
      return "attention"; // visa required — action needed
    default:
      return "note";
  }
}

function deriveFootnote(visa: VisaData | null): React.ReactNode {
  if (!visa?.source) return null;
  const synced = visa.syncedAt ? ` · synced ${formatRelative(visa.syncedAt)}` : "";
  return `${visa.source}${synced}`;
}

function ExtLink({
  href,
  title,
  children,
}: {
  href: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      style={{ color: "var(--ink-2)", textDecoration: "underline" }}
    >
      {children}
    </a>
  );
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
