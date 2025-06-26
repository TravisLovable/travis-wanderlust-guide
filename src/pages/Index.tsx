
import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import LoadingIntelligence from '@/components/LoadingIntelligence';
import ResultsPage from '@/components/ResultsPage';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

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
    
    // Skip loading transition if requested (for searches from results page)
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

  const checkUserProfile = async (userId: string) => {
    try {
      console.log('Checking if user profile exists for:', userId);
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user profile:', error);
        return;
      }

      if (!profile) {
        console.log('No profile found - showing onboarding modal');
        setShowOnboarding(true);
      } else {
        console.log('Profile exists:', profile);
      }
    } catch (error) {
      console.error('Error in checkUserProfile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          
          // If user just signed in and we haven't checked their profile yet
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setCheckingProfile(true);
            await checkUserProfile(session.user.id);
          }
        } else {
          setUser(null);
          setShowOnboarding(false);
          setCheckingProfile(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkUserProfile(session.user.id);
      } else {
        setCheckingProfile(false);
      }
    });

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
      subscription.unsubscribe();
      window.fetch = originalFetch;
    };
  }, []);

  // Show onboarding modal for verified users without profiles
  if (showOnboarding) {
    return (
      <>
        <HomePage onSearch={(destination, dates) => handleSearch(destination, dates, false)} />
        <AuthModal 
          isOpen={showOnboarding} 
          onClose={() => {
            setShowOnboarding(false);
            // Optionally refresh the page or update state after profile creation
            window.location.reload();
          }} 
        />
      </>
    );
  }

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
      <ResultsPage
        destination={searchData.destination}
        dates={searchData.dates}
        onBack={handleBack}
        onNewSearch={handleSearch}
      />
    );
  }

  return <HomePage onSearch={(destination, dates) => handleSearch(destination, dates, false)} />;
};

export default Index;
