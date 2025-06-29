import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherWidget from './WeatherWidget';
import AccommodationHeatMap from './AccommodationHeatMap';
import { useToast } from "@/hooks/use-toast";
import HeaderSection from './HeaderSection';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
}

interface GeocodingResult {
  name: string;
  country_code: string;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get('destination') || 'Unknown Destination';
  const searchDate = searchParams.get('date') || '';

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [countryFlag, setCountryFlag] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
        if (!apiKey) {
          throw new Error("OpenWeatherMap API key not found in environment variables.");
        }

        // Fetch geocoding data to get latitude and longitude
        const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${destination}&limit=1&appid=${apiKey}`;
        const geocodingResponse = await fetch(geocodingUrl);
        const geocodingData: GeocodingResult[] = await geocodingResponse.json();

        if (geocodingData && geocodingData.length > 0) {
          const { lat, lon } = geocodingData[0];

          // Fetch weather data using latitude and longitude
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
          const weatherResponse = await fetch(weatherUrl);

          if (!weatherResponse.ok) {
            throw new Error(`Weather data fetch failed with status: ${weatherResponse.status}`);
          }

          const weatherJson = await weatherResponse.json();

          setWeatherData({
            temperature: weatherJson.main.temp,
            description: weatherJson.weather[0].description,
            icon: weatherJson.weather[0].icon,
          });
        } else {
          toast({
            title: "Error",
            description: `Could not find coordinates for ${destination}.`,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || `Failed to fetch weather data for ${destination}.`,
          variant: "destructive",
        });
        console.error(`Failed to fetch weather data for ${destination}:`, error);
      }
    };

    fetchWeatherData();
  }, [destination, toast]);

  useEffect(() => {
    const fetchCountryFlag = async () => {
      try {
        const apiKey = process.env.REACT_APP_GEONAMES_API_KEY;
        if (!apiKey) {
          throw new Error("Geonames API key not found in environment variables.");
        }

        const geonamesUrl = `http://api.geonames.org/searchJSON?q=${destination}&maxRows=1&username=${apiKey}`;
        const response = await fetch(geonamesUrl);
        const data = await response.json();

        if (data.geonames && data.geonames.length > 0) {
          const countryCode = data.geonames[0].countryCode;
          setCountryFlag(`https://www.countryflags.io/${countryCode}/flat/64.png`);
        } else {
          console.warn(`Country code not found for ${destination}.`);
        }
      } catch (error) {
        console.error(`Failed to fetch country flag for ${destination}:`, error);
      }
    };

    fetchCountryFlag();
  }, [destination]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <HeaderSection 
          leftContent={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Search</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
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
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </>
          }
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Widget - Left Column */}
          <div className="lg:col-span-1">
            <WeatherWidget 
              destination={destination}
              searchDate={searchDate}
              tempUnit={tempUnit}
              onTempUnitToggle={() => setTempUnit(prev => prev === 'C' ? 'F' : 'C')}
            />
          </div>

          {/* Accommodation Map - Right Column */}
          <div className="lg:col-span-2">
            <AccommodationHeatMap />
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="local-info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="local-info">Local Information</TabsTrigger>
              <TabsTrigger value="travel-tips">Travel Tips</TabsTrigger>
              <TabsTrigger value="currency">Currency & Costs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="local-info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Popular Attractions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Discover the most visited landmarks and attractions in {destination}.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Local Culture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Learn about local customs, traditions, and cultural highlights.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="travel-tips">
              <Card>
                <CardHeader>
                  <CardTitle>Essential Travel Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get insider tips for making the most of your visit to {destination}.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="currency">
              <Card>
                <CardHeader>
                  <CardTitle>Currency & Budget Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Current exchange rates and typical costs for {destination}.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
