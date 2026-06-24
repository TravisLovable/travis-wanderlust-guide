import { useEffect, useState } from "react";
import { getEvents, type EventQuery, type TravisEvent } from "@/services/events";

interface UseEventsReturn {
  events: TravisEvent[];
  isLoading: boolean;
  error: string | null;
}

/**
 * React wrapper over the events provider-merge service. Pass null (or a query
 * missing the essentials) to stay idle. Never surfaces fabricated data: on
 * failure it clears events and sets `error` so the card shows its empty state.
 */
export function useEvents(query: EventQuery | null): UseEventsReturn {
  const [events, setEvents] = useState<TravisEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Need a date window and at least a country (for holidays) or a city.
  const canQuery =
    !!query &&
    !!query.startDate &&
    !!query.endDate &&
    (!!query.countryCode || !!query.city);

  // Primitive deps so we re-run on value changes, not object identity.
  const city = query?.city ?? "";
  const countryCode = query?.countryCode ?? "";
  const startDate = query?.startDate ?? "";
  const endDate = query?.endDate ?? "";

  useEffect(() => {
    if (!canQuery || !query) {
      setEvents([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getEvents(query)
      .then((ev) => {
        if (!cancelled) setEvents(ev);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load events");
        setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuery, city, countryCode, startDate, endDate]);

  return { events, isLoading, error };
}
