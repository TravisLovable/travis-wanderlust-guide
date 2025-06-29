
import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import LoadingIntelligence from '@/components/LoadingIntelligence';
import ResultsPage from '@/components/ResultsPage';

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

  const handleNewSearch = () => {
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
        onNewSearch={handleNewSearch}
      />
    );
  }

  return <HomePage onSearch={handleSearch} />;
};

export default Index;
