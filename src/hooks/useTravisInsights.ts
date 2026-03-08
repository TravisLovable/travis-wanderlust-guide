import { useState, useEffect } from 'react';
import { generateInsights } from '@/lib/claude';
import { TravisInsights, InsightRequest } from '@/types/insights';

interface UseTravisInsightsProps {
  destination: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  dates: {
    start: string;
    end: string;
  };
  widgetData: Record<string, any>;
  enabled?: boolean;
}

export function useTravisInsights({
  destination,
  dates,
  widgetData,
  enabled = true,
}: UseTravisInsightsProps) {
  const [insights, setInsights] = useState<TravisInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('[Travis] useTravisInsights effect:', { city: destination.city, country: destination.country, enabled });
    if (!enabled || !destination.city) return;

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Get actual user data from auth context
        const request: InsightRequest = {
          destination,
          dates,
          user: {
            firstName: 'Traveler',
            originCity: 'New York',
            originCountry: 'United States',
          },
          widgetData,
        };

        const result = await generateInsights(request);
        console.log('[Travis] Insights set:', result);
        setInsights(result);
      } catch (err) {
        setError(err as Error);
        console.error('[Travis] Failed to fetch insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    // Only re-fetch when destination or dates change — not when widgetData reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.city, destination.country, dates.start, dates.end, enabled]);

  return { insights, loading, error };
}
