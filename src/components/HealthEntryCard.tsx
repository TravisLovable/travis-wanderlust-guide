import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';

// TODO: Replace dummy data with destination-specific health entry requirements

interface HealthEntryCardProps {
  destination: string;
  animationDelay?: string;
}

interface HealthData {
  requiredVaccinations: string[];
  covidRequirement: string;
  healthAdvisories: string[];
}

function getMockHealth(destination: string): HealthData {
  const lower = destination.toLowerCase();

  if (['brazil', 'kenya', 'nigeria', 'ghana', 'uganda', 'tanzania', 'colombia'].some(k => lower.includes(k))) {
    return {
      requiredVaccinations: ['Yellow Fever certificate required (if arriving from endemic country)'],
      covidRequirement: 'No vaccination or test required.',
      healthAdvisories: ['Malaria risk in certain regions. Antimalarial prophylaxis recommended.'],
    };
  }

  if (['india', 'thailand', 'vietnam', 'cambodia', 'indonesia', 'bali'].some(k => lower.includes(k))) {
    return {
      requiredVaccinations: [],
      covidRequirement: 'No vaccination or test required.',
      healthAdvisories: ['Dengue fever risk in urban and rural areas. Use insect repellent.'],
    };
  }

  return {
    requiredVaccinations: [],
    covidRequirement: 'No vaccination or test required.',
    healthAdvisories: [],
  };
}

const HealthEntryCard: React.FC<HealthEntryCardProps> = ({
  destination,
  animationDelay = '0.16s',
}) => {
  const data = getMockHealth(destination);
  const hasRequired = data.requiredVaccinations.length > 0;
  const hasAdvisories = data.healthAdvisories.length > 0;
  const { insights, loading: insightsLoading } = useInsights();

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      <div className="widget-header">
        <div className={`widget-icon ${hasRequired ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Health Entry</h3>
          <p className="widget-subtitle">Vaccination &amp; health requirements</p>
        </div>
      </div>

      <div className="space-y-2.5 mt-1">
        {/* Required for entry */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1">Required for entry</p>
          {hasRequired ? (
            data.requiredVaccinations.map((v, i) => (
              <p key={i} className="text-xs text-foreground leading-relaxed">• {v}</p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">None</p>
          )}
        </div>

        {/* COVID-19 */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1">Covid-19</p>
          <p className="text-xs text-muted-foreground">{data.covidRequirement}</p>
        </div>

        {/* Health advisories */}
        {hasAdvisories && (
          <div className="border-l-2 border-amber-400/40 pl-2.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1">Health advisories</p>
            {data.healthAdvisories.map((a, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">{a}</p>
            ))}
          </div>
        )}
      </div>
      <InsightLine insight={insights?.healthEntry} loading={insightsLoading} />
    </div>
  );
};

export default HealthEntryCard;
