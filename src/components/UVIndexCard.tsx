import React from 'react';
import { Sun } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';

// TODO: Replace UV dummy data with WeatherAPI UV index

interface UVIndexCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

interface UVData {
  index: number;
  level: string;
  color: string;
  peakStart: string;
  peakEnd: string;
  recommendation: string;
}

function getUVLevel(index: number): { level: string; color: string } {
  if (index <= 2) return { level: 'Low', color: 'text-green-500' };
  if (index <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
  if (index <= 7) return { level: 'High', color: 'text-orange-500' };
  if (index <= 10) return { level: 'Very High', color: 'text-red-500' };
  return { level: 'Extreme', color: 'text-purple-500' };
}

function getSegmentColor(seg: number, current: number): string {
  if (seg > current) return 'bg-secondary/40';
  if (seg <= 2) return 'bg-green-500';
  if (seg <= 5) return 'bg-yellow-500';
  if (seg <= 7) return 'bg-orange-500';
  if (seg <= 10) return 'bg-red-500';
  return 'bg-purple-500';
}

function getMockUV(destination: string): UVData {
  const lower = (destination || '').toLowerCase();

  let index: number;
  if (['bali', 'thailand', 'singapore', 'hawaii', 'caribbean', 'miami', 'kenya', 'ecuador'].some(k => lower.includes(k))) {
    index = 8 + Math.floor(Math.abs(hashDest(lower)) % 3); // 8-10
  } else if (['iceland', 'norway', 'sweden', 'finland', 'alaska', 'canada', 'scotland'].some(k => lower.includes(k))) {
    index = 1 + Math.floor(Math.abs(hashDest(lower)) % 3); // 1-3
  } else if (['spain', 'italy', 'greece', 'portugal', 'australia', 'dubai', 'uae'].some(k => lower.includes(k))) {
    index = 6 + Math.floor(Math.abs(hashDest(lower)) % 3); // 6-8
  } else {
    index = 4 + Math.floor(Math.abs(hashDest(lower)) % 3); // 4-6
  }

  const { level, color } = getUVLevel(index);

  const recommendations: Record<string, string> = {
    Low: 'Minimal protection needed.',
    Moderate: 'Wear sunglasses on bright days.',
    High: 'Sunscreen essential. Seek shade midday.',
    'Very High': 'Avoid midday sun. SPF 30+ required.',
    Extreme: 'Stay indoors midday. Full protection needed.',
  };

  return {
    index,
    level,
    color,
    peakStart: '12:00 PM',
    peakEnd: '2:00 PM',
    recommendation: recommendations[level],
  };
}

function hashDest(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return h;
}

const UVIndexCard: React.FC<UVIndexCardProps> = ({
  placeDetails,
  animationDelay = '0.18s',
}) => {
  const uv = getMockUV(placeDetails?.formatted_address || placeDetails?.name || '');
  const { insights, loading: insightsLoading } = useInsights();

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      <div className="widget-header">
        <div className="widget-icon bg-amber-500/10 text-amber-500">
          <Sun className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">UV Index</h3>
          <p className="widget-subtitle">Current exposure level</p>
        </div>
      </div>

      <div className="mt-1" />

      {/* Primary reading */}
      <div className="space-y-1">
        <p className="widget-value text-foreground" style={{ letterSpacing: '-0.03em' }}>{uv.index}</p>
        <p className={`text-xs font-semibold uppercase tracking-wider ${uv.color}`}>{uv.level}</p>
      </div>

      {/* Scale bar */}
      <div className="flex gap-[2px] mt-3">
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 ${getSegmentColor(i + 1, uv.index)} ${i === 0 ? 'rounded-l-full' : ''} ${i === 10 ? 'rounded-r-full' : ''}`}
          />
        ))}
      </div>

      {/* Details */}
      <div className="mt-2.5 space-y-0.5">
        <p className="text-[10px] text-muted-foreground/50">Peak: {uv.peakStart} – {uv.peakEnd}</p>
        <p className="text-[10px] text-muted-foreground/50">{uv.recommendation}</p>
      </div>
      <InsightLine insight={insights?.uvIndex} loading={insightsLoading} />
    </div>
  );
};

export default UVIndexCard;
