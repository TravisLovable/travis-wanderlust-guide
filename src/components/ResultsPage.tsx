import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, User, Sun, Moon, Globe, MessageCircle, Phone, Mail, Clock, DollarSign, Plane, Building, Car, Utensils, Coffee, MapIcon, TrendingUp, Info, Star, Heart, Share, Bookmark, Filter, SortAsc, BarChart3, PieChart, Activity, CheckCircle, AlertCircle, Thermometer, Wind, Droplets, Eye, Zap, Sparkles, Users, Camera, Navigation, Compass, Target, Search, RefreshCw, Download, Upload, Edit, Settings, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Minus, X, Check, Bell, Shield, Lock, Unlock, Key, Home, Menu, MoreHorizontal, MoreVertical, Grid, List, Calendar as CalendarIcon, Clock as ClockIcon, Tag, Flag, Briefcase, GraduationCap, Music, Video, Image, FileText, Link, Copy, Cut, Paste, Save, Trash, Archive, Folder, FolderOpen, File, FilePlus, FileEdit, FileX, Database, Server, Cloud, Wifi, Bluetooth, Battery, Signal, Volume, VolumeX, Mic, MicOff, Camera as CameraIcon, Video as VideoIcon, Monitor, Smartphone, Tablet, Laptop, Desktop, Watch, Headphones, Speaker, Printer, Scanner, Keyboard, Mouse, Gamepad2, Joystick, Cpu, HardDrive, MemoryStick, Usb, Plug, Power, PowerOff, RotateCcw, RotateCw, Repeat, Shuffle, SkipBack, SkipForward, Play, Pause, Stop, FastForward, Rewind, VolumeUp, VolumeDown, Volume1, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import TravisChatbot from './TravisChatbot';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [newDestination, setNewDestination] = useState(destination);
  const [checkinDate, setCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  const translations = {
    en: {
      back: "Back",
      search: "Search",
      profileSettings: "Profile Settings",
      savedDestinations: "Saved Destinations",
      travelPreferences: "Travel Preferences",
      signOut: "Sign Out",
      privacy: "Privacy",
      terms: "Terms",
      settings: "Settings",
      signIn: "Sign In / Create Account"
    },
    zh: {
      back: "返回",
      search: "搜索",
      profileSettings: "个人资料设置",
      savedDestinations: "保存的目的地",
      travelPreferences: "旅行偏好",
      signOut: "登出",
      privacy: "隐私",
      terms: "条款",
      settings: "设置",
      signIn: "登录 / 创建账户"
    },
    ja: {
      back: "戻る",
      search: "検索",
      profileSettings: "プロフィール設定",
      savedDestinations: "保存された目的地",
      travelPreferences: "旅行の好み",
      signOut: "サインアウト",
      privacy: "利用規約",
      terms: "利用規約",
      settings: "設定",
      signIn: "サインイン / アカウント作成"
    },
    es: {
      back: "Atrás",
      search: "Buscar",
      profileSettings: "Configuración del Perfil",
      savedDestinations: "Destinos Guardados",
      travelPreferences: "Preferencias de Viaje",
      signOut: "Cerrar Sesión",
      privacy: "Privacidad",
      terms: "Términos",
      settings: "Configuración",
      signIn: "Iniciar Sesión / Crear Cuenta"
    },
    fr: {
      back: "Retour",
      search: "Rechercher",
      profileSettings: "Paramètres du Profil",
      savedDestinations: "Destinations Sauvegardées",
      travelPreferences: "Préférences de Voyage",
      signOut: "Se Déconnecter",
      privacy: "Confidentialité",
      terms: "Conditions",
      settings: "Paramètres",
      signIn: "Se Connecter / Créer un Compte"
    },
    it: {
      back: "Indietro",
      search: "Cerca",
      profileSettings: "Impostazioni Profilo",
      savedDestinations: "Destinazioni Salvate",
      travelPreferences: "Preferenze di Viaggio",
      signOut: "Disconnetti",
      privacy: "Privacy",
      terms: "Termini",
      settings: "Impostazioni",
      signIn: "Accedi / Crea Account"
    },
    xh: {
      back: "Emuva",
      search: "Khangela",
      profileSettings: "Iisetingi Zeprofayili",
      savedDestinations: "Iindawo Ezigciniweyo",
      travelPreferences: "Izinto Zokukhetha Ukuhamba",
      signOut: "Phuma",
      privacy: "Ubumfihlo",
      terms: "Imiqathango",
      settings: "Iisetingi",
      signIn: "Ngena / Yenza iAkhawunti"
    },
    af: {
      back: "Terug",
      search: "Soek",
      profileSettings: "Profiel Instellings",
      savedDestinations: "Gestoorde Bestemmings",
      travelPreferences: "Reis Voorkeure",
      signOut: "Teken Uit",
      privacy: "Privaatheid",
      terms: "Voorwaardes",
      settings: "Instellings",
      signIn: "Teken In / Skep Rekening"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const handleNewSearch = () => {
    onNewSearch(
      newDestination,
      {
        checkin: format(checkinDate, 'yyyy-MM-dd'),
        checkout: format(checkoutDate, 'yyyy-MM-dd')
      },
      true // Skip loading transition for searches from results page
    );
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignInClick = () => {
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/30 backdrop-blur-sm sticky top-0 z-40 bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-xl font-bold text-foreground tracking-tight">TRAVIS</div>
          </div>

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

            {/* Conditional rendering based on authentication status */}
            {!loading && (
              user ? (
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
                    <DropdownMenuItem onClick={handleSignOut}>{t.signOut}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleSignInClick}
                  className="rounded-full px-4 py-2 text-sm font-medium border-border/30 hover:bg-white/5"
                >
                  {t.signIn}
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-border/30 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Where to?"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  className="pl-10 h-10 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm rounded-l-full"
                />
              </div>
              
              <div className="flex gap-1">
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 px-3 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[90px]"
                    >
                      <span>{format(checkinDate, 'MMM dd')}</span>
                      <Calendar className="w-3 h-3 text-white/70 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkinDate}
                      onSelect={(date) => {
                        if (date) setCheckinDate(date);
                        setCheckinOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 px-3 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[90px]"
                    >
                      <span>{format(checkoutDate, 'MMM dd')}</span>
                      <Calendar className="w-3 h-3 text-white/70 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-card border-border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkoutDate}
                      onSelect={(date) => {
                        if (date) setCheckoutDate(date);
                        setCheckoutOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => date < checkinDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleNewSearch}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 rounded-r-full"
              >
                {t.search}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Weather Widget */}
          <WeatherWidget destination={destination} />
          
          {/* Accommodation Heat Map */}
          <AccommodationHeatMap destination={destination} />
        </div>
      </main>

      {/* Travis Chatbot */}
      <TravisChatbot 
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        destination={destination}
        dates={dates}
      />
    </div>
  );
};

export default ResultsPage;
