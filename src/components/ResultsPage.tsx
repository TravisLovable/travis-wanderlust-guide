import React, { useState } from 'react';
import PhotoSlideshow from '@/components/PhotoSlideshow';
import VisaEntryWidget from '@/components/VisaEntryWidget';
import WeatherWidget from '@/components/WeatherWidget';
import AccommodationHeatMap from '@/components/AccommodationHeatMap';
import HolidayWidget from '@/components/HolidayWidget';
import CurrencyExchangeWidget from '@/components/CurrencyExchangeWidget';
import WorldClockWidget from '@/components/WorldClockWidget';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ResultsPageProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (destination: string, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}

const ResultsPage = ({ destination, dates, onBack, onNewSearch }: ResultsPageProps) => {
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [newDestination, setNewDestination] = useState(destination);
  const [date, setDate] = React.useState<{
    from: Date | undefined,
    to: Date | undefined
  }>({
    from: dates.checkin ? new Date(dates.checkin) : undefined,
    to: dates.checkout ? new Date(dates.checkout) : undefined,
  })

  const handleTempUnitToggle = () => {
    setTempUnit(prevUnit => (prevUnit === 'C' ? 'F' : 'C'));
  };

  const handleSearchAgain = () => {
    if (newDestination && date?.from && date?.to) {
      const checkin = format(date.from, 'yyyy-MM-dd');
      const checkout = format(date.to, 'yyyy-MM-dd');
      onNewSearch(newDestination, { checkin, checkout }, true); // Skip transition
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <header className="bg-gray-900 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Back Button */}
          <Button onClick={onBack} variant="outline">
            Back
          </Button>

          {/* Search Form */}
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Enter destination"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              className="bg-gray-800 text-white rounded-md px-4 py-2 w-64"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      `${format(date.from, "yyyy-MM-dd")} - ${format(date.to, "yyyy-MM-dd")}`
                    ) : (
                      format(date.from, "yyyy-MM-dd")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleSearchAgain} variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search Again
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {/* Photo Slideshow */}
          <PhotoSlideshow destination={destination} />
          
          {/* Visa & Entry Widget */}
          <VisaEntryWidget destination={destination} />
          
          {/* Weather Widget */}
          <WeatherWidget 
            destination={destination}
            currentLocation="Current Location"
            tempUnit={tempUnit}
            onTempUnitToggle={handleTempUnitToggle}
          />
          
          {/* Accommodation Heat Map */}
          <AccommodationHeatMap destination={destination} />
          
          {/* Holiday Widget */}
          <HolidayWidget destination={destination} dates={dates} />
          
          {/* Currency Exchange Widget */}
          <CurrencyExchangeWidget destination={destination} />
          
          {/* World Clock Widget */}
          <WorldClockWidget destination={destination} />
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
