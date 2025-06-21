import React, { useState, useEffect } from 'react';
import { Search, User, Moon, Sun, MapPin, Plane, Calendar, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import PhotoSlideshow from './PhotoSlideshow';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (query: string) => {
    setIsLoading(true);
    console.log(`Searching for: ${query}`);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/search?q=${query}`);
    }, 1500);
  };

  const suggestions = [
    "Paris, France",
    "Tokyo, Japan", 
    "New York, USA",
    "Barcelona, Spain",
    "Sydney, Australia"
  ];

  const popularDestinations = [
    { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { name: "Barcelona", country: "Spain", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { name: "Sydney", country: "Australia", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-all duration-500">
      {/* Navigation Bar */}
      <nav className="w-full px-4 md:px-8 lg:px-16 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:text-glow">
              TRAVIS
            </span>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-10 h-10 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full profile-dropdown-glow">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <Badge className="premium-glow text-xs">Premium</Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="suggestion-hover cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="suggestion-hover cursor-pointer">
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="suggestion-hover cursor-pointer">
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="suggestion-hover cursor-pointer">
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-16 pt-16 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent dark:text-glow leading-tight">
            Your AI Travel Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 dark:text-glow-subtle mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover personalized travel experiences with intelligent recommendations, 
            real-time insights, and seamless planning.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative travis-glow-white">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 search-icon-glow transition-all duration-300" />
              <Input
                type="text"
                placeholder="Where would you like to explore?"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                className="pl-12 pr-4 py-4 text-lg h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20"
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                {suggestions
                  .filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 suggestion-hover cursor-pointer transition-all duration-200 flex items-center space-x-3"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                        handleSearch(suggestion);
                      }}
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Get Intelligence Button */}
          <Button 
            onClick={() => handleSearch(searchQuery)}
            disabled={isLoading}
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 travis-intelligence-glow"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Getting Intelligence...</span>
              </div>
            ) : (
              "Get Intelligence"
            )}
          </Button>
        </div>

        {/* Photo Slideshow */}
        <div className="mb-16">
          <PhotoSlideshow />
        </div>

        {/* Popular Destinations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white dark:text-glow-subtle">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <Card key={index} className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 travis-card travis-interactive">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold text-lg drop-shadow-lg">{destination.name}</h3>
                    <p className="text-white/80 text-sm drop-shadow-lg">{destination.country}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 border-0 shadow-lg travis-card">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold dark:text-glow-subtle">Smart Recommendations</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized travel suggestions based on your preferences, budget, and travel style.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 border-0 shadow-lg travis-card">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold dark:text-glow-subtle">Intelligent Planning</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Create optimized itineraries with real-time updates and local insights for seamless travel.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 border-0 shadow-lg travis-card">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold dark:text-glow-subtle">Community Insights</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Access curated recommendations from fellow travelers and local experts worldwide.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
