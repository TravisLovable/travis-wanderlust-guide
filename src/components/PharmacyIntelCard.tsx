import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { useTravelContext } from '@/contexts/TravelContext';

interface Medication {
  source: string;
  equivalent: string;
  status: string;
}

interface PharmacyResponse {
  medications: Medication[];
  summary: string;
  error?: string;
}

interface PharmacyIntelCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const statusColor: Record<string, string> = {
  OTC: 'text-emerald-500',
  Restricted: 'text-amber-500',
  Rx: 'text-red-400',
};

const PharmacyIntelCard: React.FC<PharmacyIntelCardProps> = ({
  placeDetails,
  animationDelay = '0.22s',
}) => {
  const { passport } = useTravelContext();

  const [data, setData] = useState<PharmacyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination = placeDetails?.formatted_address || placeDetails?.name || '';

  useEffect(() => {
    if (!destination || !passport) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pharmacy-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination, origin: passport }),
    })
      .then((res) => { if (!res.ok) throw new Error(`Pharmacy API: ${res.status}`); return res.json(); })
      .then((result) => {
        if (!cancelled) {
          if (result.error) throw new Error(result.error);
          // Normalize old schema (items) to new schema (medications)
          if (result.items && !result.medications) {
            result.medications = result.items.map((item: any) => ({
              source: item.home_name,
              equivalent: item.destination_name,
              status: item.access === 'Prescription' ? 'Rx' : item.access,
            }));
            result.summary = result.footer_note || '';
          }
          // Clean up known display names
          if (result.medications) {
            result.medications = result.medications.map((med: Medication) => ({
              ...med,
              source: med.source.replace(/Pepto-Bismol/gi, 'Pepto'),
              equivalent: med.equivalent.replace(/Pepto-Bismol/gi, 'Pepto'),
            }));
          }
          setData(result);
        }
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [destination, passport]);

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      <div className="widget-header">
        <div className="widget-icon bg-emerald-500/10 text-emerald-600">
          <Pill className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">Pharmacy Intel</h3>
          <p className="widget-subtitle">Medication equivalents</p>
        </div>
      </div>

      <div className="mt-3" />

      {loading ? (
        <div className="space-y-2.5 pb-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-3.5 w-14 rounded bg-secondary/40 animate-pulse" />
              <div className="h-3.5 w-3 rounded bg-secondary/20 animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-secondary/40 animate-pulse" />
              <div className="h-3.5 w-8 rounded bg-secondary/30 animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      ) : error || !data?.medications ? (
        <p className="text-xs text-muted-foreground">Unable to load pharmacy data</p>
      ) : (
        <div className="space-y-2.5 pb-1">
          {data.medications.slice(0, 4).map((med, i) => (
            <div key={i} className="flex items-center text-[11px] leading-none gap-1">
              <span className="text-muted-foreground/70 truncate shrink-0 max-w-[35%]">{med.source}</span>
              <span className="text-muted-foreground/40 shrink-0 text-[10px]">&rarr;</span>
              <span className="text-foreground/70 truncate min-w-0 flex-1">{med.equivalent}</span>
              <span className={`text-[10px] font-medium shrink-0 pl-2 tabular-nums ${statusColor[med.status] || 'text-muted-foreground'}`}>
                {med.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyIntelCard;
