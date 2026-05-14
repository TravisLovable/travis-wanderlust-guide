import * as React from "react";
import { SelectedPlace } from "@/hooks/useMapboxGeocoding";
import { SubcardFrame } from "@/components/travis/results/SubcardFrame";
import { KeyValueRow } from "@/components/travis/results/KeyValueRow";

interface Contact {
  label?: unknown;
  number?: unknown;
}

interface EmergencyResponse {
  contacts?: Contact[];
  summary?: unknown;
  error?: unknown;
}

interface EmergencyContactsCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({ placeDetails }) => {
  const [data, setData] = React.useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const destination = placeDetails?.formatted_address || placeDetails?.name || "";

  React.useEffect(() => {
    if (!destination) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emergency-contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Emergency API: ${res.status}`);
        return res.json();
      })
      .then((result: EmergencyResponse) => {
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
  }, [destination]);

  const contacts = Array.isArray(data?.contacts)
    ? data!.contacts!.slice(0, 4)
    : [];
  const summary = asString(data?.summary);

  return (
    <SubcardFrame
      label="Emergency"
      footnote={summary ?? "Dial the listed number from any local phone."}
    >
      <div style={{ padding: "12px 20px" }}>
        {loading && contacts.length === 0 && (
          <div
            className="font-travis"
            style={{ color: "var(--ink-3)", fontSize: 13, padding: "8px 0" }}
          >
            Resolving contacts…
          </div>
        )}
        {!loading && (error || contacts.length === 0) && (
          <div
            className="font-travis"
            style={{ color: "var(--ink-4)", fontSize: 13, padding: "8px 0" }}
          >
            —
          </div>
        )}
        {contacts.map((contact, i) => {
          const isLast = i === contacts.length - 1;
          return (
            <KeyValueRow
              key={i}
              label={asString(contact?.label) ?? "—"}
              value={asString(contact?.number)}
              noBorder={isLast}
            />
          );
        })}
      </div>
    </SubcardFrame>
  );
};

export default EmergencyContactsCard;
