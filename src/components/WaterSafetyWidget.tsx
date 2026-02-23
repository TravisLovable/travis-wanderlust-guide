import React from 'react';
import { Info, GlassWater } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWaterSafety } from '@/hooks/useWaterSafety';
import { useHomeCountry } from '@/hooks/useHomeCountry';
import { resolveIso3 } from '@/utils/countryIso3';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';

interface WaterSafetyWidgetProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

const WaterSafetyWidget: React.FC<WaterSafetyWidgetProps> = ({
  placeDetails,
  animationDelay = '0.18s',
}) => {
  const iso3 = resolveIso3(
    placeDetails?.country_code,
    placeDetails?.formatted_address || placeDetails?.name
  );

  const { data, isLoading, error } = useWaterSafety(iso3);
  const { insights, loading: insightsLoading } = useInsights();
  const { homeCountry } = useHomeCountry();
  const homeIso3 = homeCountry && homeCountry.iso3 !== iso3 ? homeCountry.iso3 : null;
  const { data: homeData } = useWaterSafety(homeIso3);

  const hasValue = data?.value_pct != null;
  const roundedValue = hasValue ? Math.round(data!.value_pct!) : null;

  const sourceUrl = data?.source_url || 'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/population-using-safely-managed-drinking-water-services-%28-%29';

  return (
    <div
      className="widget-card animate-slide-up"
      style={{ animationDelay }}
    >
      {/* Header */}
      <div className="widget-header">
        <div className="widget-icon bg-sky-500/10 text-sky-600">
          <GlassWater className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">Water Safety</h3>
          <p className="widget-subtitle">Drinking-water services</p>
        </div>

        {/* Info popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors rounded-full p-1 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="What this means"
            >
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 text-sm">
            <p className="text-foreground leading-relaxed">
              {data?.definition ||
                'Percentage of population drinking water from an improved source that is accessible on premises, available when needed and free from faecal and priority chemical contamination.'}
            </p>
            {data?.year && (
              <p className="mt-2 text-xs text-muted-foreground/[0.62]">
                Data year: {data.year}
              </p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Main content */}
      <div className="mt-1" />
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 rounded bg-secondary/40 animate-pulse" />
          <div className="h-5 w-40 rounded-full bg-secondary/40 animate-pulse" />
          <div className="h-3 w-32 rounded bg-secondary/40 animate-pulse" />
        </div>
      ) : error || !data || !hasValue ? (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Data unavailable</p>
          {iso3 && (
            <p className="text-xs text-muted-foreground/[0.62]">
              No WHO data for {iso3}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="widget-value text-foreground" style={{ letterSpacing: '-0.03em' }}>{roundedValue}%</p>
          {(() => {
            const GLOBAL_AVG = 74;
            const useHome = homeData?.value_pct != null && homeIso3;
            const baseline = useHome ? Math.round(homeData!.value_pct!) : GLOBAL_AVG;
            const diff = Math.round(roundedValue! - baseline);
            const label = useHome ? homeCountry!.name : 'global average';
            const text = diff > 1 ? `${diff} percentage points higher than ${label}` : diff < -1 ? `${Math.abs(diff)} percentage points lower than ${label}` : `In line with ${label}`;
            return <p className="text-xs text-muted-foreground">{text}</p>;
          })()}
          <p className="text-[10px] text-muted-foreground/[0.38]">
            Source:{' '}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground/[0.58] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
            >
              WHO/UNICEF JMP
            </a>
            {' '}&#8599;
          </p>
        </div>
      )}
      <InsightLine insight={insights?.waterSafety} loading={insightsLoading} />
    </div>
  );
};

export default WaterSafetyWidget;
