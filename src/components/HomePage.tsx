
import React, { useState } from 'react';
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
  const [currentLanguage, setCurrentLanguage] = useState('English');

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
      subtitle: "Data-driven insights for the modern explorer",
      searchPlaceholder: "Tokyo, Japan",
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
      subtitle: "为现代探险家提供数据驱动的洞察",
      searchPlaceholder: "东京，日本",
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
      subtitle: "モダンな探検家のためのデータ主導の洞察",
      searchPlaceholder: "東京、日本",
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
      subtitle: "Perspectivas basadas en datos para el explorador moderno",
      searchPlaceholder: "Tokio, Japón",
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
      subtitle: "Des perspectives basées sur les données pour l'explorateur moderne",
      searchPlaceholder: "Tokyo, Japon",
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
      subtitle: "Approfondimenti basati sui dati per l'esploratore moderno",
      searchPlaceholder: "Tokyo, Giappone",
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
      subtitle: "Ukuqonda okusekelwe kwidatha kumahlakani anamhlanje",
      searchPlaceholder: "Tokyo, Japan",
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
      subtitle: "Data-gedrewe insigte vir die moderne verkenner",
      searchPlaceholder: "Tokio, Japan",
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

  const getCurrentLanguageCode = () => {
    const lang = languages.find(l => l.name === currentLanguage);
    return lang ? lang.code : 'en';
  };

  const t = translations[getCurrentLanguageCode() as keyof typeof translations] || translations.en;

  // Mock destination suggestions - Japan focused
  const suggestions = [
    'Tokyo, Japan',
    'Osaka, Japan', 
    'Kyoto, Japan',
    'Nagoya, Japan',
    'Yokohama, Japan',
    'Hiroshima, Japan',
    'Sapporo, Japan',
    'Fukuoka, Japan',
    'Sendai, Japan',
    'Nara, Japan'
  ].filter(city => 
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground tracking-tight">TRAVIS</div>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.name)}
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
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-cover bg-center rounded-full" style={{
                    backgroundImage: 'url(/lovable-uploads/8f269d2a-c465-411e-a4cd-d27f4f88afc0.png)'
                  }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-cover bg-center rounded-full" style={{
                    backgroundImage: 'url(/lovable-uploads/8f269d2a-c465-411e-a4cd-d27f4f88afc0.png)'
                  }} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{t.profileName}</h3>
                      <span className="text-lg">🇺🇸</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.profileEmail}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.preferredAirline}</span>
                    <span className="text-sm font-medium text-foreground">Delta Airlines</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.travelType}</span>
                    <span className="text-sm font-medium text-foreground">Luxury</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.frequentFlyer}</span>
                    <span className="text-sm font-medium text-foreground">DL89472156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.nationality}</span>
                    <span className="text-sm font-medium text-foreground">United States</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.status}</span>
                    <span className="text-sm font-medium text-emerald-400">Premium Member</span>
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
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-4 tracking-tighter">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-light">
              {t.subtitle}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
          </div>

          {/* Google-style Search Form */}
          <form onSubmit={handleSearch} className="mb-32 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-2xl travis-glow">
              <div className="flex items-center gap-2">
                {/* Destination Input */}
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors z-10" />
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
                    className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full"
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
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
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
                
                {/* Date Inputs */}
                <div className="flex gap-1">
                  <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                      >
                        {checkinDate ? format(checkinDate, 'MMM dd') : t.depart}
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
                        className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
                      >
                        {checkoutDate ? format(checkoutDate, 'MMM dd') : t.return}
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

                {/* Search Button */}
                <Button
                  type="submit"
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-r-full border-l border-border/30"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {t.search}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/30">
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
