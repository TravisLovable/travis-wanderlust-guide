import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { MustKnowCard } from "./MustKnowCard";
import type { SelectedPlace } from "@/hooks/useMapboxGeocoding";

type TimeCardProps = {
  placeDetails: SelectedPlace | null;
  isLast?: boolean;
};

interface AstronomyData {
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
  moonPhase?: string;
  moonIllumination?: number;
  timezone?: string | null;
}

interface WorldClockData {
  origin?: { time?: string; time12?: string; abbreviation?: string };
  destination?: { time?: string; time12?: string; abbreviation?: string };
  timeDifferenceHours?: number;
  timeDifferenceText?: string;
}

/**
 * Time cell of the Must Know strip.
 *
 * Two-stage fetch matching the legacy TimeZoneContainer pattern:
 *   1. `get-astronomy` (provides accurate IANA timezone for the destination)
 *   2. `get-world-clock` (uses the timezone to compute local time + diff)
 *
 * If either fetch fails, the partial fields render and missing rows fall
 * back to "—". We never mock.
 */
export function TimeCard({ placeDetails, isLast }: TimeCardProps) {
  const [astro, setAstro] = React.useState<AstronomyData | null>(null);
  const [clock, setClock] = React.useState<WorldClockData | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!placeDetails) {
      setAstro(null);
      setClock(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data: astroResp, error: astroErr } =
          await supabase.functions.invoke<AstronomyData>("get-astronomy", {
            body: {
              latitude: placeDetails.latitude,
              longitude: placeDetails.longitude,
            },
          });
        if (cancelled) return;
        const astroData = astroErr ? null : astroResp ?? null;
        setAstro(astroData);

        const tz = astroData?.timezone;
        if (tz) {
          const originTimeZone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
          const { data: clockResp, error: clockErr } =
            await supabase.functions.invoke<WorldClockData>("get-world-clock", {
              body: {
                originTimeZone,
                destinationTimeZone: tz,
              },
            });
          if (cancelled) return;
          setClock(clockErr ? null : clockResp ?? null);
        } else {
          setClock(null);
        }
      } catch {
        if (!cancelled) {
          setAstro(null);
          setClock(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placeDetails]);

  const diff = clock?.timeDifferenceText;
  const tzShort = clock?.destination?.abbreviation;
  const utcOffset = astro?.timezone ? deriveUTCOffset(astro.timezone) : null;

  const headline = loading
    ? null
    : diff
      ? diff
      : null;

  const sub = tzShort && utcOffset ? `${tzShort} · ${utcOffset}` : tzShort || undefined;

  return (
    <MustKnowCard
      kind="note"
      label="Time"
      headline={headline}
      sub={sub}
      details={[
        { label: "Local now", value: clock?.destination?.time12 ?? clock?.destination?.time },
        { label: "Sunrise", value: astro?.sunrise },
        { label: "Sunset", value: astro?.sunset },
        { label: "Moon phase", value: astro?.moonPhase },
      ]}
      footnote={
        astro?.timezone ? `Timezone ${astro.timezone}` : undefined
      }
      isLast={isLast}
    />
  );
}

function deriveUTCOffset(tz: string): string | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = fmt.formatToParts(new Date());
    const off = parts.find((p) => p.type === "timeZoneName");
    return off?.value ?? null;
  } catch {
    return null;
  }
}
