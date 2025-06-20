
import React, { useState } from 'react';
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
    setSearchData({ destination, dates });
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  const handleBack = () => {
    setSearchData(null);
    setShowLoading(false);
  };

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

  return <HomePage onSearch={handleSearch} />;
};

export default Index;
