
import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import LoadingIntelligence from '@/components/LoadingIntelligence';
import ResultsPage from '@/components/ResultsPage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';

interface SearchData {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
}

const Index = () => {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  // Authentication setup
  useEffect((): any => {
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
  }, []);


  const handleSearch = (destination: string, dates: { checkin: string; checkout: string }, skipTransition = false) => {
    setSearchData({ destination, dates });

    // Skip loading transition if requested (for searches from results page)
    if (skipTransition) {
      setShowLoading(false);
    } else {
      setShowLoading(true);
    }
  };
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLoadingComplete = () => {
    // disable while implimenting the loading stuff
    setShowLoading(false);
  };

  const handleBack = () => {
    setSearchData(null);
    setShowLoading(false);
  };

  useEffect(() => {
    // Map /api/mapbox-geocoding to Supabase edge function
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      if (typeof input === 'string' && input.startsWith('/api/mapbox-geocoding')) {
        const url = new URL(input, window.location.origin);
        const params = url.searchParams;
        const supabaseUrl = `https://sioicdmsphfigulrufim.supabase.co/functions/v1/mapbox-geocoding?${params.toString()}`;
        return originalFetch(supabaseUrl, {
          ...init,
          headers: {
            ...init?.headers,
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2ljZG1zcGhmaWd1bHJ1ZmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjA3ODcsImV4cCI6MjA2NjAzNjc4N30.jeiXaHM_wjCOs29jfePSKYTJXouR17BsTBfC-Oym8uk`
          }
        });
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Determine which page to render based on existing logic
  let content: React.ReactNode;
  if (showLoading && searchData) {
    content = (
      <LoadingIntelligence
        destination={searchData.destination}
        onComplete={handleLoadingComplete}
      />
    );
  } else if (searchData && !showLoading) {
    content = (
      <ResultsPage
        destination={searchData.destination}
        dates={searchData.dates}
        onBack={handleBack}
        onNewSearch={handleSearch}
      />
    );
  } else {
    content = (
      <HomePage onSearch={(destination, dates) => handleSearch(destination, dates, false)} />
    );
  }

  // Always wrap the rendered page in the same parent container
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header user={user} userProfile={userProfile} isDarkMode={isDarkMode} toggleTheme={toggleTheme} setIsAuthModalOpen={setIsAuthModalOpen} setCurrentLanguage={setCurrentLanguage} currentLanguage={currentLanguage} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignInSuccess={() => { }}
      />
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        user={user}
      />
      {content}
    </div>
  );
};

export default Index;
