import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ──

export interface VerifiedSource {
  title: string;
  description: string;
  creator: string;
  tier: string;
  platform: string;
  url: string;
}

export interface SourceCategory {
  label: string;
  sources: VerifiedSource[];
}

interface VerifiedSourcesWidgetProps {
  categories: SourceCategory[] | null; // null = loading
  animationDelay?: string;
}

// ── Skeleton (loading state) ──

const SkeletonCard = () => (
  <div className="py-3 flex items-start justify-between gap-4">
    <div className="flex-1 space-y-2">
      <div className="h-4 w-48 max-w-full rounded bg-secondary/40 animate-pulse" />
      <div className="h-3.5 w-64 max-w-full rounded bg-secondary/30 animate-pulse" />
      <div className="h-3 w-40 max-w-full rounded bg-secondary/20 animate-pulse" />
    </div>
    <div className="h-4 w-10 rounded bg-secondary/30 animate-pulse shrink-0 mt-0.5" />
  </div>
);

const SkeletonCategory = () => (
  <div>
    <div className="h-3 w-24 rounded bg-secondary/30 animate-pulse mb-2" />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

// ── Component ──

const VerifiedSourcesWidget: React.FC<VerifiedSourcesWidgetProps> = ({
  categories,
  animationDelay = '0.42s',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLoading = categories === null;
  const isEmpty = categories !== null && categories.length === 0;

  return (
    <div
      className="widget-card overflow-hidden animate-slide-up !p-0"
      style={{ animationDelay }}
    >
      {/* Header — always visible, clickable */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/20 transition-colors duration-150"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            TRAVIS Verified Sources
          </h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Regionally vetted content from verified sources.
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground/50 shrink-0 ml-4 transition-transform duration-250 ease-in-out ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Accordion body */}
      <div
        className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}
      >
        {/* Divider between header and body */}
        <div className="border-t border-border/30 mx-5" />

        <div className="p-5 pt-4" onClick={(e) => e.stopPropagation()}>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-6">
              <SkeletonCategory />
              <SkeletonCategory />
              <SkeletonCategory />
            </div>
          )}

          {/* Empty */}
          {isEmpty && (
            <div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We verify sources for regional familiarity and practical, high-signal travel intel.
              </p>

              <ul className="mt-3.5 space-y-1.5 text-xs text-muted-foreground/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  Regional familiarity and repeat experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  Clear, practical logistics (arrival, transit, neighborhoods)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  Consistent accuracy and specificity
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  High signal-to-noise (no filler, no hype)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  Respectful cultural context
                </li>
              </ul>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-[11px] rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  Apply to be verified
                </Button>
                <a
                  href="#"
                  className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Recommend a creator
                </a>
              </div>
            </div>
          )}

          {/* Populated */}
          {!isLoading && !isEmpty && categories && (
            <div className="space-y-5">
              {categories.map((cat, ci) => (
                <div key={ci}>
                  {ci > 0 && <div className="border-t border-border/30 mb-4" />}
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">
                    {cat.label}
                  </p>
                  <div className="divide-y divide-border/20">
                    {cat.sources.map((source, si) => (
                      <div key={si} className="py-3 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {source.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {source.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/40 mt-1">
                            Verified · {source.creator} · {source.tier} · {source.platform}
                          </p>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors shrink-0 mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifiedSourcesWidget;
