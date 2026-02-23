import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '@/components/HomePage';
import Header from '@/components/Header';
import { SelectedPlace } from '@/hooks/useGooglePlaces';

const Index = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleSearch = (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }, skipTransition = false) => {
    if (!placeDetails) return;

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

    navigate(`/search?${searchParams.toString()}`);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        setCurrentLanguage={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />
      <HomePage
        onSearch={(placeDetails, dates) => handleSearch(placeDetails, dates, false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    </div>
  );
};

export default Index;
