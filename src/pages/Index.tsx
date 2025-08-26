
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '@/components/HomePage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

const Index = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  // Authentication setup
  useEffect(() => {
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

    return () => subscription.unsubscribe();
  }, []);


  const handleSearch = (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }, skipTransition = false) => {
    if (!placeDetails) return;

    // Create URL parameters for the search
    const searchParams = new URLSearchParams({
      destination: placeDetails.formatted_address,
      name: placeDetails.name,
      lat: placeDetails.latitude.toString(),
      lng: placeDetails.longitude.toString(),
      checkin: dates.checkin,
      checkout: dates.checkout,
      ...(placeDetails.country_code && { country: placeDetails.country_code }),
      ...(placeDetails.region && { region: placeDetails.region }),
      ...(placeDetails.place_id && { placeId: placeDetails.place_id }),
      ...(!skipTransition && { loading: 'true' })
    });

    // Navigate to search results page
    navigate(`/search?${searchParams.toString()}`);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header
        user={user}
        userProfile={userProfile}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setCurrentLanguage={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />
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
      <HomePage onSearch={(placeDetails, dates) => handleSearch(placeDetails, dates, false)} />
    </div>
  );
};

export default Index;
