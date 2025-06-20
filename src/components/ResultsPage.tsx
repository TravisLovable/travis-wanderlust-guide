import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PhotoSlideshow from '@/components/PhotoSlideshow';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }) => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const handleNewSearch = () => {
    onNewSearch(destination, {
      checkin: dates.checkin,
      checkout: dates.checkout,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-cover bg-center rounded-full object-cover" style={{
                    backgroundImage: 'url(/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png)',
                    backgroundPosition: 'center center'
                  }} />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-cover bg-center rounded-full object-cover" style={{
                  backgroundImage: 'url(/lovable-uploads/50d1238b-b62f-4cea-a3cb-8e7f0834fe41.png)',
                  backgroundPosition: 'center center'
                }} />
                <div>
                  <h3 className="font-semibold text-foreground">Brittany J.</h3>
                  <span className="text-sm font-medium premium-glow">Premium Member</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preferred Airline</span>
                  <span className="text-sm font-medium text-foreground">Delta Airlines</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Travel Type</span>
                  <span className="text-sm font-medium text-foreground">Luxury</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Frequent Flyer #</span>
                  <span className="text-sm font-medium text-foreground">DL89472156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Passport</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">United States</span>
                  </div>
                </div>
              </div>
              
              <DropdownMenuSeparator className="my-4" />
              
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Saved Destinations</DropdownMenuItem>
              <DropdownMenuItem>Travel Preferences</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Results Summary */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
              Explore {destination}
            </h2>
            <p className="text-muted-foreground">
              {format(new Date(dates.checkin), 'MMM dd')} - {format(new Date(dates.checkout), 'MMM dd')} · {format(addDays(new Date(dates.checkout), 7), 'MMM dd')}
            </p>
          </div>

          {/* Photo Slideshow */}
          <div className="mb-8">
            <PhotoSlideshow />
          </div>

          {/* New Search Button */}
          <Button onClick={handleNewSearch} className="w-full">
            <Calendar className="mr-2 w-4 h-4" />
            New Search
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p className="text-sm">
            © {new Date().getFullYear()} Travis. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResultsPage;
