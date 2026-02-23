// Mock data for development and demo purposes
// This allows the UI to function without real API connections
import { toLocalMidnight } from '@/lib/dates';

export interface MockWeatherData {
  location: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

export interface MockCurrencyData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  fromSymbol: string;
  toSymbol: string;
}

export interface MockTimezoneData {
  location: string;
  timezone: string;
  currentTime: string;
  offset: string;
  isDaylight: boolean;
}

export interface MockSunData {
  sunrise: string;
  sunset: string;
  sunriseHour: number;   // decimal hours (6.2 = 6:12 AM)
  sunsetHour: number;    // decimal hours (18.57 = 6:34 PM)
  currentHour: number;   // decimal hours in destination tz
  daylightMinutes: number;
}

export interface MockVisaData {
  required: boolean;
  type: string;
  maxStay: string;
  processingTime: string;
  cost: string;
  notes: string;
}

export interface MockHolidayData {
  holidays: Array<{
    date: string;
    name: string;
    type: string;
  }>;
}

// Weather conditions for randomization
const weatherConditions = [
  { condition: 'Sunny', icon: 'sun' },
  { condition: 'Partly Cloudy', icon: 'cloud-sun' },
  { condition: 'Cloudy', icon: 'cloud' },
  { condition: 'Light Rain', icon: 'cloud-rain' },
  { condition: 'Clear', icon: 'moon' },
];

// Generate mock weather based on destination
export function getMockWeather(destination: string): MockWeatherData {
  const baseTemp = getBaseTempForLocation(destination);
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  const forecast = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const variation = Math.floor(Math.random() * 6) - 3;

    forecast.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      day: days[date.getDay()],
      high: baseTemp + variation + 5,
      low: baseTemp + variation - 5,
      condition: dayCondition.condition,
      icon: dayCondition.icon,
    });
  }

  return {
    location: destination,
    current: {
      temp: baseTemp,
      feelsLike: baseTemp - 2,
      humidity: 45 + Math.floor(Math.random() * 30),
      windSpeed: 5 + Math.floor(Math.random() * 15),
      condition: condition.condition,
      icon: condition.icon,
    },
    forecast,
  };
}

function getBaseTempForLocation(destination: string): number {
  const lower = destination.toLowerCase();

  // Tropical locations
  if (lower.includes('bali') || lower.includes('thailand') || lower.includes('singapore') ||
      lower.includes('hawaii') || lower.includes('caribbean') || lower.includes('miami')) {
    return 28 + Math.floor(Math.random() * 5);
  }

  // Cold locations
  if (lower.includes('iceland') || lower.includes('norway') || lower.includes('sweden') ||
      lower.includes('finland') || lower.includes('alaska') || lower.includes('canada')) {
    return 5 + Math.floor(Math.random() * 10);
  }

  // Mediterranean
  if (lower.includes('spain') || lower.includes('italy') || lower.includes('greece') ||
      lower.includes('portugal') || lower.includes('france')) {
    return 20 + Math.floor(Math.random() * 8);
  }

  // Default moderate climate
  return 18 + Math.floor(Math.random() * 10);
}

// Currency data based on destination
export function getMockCurrency(destination: string): MockCurrencyData {
  const lower = destination.toLowerCase();

  const currencyMap: Record<string, { code: string; symbol: string; rate: number }> = {
    japan: { code: 'JPY', symbol: '¥', rate: 149.5 },
    uk: { code: 'GBP', symbol: '£', rate: 0.79 },
    europe: { code: 'EUR', symbol: '€', rate: 0.92 },
    france: { code: 'EUR', symbol: '€', rate: 0.92 },
    germany: { code: 'EUR', symbol: '€', rate: 0.92 },
    italy: { code: 'EUR', symbol: '€', rate: 0.92 },
    spain: { code: 'EUR', symbol: '€', rate: 0.92 },
    thailand: { code: 'THB', symbol: '฿', rate: 35.2 },
    mexico: { code: 'MXN', symbol: '$', rate: 17.1 },
    brazil: { code: 'BRL', symbol: 'R$', rate: 4.97 },
    india: { code: 'INR', symbol: '₹', rate: 83.1 },
    australia: { code: 'AUD', symbol: 'A$', rate: 1.53 },
    canada: { code: 'CAD', symbol: 'C$', rate: 1.36 },
    singapore: { code: 'SGD', symbol: 'S$', rate: 1.34 },
    uae: { code: 'AED', symbol: 'د.إ', rate: 3.67 },
    dubai: { code: 'AED', symbol: 'د.إ', rate: 3.67 },
    south_africa: { code: 'ZAR', symbol: 'R', rate: 18.9 },
    indonesia: { code: 'IDR', symbol: 'Rp', rate: 15680 },
    bali: { code: 'IDR', symbol: 'Rp', rate: 15680 },
  };

  // Find matching currency
  let currency = { code: 'USD', symbol: '$', rate: 1.0 };
  for (const [key, value] of Object.entries(currencyMap)) {
    if (lower.includes(key)) {
      currency = value;
      break;
    }
  }

  return {
    fromCurrency: 'USD',
    toCurrency: currency.code,
    rate: currency.rate,
    fromSymbol: '$',
    toSymbol: currency.symbol,
  };
}

// Timezone data
export function getMockTimezone(destination: string): MockTimezoneData {
  const lower = destination.toLowerCase();

  const timezoneMap: Record<string, { timezone: string; offset: string }> = {
    japan: { timezone: 'Asia/Tokyo', offset: '+9:00' },
    tokyo: { timezone: 'Asia/Tokyo', offset: '+9:00' },
    uk: { timezone: 'Europe/London', offset: '+0:00' },
    london: { timezone: 'Europe/London', offset: '+0:00' },
    france: { timezone: 'Europe/Paris', offset: '+1:00' },
    paris: { timezone: 'Europe/Paris', offset: '+1:00' },
    germany: { timezone: 'Europe/Berlin', offset: '+1:00' },
    thailand: { timezone: 'Asia/Bangkok', offset: '+7:00' },
    bangkok: { timezone: 'Asia/Bangkok', offset: '+7:00' },
    dubai: { timezone: 'Asia/Dubai', offset: '+4:00' },
    uae: { timezone: 'Asia/Dubai', offset: '+4:00' },
    singapore: { timezone: 'Asia/Singapore', offset: '+8:00' },
    australia: { timezone: 'Australia/Sydney', offset: '+11:00' },
    sydney: { timezone: 'Australia/Sydney', offset: '+11:00' },
    'new york': { timezone: 'America/New_York', offset: '-5:00' },
    usa: { timezone: 'America/New_York', offset: '-5:00' },
    'los angeles': { timezone: 'America/Los_Angeles', offset: '-8:00' },
    brazil: { timezone: 'America/Sao_Paulo', offset: '-3:00' },
    india: { timezone: 'Asia/Kolkata', offset: '+5:30' },
  };

  let tz = { timezone: 'UTC', offset: '+0:00' };
  for (const [key, value] of Object.entries(timezoneMap)) {
    if (lower.includes(key)) {
      tz = value;
      break;
    }
  }

  // Calculate current time in that timezone
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: tz.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  let currentTime = '12:00 PM';
  try {
    currentTime = now.toLocaleTimeString('en-US', options);
  } catch {
    // Fallback if timezone is invalid
  }

  const hour = now.getHours();
  const isDaylight = hour >= 6 && hour < 18;

  return {
    location: destination,
    timezone: tz.timezone,
    currentTime,
    offset: `UTC${tz.offset}`,
    isDaylight,
  };
}

// TODO: Replace dummy data with actual WeatherAPI astronomy data from Supabase
// Sunrise/sunset mock data
export function getMockSunData(destination: string): MockSunData {
  const lower = destination.toLowerCase();

  let sunriseHour: number;
  let sunsetHour: number;

  // High-latitude summer (very long days)
  if (lower.includes('iceland') || lower.includes('norway') || lower.includes('sweden') || lower.includes('finland')) {
    sunriseHour = 3.25;   // 3:15 AM
    sunsetHour = 23.5;    // 11:30 PM
  }
  // Equatorial (nearly 12/12 split year-round)
  else if (lower.includes('singapore') || lower.includes('ecuador') || lower.includes('kenya') || lower.includes('colombia')) {
    sunriseHour = 6.0;    // 6:00 AM
    sunsetHour = 18.25;   // 6:15 PM
  }
  // Tropical
  else if (lower.includes('bali') || lower.includes('thailand') || lower.includes('hawaii') || lower.includes('miami')) {
    sunriseHour = 5.75;   // 5:45 AM
    sunsetHour = 18.75;   // 6:45 PM
  }
  // Default mid-latitude
  else {
    sunriseHour = 6.2;    // 6:12 AM
    sunsetHour = 18.567;  // 6:34 PM
  }

  const formatTime = (decimalHour: number): string => {
    const h = Math.floor(decimalHour);
    const m = Math.round((decimalHour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Compute current hour in destination timezone (reuse timezone lookup)
  const tz = getMockTimezone(destination);
  let currentHour = 12;
  try {
    const now = new Date();
    const parts = now.toLocaleTimeString('en-US', { timeZone: tz.timezone, hour12: false, hour: '2-digit', minute: '2-digit' });
    const [h, m] = parts.split(':').map(Number);
    currentHour = h + m / 60;
  } catch {
    // fallback: midday
  }

  const daylightMinutes = Math.round((sunsetHour - sunriseHour) * 60);

  return {
    sunrise: formatTime(sunriseHour),
    sunset: formatTime(sunsetHour),
    sunriseHour,
    sunsetHour,
    currentHour,
    daylightMinutes,
  };
}

// Visa requirements
export function getMockVisa(destination: string, nationality: string = 'US'): MockVisaData {
  const lower = destination.toLowerCase();

  // Countries that typically don't require visas for US citizens
  const visaFree = ['uk', 'france', 'germany', 'italy', 'spain', 'japan', 'south korea',
    'singapore', 'australia', 'canada', 'mexico', 'brazil', 'argentina', 'chile'];

  // Countries that require e-visa or visa on arrival
  const eVisa = ['india', 'turkey', 'vietnam', 'cambodia', 'sri lanka', 'kenya', 'egypt'];

  const isVisaFree = visaFree.some(country => lower.includes(country));
  const isEVisa = eVisa.some(country => lower.includes(country));

  if (isVisaFree) {
    return {
      required: false,
      type: 'Visa-Free Entry',
      maxStay: '90 days',
      processingTime: 'N/A',
      cost: 'Free',
      notes: 'Valid passport required with at least 6 months validity.',
    };
  }

  if (isEVisa) {
    return {
      required: true,
      type: 'e-Visa / Visa on Arrival',
      maxStay: '30 days',
      processingTime: '3-5 business days',
      cost: '$25-75',
      notes: 'Apply online before travel or obtain on arrival.',
    };
  }

  return {
    required: true,
    type: 'Tourist Visa Required',
    maxStay: '30 days',
    processingTime: '5-10 business days',
    cost: '$50-150',
    notes: 'Apply at the embassy or consulate before travel.',
  };
}

// Holiday data
export function getMockHolidays(destination: string, dates: { checkin: string; checkout: string }): MockHolidayData {
  const checkin = toLocalMidnight(dates.checkin);
  const checkout = toLocalMidnight(dates.checkout);

  // Generate some mock holidays within the date range
  const holidays = [];
  const possibleHolidays = [
    { name: 'National Day', type: 'National' },
    { name: 'Independence Day', type: 'National' },
    { name: 'Labor Day', type: 'Public' },
    { name: 'Cultural Festival', type: 'Cultural' },
    { name: 'Religious Holiday', type: 'Religious' },
    { name: 'Spring Festival', type: 'Cultural' },
  ];

  // Add a random holiday if the trip is longer than 5 days
  const tripLength = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));

  if (tripLength > 5 && Math.random() > 0.5) {
    const randomDays = Math.floor(Math.random() * tripLength);
    const holidayDate = new Date(checkin);
    holidayDate.setDate(holidayDate.getDate() + randomDays);

    const randomHoliday = possibleHolidays[Math.floor(Math.random() * possibleHolidays.length)];

    const y = holidayDate.getFullYear();
    const m = String(holidayDate.getMonth() + 1).padStart(2, '0');
    const d = String(holidayDate.getDate()).padStart(2, '0');

    holidays.push({
      date: `${y}-${m}-${d}`,
      name: randomHoliday.name,
      type: randomHoliday.type,
    });
  }

  return { holidays };
}

// Uber/Transport availability
export interface MockTransportData {
  available: boolean;
  services: Array<{
    name: string;
    estimatedPrice: string;
    estimatedTime: string;
  }>;
}

export function getMockTransport(destination: string): MockTransportData {
  const lower = destination.toLowerCase();

  // Cities with good Uber/ride-share coverage
  const goodCoverage = ['new york', 'london', 'paris', 'tokyo', 'singapore', 'dubai',
    'los angeles', 'san francisco', 'chicago', 'sydney', 'berlin', 'amsterdam'];

  const hasGoodCoverage = goodCoverage.some(city => lower.includes(city));

  if (hasGoodCoverage) {
    return {
      available: true,
      services: [
        { name: 'UberX', estimatedPrice: '$12-18', estimatedTime: '3-5 min' },
        { name: 'Uber Comfort', estimatedPrice: '$18-25', estimatedTime: '5-8 min' },
        { name: 'Uber Black', estimatedPrice: '$35-50', estimatedTime: '8-12 min' },
      ],
    };
  }

  return {
    available: true,
    services: [
      { name: 'Local Taxi', estimatedPrice: '$8-15', estimatedTime: '5-10 min' },
      { name: 'Ride Share', estimatedPrice: '$10-20', estimatedTime: '10-15 min' },
    ],
  };
}

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

// Photo URLs for destinations (using placeholder images)
export function getMockPhotos(destination: string): string[] {
  // Return placeholder image URLs
  // In production, these would come from Unsplash or similar
  const baseUrl = 'https://images.unsplash.com';
  const queries = [
    'travel,city',
    'architecture,landmark',
    'street,urban',
    'nature,landscape',
  ];

  return queries.map((q, i) =>
    `${baseUrl}/photo-${1500000000000 + i}?w=800&h=600&fit=crop&q=80`
  );
}
