import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTravelContext } from '@/contexts/TravelContext';

interface WhatMattersResponse {
  items: string[];
  summary: string;
  error?: string;
}

interface WhatMattersCardProps {
  destination: string;
  animationDelay?: string;
}

const TOTAL_ROWS = 3;

const WhatMattersCard: React.FC<WhatMattersCardProps> = ({
  destination,
  animationDelay = '0s',
}) => {
  const { passport } = useTravelContext();
  const [data, setData] = useState<WhatMattersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!destination) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/what-matters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination, origin: passport }),
    })
      .then((res) => { if (!res.ok) throw new Error(`What Matters API: ${res.status}`); return res.json(); })
      .then((result) => { if (!cancelled) { if (result.error) throw new Error(result.error); setData(result); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [destination, passport]);

  // Loading
  if (loading) {
    return (
      <div className="widget-card animate-slide-up md:col-span-2" style={{ animationDelay, boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 32px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="widget-icon bg-rose-500/10 text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="widget-title">What Matters</h3>
            <p className="widget-subtitle">Relevance brief</p>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-rose-500/30 border-t-rose-500" />
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="widget-card animate-slide-up md:col-span-2" style={{ animationDelay, boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 32px rgba(255,255,255,0.08), 0 0 12px rgba(255,255,255,0.05)' }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="widget-icon bg-rose-500/10 text-rose-500">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">What Matters</h3>
          <p className="widget-subtitle">Relevance brief</p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-400/40 mt-1">Unable to load live data</p>
      )}

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col mt-2 max-w-[55%]">
        <div className="flex-1 min-h-0 flex flex-col justify-center space-y-2.5">
          {Array.from({ length: TOTAL_ROWS }).map((_, i) => {
            const item = items[i];
            return (
              <div key={i}>
                {item ? (
                  <p className="text-[12.5px] text-muted-foreground/75 leading-relaxed whitespace-nowrap">
                    {item}
                  </p>
                ) : (
                  <div className="h-[18px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-auto pt-2">
          <p className="text-[11px] text-muted-foreground/35 italic leading-snug h-[16px] whitespace-nowrap">
            {data?.summary || '\u00A0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatMattersCard;
