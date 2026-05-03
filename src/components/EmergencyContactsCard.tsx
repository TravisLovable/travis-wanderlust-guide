import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface Contact {
  label: string;
  number: string;
}

interface EmergencyResponse {
  contacts: Contact[];
  summary: string;
  error?: string;
}

interface EmergencyContactsCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({
  placeDetails,
  animationDelay = '0.28s',
}) => {
  const [data, setData] = useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = placeDetails?.formatted_address || placeDetails?.name || '';

  useEffect(() => {
    if (!destination) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emergency-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination }),
    })
      .then((res) => { if (!res.ok) throw new Error(`Emergency API: ${res.status}`); return res.json(); })
      .then((result) => {
        if (!cancelled) {
          if (result.error) throw new Error(result.error);
          setData(result);
        }
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [destination]);

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      <div className="widget-header">
        <div className="widget-icon bg-red-500/10 text-red-500">
          <Phone className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">Emergency Contacts</h3>
          <p className="widget-subtitle">Local emergency numbers</p>
        </div>
      </div>

      <div className="mt-3" />

      {loading ? (
        <div className="space-y-2.5 pb-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-3.5 w-16 rounded bg-secondary/40 animate-pulse" />
              <div className="h-3.5 w-12 rounded bg-secondary/40 animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      ) : error || !data?.contacts ? (
        <p className="text-xs text-muted-foreground">Unable to load emergency contacts</p>
      ) : (
        <div className="space-y-2.5 pb-1">
          {data.contacts.slice(0, 4).map((contact, i) => (
            <div key={i} className="flex items-center text-[11px] leading-none gap-1">
              <span className="text-muted-foreground/70 truncate shrink-0">{contact.label}</span>
              <span className="text-foreground/70 font-medium ml-auto tabular-nums">{contact.number}</span>
            </div>
          ))}
          {data.summary && (
            <p className="text-[10px] text-muted-foreground/50 pt-1 leading-snug">{data.summary}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsCard;
