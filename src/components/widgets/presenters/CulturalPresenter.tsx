import React from 'react';
import { Globe } from 'lucide-react';

export interface CulturalData {
  insights: [string, string, string];
  summary: string;
}

interface CulturalPresenterProps {
  data: CulturalData;
  animationDelay?: string;
}

const TOTAL_ROWS = 3;

const CulturalPresenter: React.FC<CulturalPresenterProps> = ({
  data,
  animationDelay = '0.4s',
}) => {
  return (
    <div className="widget-card animate-slide-up md:col-span-2" style={{ animationDelay }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="widget-icon bg-indigo-500/10 text-indigo-500">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Cultural Insights</h3>
          <p className="widget-subtitle">What feels different here</p>
        </div>
      </div>

      {/* Primary content — bounded reading column with intentional negative space */}
      <div className="flex-1 min-h-0 flex flex-col mt-4 max-w-[55%]">
        <div className="flex-1 min-h-0 flex flex-col justify-center space-y-4">
          {Array.from({ length: TOTAL_ROWS }).map((_, i) => {
            const insight = data.insights[i];
            return (
              <div key={i}>
                {insight ? (
                  <p className="text-[12.5px] text-muted-foreground/75 leading-relaxed whitespace-nowrap">
                    {insight}
                  </p>
                ) : (
                  <div className="h-[18px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Intelligence layer */}
        <div className="mt-auto pt-3">
          <p className="text-[11px] text-muted-foreground/35 italic leading-snug h-[16px] whitespace-nowrap">
            {data.summary || '\u00A0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CulturalPresenter;
