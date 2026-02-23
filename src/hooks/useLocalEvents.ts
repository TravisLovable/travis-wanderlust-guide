import { useState, useEffect } from 'react';
import { getMockLocalEvents, MockLocalEvent } from '@/utils/mockData';

interface UseLocalEventsParams {
  destination: string;
  startDate: string;
  endDate: string;
}

interface UseLocalEventsResult {
  events: MockLocalEvent[];
  isLoading: boolean;
}

export function useLocalEvents({ destination, startDate, endDate }: UseLocalEventsParams): UseLocalEventsResult {
  const [events, setEvents] = useState<MockLocalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!destination || !startDate || !endDate) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Simulate async fetch — replace with real API call later
    const timer = setTimeout(() => {
      const data = getMockLocalEvents(destination, { checkin: startDate, checkout: endDate });
      setEvents(data.events);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [destination, startDate, endDate]);

  return { events, isLoading };
}
