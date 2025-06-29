
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsPageProps {
  destination: string;
  dates: { checkin: string; checkout: string };
  onBack: () => void;
  onNewSearch: () => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const navigate = useNavigate();
  const [searchDate, setSearchDate] = useState<Date | null>(null);

  useEffect(() => {
    if (dates && dates.checkin) {
      setSearchDate(new Date(dates.checkin));
    }
  }, [dates]);

  const handleBack = () => {
    navigate('/');
    onBack();
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
            </div>

            {searchDate && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {searchDate.toLocaleDateString('en-US', {
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
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Property 1</h3>
            <p className="text-gray-600">Sample property content</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Property 2</h3>
            <p className="text-gray-600">Sample property content</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Property 3</h3>
            <p className="text-gray-600">Sample property content</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Property 4</h3>
            <p className="text-gray-600">Sample property content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
