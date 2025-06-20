import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, User, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface HomePageProps {
  onSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  // Trigger fade-in animation on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Word swap animation - only the last word
  const swapWords = ["explorer", "nomad", "analyst", "visionary"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % swapWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' }
  ];

  // Language translations
  const translations = {
    en: {
      title: "The World Awaits",
      subtitle: "Data-driven Intelligence for the modern explorer",
      searchPlaceholder: "São Paulo, Brazil",
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
      searchPlaceholder: "圣保罗，巴西",
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
      searchPlaceholder: "サンパウロ、ブラジル",
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
      privacy: "プライバシー",
      terms: "利用規約",
      settings: "設定"
    },
    es: {
      title: "El Mundo Te Espera",
      subtitle: "Inteligencia basada en datos para el explorador moderno",
      searchPlaceholder: "São Paulo, Brasil",
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
      searchPlaceholder: "São Paulo, Brésil",
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
      searchPlaceholder: "São Paulo, Brasile",
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
      searchPlaceholder: "São Paulo, Brazil",
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
      searchPlaceholder: "São Paulo, Brasilië",
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

  // Comprehensive global destination suggestions
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

  const suggestions = globalDestinations.filter(city => 
    city.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      onSearch(destination, { 
        checkin: format(checkinDate, 'yyyy-MM-dd'), 
        checkout: format(checkoutDate, 'yyyy-MM-dd') 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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

      {/* Header */}
      <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground tracking-tight">TRAVIS</div>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-5 h-5" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-cover bg-center rounded-full object-cover" style={{
                    backgroundImage: 'url(/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png)',
                    backgroundPosition: 'center center'
                  }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border p-6 profile-dropdown-glow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-cover bg-center rounded-full object-cover" style={{
                    backgroundImage: 'url(/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png)',
                    backgroundPosition: 'center center'
                  }} />
                  <div>
                    <div className="flex flex-col space-y-1">
                      <h3 className="font-semibold text-foreground">Brittany J.</h3>
                      <span className="text-sm font-medium text-emerald-400">Premium Member</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preferred Airline</span>
                    <span className="text-sm font-semibold text-foreground">Delta Airlines</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Travel Type</span>
                    <span className="text-sm font-semibold text-foreground">Luxury</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Frequent Flyer #</span>
                    <span className="text-sm font-medium text-foreground">DL89472156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nationality</span>
                    <span className="text-sm font-medium text-foreground">American</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Country</span>
                    <span className="text-sm font-medium text-foreground">United States</span>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="my-4" />
                
                <DropdownMenuItem>{t.profileSettings}</DropdownMenuItem>
                <DropdownMenuItem>{t.savedDestinations}</DropdownMenuItem>
                <DropdownMenuItem>{t.travelPreferences}</DropdownMenuItem>
                <DropdownMenuItem>{t.signOut}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Section with fade-in animation */}
          <div className={`mb-10 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-4 tracking-tighter dark:text-glow dark:drop-shadow-2xl">
              {t.title}
            </h1>
            <div className={`mb-6 transition-all duration-1000 ease-out delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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

          {/* Google-style Search Form with fade-in animation */}
          <form onSubmit={handleSearch} className={`mb-8 max-w-5xl mx-auto transition-all duration-1000 ease-out delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-2xl travis-glow-white hover:dark:shadow-white/20 hover:dark:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center gap-2">
                {/* Destination Input */}
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-white transition-colors z-10" />
                  <Input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setDestination(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 suggestion-hover transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span>{suggestion}</span>
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
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[100px]"
                      >
                        <span>{checkinDate ? format(checkinDate, 'MMM dd') : 'Depart'}</span>
                        <Calendar className="w-4 h-4 text-white/70 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkinDate}
                        onSelect={(date) => {
                          if (date) setCheckinDate(date);
                          setCheckinOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[100px]"
                      >
                        <span>{checkoutDate ? format(checkoutDate, 'MMM dd') : 'Return'}</span>
                        <Calendar className="w-4 h-4 text-white/70 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={checkoutDate}
                        onSelect={(date) => {
                          if (date) setCheckoutDate(date);
                          setCheckoutOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < (checkinDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Launch Brief Button */}
                <Button
                  type="submit"
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-r-full border-l border-border/30 transition-all duration-300 font-medium flex items-center space-x-2 travis-intelligence-glow"
                >
                  <Search className="w-4 h-4" />
                  <span>Launch Brief</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Inspirational Link */}
          <div className="text-center">
            <button className="text-sm text-muted-foreground/80 hover:text-white transition-colors duration-300 underline-offset-4 hover:underline">
              Not sure where to go? Get inspired.
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/30 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div></div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">{t.privacy}</button>
            <button className="hover:text-foreground transition-colors">{t.terms}</button>
            <button className="hover:text-foreground transition-colors">{t.settings}</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
