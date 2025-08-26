import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, MapPin, User, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useMapboxGeocoding, SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import OnboardingModal from './OnboardingModal';
import { useToast } from '@/hooks/use-toast';


interface HomePageProps {
  onSearch: (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [wordIndex, setWordIndex] = useState(0);

  // Authentication state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const [isSearchDisabled, setIsSearchDisabled] = useState(true);
  useEffect(() => {
    if (destination && checkinDate && checkoutDate) {
      setIsSearchDisabled(false);
    } else {
      setIsSearchDisabled(true);
    }
  }, [destination, checkinDate, checkoutDate]);


  // Use Mapbox for destination suggestions
  const { suggestions: mapboxSuggestions, isLoading: isLoadingSuggestions, hasApiAccess, getPlaceDetails } = useMapboxGeocoding(
    destination,
    showSuggestions && destination.length >= 2
  );

  // Word swap animation - only the last word
  const swapWords = ["explorer", "nomad", "analyst", "visionary"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % swapWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);









  // Language translations
  const translations = {
    en: {
      title: "The World Awaits",
      subtitle: "Data-driven Intelligence for the modern explorer",
      searchPlaceholder: "Where to?",
      depart: "Depart",
      return: "Return",
      search: "Search",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Preferred Airline",
      travelType: "Travel Type",
      frequentFlyer: "Frequent Flyer #",
      nationality: "Nationality",
      status: "Status",
      profileSettings: "Profile Settings",
      savedDestinations: "Saved Destinations",
      travelPreferences: "Travel Preferences",
      signOut: "Sign Out",
      privacy: "Privacy",
      terms: "Terms",
      settings: "Settings"
    },
    zh: {
      title: "世界在等待",
      subtitle: "为现代探险家提供数据驱动的智能",
      searchPlaceholder: "去哪里？",
      depart: "出发",
      return: "返回",
      search: "搜索",
      profileName: "克里斯·厄普彻奇",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "首选航空公司",
      travelType: "旅行类型",
      frequentFlyer: "常旅客号码",
      nationality: "国籍",
      status: "状态",
      profileSettings: "个人资料设置",
      savedDestinations: "保存的目的地",
      travelPreferences: "旅行偏好",
      signOut: "登出",
      privacy: "隐私",
      terms: "条款",
      settings: "设置"
    },
    ja: {
      title: "世界があなたを待っています",
      subtitle: "モダンな探検家のためのデータ主導のインテリジェンス",
      searchPlaceholder: "どこへ？",
      depart: "出発",
      return: "帰国",
      search: "検索",
      profileName: "クリス・アップチャーチ",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "優先航空会社",
      travelType: "旅行タイプ",
      frequentFlyer: "フリークエントフライヤー番号",
      nationality: "国籍",
      status: "ステータス",
      profileSettings: "プロフィール設定",
      savedDestinations: "保存された目的地",
      travelPreferences: "旅行の好み",
      signOut: "サインアウト",
      privacy: "利用規約",
      terms: "利用規約",
      settings: "設定"
    },
    es: {
      title: "El Mundo Te Espera",
      subtitle: "Inteligencia basada en datos para el explorador moderno",
      searchPlaceholder: "¿A dónde?",
      depart: "Salida",
      return: "Regreso",
      search: "Buscar",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Aerolínea Preferida",
      travelType: "Tipo de Viaje",
      frequentFlyer: "Viajero Frecuente #",
      nationality: "Nacionalidad",
      status: "Estado",
      profileSettings: "Configuración del Perfil",
      savedDestinations: "Destinos Guardados",
      travelPreferences: "Preferencias de Viaje",
      signOut: "Cerrar Sesión",
      privacy: "Privacidad",
      terms: "Términos",
      settings: "Configuración"
    },
    fr: {
      title: "Le Monde Vous Attend",
      subtitle: "Intelligence basée sur les données pour l'explorateur moderne",
      searchPlaceholder: "Où aller ?",
      depart: "Départ",
      return: "Retour",
      search: "Rechercher",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Compagnie Aérienne Préférée",
      travelType: "Type de Voyage",
      frequentFlyer: "Voyageur Fréquent #",
      nationality: "Nationalité",
      status: "Statut",
      profileSettings: "Paramètres du Profil",
      savedDestinations: "Destinations Sauvegardées",
      travelPreferences: "Préférences de Voyage",
      signOut: "Se Déconnecter",
      privacy: "Confidentialité",
      terms: "Conditions",
      settings: "Paramètres"
    },
    it: {
      title: "Il Mondo Ti Aspetta",
      subtitle: "Intelligenza basata sui dati per l'esploratore moderno",
      searchPlaceholder: "Dove andare?",
      depart: "Partenza",
      return: "Ritorno",
      search: "Cerca",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Compagnia Aerea Preferita",
      travelType: "Tipo di Viaggio",
      frequentFlyer: "Frequent Flyer #",
      nationality: "Nazionalità",
      status: "Stato",
      profileSettings: "Impostazioni Profilo",
      savedDestinations: "Destinazioni Salvate",
      travelPreferences: "Preferenze di Viaggio",
      signOut: "Disconnetti",
      privacy: "Privacy",
      terms: "Termini",
      settings: "Impostazioni"
    },
    xh: {
      title: "Ihlabathi Lilindile",
      subtitle: "Ubukrelekrele obusekelwe kwidatha kumahlakani anamhlanje",
      searchPlaceholder: "Uya phi?",
      depart: "Ukuhamba",
      return: "Ukubuya",
      search: "Khangela",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Inqwelomoya Ekhethwayo",
      travelType: "Uhlobo Lokuhamba",
      frequentFlyer: "Umhambi Rhoqo #",
      nationality: "Ubuzwe",
      status: "Isimo",
      profileSettings: "Iisetingi Zeprofayili",
      savedDestinations: "Iindawo Ezigciniweyo",
      travelPreferences: "Izinto Zokukhetha Ukuhamba",
      signOut: "Phuma",
      privacy: "Ubumfihlo",
      terms: "Imiqathango",
      settings: "Iisetingi"
    },
    af: {
      title: "Die Wêreld Wag",
      subtitle: "Data-gedrewe intelligensie vir die moderne verkenner",
      searchPlaceholder: "Waarheen?",
      depart: "Vertrek",
      return: "Terugkeer",
      search: "Soek",
      profileName: "Chris Upchurch",
      profileEmail: "chris.upchurch@email.com",
      preferredAirline: "Voorkeur Lugredery",
      travelType: "Reis Tipe",
      frequentFlyer: "Gereelde Vlieër #",
      nationality: "Nasionaliteit",
      status: "Status",
      profileSettings: "Profiel Instellings",
      savedDestinations: "Gestoorde Bestemmings",
      travelPreferences: "Reis Voorkeure",
      signOut: "Teken Uit",
      privacy: "Privaatheid",
      terms: "Voorwaardes",
      settings: "Instellings"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  // Comprehensive global destination suggestions (fallback when Google Places is not available)
  const globalDestinations = [
    // Brazil
    'São Paulo, Brazil',
    'Rio de Janeiro, Brazil',
    'Brasília, Brazil',
    'Salvador, Brazil',
    'Fortaleza, Brazil',
    'Belo Horizonte, Brazil',
    'Manaus, Brazil',
    'Curitiba, Brazil',
    'Recife, Brazil',
    'Porto Alegre, Brazil',
    // Major Global Cities
    'New York, USA',
    'Los Angeles, USA',
    'Chicago, USA',
    'Miami, USA',
    'Las Vegas, USA',
    'San Francisco, USA',
    'London, UK',
    'Paris, France',
    'Rome, Italy',
    'Barcelona, Spain',
    'Madrid, Spain',
    'Berlin, Germany',
    'Munich, Germany',
    'Amsterdam, Netherlands',
    'Vienna, Austria',
    'Zurich, Switzerland',
    'Tokyo, Japan',
    'Osaka, Japan',
    'Kyoto, Japan',
    'Seoul, South Korea',
    'Beijing, China',
    'Shanghai, China',
    'Hong Kong',
    'Singapore',
    'Bangkok, Thailand',
    'Dubai, UAE',
    'Istanbul, Turkey',
    'Cairo, Egypt',
    'Cape Town, South Africa',
    'Johannesburg, South Africa',
    'Sydney, Australia',
    'Melbourne, Australia',
    'Auckland, New Zealand',
    'Vancouver, Canada',
    'Toronto, Canada',
    'Montreal, Canada',
    'Mexico City, Mexico',
    'Buenos Aires, Argentina',
    'Lima, Peru',
    'Santiago, Chile',
    'Bogotá, Colombia',
    'Caracas, Venezuela',
    'Mumbai, India',
    'Delhi, India',
    'Bangalore, India',
    'Jakarta, Indonesia',
    'Manila, Philippines',
    'Kuala Lumpur, Malaysia',
    'Ho Chi Minh City, Vietnam',
    'Hanoi, Vietnam',
    'Tel Aviv, Israel',
    'Moscow, Russia',
    'St. Petersburg, Russia',
    'Warsaw, Poland',
    'Prague, Czech Republic',
    'Budapest, Hungary',
    'Athens, Greece',
    'Lisbon, Portugal',
    'Stockholm, Sweden',
    'Oslo, Norway',
    'Copenhagen, Denmark',
    'Helsinki, Finland',
    'Reykjavik, Iceland'
  ];

  // Use Mapbox suggestions if available, otherwise fall back to static list
  const staticSuggestions = globalDestinations.filter(city =>
    city.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  );

  const suggestions = hasApiAccess && mapboxSuggestions.length > 0 ? mapboxSuggestions : [];
  const fallbackSuggestions = !hasApiAccess || mapboxSuggestions.length === 0 ? staticSuggestions : [];
  const { toast } = useToast();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      // If we have a selectedPlace from Mapbox, use it. Otherwise, create a basic place object
      const placeToUse = selectedPlace || {
        name: destination,
        formatted_address: destination,
        latitude: 0,
        longitude: 0,
        place_id: `manual_${Date.now()}`
      };
      
      onSearch(placeToUse, {
        checkin: format(checkinDate, 'yyyy-MM-dd'),
        checkout: format(checkoutDate, 'yyyy-MM-dd')
      });
    } else {
      toast({
        title: 'Please fill in all fields',
        description: 'Location and Departure Date are required',
        variant: 'destructive',
        className: 'bg-black text-white'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBarClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    handleSearch();
  };



  const handleDestinationSelect = async (suggestion: any) => {
    // Handle both Mapbox suggestions and static suggestions
    if (suggestion.id && suggestion.place_name) {
      // Mapbox suggestion
      const placeDetails = await getPlaceDetails(suggestion);
      if (placeDetails) {
        setDestination(placeDetails.formatted_address);
        setSelectedPlace(placeDetails);
        console.log('Selected place details:', placeDetails);
      } else {
        setDestination(suggestion.place_name);
        setSelectedPlace(null);
      }
    } else {
      // Static suggestion fallback
      setDestination(suggestion);
      setSelectedPlace(null);
    }
    setShowSuggestions(false);
  };


  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient Background Animation */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern animate-drift-slow"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header with reduced padding */}



      {/* Main Content with reduced padding */}
      <main className="flex-1 flex items-center justify-center px-3 py-6 relative z-10">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Section without glow animation */}
          <div className="mb-10">
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-4 tracking-tighter dark:text-glow dark:drop-shadow-2xl">
              {t.title}
            </h1>
            <div className="mb-6">
              <p className="text-xl text-muted-foreground font-light dark:text-glow-subtle leading-relaxed">
                <span>Data-driven Intelligence for the modern </span>
                <span
                  key={wordIndex}
                  className="inline-block animate-fadeIn min-w-[120px] text-left"
                >
                  {swapWords[wordIndex]}
                </span>
              </p>
            </div>
            {/* Animated gradient underline with hover shimmer */}
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8 animate-shimmer hover:animate-pulse transition-all duration-300"></div>
          </div>

          {/* Airbnb-Style Search Bar */}
          <div className="mb-8 max-w-5xl mx-auto">
            <div 
              className="bar bg-white shadow-lg rounded-full flex justify-center h-14"
              style={{ fontSize: '0.6rem' }}
              onClick={handleBarClick}
              onKeyDown={handleKeyPress}
              tabIndex={0}
              role="button"
              aria-label="Launch brief"
            >
              {/* Location Section */}
              <div className="location w-[34%] rounded-l-full px-6 py-4 transition-all duration-250 hover:bg-gray-100 relative">
                <div className="relative">
                  <p className="text-xs font-semibold text-gray-900 mb-1">Location</p>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setSelectedPlace(null);
                      setShowSuggestions(true);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full text-sm pt-1"
                    style={{ fontSize: '0.75rem' }}
                    required
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (suggestions.length > 0 || fallbackSuggestions.length > 0) && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                      {!hasApiAccess && destination.length >= 2 && (
                        <div className="p-2 text-xs text-yellow-500 bg-yellow-500/10 rounded-t-xl border-b border-gray-200">
                          ⚠️ Using offline search. Connect Mapbox API for better results.
                        </div>
                      )}
                      {isLoadingSuggestions && hasApiAccess && (
                        <div className="p-4 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                        </div>
                      )}
                      {/* Mapbox suggestions */}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`mapbox-${index}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDestinationSelect(suggestion);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {suggestion.text}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.place_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {/* Fallback static suggestions */}
                      {fallbackSuggestions.slice(0, 8).map((suggestion, index) => (
                        <button
                          key={`static-${index}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDestinationSelect(suggestion);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {suggestion}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Separator */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-200"></div>
              </div>

              {/* Check In Section */}
              <div className="check-in w-[22%] px-6 py-4 transition-all duration-250 hover:bg-gray-100 relative">
                <p className="text-xs font-semibold text-gray-900 mb-1">Check in</p>
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <input
                      type="text"
                      placeholder="Add dates"
                      value={checkinDate ? format(checkinDate, 'MMM dd') : ''}
                      readOnly
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full text-sm pt-1 cursor-pointer"
                      style={{ fontSize: '0.75rem' }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-white border-gray-200 fixed" align="start" side="bottom" sideOffset={8}>
                    <CalendarComponent
                      mode="single"
                      selected={checkinDate}
                      onSelect={(date) => {
                        if (date) setCheckinDate(date);
                        setCheckinOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto w-full"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Separator */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-200"></div>
              </div>

              {/* Check Out Section */}
              <div className="check-out w-[22%] px-6 py-4 transition-all duration-250 hover:bg-gray-100 relative">
                <p className="text-xs font-semibold text-gray-900 mb-1">Check out</p>
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <input
                      type="text"
                      placeholder="Add dates"
                      value={checkoutDate ? format(checkoutDate, 'MMM dd') : ''}
                      readOnly
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full text-sm pt-1 cursor-pointer"
                      style={{ fontSize: '0.75rem' }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-white border-gray-200 fixed" align="start" side="bottom" sideOffset={8}>
                    <CalendarComponent
                      mode="single"
                      selected={checkoutDate}
                      onSelect={(date) => {
                        if (date) setCheckoutDate(date);
                        setCheckoutOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto w-full"
                      disabled={(date) => date < (checkinDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Separator */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gray-200"></div>
              </div>

              {/* Search Section (replacing "Guests" from Airbnb) */}
              <div className="guests w-[22%] rounded-r-full px-6 py-4 transition-all duration-250 hover:bg-gray-100 relative">
                <p className="text-xs font-semibold text-gray-900 mb-1">Search</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm pt-1" style={{ fontSize: '0.75rem' }}>
                    Find destination
                  </span>
                  <span 
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-red-500 text-white text-sm p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                    onClick={handleSearch}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inspirational Link */}
          <div className="text-center">
            <button className="text-sm text-muted-foreground/80 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline">
              Not sure where to go? Get inspired.
            </button>
          </div>
        </div>
      </main>



      {/* <CountryTest /> */}

      {/* Footer with reduced padding */}
      <footer className="px-3 py-4 border-t border-border/30 relative z-10">
        <div className="max-w-none mx-auto flex justify-between items-center">
          <div></div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">{t.privacy}</button>
            <button className="hover:text-foreground transition-colors">{t.terms}</button>
            <button className="hover:text-foreground transition-colors">{t.settings}</button>
          </div>
        </div>
      </footer>


      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default HomePage;
