import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import LoadingIntelligence from '@/components/LoadingIntelligence';
import ResultsPage from '@/components/ResultsPage';
import AuthModal from '@/components/AuthModal';
import HeaderWithAuth from '@/components/HeaderWithAuth';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const handleSearch = (destination: string, dates: { checkin: string; checkout: string }, skipTransition = false) => {
    setSearchData({ destination, dates });
    
    if (skipTransition) {
      setShowLoading(false);
    } else {
      setShowLoading(true);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  const handleBack = () => {
    setSearchData(null);
    setShowLoading(false);
  };

  const checkUserProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('Checking if user profile exists for:', userId);
      
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found - showing onboarding modal');
          setShowOnboarding(true);
        } else {
          console.error('Error checking user profile:', error);
          
          if (error.message?.includes('JWT') && retryCount < 3) {
            console.log('JWT issue, retrying profile check...');
            setTimeout(() => {
              checkUserProfile(userId, retryCount + 1);
            }, 2000);
            return;
          }
          
          toast.error('Error checking your profile. Please try refreshing the page.');
        }
      } else if (profile) {
        console.log('Profile exists:', profile);
        
        if (!profile.onboarding_completed) {
          console.log('Profile exists but onboarding not completed - showing onboarding modal');
          setShowOnboarding(true);
        } else {
          console.log('Profile exists and onboarding completed');
          setShowOnboarding(false);
        }
      }
    } catch (error) {
      console.error('Error in checkUserProfile:', error);
      
      if (retryCount < 2) {
        console.log('Retrying profile check due to error...');
        setTimeout(() => {
          checkUserProfile(userId, retryCount + 1);
        }, 2000);
        return;
      }
      
      toast.error('Failed to load your profile. Please try refreshing the page.');
    } finally {
      if (retryCount >= 2) {
        setCheckingProfile(false);
      }
    }
  };

  const handleOnboardingClose = async () => {
    setShowOnboarding(false);
    
    if (user) {
      setCheckingProfile(true);
      await checkUserProfile(user.id);
      setCheckingProfile(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setCheckingProfile(true);
            setTimeout(() => {
              checkUserProfile(session.user.id);
            }, 1500);
          }
        } else {
          setUser(null);
          setShowOnboarding(false);
          setCheckingProfile(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user.id);
      } else {
        setCheckingProfile(false);
      }
    });

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
      subscription.unsubscribe();
      window.fetch = originalFetch;
    };
  }, []);

  if (showLoading && searchData) {
    return (
      <LoadingIntelligence
        destination={searchData.destination}
        onComplete={handleLoadingComplete}
      />
    );
  }

  if (searchData && !showLoading) {
    return (
      <>
        <HeaderWithAuth user={user} />
        <ResultsPage
          destination={searchData.destination}
          dates={searchData.dates}
          onBack={handleBack}
          onNewSearch={handleSearch}
        />
      </>
    );
  }

  return (
    <>
      <HeaderWithAuth user={user} />
      <HomePage onSearch={(destination, dates) => handleSearch(destination, dates, false)} />
      {showOnboarding && user && (
        <AuthModal 
          isOpen={showOnboarding} 
          onClose={handleOnboardingClose}
        />
      )}
    </>
  );
};

export default Index;
