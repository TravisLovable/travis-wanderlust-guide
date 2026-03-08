import { useState } from 'react';
import { Ticket } from 'lucide-react';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';
import { format } from 'date-fns';
import { useLocalEvents } from '@/hooks/useLocalEvents';
import { toLocalMidnight } from '@/lib/dates';

interface LocalEventsCardProps {
  destination: string;
  startDate: string;
  endDate: string;
  animationDelay?: string;
}

const categoryColors: Record<string, string> = {
  Festival: 'bg-purple-500/10 text-purple-500',
  Conference: 'bg-blue-500/10 text-blue-500',
  Sports: 'bg-amber-500/10 text-amber-500',
  Concert: 'bg-pink-500/10 text-pink-500',
  Civic: 'bg-cyan-500/10 text-cyan-500',
};

export default function LocalEventsCard({ destination, startDate, endDate, animationDelay }: LocalEventsCardProps) {
  const { events, isLoading } = useLocalEvents({ destination, startDate, endDate });
  const [showAll, setShowAll] = useState(false);
  const { insights, loading: insightsLoading } = useInsights();

  const displayEvents = showAll ? events : events.slice(0, 3);
  const hasMore = events.length > 3;

  const formatEventDate = (start: string, end: string) => {
    const s = toLocalMidnight(start);
    const e = toLocalMidnight(end);
    const diffMs = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return format(s, 'MMM d');
    }
    // Same month
    if (s.getMonth() === e.getMonth()) {
      return `${format(s, 'MMM d')}–${format(e, 'd')}`;
    }
    return `${format(s, 'MMM d')}–${format(e, 'MMM d')}`;
  };

  return (
    <div className="widget-card animate-slide-up" style={animationDelay ? { animationDelay } : undefined}>
      <div className="widget-header">
        <div className="widget-icon bg-purple-500/10 text-purple-500">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Local Events</h3>
          <p className="widget-subtitle">During your trip</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 animate-pulse">
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-muted-foreground/10 rounded" />
                <div className="h-3 w-16 bg-muted-foreground/10 rounded" />
              </div>
              <div className="h-3.5 w-14 bg-muted-foreground/10 rounded" />
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-2">
          {displayEvents.map((event, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-sm truncate max-w-[180px]">{event.name}</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium mt-0.5 ${categoryColors[event.category] || 'bg-secondary text-muted-foreground'}`}>
                  {event.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground shrink-0 ml-2">
                {formatEventDate(event.startDate, event.endDate)}
              </p>
            </div>
          ))}
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-muted-foreground/[0.62] hover:text-muted-foreground transition-colors pt-0.5"
            >
              View all {events.length} events
            </button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No major events detected during your dates.</p>
      )}
      <InsightLine insight={insights?.localEvents} loading={insightsLoading} />
    </div>
  );
}
