
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { fetchCountryFlag } from '@/lib/utils';
import PropertyCard from './PropertyCard';

interface ResultsPageProps {
  destination: string;
  dates: { checkin: string; checkout: string };
  onBack: () => void;
  onNewSearch: () => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  console.log('ResultsPage rendered with props:', { destination, dates });
  
  const navigate = useNavigate();
  const [countryFlag, setCountryFlag] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState<Date | null>(null);

  useEffect(() => {
    if (dates && dates.checkin) {
      setSearchDate(new Date(dates.checkin));
    }
  }, [dates]);

  useEffect(() => {
    const getFlag = async () => {
      const flag = await fetchCountryFlag(destination);
      setCountryFlag(flag);
    };

    getFlag();
  }, [destination]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          {/* Left-aligned: back button, destination info, date */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Search</span>
            </Button>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5" />
              <h1 className="text-2xl font-bold text-gray-800">{destination}</h1>
              {countryFlag && (
                <img
                  src={countryFlag}
                  alt={`${destination} flag`}
                  className="w-8 h-6 object-cover rounded shadow-sm"
                />
              )}
            </div>

            {searchDate && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(searchDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Right-aligned: empty for now */}
          <div>
            {/* Placeholder for future profile dropdown */}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
