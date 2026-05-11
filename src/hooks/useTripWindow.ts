import { useMemo } from 'react';
import { toLocalMidnight, todayLocal, addDaysLocal } from '@/lib/dates';

export interface TripWindow {
  tripStart: Date;
  tripEnd: Date;
  today: Date;
  forecastEnd: Date;
  /** True when today is in [tripStart, tripEnd) — checkout exclusive */
  isTodayWithinTrip: boolean;
  /** True when tripStart falls on or before forecastEnd (today + 14 days),
   *  OR trip already started and hasn't ended (today is in trip).
   *  Forecast data covers day 0 (today) through day 13 — 14 entries total. */
  isTripWithin14DayForecastWindow: boolean;
}

export function computeTripWindow(checkin: string, checkout: string): TripWindow {
  const tripStart = toLocalMidnight(checkin);
  const tripEnd = toLocalMidnight(checkout);
  const today = todayLocal();

  // forecastEnd = today + 14 days (exclusive: forecast covers today..today+13)
  const forecastEnd = addDaysLocal(today, 14);

  // Checkout exclusive: checkout day = departure, not a trip day
  const isTodayWithinTrip = today >= tripStart && today < tripEnd;

  // Forecastable if: trip starts before the forecast boundary OR trip already started
  const isTripWithin14DayForecastWindow =
    tripStart.getTime() <= forecastEnd.getTime() || isTodayWithinTrip;

  return { tripStart, tripEnd, today, forecastEnd, isTodayWithinTrip, isTripWithin14DayForecastWindow };
}

export function useTripWindow(checkin: string, checkout: string): TripWindow {
  return useMemo(() => computeTripWindow(checkin, checkout), [checkin, checkout]);
}
