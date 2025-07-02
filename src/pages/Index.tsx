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

  const handleSearch = (destination: string, dates: { checkin: string; checkout: string }) => {
    console.log('Search triggered with:', { destination, dates });
    setSearchData({ destination, dates });
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    console.log('Loading complete, showing results page');
    setShowLoading(false);
  };

  const handleBack = () => {
    console.log('Going back to home page');
    setSearchData(null);
    setShowLoading(false);
  };

  const handleNewSearch = () => {
    console.log('Starting new search');
    setSearchData(null);
    setShowLoading(false);
  };

  // Debug current state
  console.log('Current state:', { searchData, showLoading });

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
    console.log('Rendering LoadingIntelligence component');
    return (
      <LoadingIntelligence
        destination={searchData.destination}
        onComplete={handleLoadingComplete}
      />
    );
  }

  if (searchData && !showLoading) {
    console.log('Rendering ResultsPage component');
    return (
      <ResultsPage
        destination={searchData.destination}
        dates={searchData.dates}
        onBack={handleBack}
        onNewSearch={handleNewSearch}
      />
    );
  }

  console.log('Rendering HomePage component');
  return <HomePage onSearch={handleSearch} />;
};

export default Index;
