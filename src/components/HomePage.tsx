import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Calendar, MapPin, User, Sun, Moon, Globe, Sparkles, Plane, Heart } from 'lucide-react';
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
import { usePinnedLocations } from '@/hooks/usePinnedLocations';
import OnboardingModal from './OnboardingModal';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import SettingsModal from './SettingsModal';
import InspirationModal from './InspirationModal';
import { useToast } from '@/hooks/use-toast';


interface HomePageProps {
  onSearch: (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  currentLanguage?: string;
  setCurrentLanguage?: (language: string) => void;
}

const HomePage = ({
  onSearch,
  isDarkMode: propIsDarkMode,
  toggleTheme: propToggleTheme,
  currentLanguage: propCurrentLanguage,
  setCurrentLanguage: propSetCurrentLanguage
}: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(propIsDarkMode ?? true);
  const [currentLanguage, setCurrentLanguage] = useState(propCurrentLanguage ?? 'en');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Authentication state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const [isSearchDisabled, setIsSearchDisabled] = useState(true);

  // Pinned locations hook
  const { pinnedLocations, toSelectedPlace } = usePinnedLocations();

  // Refs for focus management
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const checkinButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (destination && checkinDate && checkoutDate) {
      setIsSearchDisabled(false);
    } else {
      setIsSearchDisabled(true);
    }
  }, [destination, checkinDate, checkoutDate]);

  // Auto-focus destination input on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      destinationInputRef.current?.focus();
    }, 500); // Small delay to allow page to settle

    return () => clearTimeout(timer);
  }, []);


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

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Trigger confetti on successful search
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };









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

  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('dark');
    }
  };

  const handleLanguageChange = (language: string) => {
    if (propSetCurrentLanguage) {
      propSetCurrentLanguage(language);
    } else {
      setCurrentLanguage(language);
    }
  };

  // Focus management functions
  const focusNextInput = () => {
    if (!destination) {
      destinationInputRef.current?.focus();
    } else if (!checkinDate) {
      checkinButtonRef.current?.click();
    } else if (!checkoutDate) {
      checkoutButtonRef.current?.click();
    } else {
      searchButtonRef.current?.focus();
    }
  };

  const handleDestinationComplete = () => {
    if (destination.trim()) {
      // Small delay to allow state to update
      setTimeout(() => {
        checkinButtonRef.current?.click();
      }, 100);
    }
  };

  const handleCheckinComplete = (date: Date) => {
    setCheckinDate(date);
    setCheckinOpen(false);
    // Small delay to allow popover to close
    setTimeout(() => {
      checkoutButtonRef.current?.click();
    }, 150);
  };

  const handleCheckoutComplete = (date: Date) => {
    setCheckoutDate(date);
    setCheckoutOpen(false);
    // Focus search button after selecting checkout date
    setTimeout(() => {
      searchButtonRef.current?.focus();
    }, 150);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      triggerConfetti();
      // If we have a selectedPlace from Mapbox, use it. Otherwise, create a basic place object
      const placeToUse = selectedPlace || {
        name: destination,
        formatted_address: destination,
        latitude: 0,
        longitude: 0,
        place_id: `manual_${Date.now()}`
      };

      setTimeout(() => {
        onSearch(placeToUse, {
          checkin: format(checkinDate, 'yyyy-MM-dd'),
          checkout: format(checkoutDate, 'yyyy-MM-dd')
        });
      }, 800);
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
      e.preventDefault();
      if (destination && checkinDate && checkoutDate) {
        handleSearch();
      } else {
        focusNextInput();
      }
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
    if (suggestion.id && suggestion.place_name) {
      // Mapbox suggestion
      const placeDetails = await getPlaceDetails(suggestion);
      if (placeDetails) {
        setDestination(placeDetails.formatted_address);
        setSelectedPlace(placeDetails);
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

    // Trigger autofocus to next input after destination is selected
    handleDestinationComplete();
  };

  const handlePinnedLocationSelect = (locationId: string) => {
    const location = pinnedLocations.find(p => p.id === locationId);
    if (location) {
      const selectedPlace = toSelectedPlace(location);
      setDestination(selectedPlace.formatted_address);
      setSelectedPlace(selectedPlace);
      // Trigger autofocus to next input after destination is selected
      handleDestinationComplete();
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Enhanced Ambient Background Animation */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern animate-drift-slow"></div>
        {[...Array(25)].map((_, i) => (
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
        {/* Floating travel icons */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`icon-${i}`}
            className="absolute text-white/5 floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          >
            {i % 3 === 0 ? <Plane className="w-6 h-6 rotate-45" /> :
              i % 3 === 1 ? <Globe className="w-5 h-5" /> :
                <MapPin className="w-4 h-4" />}
          </div>
        ))}
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 1}s`
              }}
            />
          ))}
        </div>
      )}

      <main className="flex-1 flex items-center justify-center px-3 py-6 relative z-10">
        <div className="max-w-6xl w-full text-center">
          {/* Enhanced Hero Section with Playful Elements */}
          <div className="mb-10 animate-slide-in-up">
            <div className="relative">
              <h1 className="text-7xl md:text-8xl font-light text-foreground mb-4 tracking-tighter dark:text-glow dark:drop-shadow-2xl relative">
                {t.title}
                {/* Floating sparkles around title */}
                <Sparkles className="absolute -top-4 -right-8 w-6 h-6 text-blue-400 animate-sparkle" style={{ animationDelay: '0s' }} />
                <Sparkles className="absolute -bottom-2 -left-6 w-4 h-4 text-purple-400 animate-sparkle" style={{ animationDelay: '0.7s' }} />
                <Sparkles className="absolute top-1/2 -right-12 w-5 h-5 text-cyan-400 animate-sparkle" style={{ animationDelay: '1.4s' }} />
              </h1>
            </div>
            <div className="mb-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl text-muted-foreground font-light dark:text-glow-subtle leading-relaxed">
                <span>Data-driven Intelligence for the modern </span>
                <span
                  key={wordIndex}
                  className="inline-block animate-fadeIn min-w-[120px] text-left gradient-text font-medium"
                >
                  {swapWords[wordIndex]}
                </span>
                <Heart className="inline-block w-5 h-5 ml-2 text-red-400 animate-heart-beat" />
              </p>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8 animate-shimmer hover:animate-glow-pulse transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.4s' }}></div>
          </div>

          <div className="mb-8 max-w-5xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <div
              className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-2xl travis-glow-white hover:shadow-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer group interactive-scale"
              onClick={handleBarClick}
              onKeyDown={handleKeyPress}
              tabIndex={0}
              role="button"
              aria-label="Launch brief"
              onMouseEnter={() => {
                const element = document.querySelector('.search-bar-main') as HTMLElement;
                if (element) element.classList.add('animate-glow-pulse');
              }}
              onMouseLeave={() => {
                const element = document.querySelector('.search-bar-main') as HTMLElement;
                if (element) element.classList.remove('animate-glow-pulse');
              }}
            >
              <div className="flex items-center gap-2 search-bar-main">
                {/* Destination Input */}
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-white transition-all duration-300 z-10 group-hover:animate-bounce-gentle" />
                  <Input
                    ref={destinationInputRef}
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setSelectedPlace(null);
                      setShowSuggestions(true);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && destination.trim()) {
                        e.preventDefault();
                        setShowSuggestions(false);
                        handleDestinationComplete();
                      } else {
                        handleKeyPress(e);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 h-12 bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground/60 placeholder:font-light rounded-l-full cursor-pointer"
                    required
                  />
                  {showSuggestions && (suggestions.length > 0 || fallbackSuggestions.length > 0) && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                      {!hasApiAccess && destination.length >= 2 && (
                        <div className="p-2 text-xs text-yellow-500 bg-yellow-500/10 rounded-t-xl border-b border-border/30">
                          ⚠️ Using offline search. Connect Mapbox API for better results.
                        </div>
                      )}
                      {isLoadingSuggestions && hasApiAccess && (
                        <div className="p-4 text-center text-muted-foreground">
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
                          className="w-full text-left px-4 py-3 suggestion-hover transition-colors first:rounded-t-xl last:rounded-b-xl"
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
                      {/* Fallback static suggestions */}
                      {fallbackSuggestions.slice(0, 8).map((suggestion, index) => (
                        <button
                          key={`static-${index}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDestinationSelect(suggestion);
                          }}
                          className="w-full text-left px-4 py-3 suggestion-hover transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {suggestion}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Inputs with Calendar Icons */}
                <div className="flex gap-1">
                  <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        ref={checkinButtonRef}
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[100px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{checkinDate ? format(checkinDate, 'MMM dd') : 'Depart'}</span>
                        <Calendar className="w-4 h-4 text-white/70 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-card border-border fixed" align="start" side="bottom" sideOffset={8}>
                      <CalendarComponent
                        mode="single"
                        selected={checkinDate}
                        onSelect={(date) => {
                          if (date) handleCheckinComplete(date);
                        }}
                        initialFocus
                        className="pointer-events-auto w-full"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        ref={checkoutButtonRef}
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[100px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{checkoutDate ? format(checkoutDate, 'MMM dd') : 'Return'}</span>
                        <Calendar className="w-4 h-4 text-white/70 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-card border-border fixed" align="start" side="bottom" sideOffset={8}>
                      <CalendarComponent
                        mode="single"
                        selected={checkoutDate}
                        onSelect={(date) => {
                          if (date) handleCheckoutComplete(date);
                        }}
                        initialFocus
                        className="pointer-events-auto w-full"
                        disabled={(date) => date < (checkinDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Right Arrow Icon with Enhanced Playfulness */}
                <button
                  ref={searchButtonRef}
                  className="h-12 px-6 flex items-center justify-center text-white/60 group-hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:animate-wiggle focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded"
                  disabled={isSearchDisabled}
                  onClick={handleSearch}
                  onKeyPress={handleKeyPress}
                  onMouseEnter={(e) => {
                    if (!isSearchDisabled) {
                      e.currentTarget.classList.add('animate-wiggle');
                    }
                  }}
                  onAnimationEnd={(e) => {
                    e.currentTarget.classList.remove('animate-wiggle');
                  }}
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
                  {!isSearchDisabled && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-3 h-3 text-blue-400 animate-sparkle" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Pinned Locations Section */}
          {pinnedLocations.length > 0 && (
            <div className="text-center animate-slide-in-up mb-6" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Pin className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-muted-foreground font-medium">Your Pinned Locations</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {pinnedLocations.slice(0, 6).map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handlePinnedLocationSelect(location.id)}
                    className="group flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full text-sm text-white transition-all duration-300 interactive-scale"
                  >
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span className="truncate max-w-[150px]">{location.name}</span>
                  </button>
                ))}
                {pinnedLocations.length > 6 && (
                  <span className="text-xs text-muted-foreground/60 px-3 py-2">
                    +{pinnedLocations.length - 6} more in header
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Inspirational Link */}
          <div className="text-center animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
            <button
              onClick={() => setIsInspirationModalOpen(true)}
              className="text-sm text-muted-foreground/80 hover:text-white transition-all duration-300 underline-offset-4 hover:underline group flex items-center justify-center space-x-2 mx-auto interactive-scale"
            >
              <Sparkles className="w-4 h-4 group-hover:animate-sparkle" />
              <span>Not sure where to go? Get inspired.</span>
              <Sparkles className="w-4 h-4 group-hover:animate-sparkle" style={{ animationDelay: '0.5s' }} />
            </button>
          </div>
        </div>
      </main>





      {/* Footer with reduced padding */}
      <footer className="px-3 py-4 border-t border-border/30 relative z-10">
        <div className="max-w-none mx-auto flex justify-between items-center">
          <div></div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              {t.privacy}
            </button>
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              {t.terms}
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              {t.settings}
            </button>
          </div>
        </div>
      </footer>


      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        user={user}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentLanguage={currentLanguage}
        setCurrentLanguage={handleLanguageChange}
      />

      <InspirationModal
        isOpen={isInspirationModalOpen}
        onClose={() => setIsInspirationModalOpen(false)}
        onDestinationSelect={(destination) => {
          setDestination(destination);
          setSelectedPlace(null);
        }}
      />
    </div>
  );
};

export default HomePage;