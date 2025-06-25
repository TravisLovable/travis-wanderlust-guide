import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Moon, Globe, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import TravisChatbot from './TravisChatbot';
import AccommodationHeatMap from './AccommodationHeatMap';
import WeatherWidget from './WeatherWidget';
import PhotoSlideshow from './PhotoSlideshow';

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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [modifiedDestination, setModifiedDestination] = useState(destination);
  const [checkinDate, setCheckinDate] = useState<Date>(new Date(dates.checkin));
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date(dates.checkout));
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

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
      backToSearch: "Back to Search",
      privacy: "Privacy",
      terms: "Terms",
      settings: "Settings",
      updateSearch: "Update Search"
    },
    zh: {
      backToSearch: "返回搜索",
      privacy: "隐私",
      terms: "条款",
      settings: "设置",
      updateSearch: "更新搜索"
    },
    ja: {
      backToSearch: "検索に戻る",
      privacy: "プライバシー",
      terms: "利用規約",
      settings: "設定",
      updateSearch: "検索を更新"
    },
    es: {
      backToSearch: "Volver a Buscar",
      privacy: "Privacidad",
      terms: "Términos",
      settings: "Configuración",
      updateSearch: "Actualizar Búsqueda"
    },
    fr: {
      backToSearch: "Retour à la Recherche",
      privacy: "Confidentialité",
      terms: "Conditions",
      settings: "Paramètres",
      updateSearch: "Mettre à Jour la Recherche"
    },
    it: {
      backToSearch: "Torna alla Ricerca",
      privacy: "Privacy",
      terms: "Termini",
      settings: "Impostazioni",
      updateSearch: "Aggiorna Ricerca"
    },
    xh: {
      backToSearch: "Buyela Ekukhangeni",
      privacy: "Ubumfihlo",
      terms: "Imiqathango",
      settings: "Iisetingi",
      updateSearch: "Hlaziya Ukukhangela"
    },
    af: {
      backToSearch: "Terug na Soek",
      privacy: "Privaatheid",
      terms: "Voorwaardes",
      settings: "Instellings",
      updateSearch: "Opdateer Soektog"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleTempUnitToggle = () => {
    setTempUnit(tempUnit === 'C' ? 'F' : 'C');
  };

  const handleUpdateSearch = () => {
    const newDates = {
      checkin: format(checkinDate, 'yyyy-MM-dd'),
      checkout: format(checkoutDate, 'yyyy-MM-dd')
    };
    onNewSearch(modifiedDestination, newDates, true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/30 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToSearch}</span>
            </Button>
            <div className="text-xl font-bold text-foreground tracking-tight">TRAVIS</div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-4 h-4" strokeWidth={1.5} />
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
              {isDarkMode ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
            </Button>

            {/* Profile Container Placeholder */}
            <div id="profile-container"></div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-card/50 border-b border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm border border-border/30 rounded-lg p-3">
            <div className="flex-1">
              <input
                type="text"
                value={modifiedDestination}
                onChange={(e) => setModifiedDestination(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-sm font-medium text-foreground"
                placeholder="Destination"
              />
            </div>
            
            <div className="flex gap-2">
              <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm justify-between font-normal border border-border/30 min-w-[100px]"
                  >
                    <span>{format(checkinDate, 'MMM dd')}</span>
                    <Calendar className="w-3 h-3 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                    size="sm"
                    className="text-sm justify-between font-normal border border-border/30 min-w-[100px]"
                  >
                    <span>{format(checkoutDate, 'MMM dd')}</span>
                    <Calendar className="w-3 h-3 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              onClick={handleUpdateSearch}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t.updateSearch}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chat and Maps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Travis Chatbot */}
              <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
                <TravisChatbot />
              </div>

              {/* Accommodation Heat Map */}
              <div className="bg-card border border-border/30 rounded-xl p-6">
                <AccommodationHeatMap />
              </div>
            </div>

            {/* Right Column - Weather and Photos */}
            <div className="space-y-6">
              {/* Weather Widget */}
              <div className="bg-card border border-border/30 rounded-xl p-6">
                <WeatherWidget 
                  destination={destination} 
                  tempUnit={tempUnit}
                  onTempUnitToggle={handleTempUnitToggle}
                />
              </div>

              {/* Photo Slideshow */}
              <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
                <PhotoSlideshow destination={destination} />
              </div>
            </div>
          </div>
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

export default ResultsPage;
