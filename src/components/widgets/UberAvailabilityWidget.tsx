import React, { useState, useEffect } from 'react';
import { Car, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';
import { useTravelContext } from '@/contexts/TravelContext';

interface RideShareData {
  primary_provider: string;
  status: 'Active' | 'Limited' | 'Unavailable';
  airport_to_city_time: string;
  available_services: string[];
  local_alternatives: string[];
  insight: string;
  error?: string;
}

interface UberAvailabilityWidgetProps {
  placeDetails: SelectedPlace | null;
}

const statusConfig = {
  Active: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Active' },
  Limited: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Limited' },
  Unavailable: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Unavailable' },
};

const UberAvailabilityWidget = ({ placeDetails }: UberAvailabilityWidgetProps) => {
  const [data, setData] = useState<RideShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { insights, loading: insightsLoading } = useInsights();
  const { passport } = useTravelContext();

  const destination = placeDetails?.formatted_address || placeDetails?.name || '';

  useEffect(() => {
    if (!destination) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/uber-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination, origin: passport }),
    })
      .then((res) => { if (!res.ok) throw new Error(`Ride API: ${res.status}`); return res.json(); })
      .then((result) => { if (!cancelled) { if (result.error) throw new Error(result.error); setData(result); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [destination, passport]);

  const status = data ? statusConfig[data.status] || statusConfig.Unavailable : null;
  const StatusIcon = status?.icon || AlertTriangle;

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay: '0.26s' }}>
      <div className="widget-header">
        <div className="widget-icon bg-blue-500/10 text-blue-500">
          <Car className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">Ride Share</h3>
          <p className="widget-subtitle">App-based transport</p>
        </div>
      </div>

      <div className="mt-1" />

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-28 rounded bg-secondary/40 animate-pulse" />
          <div className="h-4 w-36 rounded bg-secondary/40 animate-pulse" />
          <div className="h-4 w-24 rounded bg-secondary/40 animate-pulse" />
        </div>
      ) : error || !data ? (
        <p className="text-xs text-muted-foreground">Unable to load ride-share data</p>
      ) : (
        <div className="space-y-2.5">
          {/* Provider + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StatusIcon className={`w-4 h-4 ${status!.color}`} />
              <span className="text-sm font-medium text-foreground">{data.primary_provider}</span>
            </div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status!.bg} ${status!.color}`}>
              {status!.label}
            </span>
          </div>

          {/* Airport → City Center */}
          {data.airport_to_city_time && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Airport → City: {data.airport_to_city_time}</span>
            </div>
          )}

          {/* Services */}
          {data.available_services && data.available_services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.available_services.map((svc, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                  {svc}
                </span>
              ))}
            </div>
          )}

          {/* Alternatives */}
          {data.local_alternatives && data.local_alternatives.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground/50 mb-0.5">Alternatives</p>
              <p className="text-xs text-muted-foreground">{data.local_alternatives.join(' · ')}</p>
            </div>
          )}

          {/* Insight */}
          {data.insight && (
            <p className="text-[10px] text-muted-foreground/60 leading-snug">{data.insight}</p>
          )}
        </div>
      )}

      <InsightLine insight={insights?.transportation} loading={insightsLoading} />
    </div>
  );
};

export default UberAvailabilityWidget;
