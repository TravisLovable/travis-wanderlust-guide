
import React, { useState } from 'react';
import HomePage from '@/components/HomePage';
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

  const handleSearch = (destination: string, dates: { checkin: string; checkout: string }) => {
    setSearchData({ destination, dates });
  };

  const handleBack = () => {
    setSearchData(null);
  };

  if (searchData) {
    return (
      <ResultsPage
        destination={searchData.destination}
        dates={searchData.dates}
        onBack={handleBack}
      />
    );
  }

  return <HomePage onSearch={handleSearch} />;
};

export default Index;
