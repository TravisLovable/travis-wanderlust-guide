
import React, { useState } from 'react';
import { Search, Calendar, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HomePageProps {
  onSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const HomePage = ({ onSearch }: HomePageProps) => {
  const [destination, setDestination] = useState('');
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && checkinDate && checkoutDate) {
      onSearch(destination, { checkin: checkinDate, checkout: checkoutDate });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">Travis</div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Explore</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Intelligence</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Access</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-float">
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-6 tracking-tighter">
              The World
            </h1>
            <h1 className="text-7xl md:text-8xl font-light text-foreground mb-8 tracking-tighter">
              Awaits.
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
          </div>
          
          <p className="text-2xl text-muted-foreground mb-4 font-light tracking-wide">
            Explore Confidently
          </p>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            Real-time intelligence for the modern explorer. Transform every journey into a seamless, first-class experience.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="travis-card p-8 md:p-12 mb-16 travis-glow">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-12 h-14 bg-secondary/50 border-border/50 focus:border-blue-400 focus:bg-secondary/80 rounded-xl text-lg transition-all duration-300"
                  required
                />
              </div>
              
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors" />
                <Input
                  type="date"
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className="pl-12 h-14 bg-secondary/50 border-border/50 focus:border-blue-400 focus:bg-secondary/80 rounded-xl text-lg transition-all duration-300"
                  required
                />
              </div>
              
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-hover:text-blue-400 transition-colors" />
                <Input
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="pl-12 h-14 bg-secondary/50 border-border/50 focus:border-blue-400 focus:bg-secondary/80 rounded-xl text-lg transition-all duration-300"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
            >
              <Search className="w-6 h-6 mr-3" />
              Begin Intelligence Brief
            </Button>
          </form>

          {/* Elite Destinations */}
          <div className="space-y-6">
            <p className="text-muted-foreground font-medium tracking-wide">ELITE DESTINATIONS</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Tokyo', 'Dubai', 'Singapore', 'Zurich', 'Monaco', 'Aspen'].map((city) => (
                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="px-6 py-4 bg-secondary/30 border border-border/30 rounded-xl text-foreground hover:bg-secondary/60 hover:border-blue-400/50 transition-all duration-300 font-medium tracking-wide travis-interactive"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground font-light tracking-wide">
            Powered by <span className="text-foreground font-medium">Travis</span> • Your intelligent travel companion
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
