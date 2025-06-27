
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import PhotoSlideshow from './PhotoSlideshow';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';
import UserProfileDropdown from './UserProfileDropdown';

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
  
  // Authentication state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Authentication setup
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', session.user.id)
              .single();
            
            setUserProfile(profile);
            
            // Show onboarding modal if profile doesn't exist or onboarding not completed
            if (!profile || !profile.onboarding_completed) {
              setIsOnboardingModalOpen(true);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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

  const handleSearch = () => {
    if (newDestination && checkinDate && checkoutDate) {
      onNewSearch(newDestination, {
        checkin: format(checkinDate, 'yyyy-MM-dd'),
        checkout: format(checkoutDate, 'yyyy-MM-dd')
      }, true);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignInSuccess = () => {
    // This will be handled by the auth state change listener
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
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

            {/* User Authentication */}
            {user ? (
              <UserProfileDropdown 
                user={user} 
                userProfile={userProfile}
                currentLanguage={currentLanguage}
                setCurrentLanguage={setCurrentLanguage}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                languages={languages}
              />
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} variant="outline">
                Log In / Sign Up
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-border/30 rounded-full p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Where to?"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground/60 rounded-l-full"
                />
              </div>
              
              <div className="flex gap-1">
                <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[100px]"
                    >
                      <span>{format(checkinDate, 'MMM dd')}</span>
                      <Calendar className="w-4 h-4 text-white/70 ml-2" />
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
                      className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-between font-normal border-l border-border/30 min-w-[100px]"
                    >
                      <span>{format(checkoutDate, 'MMM dd')}</span>
                      <Calendar className="w-4 h-4 text-white/70 ml-2" />
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
                onClick={handleSearch}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-r-full"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Weather and Photos */}
          <div className="space-y-6">
            <WeatherWidget destination={destination} />
            <PhotoSlideshow destination={destination} />
          </div>

          {/* Right Column - Accommodation Map */}
          <div className="lg:col-span-2">
            <AccommodationHeatMap destination={destination} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />
      
      <OnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onClose={() => setIsOnboardingModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default ResultsPage;
