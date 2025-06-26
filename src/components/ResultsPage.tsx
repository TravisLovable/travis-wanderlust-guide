import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Thermometer, Clock, CreditCard, Plane, Car, Shield, Mountain, Wifi, TrendingUp, Users, Zap, Pin, PinOff, CalendarDays, Plug, Palette, Church, Globe, Heart, Utensils, User, ChevronDown, Search, Sun, Moon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import PhotoSlideshow from './PhotoSlideshow';
import TravisChatbot from './TravisChatbot';
import SaoPauloAccommodationMap from './SaoPauloAccommodationMap';
import WeatherWidget from './WeatherWidget';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { supabase } from '@/integrations/supabase/client';
import { getContextualDestinations } from '@/utils/contextualDestinationSuggestions';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}

interface WorldClockData {
  origin: {
    timeZone: string;
    time: string;
    time12: string;
    date: string;
    fullDateTime: string;
    isDst: boolean;
    abbreviation: string;
  };
  destination: {
    timeZone: string;
    time: string;
    time12: string;
    date: string;
    fullDateTime: string; 
    isDst: boolean;
    abbreviation: string;
  };
  timeDifferenceHours: number;
  timeDifferenceText: string;
}

interface HolidayData {
  country: string;
  year: number;
  totalHolidays: number;
  upcomingHolidays: Array<{
    date: string;
    name: string;
    localName: string;
    countryCode: string;
    fixed: boolean;
    global: boolean;
    counties: string[] | null;
    type: string;
    region?: string;
  }>;
  allHolidays: Array<{
    date: string;
    name: string;
    localName: string;
    countryCode: string;
    fixed: boolean;
    global: boolean;
    counties: string[] | null;
    type: string;
    region?: string;
  }>;
  source?: string;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [currencyAmount, setCurrencyAmount] = useState(100);
  const [selectedWidgets, setSelectedWidgets] = useState(['currency', 'weather', 'time']);
  const [pinnedDestinations, setPinnedDestinations] = useState([destination]);
  const [newDestination, setNewDestination] = useState(destination);
  const [newCheckinDate, setNewCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [newCheckoutDate, setNewCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isAdapterSpinning, setIsAdapterSpinning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [worldClockData, setWorldClockData] = useState<WorldClockData | null>(null);
  const [isLoadingWorldClock, setIsLoadingWorldClock] = useState(false);
  const [holidayData, setHolidayData] = useState<HolidayData | null>(null);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  // Use Mapbox geocoding for destination suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions } = useMapboxGeocoding(
    newDestination,
    showSuggestions && newDestination.length >= 2
  );

  // Use real currency exchange data with destination-based currency
  const { currencyData, isLoading: currencyLoading, error: currencyError } = useCurrencyExchange('USD', destination);

  // Update pinned destinations when destination changes
  useEffect(() => {
    if (!pinnedDestinations.includes(destination)) {
      setPinnedDestinations(prev => [destination, ...prev.slice(0, 4)]); // Keep max 5 pinned destinations
    }
  }, [destination]);

  // Update newDestination when destination prop changes
  useEffect(() => {
    setNewDestination(destination);
  }, [destination]);

  // Fetch world clock data
  useEffect(() => {
    const fetchWorldClockData = async () => {
      setIsLoadingWorldClock(true);
      try {
        console.log('Fetching world clock data for:', destination);
        
        // Get timezone for destination - improved mapping with more destinations
        const getTimezoneForDestination = (dest: string) => {
          const lowerDest = dest.toLowerCase();
          
          // Peru
          if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
            return 'America/Lima';
          }
          
          // South America
          if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro')) {
            return 'America/Sao_Paulo';
          }
          
          if (lowerDest.includes('argentina') || lowerDest.includes('buenos aires')) {
            return 'America/Argentina/Buenos_Aires';
          }
          
          if (lowerDest.includes('chile') || lowerDest.includes('santiago')) {
            return 'America/Santiago';
          }
          
          if (lowerDest.includes('colombia') || lowerDest.includes('bogota')) {
            return 'America/Bogota';
          }
          
          // North America
          if (lowerDest.includes('chicago')) {
            return 'America/Chicago';
          }
          
          if (lowerDest.includes('new york')) {
            return 'America/New_York';
          }
          
          if (lowerDest.includes('los angeles')) {
            return 'America/Los_Angeles';
          }
          
          if (lowerDest.includes('mexico')) {
            return 'America/Mexico_City';
          }
          
          // Europe
          if (lowerDest.includes('london')) {
            return 'Europe/London';
          }
          
          if (lowerDest.includes('paris')) {
            return 'Europe/Paris';
          }
          
          // Asia
          if (lowerDest.includes('bali') || lowerDest.includes('indonesia')) {
            return 'Asia/Makassar';
          }
          
          if (lowerDest.includes('tokyo')) {
            return 'Asia/Tokyo';
          }
          
          // Default fallback
          return 'UTC';
        };

        const destinationTimezone = getTimezoneForDestination(destination);
        const originTimezone = 'America/Chicago'; // User's timezone (CST)

        console.log(`Using timezones: origin=${originTimezone}, destination=${destinationTimezone}`);

        const { data, error } = await supabase.functions.invoke('get-world-clock', {
          body: {
            originTimeZone: originTimezone,
            destinationTimeZone: destinationTimezone
          }
        });

        if (error) {
          console.error('Error fetching world clock data:', error);
          throw error;
        }

        console.log('World clock data received:', data);
        setWorldClockData(data);
      } catch (error) {
        console.error('Failed to fetch world clock data:', error);
        // Keep existing mock data as fallback
      } finally {
        setIsLoadingWorldClock(false);
      }
    };

    fetchWorldClockData();
  }, [destination]);

  // Fetch holiday data - Updated to handle multiple years
  useEffect(() => {
    const fetchHolidayData = async () => {
      setIsLoadingHolidays(true);
      try {
        console.log('Fetching holiday data for:', destination);
        
        // Get country code for destination - improved mapping
        const getCountryCodeForDestination = (dest: string) => {
          const lowerDest = dest.toLowerCase();
          
          // Map destinations to ISO country codes
          if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro') || lowerDest.includes('salvador') || lowerDest.includes('brasília')) {
            return 'BR';
          }
          if (lowerDest.includes('peru') || lowerDest.includes('lima') || lowerDest.includes('cusco') || lowerDest.includes('arequipa') || lowerDest.includes('trujillo')) {
            return 'PE';
          }
          if (lowerDest.includes('united states') || lowerDest.includes('usa') || lowerDest.includes('chicago') || lowerDest.includes('new york') || lowerDest.includes('los angeles') || lowerDest.includes('miami')) {
            return 'US';
          }
          if (lowerDest.includes('united kingdom') || lowerDest.includes('uk') || lowerDest.includes('london') || lowerDest.includes('manchester') || lowerDest.includes('edinburgh')) {
            return 'GB';
          }
          if (lowerDest.includes('france') || lowerDest.includes('paris') || lowerDest.includes('lyon') || lowerDest.includes('marseille')) {
            return 'FR';
          }
          if (lowerDest.includes('germany') || lowerDest.includes('berlin') || lowerDest.includes('munich') || lowerDest.includes('hamburg')) {
            return 'DE';
          }
          if (lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('osaka') || lowerDest.includes('kyoto')) {
            return 'JP';
          }
          if (lowerDest.includes('italy') || lowerDest.includes('rome') || lowerDest.includes('milan') || lowerDest.includes('florence')) {
            return 'IT';
          }
          if (lowerDest.includes('spain') || lowerDest.includes('madrid') || lowerDest.includes('barcelona') || lowerDest.includes('seville')) {
            return 'ES';
          }
          if (lowerDest.includes('canada') || lowerDest.includes('toronto') || lowerDest.includes('vancouver') || lowerDest.includes('montreal')) {
            return 'CA';
          }
          if (lowerDest.includes('australia') || lowerDest.includes('sydney') || lowerDest.includes('melbourne') || lowerDest.includes('brisbane')) {
            return 'AU';
          }
          if (lowerDest.includes('mexico') || lowerDest.includes('mexico city') || lowerDest.includes('cancun') || lowerDest.includes('guadalajara')) {
            return 'MX';
          }
          if (lowerDest.includes('argentina') || lowerDest.includes('buenos aires') || lowerDest.includes('cordoba') || lowerDest.includes('mendoza')) {
            return 'AR';
          }
          if (lowerDest.includes('chile') || lowerDest.includes('santiago') || lowerDest.includes('valparaiso')) {
            return 'CL';
          }
          if (lowerDest.includes('colombia') || lowerDest.includes('bogota') || lowerDest.includes('medellin') || lowerDest.includes('cartagena')) {
            return 'CO';
          }
          
          // Default fallback - try to extract country code from destination string
          const parts = dest.split(',');
          if (parts.length > 1) {
            const lastPart = parts[parts.length - 1].trim();
            // Simple country name to code mapping
            const countryMap: { [key: string]: string } = {
              'Brazil': 'BR',
              'Peru': 'PE',
              'United States': 'US',
              'USA': 'US',
              'United Kingdom': 'GB',
              'UK': 'GB',
              'France': 'FR',
              'Germany': 'DE',
              'Japan': 'JP',
              'Italy': 'IT',
              'Spain': 'ES',
              'Canada': 'CA',
              'Australia': 'AU',
              'Mexico': 'MX',
              'Argentina': 'AR',
              'Chile': 'CL',
              'Colombia': 'CO'
            };
            return countryMap[lastPart] || 'US'; // Default to US if no match
          }
          
          return 'US'; // Final fallback
        };

        const countryCode = getCountryCodeForDestination(destination);
        const checkinDate = new Date(dates.checkin);
        const checkoutDate = new Date(dates.checkout);
        const startYear = checkinDate.getFullYear();
        const endYear = checkoutDate.getFullYear();

        console.log(`Fetching holidays for country code: ${countryCode} based on destination: ${destination}`);
        console.log(`Travel dates span from ${startYear} to ${endYear}`);

        // Fetch holidays for all years in the travel date range
        const years = [];
        for (let year = startYear; year <= endYear; year++) {
          years.push(year);
        }

        console.log('Years to fetch:', years);

        // Fetch holidays for each year
        const allHolidaysData = [];
        for (const year of years) {
          try {
            console.log(`Fetching holidays for year ${year}`);
            const { data, error } = await supabase.functions.invoke('get-holidays', {
              body: {
                country: countryCode,
                year: year
              }
            });

            if (error) {
              console.error(`Error fetching holiday data for ${year}:`, error);
              continue;
            }

            if (data && data.allHolidays) {
              console.log(`Got ${data.allHolidays.length} holidays for ${year}`);
              allHolidaysData.push(...data.allHolidays);
            }
          } catch (yearError) {
            console.error(`Failed to fetch holidays for year ${year}:`, yearError);
          }
        }

        console.log(`Total holidays fetched across all years: ${allHolidaysData.length}`);
        
        // Filter holidays to show ONLY holidays that fall within the travel period
        if (allHolidaysData.length > 0) {
          console.log('Travel dates:', { 
            checkin: checkinDate.toISOString().split('T')[0], 
            checkout: checkoutDate.toISOString().split('T')[0] 
          });
          
          // Filter to show ONLY holidays that fall within the exact travel dates
          const relevantHolidays = allHolidaysData.filter((holiday: any) => {
            const holidayDate = new Date(holiday.date);
            const isWithinTravelDates = holidayDate >= checkinDate && holidayDate <= checkoutDate;
            
            console.log(`Holiday ${holiday.name} (${holiday.date}): ${isWithinTravelDates ? 'WITHIN TRAVEL DATES' : 'OUTSIDE TRAVEL DATES'}`);
            
            return isWithinTravelDates;
          });

          console.log('Holidays within travel dates:', relevantHolidays);

          // Update the data with filtered holidays
          const updatedData = {
            country: countryCode,
            year: startYear, // Use start year as primary
            totalHolidays: relevantHolidays.length,
            upcomingHolidays: relevantHolidays.slice(0, 10), // Show up to 10 holidays within travel dates
            allHolidays: relevantHolidays,
            source: 'multi-year-fetch'
          };
          
          setHolidayData(updatedData);
        } else {
          // No holidays found
          setHolidayData({
            country: countryCode,
            year: startYear,
            totalHolidays: 0,
            upcomingHolidays: [],
            allHolidays: [],
            source: 'multi-year-fetch'
          });
        }
      } catch (error) {
        console.error('Failed to fetch holiday data:', error);
        // Keep existing fallback data if API fails
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    fetchHolidayData();
  }, [destination, dates.checkin, dates.checkout]);

  // Dynamic flag mapping based on destination
  const getCountryFlag = (dest: string) => {
    const lowerDest = dest.toLowerCase();
    
    // African countries
    if (lowerDest.includes('south africa') || lowerDest.includes('cape town') || lowerDest.includes('johannesburg') || lowerDest.includes('durban')) {
      return 'https://flagcdn.com/w40/za.png';
    }
    if (lowerDest.includes('egypt') || lowerDest.includes('cairo') || lowerDest.includes('alexandria')) {
      return 'https://flagcdn.com/w40/eg.png';
    }
    if (lowerDest.includes('nigeria') || lowerDest.includes('lagos') || lowerDest.includes('abuja')) {
      return 'https://flagcdn.com/w40/ng.png';
    }
    if (lowerDest.includes('kenya') || lowerDest.includes('nairobi') || lowerDest.includes('mombasa')) {
      return 'https://flagcdn.com/w40/ke.png';
    }
    if (lowerDest.includes('morocco') || lowerDest.includes('marrakech') || lowerDest.includes('casablanca') || lowerDest.includes('rabat')) {
      return 'https://flagcdn.com/w40/ma.png';
    }
    if (lowerDest.includes('tunisia') || lowerDest.includes('tunis')) {
      return 'https://flagcdn.com/w40/tn.png';
    }
    if (lowerDest.includes('ghana') || lowerDest.includes('accra')) {
      return 'https://flagcdn.com/w40/gh.png';
    }
    if (lowerDest.includes('ethiopia') || lowerDest.includes('addis ababa')) {
      return 'https://flagcdn.com/w40/et.png';
    }
    if (lowerDest.includes('tanzania') || lowerDest.includes('dar es salaam') || lowerDest.includes('dodoma')) {
      return 'https://flagcdn.com/w40/tz.png';
    }
    if (lowerDest.includes('uganda') || lowerDest.includes('kampala')) {
      return 'https://flagcdn.com/w40/ug.png';
    }
    if (lowerDest.includes('rwanda') || lowerDest.includes('kigali')) {
      return 'https://flagcdn.com/w40/rw.png';
    }
    if (lowerDest.includes('senegal') || lowerDest.includes('dakar')) {
      return 'https://flagcdn.com/w40/sn.png';
    }
    if (lowerDest.includes('madagascar') || lowerDest.includes('antananarivo')) {
      return 'https://flagcdn.com/w40/mg.png';
    }
    if (lowerDest.includes('zimbabwe') || lowerDest.includes('harare')) {
      return 'https://flagcdn.com/w40/zw.png';
    }
    if (lowerDest.includes('botswana') || lowerDest.includes('gaborone')) {
      return 'https://flagcdn.com/w40/bw.png';
    }
    if (lowerDest.includes('namibia') || lowerDest.includes('windhoek')) {
      return 'https://flagcdn.com/w40/na.png';
    }
    if (lowerDest.includes('zambia') || lowerDest.includes('lusaka')) {
      return 'https://flagcdn.com/w40/zm.png';
    }
    if (lowerDest.includes('malawi') || lowerDest.includes('lilongwe')) {
      return 'https://flagcdn.com/w40/mw.png';
    }
    if (lowerDest.includes('mozambique') || lowerDest.includes('maputo')) {
      return 'https://flagcdn.com/w40/mz.png';
    }
    if (lowerDest.includes('angola') || lowerDest.includes('luanda')) {
      return 'https://flagcdn.com/w40/ao.png';
    }
    
    // Existing non-African countries
    if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro')) {
      return 'https://flagcdn.com/w40/br.png';
    }
    if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
      return 'https://flagcdn.com/w40/pe.png';
    }
    if (lowerDest.includes('italy') || lowerDest.includes('rome') || lowerDest.includes('milan')) {
      return 'https://flagcdn.com/w40/it.png';
    }
    if (lowerDest.includes('france') || lowerDest.includes('paris')) {
      return 'https://flagcdn.com/w40/fr.png';
    }
    if (lowerDest.includes('spain') || lowerDest.includes('madrid') || lowerDest.includes('barcelona')) {
      return 'https://flagcdn.com/w40/es.png';
    }
    if (lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('osaka')) {
      return 'https://flagcdn.com/w40/jp.png';
    }
    if (lowerDest.includes('united kingdom') || lowerDest.includes('london') || lowerDest.includes('uk')) {
      return 'https://flagcdn.com/w40/gb.png';
    }
    if (lowerDest.includes('germany') || lowerDest.includes('berlin') || lowerDest.includes('munich')) {
      return 'https://flagcdn.com/w40/de.png';
    }
    if (lowerDest.includes('australia') || lowerDest.includes('sydney') || lowerDest.includes('melbourne')) {
      return 'https://flagcdn.com/w40/au.png';
    }
    if (lowerDest.includes('canada') || lowerDest.includes('toronto') || lowerDest.includes('vancouver')) {
      return 'https://flagcdn.com/w40/ca.png';
    }
    // Default to world icon if no country match
    return null;
  };

  // Dynamic mock data based on destination (removed hardcoded Brazil references)
  const mockData = {
    time: { current: '14:42', offset: '-3', dst: false },
    airport: { 
      code: destination.toLowerCase().includes('lima') ? 'LIM' : 'GRU', 
      name: destination.toLowerCase().includes('lima') ? 'Jorge Chávez International Airport' : 'São Paulo/Guarulhos International Airport', 
      address: destination.toLowerCase().includes('lima') ? 'Lima, Peru' : 'Guarulhos, São Paulo' 
    },
    altitude: { elevation: destination.toLowerCase().includes('lima') ? '113m above sea level' : '760m above sea level' },
    emergency: { police: '190', fire: '193', medical: '192' },
    holidays: [
      { name: 'Carnival', date: 'February 12-13, 2024' },
      { name: 'Independence Day', date: 'September 7, 2024' },
      { name: 'Christmas Day', date: 'December 25, 2024' }
    ],
    culture: {
      language: { 
        primary: destination.toLowerCase().includes('lima') ? 'Spanish' : 'Portuguese', 
        secondary: 'English (limited in tourist areas)' 
      },
      religion: { 
        primary: destination.toLowerCase().includes('lima') ? 'Roman Catholic (76%)' : 'Roman Catholic (64.6%)', 
        secondary: destination.toLowerCase().includes('lima') ? 'Protestant (14%), Other (10%)' : 'Protestant (22.2%), Other (13.2%)' 
      },
      etiquette: [
        'Warm greetings with hugs and kisses on cheek',
        'Dress well, appearance matters',
        'Avoid discussing politics initially',
        destination.toLowerCase().includes('lima') ? 'Always say "gracias" (thank you)' : 'Always say "obrigado/obrigada" (thank you)',
        'Family values are very important'
      ],
      customs: [
        'Late dining (8-10 PM is normal)',
        'Strong coffee culture throughout day',
        destination.toLowerCase().includes('lima') ? 'Food culture is central to identity' : 'Soccer (futebol) is a national passion',
        'Music and dance are central to culture'
      ]
    }
  };

  const fourteenDayForecast = [
    { day: 'Today', temp: 24, condition: 'Partly Cloudy' },
    { day: 'Tomorrow', temp: 26, condition: 'Sunny' },
    { day: 'Wed', temp: 22, condition: 'Rainy' },
    { day: 'Thu', temp: 28, condition: 'Sunny' },
    { day: 'Fri', temp: 25, condition: 'Cloudy' },
    { day: 'Sat', temp: 27, condition: 'Sunny' },
    { day: 'Sun', temp: 23, condition: 'Rainy' },
    { day: 'Mon', temp: 29, condition: 'Sunny' },
    { day: 'Tue', temp: 24, condition: 'Partly Cloudy' },
    { day: 'Wed', temp: 26, condition: 'Sunny' },
    { day: 'Thu', temp: 25, condition: 'Cloudy' },
    { day: 'Fri', temp: 30, condition: 'Sunny' },
    { day: 'Sat', temp: 23, condition: 'Rainy' },
    { day: 'Sun', temp: 27, condition: 'Partly Cloudy' }
  ];

  const widgetOptions = [
    { id: 'currency', name: 'Currency', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
    { id: 'weather', name: 'Weather', icon: Thermometer, color: 'from-orange-500 to-red-600' },
    { id: 'time', name: 'Time', icon: Clock, color: 'from-blue-500 to-cyan-600' },
    { id: 'transport', name: 'Transport', icon: Car, color: 'from-purple-500 to-violet-600' },
    { id: 'emergency', name: 'Emergency', icon: Shield, color: 'from-red-500 to-pink-600' },
    { id: 'connectivity', name: 'Wi-Fi', icon: Wifi, color: 'from-teal-500 to-cyan-600' }
  ];

  // Dynamic destination suggestions based on the current destination region
  const getRegionalDestinations = (currentDest: string) => {
    return getContextualDestinations(currentDest);
  };

  const handleDestinationChange = (value: string) => {
    setNewDestination(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleDestinationSelect = (suggestion: any) => {
    setNewDestination(suggestion.place_name);
    setShowSuggestions(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newDestination && newCheckinDate && newCheckoutDate) {
      // Pass skipTransition as true to avoid loading screen
      onNewSearch(newDestination, { 
        checkin: format(newCheckinDate, 'yyyy-MM-dd'), 
        checkout: format(newCheckoutDate, 'yyyy-MM-dd') 
      }, true);
      setShowSuggestions(false); // Hide suggestions after search
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handlePinDestination = (dest: string) => {
    if (!pinnedDestinations.includes(dest)) {
      setPinnedDestinations([...pinnedDestinations, dest]);
    }
  };

  const removePinnedDestination = (dest: string) => {
    setPinnedDestinations(pinnedDestinations.filter(d => d !== dest));
  };

  const convertTemp = (temp: number) => {
    return tempUnit === 'F' ? Math.round((temp * 9/5) + 32) : temp;
  };

  const handleAdapterClick = () => {
    setIsAdapterSpinning(!isAdapterSpinning);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const formatDateRange = (checkin: Date, checkout: Date) => {
    const departFormatted = format(checkin, 'EEEE MMMM do');
    const returnFormatted = format(checkout, 'EEEE MMMM do');
    return `Depart: ${departFormatted} • Return: ${returnFormatted}`;
  };

  const handleSignOut = () => {
    // Navigate to sign out/sign in page
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gray-400 dark:bg-black">
      {/* Header - More transparent */}
      <header className="bg-black/5 dark:bg-black/5 backdrop-blur-sm border-b border-white/5 shadow-lg shadow-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2 hover:bg-secondary/50 rounded-xl travis-interactive"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-foreground flex items-center tracking-tight">
                    {destination}
                    {getCountryFlag(destination) ? (
                      <img 
                        src={getCountryFlag(destination)!} 
                        alt="Country Flag" 
                        className="w-8 h-6 ml-3 mr-2 rounded shadow-sm"
                      />
                    ) : (
                      <Globe className="w-8 h-6 ml-3 mr-2 text-blue-400" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePinDestination(destination)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Pin className="w-5 h-5" />
                    </Button>
                  </h1>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground flex items-center font-light p-0 h-auto hover:text-foreground transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDateRange(newCheckinDate, newCheckoutDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Depart Date</p>
                        <CalendarComponent
                          mode="single"
                          selected={newCheckinDate}
                          onSelect={(date) => {
                            if (date) setNewCheckinDate(date);
                          }}
                          className="pointer-events-auto"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Return Date</p>
                        <CalendarComponent
                          mode="single"
                          selected={newCheckoutDate}
                          onSelect={(date) => {
                            if (date) setNewCheckoutDate(date);
                          }}
                          className="pointer-events-auto"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Pinned Destinations - More transparent */}
          {pinnedDestinations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground font-medium">PINNED:</span>
                <div className="flex space-x-2 flex-wrap">
                  {pinnedDestinations.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => setNewDestination(dest)}
                      className="group flex items-center space-x-2 px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-sm text-white hover:bg-blue-700/40 transition-colors shadow-sm"
                    >
                      <span>{dest}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePinnedDestination(dest);
                        }}
                        className="w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  {getRegionalDestinations(destination).map((city) => (
                    <button
                      key={city}
                      onClick={() => handlePinDestination(city)}
                      className="px-2 py-1 bg-green-600/30 border border-green-500/30 rounded text-xs text-white hover:bg-green-700/40 transition-colors shadow-sm"
                      title="Click to pin"
                    >
                      + {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar with Mapbox Auto-suggestions */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-sm border border-border/20 rounded-full p-2 shadow-lg relative travis-glow-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search any destination worldwide..."
                  value={newDestination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => newDestination.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full"
                />
                {showSuggestions && mapboxSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isLoadingSuggestions && (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                      </div>
                    )}
                    {mapboxSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleDestinationSelect(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors text-sm border-b border-border/20 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">
                              {suggestion.text}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {suggestion.place_name}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Date Inputs */}
              <div className="flex gap-1">
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                    >
                      {newCheckinDate ? format(newCheckinDate, 'MMM dd') : 'Depart'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newCheckinDate}
                      onSelect={(date) => {
                        if (date) setNewCheckinDate(date);
                        setCheckinOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                    >
                      {newCheckoutDate ? format(newCheckoutDate, 'MMM dd') : 'Return'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newCheckoutDate}
                      onSelect={(date) => {
                        if (date) setNewCheckoutDate(date);
                        setCheckoutOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="submit"
                className="h-12 px-4 bg-white/20 hover:bg-white/30 text-white rounded-r-full border-l border-border/30 search-icon-glow"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Photo Slideshow */}
        <div className="mb-6">
          <PhotoSlideshow />
        </div>

        {/* Optimized Widget Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
          
          {/* Row 1: Primary Info Widgets - Reordered as requested */}
          {/* Time Zone - First position */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Time Zone
                <Zap className="w-3 h-3 ml-auto text-blue-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingWorldClock ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">YOUR TIME</div>
                      <div className="text-lg font-bold text-blue-400">
                        {worldClockData?.origin.time12 || '4:50 PM'}
                      </div>
                      <div className="text-xs text-muted-foreground opacity-75">
                        {worldClockData?.origin.time || '16:50'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {worldClockData?.origin.abbreviation || 'CST'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                      <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">
                        {destination.split(',')[0]}
                      </div>
                      <div className="text-lg font-bold text-blue-300">
                        {worldClockData?.destination.time12 || '4:50 PM'}
                      </div>
                      <div className="text-xs text-muted-foreground opacity-75">
                        {worldClockData?.destination.time || '16:50'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {worldClockData?.destination.abbreviation || 'PET'}
                      </div>
                    </div>
                  </div>
                  {worldClockData && (
                    <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <Clock className="w-3 h-3 mr-1 text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">
                        {worldClockData.timeDifferenceText}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Currency - Second position */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-2">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Currency
                <TrendingUp className="w-3 h-3 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currencyLoading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center p-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <span className="font-semibold text-sm">1 USD</span>
                    <span className="text-green-400 font-bold text-sm">
                      {currencyData?.rate.toFixed(2)} {currencyData?.symbol}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={currencyAmount}
                      onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                      className="flex-1 bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl h-8 text-sm"
                    />
                    <span className="text-green-400 font-semibold text-sm">
                      = {currencyData?.symbol}{currencyData ? (currencyAmount * currencyData.rate).toFixed(2) : '-.--'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currencyError ? (
                      <span className="text-orange-400">API Error - Using fallback</span>
                    ) : (
                      `Live rate • ${currencyData?.lastUpdated}`
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Airport Info - Third position */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                Airport
                <Plane className="w-3 h-3 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="font-bold text-lg text-purple-700">{mockData.airport.code}</div>
                <div className="text-sm font-medium">{mockData.airport.name}</div>
                <div className="text-xs text-muted-foreground">{mockData.airport.address}</div>
              </div>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Distance:</span> 25 km</p>
                <p><span className="font-medium">Travel time:</span> 45-90 min</p>
                <p><span className="font-medium">Options:</span> Metro, Bus, Taxi</p>
              </div>
            </CardContent>
          </Card>

          {/* Visa & Entry - Fourth position */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                Visa & Entry
                <Shield className="w-3 h-3 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-green-700 font-medium text-sm">✓ Visa-free entry</div>
                <div className="text-xs text-muted-foreground">For US passport holders</div>
              </div>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Max stay:</span> 90 days</p>
                <p><span className="font-medium">Passport validity:</span> 6 months minimum</p>
                <p><span className="font-medium">Yellow fever:</span> Vaccination recommended</p>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Requirements
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Weather Widget - Integrated into grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Weather Widget - Takes 2 columns on larger screens */}
          <div className="lg:col-span-2 xl:col-span-2">
            <WeatherWidget
              destination={destination}
              tempUnit={tempUnit}
              onTempUnitToggle={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
            />
          </div>

          {/* Transportation */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2">
                  <Car className="w-4 h-4 text-white" />
                </div>
                Transport
                <Car className="w-3 h-3 ml-auto text-indigo-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                  <div className="font-medium text-indigo-700 text-sm">Metro</div>
                  <div className="text-xs text-muted-foreground">Network</div>
                </div>
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                  <div className="font-medium text-indigo-700 text-sm">Uber/99</div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Metro pass:</span> R$12.00</p>
                <p><span className="font-medium">Bus fare:</span> R$4.40</p>
                <p><span className="font-medium">Card:</span> Bilhete Único</p>
              </div>
            </CardContent>
          </Card>

          {/* Local Holidays - Enhanced with Time and Date API */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                Holidays
                <Mountain className="w-3 h-3 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoadingHolidays ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                </div>
              ) : (
                <>
                  {holidayData && holidayData.upcomingHolidays.length > 0 ? (
                    <>
                      <div className="text-xs text-purple-300 mb-2 font-medium">
                        During your trip to {destination}:
                      </div>
                      {holidayData.upcomingHolidays.map((holiday, idx) => (
                        <div key={idx} className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                          <div className="font-medium text-purple-300 text-sm">{holiday.name}</div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>
                              {new Date(holiday.date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {holiday.region && holiday.region !== 'National' && (
                              <span className="text-purple-400">
                                {holiday.region}
                              </span>
                            )}
                          </div>
                          {holiday.type && (
                            <div className="text-xs text-purple-400 mt-1">
                              {holiday.type === 'national' ? 'National' : holiday.type}
                            </div>
                          )}
                        </div>
                      ))}
                      {holidayData.source && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Source: {holidayData.source === 'timeanddate' ? 'Time and Date API' : holidayData.source === 'multi-year-fetch' ? 'Multi-year Holiday API' : 'Public Holidays API'}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                      <div className="text-gray-400 text-sm">No holidays during your travel dates</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(dates.checkin), 'MMM dd, yyyy')} - {format(new Date(dates.checkout), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Secondary Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Power Adapters */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mr-2">
                  <Plug className="w-4 h-4 text-white" />
                </div>
                Power
                <Zap className="w-3 h-3 ml-auto text-yellow-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl cursor-pointer perspective-1000"
                onClick={handleAdapterClick}
              >
                <div 
                  className={`w-12 h-16 mx-auto mb-2 relative transition-all duration-1000 transform-gpu ${
                    isAdapterSpinning ? 'animate-spin rotate-y-180' : 'hover:rotate-y-12 hover:-translate-y-2'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 50%, #9ca3af 100%)',
                    boxShadow: `
                      0 15px 20px -5px rgba(0, 0, 0, 0.1),
                      0 8px 8px -5px rgba(0, 0, 0, 0.04),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    borderRadius: '6px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-1 h-6 bg-gray-700 rounded-full shadow-md"></div>
                    <div className="w-1 h-6 bg-gray-700 rounded-full shadow-md mt-1"></div>
                  </div>
                </div>
                <div className="font-bold text-sm text-yellow-400">Type C & N</div>
                <div className="text-xs text-muted-foreground">220V • 60Hz</div>
              </div>
              <div className="text-xs space-y-1 mt-2">
                <p><span className="font-medium">Voltage:</span> 220V</p>
                <p><span className="font-medium">Frequency:</span> 60Hz</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Info */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                Emergency
                <Shield className="w-3 h-3 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700 text-sm">{mockData.emergency.police}</div>
                  <div className="text-xs text-muted-foreground">Police</div>
                </div>
                <div className="text-center p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="font-bold text-red-700 text-sm">{mockData.emergency.medical}</div>
                  <div className="text-xs text-muted-foreground">Medical</div>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">US Consulate:</span> +55 11 5186-7000</p>
                <p><span className="font-medium">Tourist Police:</span> +55 11 3120-4417</p>
              </div>
            </CardContent>
          </Card>

          {/* Connectivity */}
          <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-semibold">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-2">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                Connectivity
                <Wifi className="w-3 h-3 ml-auto text-teal-400 group-hover:scale-110 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <h4 className="font-medium text-cyan-700 mb-1 text-sm">Free Wi-Fi Spots</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Shopping malls</li>
                  <li>• Starbucks, McDonald's</li>
                  <li>• Metro stations (WiFi Livre SP)</li>
                </ul>
              </div>
              <div className="text-xs">
                <p className="font-medium mb-1">ATM Locations:</p>
                <p className="text-muted-foreground">Banco do Brasil, Bradesco, Itaú branches. International cards accepted.</p>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for future widget */}
          <div className="hidden xl:block"></div>
        </div>

        {/* Row 4: Map - Full Width */}
        <div className="mb-6">
          <SaoPauloAccommodationMap />
        </div>

        {/* Row 5: Intelligence Dashboard - Full Width */}
        <Card className="travis-card bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                <Palette className="w-4 h-4 text-white" />
              </div>
              Intelligence Dashboard
              <Users className="w-4 h-4 ml-auto text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Configure your travel intelligence dashboard:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {widgetOptions.map((widget) => {
                const Icon = widget.icon;
                const isSelected = selectedWidgets.includes(widget.id);
                return (
                  <button
                    key={widget.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedWidgets(selectedWidgets.filter(id => id !== widget.id));
                      } else {
                        setSelectedWidgets([...selectedWidgets, widget.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all duration-300 travis-interactive ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                        : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50 hover:border-border'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs font-medium">{widget.name}</div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-purple-300 font-medium text-sm">
                {selectedWidgets.length} modules selected for your travel intelligence dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Insights Section - Optimized */}
        <Card className="travis-card bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2">
                <Globe className="w-4 h-4 text-white" />
              </div>
              Cultural Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Language */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Globe className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-blue-700">Language</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-xs"><span className="font-medium">Primary:</span> {mockData.culture.language.primary}</p>
                  <p className="text-xs"><span className="font-medium">Secondary:</span> {mockData.culture.language.secondary}</p>
                </div>
              </div>

              {/* Religion */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <Church className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-purple-700">Religion</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-xs"><span className="font-medium">Primary:</span> {mockData.culture.religion.primary}</p>
                  <p className="text-xs"><span className="font-medium">Other:</span> {mockData.culture.religion.secondary}</p>
                </div>
              </div>

              {/* Cultural Etiquette */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-green-700">Etiquette</h3>
                </div>
                <div className="space-y-1">
                  {mockData.culture.etiquette.slice(0, 3).map((rule, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">• {rule}</p>
                  ))}
                </div>
              </div>

              {/* Local Customs */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Utensils className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-orange-700">Customs</h3>
                </div>
                <div className="space-y-1">
                  {mockData.culture.customs.slice(0, 3).map((custom, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">• {custom}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Travis Chatbot */}
      <TravisChatbot />
    </div>
  );
};

export default ResultsPage;
