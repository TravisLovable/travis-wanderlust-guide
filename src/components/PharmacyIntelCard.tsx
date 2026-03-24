import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';
import { useTravelContext } from '@/contexts/TravelContext';

interface PharmacyItem {
  home_name: string;
  destination_name: string;
  secondary_name: string;
  access: 'OTC' | 'Restricted' | 'Prescription';
  context: string;
}

interface PharmacyResponse {
  items: PharmacyItem[];
  footer_note: string;
  error?: string;
}

interface PharmacyIntelCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const accessColor: Record<string, string> = {
  OTC: 'text-emerald-500',
  Restricted: 'text-amber-500',
  Prescription: 'text-red-400',
};

const PharmacyIntelCard: React.FC<PharmacyIntelCardProps> = ({
  placeDetails,
  animationDelay = '0.22s',
}) => {
  const { insights, loading: insightsLoading } = useInsights();
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
      .then((result) => { if (!cancelled) { if (result.error) throw new Error(result.error); setData(result); } })
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

      <div className="mt-1" />

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-16 rounded bg-secondary/40 animate-pulse" />
              <div className="h-4 w-24 rounded bg-secondary/40 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error || !data?.items ? (
        <p className="text-xs text-muted-foreground">Unable to load pharmacy data</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item, i) => (
              <div key={i} className="space-y-0">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-muted-foreground truncate">{item.home_name}</span>
                  <span className="text-muted-foreground/40 shrink-0">&rarr;</span>
                  <span className="font-medium text-right truncate text-foreground">
                    {item.destination_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {item.secondary_name ? (
                    <span className="text-[10px] text-muted-foreground/40">{item.secondary_name}</span>
                  ) : <span />}
                  <span className={`text-[10px] font-medium ${accessColor[item.access] || 'text-muted-foreground'}`}>
                    {item.access}
                  </span>
                </div>
                {item.context && (
                  <p className="text-[10px] text-muted-foreground/50 leading-snug">{item.context}</p>
                )}
              </div>
            ))}
          </div>

        </>
      )}

      <InsightLine insight={insights?.pharmacyIntel} loading={insightsLoading} />
    </div>
  );
};

export default PharmacyIntelCard;
