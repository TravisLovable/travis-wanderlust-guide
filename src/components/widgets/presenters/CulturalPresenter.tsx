import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

export interface CulturalData {
  religion: string;
  dressCode: string;
  greetingsTipping: string;
  sensitivities: string[];
}

interface CulturalPresenterProps {
  data: CulturalData;
  animationDelay?: string;
}

const CulturalPresenter: React.FC<CulturalPresenterProps> = ({
  data,
  animationDelay = '0.4s',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="widget-card animate-slide-up md:col-span-2" style={{ animationDelay }}>
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="widget-icon bg-indigo-500/10 text-indigo-500">
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="widget-title">Cultural Insights</h3>
            <p className="widget-subtitle">Customs &amp; etiquette</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content — 4-column grid */}
      {isExpanded && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-4 mt-4 border-t border-border/30">
          {/* Religion */}
          <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">
              Religion
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {data.religion}
            </p>
          </div>

          {/* Dress Code */}
          <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">
              Dress Code
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {data.dressCode}
            </p>
          </div>

          {/* Greetings & Tipping */}
          <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">
              Greetings &amp; Tipping
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {data.greetingsTipping}
            </p>
          </div>

          {/* Sensitivities */}
          <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">
              Sensitivities
            </h4>
            <ul className="space-y-1">
              {data.sensitivities.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalPresenter;
