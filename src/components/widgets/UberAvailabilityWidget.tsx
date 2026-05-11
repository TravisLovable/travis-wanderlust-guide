import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { useTravelContext } from '@/contexts/TravelContext';

interface AirportEntry {
  code: string;
  time: string;
}

interface LocalData {
  train_metro: string;
  bus: string;
  taxi: string;
}

interface TransportData {
  ride_share: string;
  airports: AirportEntry[];
  local: LocalData;
  error?: string;
}

interface UberAvailabilityWidgetProps {
  placeDetails: SelectedPlace | null;
}

const UberAvailabilityWidget = ({ placeDetails }: UberAvailabilityWidgetProps) => {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      .then((result) => {
        if (!cancelled) {
          if (result.error) throw new Error(result.error);
          // Normalize old schema
          if (result.primary_provider && !result.airports) {
            result = {
              ride_share: result.status === 'Unavailable' ? 'Not available' : 'Available',
              airports: [{ code: 'Main', time: result.airport_to_city_time || 'Varies' }],
              local: {
                train_metro: 'Available',
                bus: 'Available',
                taxi: 'Available',
              },
            };
          }
          setData(result);
        }
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [destination, passport]);

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay: '0.26s' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="widget-icon bg-blue-500/10 text-blue-500">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Transportation</h3>
          <p className="widget-subtitle">Airport transfer + local transit</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col mt-3 overflow-hidden">
        {loading ? (
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-secondary/40 animate-pulse" />
            <div className="h-3.5 w-28 rounded bg-secondary/40 animate-pulse mt-2" />
            <div className="h-3.5 w-32 rounded bg-secondary/40 animate-pulse" />
            <div className="h-px w-full bg-secondary/20 my-1.5" />
            <div className="h-3.5 w-24 rounded bg-secondary/40 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-secondary/40 animate-pulse" />
          </div>
        ) : error || !data ? (
          <p className="text-xs text-muted-foreground">Unable to load transportation data</p>
        ) : (
          <>
            {/* Primary — Ride share + airports */}
            <div className="space-y-1">
              <p className="text-[12px] text-muted-foreground/75">
                <span className="text-muted-foreground/40 font-medium">Ride share:</span>{' '}
                <span className={data.ride_share === 'Available' ? 'text-emerald-500/90' : 'text-muted-foreground/75'}>
                  {data.ride_share}
                </span>
              </p>
              {data.airports.slice(0, 3).map((ap, i) => (
                <p key={i} className="text-[12px] text-muted-foreground/75 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-muted-foreground/40 font-medium">{ap.code}:</span>{' '}
                  {ap.time}
                </p>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-border/10 my-2" />

            {/* Secondary — Local transport */}
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground/25 font-medium uppercase tracking-wider mb-0.5">Local transport</p>
              <p className="text-[12px] text-muted-foreground/60 whitespace-nowrap">
                <span className="text-muted-foreground/30 font-medium">Train/Metro:</span>{' '}
                {data.local.train_metro}
              </p>
              <p className="text-[12px] text-muted-foreground/60 whitespace-nowrap">
                <span className="text-muted-foreground/30 font-medium">Bus:</span>{' '}
                {data.local.bus}
              </p>
              <p className="text-[12px] text-muted-foreground/60 whitespace-nowrap">
                <span className="text-muted-foreground/30 font-medium">Taxi:</span>{' '}
                {data.local.taxi}
              </p>
            </div>

            {/* Insight placeholder */}
            <div className="mt-auto pt-2 border-t border-border/10">
              <p className="text-[10px] text-muted-foreground/20 italic h-[14px]">
                Travis insight — Coming soon
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UberAvailabilityWidget;
