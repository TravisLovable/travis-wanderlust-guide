import { useEffect, useState } from 'react';

interface InsightLineProps {
  insight: string | null | undefined;
  loading?: boolean;
}

export function InsightLine({ insight, loading = false }: InsightLineProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (insight) {
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [insight]);

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="h-4 w-3/4 bg-secondary/40 rounded animate-pulse" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div
      className={`mt-3 pt-3 border-t border-border/30 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="text-xs text-muted-foreground/70 italic leading-snug">
        &ldquo;{insight}&rdquo;
      </p>
    </div>
  );
}
