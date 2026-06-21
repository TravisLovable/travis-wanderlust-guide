// Mock local-events generator — the only remaining consumer is EventsCard via
// useLocalEvents. NOTE: these events are fabricated (see the planned EventsCard
// honesty fix). The other mock generators in this file were removed as dead code.
import { toLocalMidnight } from '@/lib/dates';

// Local Events data
export interface MockLocalEvent {
  name: string;
  startDate: string;
  endDate: string;
  category: 'Festival' | 'Conference' | 'Sports' | 'Concert' | 'Civic';
}

export interface MockLocalEventsData {
  events: MockLocalEvent[];
}

const eventPool: Record<string, Array<{ name: string; category: MockLocalEvent['category']; monthRange: [number, number]; durationDays: number }>> = {
  japan: [
    { name: 'Cherry Blossom Festival', category: 'Festival', monthRange: [3, 4], durationDays: 14 },
    { name: 'Tokyo Marathon', category: 'Sports', monthRange: [2, 3], durationDays: 1 },
    { name: 'Fuji Rock Festival', category: 'Concert', monthRange: [7, 7], durationDays: 3 },
    { name: 'Gion Matsuri', category: 'Festival', monthRange: [7, 7], durationDays: 31 },
  ],
  france: [
    { name: 'Roland Garros', category: 'Sports', monthRange: [5, 6], durationDays: 14 },
    { name: 'Fête de la Musique', category: 'Concert', monthRange: [6, 6], durationDays: 1 },
    { name: 'Tour de France', category: 'Sports', monthRange: [7, 7], durationDays: 21 },
    { name: 'Paris Fashion Week', category: 'Civic', monthRange: [9, 10], durationDays: 7 },
  ],
  uk: [
    { name: 'Wimbledon', category: 'Sports', monthRange: [6, 7], durationDays: 14 },
    { name: 'Notting Hill Carnival', category: 'Festival', monthRange: [8, 8], durationDays: 2 },
    { name: 'London Tech Week', category: 'Conference', monthRange: [6, 6], durationDays: 5 },
    { name: 'Glastonbury Festival', category: 'Concert', monthRange: [6, 6], durationDays: 5 },
  ],
  spain: [
    { name: 'La Tomatina', category: 'Festival', monthRange: [8, 8], durationDays: 1 },
    { name: 'Running of the Bulls', category: 'Festival', monthRange: [7, 7], durationDays: 9 },
    { name: 'Mobile World Congress', category: 'Conference', monthRange: [2, 3], durationDays: 4 },
    { name: 'Primavera Sound', category: 'Concert', monthRange: [5, 6], durationDays: 4 },
  ],
  germany: [
    { name: 'Oktoberfest', category: 'Festival', monthRange: [9, 10], durationDays: 16 },
    { name: 'Berlin Film Festival', category: 'Civic', monthRange: [2, 2], durationDays: 10 },
    { name: 'CeBIT Tech Conference', category: 'Conference', monthRange: [3, 3], durationDays: 5 },
    { name: 'Carnival', category: 'Festival', monthRange: [2, 2], durationDays: 6 },
  ],
  italy: [
    { name: 'Venice Carnival', category: 'Festival', monthRange: [2, 2], durationDays: 14 },
    { name: 'Milan Design Week', category: 'Civic', monthRange: [4, 4], durationDays: 7 },
    { name: 'Palio di Siena', category: 'Sports', monthRange: [7, 8], durationDays: 1 },
    { name: 'Venice Film Festival', category: 'Civic', monthRange: [8, 9], durationDays: 10 },
  ],
  thailand: [
    { name: 'Songkran Water Festival', category: 'Festival', monthRange: [4, 4], durationDays: 3 },
    { name: 'Loy Krathong', category: 'Festival', monthRange: [11, 11], durationDays: 1 },
    { name: 'Bangkok International Film Festival', category: 'Civic', monthRange: [3, 3], durationDays: 7 },
  ],
  australia: [
    { name: 'Sydney Festival', category: 'Festival', monthRange: [1, 1], durationDays: 21 },
    { name: 'Australian Open', category: 'Sports', monthRange: [1, 1], durationDays: 14 },
    { name: 'Melbourne Cup', category: 'Sports', monthRange: [11, 11], durationDays: 1 },
    { name: 'Vivid Sydney', category: 'Festival', monthRange: [5, 6], durationDays: 23 },
  ],
  brazil: [
    { name: 'Carnival', category: 'Festival', monthRange: [2, 3], durationDays: 5 },
    { name: 'Rock in Rio', category: 'Concert', monthRange: [9, 10], durationDays: 7 },
    { name: 'São Paulo Fashion Week', category: 'Civic', monthRange: [4, 4], durationDays: 5 },
  ],
  india: [
    { name: 'Diwali Festival', category: 'Festival', monthRange: [10, 11], durationDays: 5 },
    { name: 'Holi Festival', category: 'Festival', monthRange: [3, 3], durationDays: 2 },
    { name: 'Bangalore Tech Summit', category: 'Conference', monthRange: [11, 11], durationDays: 3 },
  ],
  singapore: [
    { name: 'Singapore Grand Prix', category: 'Sports', monthRange: [9, 10], durationDays: 3 },
    { name: 'Singapore Food Festival', category: 'Festival', monthRange: [7, 8], durationDays: 14 },
    { name: 'Innovfest Unbound', category: 'Conference', monthRange: [6, 6], durationDays: 2 },
  ],
  dubai: [
    { name: 'Dubai Shopping Festival', category: 'Civic', monthRange: [12, 1], durationDays: 30 },
    { name: 'Dubai World Cup', category: 'Sports', monthRange: [3, 3], durationDays: 1 },
    { name: 'GITEX Technology Week', category: 'Conference', monthRange: [10, 10], durationDays: 5 },
  ],
  mexico: [
    { name: 'Día de los Muertos', category: 'Festival', monthRange: [10, 11], durationDays: 2 },
    { name: 'Guelaguetza Festival', category: 'Festival', monthRange: [7, 7], durationDays: 14 },
    { name: 'Mexican Grand Prix', category: 'Sports', monthRange: [10, 10], durationDays: 3 },
  ],
};

// Fallback events for unrecognized destinations
const fallbackEvents: Array<{ name: string; category: MockLocalEvent['category']; durationDays: number }> = [
  { name: 'International Food Festival', category: 'Festival', durationDays: 5 },
  { name: 'Regional Tech Summit', category: 'Conference', durationDays: 3 },
  { name: 'City Marathon', category: 'Sports', durationDays: 1 },
  { name: 'Open-Air Concert Series', category: 'Concert', durationDays: 2 },
  { name: 'Civic Heritage Week', category: 'Civic', durationDays: 7 },
];

export function getMockLocalEvents(
  destination: string,
  dates: { checkin: string; checkout: string }
): MockLocalEventsData {
  const checkin = toLocalMidnight(dates.checkin);
  const checkout = toLocalMidnight(dates.checkout);
  const lower = destination.toLowerCase();

  // Find matching event pool
  let pool: typeof eventPool[string] | undefined;
  for (const [key, events] of Object.entries(eventPool)) {
    if (lower.includes(key)) {
      pool = events;
      break;
    }
  }

  const results: MockLocalEvent[] = [];
  const year = checkin.getFullYear();

  if (pool) {
    // Check each event for date overlap with trip window
    for (const event of pool) {
      // Build event dates for the trip year
      const eventStart = new Date(year, event.monthRange[0] - 1, 5 + Math.floor(Math.abs(hashString(event.name)) % 20));
      const eventEnd = new Date(eventStart);
      eventEnd.setDate(eventEnd.getDate() + event.durationDays);

      // Date overlap: event starts before checkout AND event ends after checkin
      if (eventStart < checkout && eventEnd > checkin) {
        results.push({
          name: event.name,
          startDate: `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, '0')}-${String(eventStart.getDate()).padStart(2, '0')}`,
          endDate: `${eventEnd.getFullYear()}-${String(eventEnd.getMonth() + 1).padStart(2, '0')}-${String(eventEnd.getDate()).padStart(2, '0')}`,
          category: event.category,
        });
      }
    }
  } else {
    // For unrecognized destinations, probabilistically generate 0-2 events
    const tripLength = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    const seed = hashString(destination + dates.checkin);

    if (tripLength > 4 && Math.abs(seed) % 3 !== 0) {
      const count = 1 + (Math.abs(seed) % 2);
      for (let i = 0; i < count && i < fallbackEvents.length; i++) {
        const fb = fallbackEvents[(Math.abs(seed) + i) % fallbackEvents.length];
        const offset = Math.abs((seed + i * 7) % Math.max(tripLength - 1, 1));
        const start = new Date(checkin);
        start.setDate(start.getDate() + offset);
        const end = new Date(start);
        end.setDate(end.getDate() + fb.durationDays);

        const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        results.push({
          name: fb.name,
          startDate: fmt(start),
          endDate: fmt(end),
          category: fb.category,
        });
      }
    }
  }

  // Sort by start date
  results.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return { events: results };
}

// Stable hash for deterministic mock data (no Math.random)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

