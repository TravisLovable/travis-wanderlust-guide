import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import UserAvatarDropdown from './UserAvatarDropdown';

const ResultsPage = () => {
  const [destination, setDestination] = useState('Paris');
  const [budget, setBudget] = useState(3000);
  const [tripType, setTripType] = useState('Relaxing');
  const [accommodationType, setAccommodationType] = useState('Hotel');

  const searchResults = [
    { id: 1, name: 'Luxury Suite', price: 500, rating: 4.5, imageUrl: 'https://example.com/suite.jpg' },
    { id: 2, name: 'Cozy Apartment', price: 200, rating: 4.2, imageUrl: 'https://example.com/apartment.jpg' },
    { id: 3, name: 'Budget Hotel Room', price: 100, rating: 3.8, imageUrl: 'https://example.com/hotel.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
            
            <UserAvatarDropdown />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Destination Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Explore {destination}
          </h2>
          <p className="text-gray-600">
            Here are some great options for your {tripType} trip, staying in a {accommodationType} within your budget of ${budget}.
          </p>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {searchResults.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={result.imageUrl} alt={result.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{result.name}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{result.rating}</span>
                </div>
                <p className="text-gray-600">${result.price} per night</p>
                <Button className="mt-4 w-full">View Details</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeatherWidget destination={destination} />
          <AccommodationHeatMap destination={destination} accommodationType={accommodationType} />
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
