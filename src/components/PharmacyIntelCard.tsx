import React from 'react';
import { Pill } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';

// TODO: Replace pharmacy data with destination-specific data from API/Claude

interface PharmacyIntelCardProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

interface MedEquivalent {
  us: string;
  local: string;
  restricted: boolean;
}

interface PharmacyData {
  equivalents: MedEquivalent[];
  restriction: string;
  pharmacies: { name: string; note: string }[];
}

function getMockPharmacy(_destination: string): PharmacyData {
  return {
    equivalents: [
      { us: 'Tylenol', local: 'Paracetamol', restricted: false },
      { us: 'Advil', local: 'Ibuprofen', restricted: false },
      { us: 'Benadryl', local: 'Diphenhydramine', restricted: false },
      { us: 'Sudafed', local: 'Pseudoephedrine', restricted: true },
    ],
    restriction: 'Carry prescriptions for controlled substances.',
    pharmacies: [
      { name: 'Clicks Pharmacy', note: 'nationwide' },
      { name: 'Dis-Chem', note: 'major cities' },
    ],
  };
}

const PharmacyIntelCard: React.FC<PharmacyIntelCardProps> = ({
  placeDetails,
  animationDelay = '0.22s',
}) => {
  const data = getMockPharmacy(placeDetails?.formatted_address || '');
  const { insights, loading: insightsLoading } = useInsights();

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

      {/* Equivalents */}
      <div className="space-y-1.5">
        {data.equivalents.map((eq, i) => (
          <div key={i} className="flex items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground truncate">{eq.us}</span>
            <span className="text-muted-foreground/40 shrink-0">&rarr;</span>
            <span className={`font-medium text-right truncate ${eq.restricted ? 'text-amber-500' : 'text-foreground'}`}>
              {eq.local}
            </span>
          </div>
        ))}
      </div>

      {/* Restriction notice */}
      <div className="border-t border-border/30 mt-2.5 pt-2">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
          {data.restriction}
        </p>
      </div>

      {/* Pharmacies */}
      <div className="mt-2 space-y-0.5">
        {data.pharmacies.map((ph, i) => (
          <p key={i} className="text-[10px] text-muted-foreground/50">
            <span className="text-muted-foreground/30 mr-1">&#x2022;</span>
            {ph.name} <span className="text-muted-foreground/30">({ph.note})</span>
          </p>
        ))}
      </div>
      <InsightLine insight={insights?.pharmacyIntel} loading={insightsLoading} />
    </div>
  );
};

export default PharmacyIntelCard;
