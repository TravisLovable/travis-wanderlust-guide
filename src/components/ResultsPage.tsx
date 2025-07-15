import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Plane, Clock, DollarSign, Shield, Thermometer, Car, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import SaoPauloAccommodationMap from './SaoPauloAccommodationMap';
import UserProfileDropdown from './UserProfileDropdown';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Holiday {
  name: string;
  date: string;
  countryCode: string;
}

interface AirportData {
  name: string;
  iata_code: string;
  city: string;
  country: string;
}

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }, skipTransition: boolean) => void;
}

const fetchExchangeRate = async (destination: string) => {
  try {
    const response = await fetch(`/api/exchange-rate?destination=${destination}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch exchange rate:", error);
    return null;
  }
};

const fetchAirportData = async (destination: string) => {
  try {
    const response = await fetch(`/api/airport?destination=${destination}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch airport data:", error);
    return null;
  }
};

const fetchHolidays = async (destination: string) => {
  try {
    const response = await fetch(`/api/holidays?destination=${destination}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch holidays:", error);
    return [];
  }
};

const ResultsPage: React.FC<ResultsPageProps> = ({
  destination,
  dates,
  onBack,
  onNewSearch
}) => {
  const [yourTime, setYourTime] = useState(new Date().toLocaleTimeString());
  const [destinationTime, setDestinationTime] = useState('');
  const [timeDifference, setTimeDifference] = useState('');
  const [exchangeRate, setExchangeRate] = useState('N/A');
  const [convertedAmount, setConvertedAmount] = useState('N/A');
  const [lastUpdated, setLastUpdated] = useState('N/A');
  const [airportData, setAirportData] = useState<AirportData | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setYourTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const calculateDestinationTime = async () => {
      try {
        const response = await fetch(`/api/timezone?destination=${destination}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.destinationTime) {
          setDestinationTime(data.destinationTime);
          setTimeDifference(data.timeDifference);
        } else {
          setDestinationTime('N/A');
          setTimeDifference('N/A');
          toast({
            title: "Error",
            description: `Could not fetch timezone for ${destination}.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Could not fetch timezone:", error);
        setDestinationTime('N/A');
        setTimeDifference('N/A');
        toast({
          title: "Error",
          description: `Failed to fetch timezone for ${destination}.`,
          variant: "destructive",
        });
      }
    };

    calculateDestinationTime();
  }, [destination, toast]);

  useEffect(() => {
    const loadExchangeRate = async () => {
      const exchangeData = await fetchExchangeRate(destination);
      if (exchangeData) {
        setExchangeRate(exchangeData.exchangeRate);
        setConvertedAmount(exchangeData.convertedAmount);
        setLastUpdated(exchangeData.lastUpdated);
      } else {
        toast({
          title: "Error",
          description: `Could not fetch exchange rates for ${destination}.`,
          variant: "destructive",
        });
      }
    };

    loadExchangeRate();
  }, [destination, toast]);

  useEffect(() => {
    const loadAirportData = async () => {
      const data = await fetchAirportData(destination);
      if (data) {
        setAirportData(data);
      } else {
        toast({
          title: "Error",
          description: `Could not fetch airport data for ${destination}.`,
          variant: "destructive",
        });
      }
    };

    loadAirportData();
  }, [destination, toast]);

  useEffect(() => {
    const loadHolidays = async () => {
      const holidaysData = await fetchHolidays(destination);
      if (holidaysData && holidaysData.length > 0) {
        setHolidays(holidaysData);
      } else {
        toast({
          title: "Info",
          description: `No upcoming holidays found for ${destination}.`,
        });
        setHolidays([]);
      }
    };

    loadHolidays();
  }, [destination, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-400/10 to-transparent rounded-full blur-3xl"></div>

      {/* Header with Controls */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/30 backdrop-blur-sm relative z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2 bg-white/10 border border-border/30 backdrop-blur-sm hover:bg-white/20 text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{destination}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{dates.checkin} - {dates.checkout}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>1 {t.traveler}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh')}
                className="px-3 py-2 text-sm bg-white/10 border border-border/30 rounded-lg backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
                <option value="it">🇮🇹 IT</option>
                <option value="pt">🇵🇹 PT</option>
                <option value="ru">🇷🇺 RU</option>
                <option value="ja">🇯🇵 JP</option>
                <option value="ko">🇰🇷 KR</option>
                <option value="zh">🇨🇳 ZH</option>
              </select>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="bg-white/10 border border-border/30 backdrop-blur-sm hover:bg-white/20 text-foreground"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>

              {/* User Profile Dropdown */}
              <UserProfileDropdown user={user} userProfile={null} />
            </>
          ) : (
            <>
              {/* Language Selector for non-authenticated users */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh')}
                className="px-3 py-2 text-sm bg-white/10 border border-border/30 rounded-lg backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
                <option value="it">🇮🇹 IT</option>
                <option value="pt">🇵🇹 PT</option>
                <option value="ru">🇷🇺 RU</option>
                <option value="ja">🇯🇵 JP</option>
                <option value="ko">🇰🇷 KR</option>
                <option value="zh">🇨🇳 ZH</option>
              </select>

              {/* Theme Toggle for non-authenticated users */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="bg-white/10 border border-border/30 backdrop-blur-sm hover:bg-white/20 text-foreground"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content - increased padding for better spacing */}
      <div className="px-12 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Information Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Time Zone Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-foreground">{t.timeZone}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.yourTime}</span>
                    <span className="font-mono text-foreground">{yourTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{destination}</span>
                    <span className="font-mono text-foreground">{destinationTime}</span>
                  </div>
                  {timeDifference && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      🕐 {timeDifference}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Currency Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-foreground">{t.currency}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">1 USD</span>
                    <span className="font-mono text-foreground">{exchangeRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">100</span>
                    <span className="font-mono text-green-600 dark:text-green-400">
                      ≈ {convertedAmount}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {t.liveRate} • {lastUpdated}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Airport Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-foreground">{t.airport}</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {airportData?.iata_code || 'N/A'}
                    </Badge>
                    <div className="text-sm font-medium text-foreground">
                      {airportData?.name || t.primaryAirport}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {airportData?.city}, {airportData?.country}
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.distance}:</span>
                      <span className="text-foreground">{t.variable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.travelTime}:</span>
                      <span className="text-foreground">{t.variable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.options}:</span>
                      <span className="text-foreground">{t.multipleOptions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visa & Entry Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="font-semibold text-foreground">{t.visaEntry}</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {t.visaFreeEntry}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.forUSPassport}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.maxStay}:</span>
                      <span className="text-foreground">90 {t.days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.passportValidity}:</span>
                      <span className="text-foreground">6 {t.monthsMin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.yellowFever}:</span>
                      <span className="text-foreground">{t.vaccinationRecommended}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 text-xs bg-white/5 border-border/50 hover:bg-white/10"
                  >
                    {t.viewRequirements}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row of Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Weather Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-foreground">{t.weatherIntel}</h3>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">°C ↔ °F</div>
                </div>
                <WeatherWidget destination={destination} currentLocation="Current Location" tempUnit="C" onTempUnitToggle={() => {}} />
              </CardContent>
            </Card>

            {/* Transport Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-foreground">{t.transport}</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <div className="text-lg">🚗</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.rental}</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                      <div className="text-lg">🚌</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.public}</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                      <div className="text-lg">🚕</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.taxi}</div>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.avgCarRental}:</span>
                      <span className="text-foreground">$45/{t.day}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.gasPrice}:</span>
                      <span className="text-foreground">$1.20/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.publicTransport}:</span>
                      <span className="text-foreground">$2.50</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Holidays Widget */}
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-foreground">{t.holidays}</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {holidays.length > 0 ? (
                    <div className="space-y-2">
                      {holidays.slice(0, 3).map((holiday, index) => (
                        <div key={index} className="p-2 bg-white/5 rounded-lg">
                          <div className="text-sm font-medium text-foreground">
                            {holiday.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(holiday.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      {t.noUpcomingHolidays}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accommodation Map Section */}
          <div className="mb-8">
            <Card className="bg-white/10 border border-border/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{t.accommodationMap}</span>
                </h3>
                {destination.toLowerCase().includes('são paulo') || destination.toLowerCase().includes('sao paulo') ? (
                  <SaoPauloAccommodationMap />
                ) : (
                  <AccommodationHeatMap destination={destination} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
