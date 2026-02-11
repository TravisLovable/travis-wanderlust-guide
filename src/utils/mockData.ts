// Mock data for development and demo purposes
// This allows the UI to function without real API connections

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

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const variation = Math.floor(Math.random() * 6) - 3;

    forecast.push({
      date: date.toISOString().split('T')[0],
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
  const checkin = new Date(dates.checkin);
  const checkout = new Date(dates.checkout);

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

    holidays.push({
      date: holidayDate.toISOString().split('T')[0],
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
