
import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface SearchBarWithSuggestionsProps {
  newDestination: string;
  newCheckinDate: Date;
  newCheckoutDate: Date;
  checkinOpen: boolean;
  checkoutOpen: boolean;
  showSuggestions: boolean;
  isLoadingSuggestions: boolean;
  mapboxSuggestions: Array<{
    place_name: string;
    text: string;
  }>;
  onDestinationChange: (value: string) => void;
  onDestinationSelect: (suggestion: any) => void;
  onCheckinDateChange: (date: Date) => void;
  onCheckoutDateChange: (date: Date) => void;
  onCheckinOpenChange: (open: boolean) => void;
  onCheckoutOpenChange: (open: boolean) => void;
  onShowSuggestionsChange: (show: boolean) => void;
  onSearch: (e?: React.FormEvent) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const SearchBarWithSuggestions = ({
  newDestination,
  newCheckinDate,
  newCheckoutDate,
  checkinOpen,
  checkoutOpen,
  showSuggestions,
  isLoadingSuggestions,
  mapboxSuggestions,
  onDestinationChange,
  onDestinationSelect,
  onCheckinDateChange,
  onCheckoutDateChange,
  onCheckinOpenChange,
  onCheckoutOpenChange,
  onShowSuggestionsChange,
  onSearch,
  onKeyPress
}: SearchBarWithSuggestionsProps) => {
  return (
    <form onSubmit={onSearch} className="bg-white/10 backdrop-blur-sm border border-border/20 rounded-full p-2 shadow-lg relative travis-glow-white">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
          <Input
            type="text"
            placeholder="Search any destination worldwide..."
            value={newDestination}
            onChange={(e) => onDestinationChange(e.target.value)}
            onKeyPress={onKeyPress}
            onFocus={() => newDestination.length >= 2 && onShowSuggestionsChange(true)}
            onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
            className="pl-12 h-12 bg-transparent border-0 focus:ring-0 text-base placeholder:text-muted-foreground/70 rounded-l-full"
          />
          {showSuggestions && mapboxSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoadingSuggestions && (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              )}
              {mapboxSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onDestinationSelect(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors text-sm border-b border-border/20 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {suggestion.text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion.place_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Date Inputs */}
        <div className="flex gap-1">
          <Popover open={checkinOpen} onOpenChange={onCheckinOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
              >
                {newCheckinDate ? format(newCheckinDate, 'MMM dd') : 'Depart'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <CalendarComponent
                mode="single"
                selected={newCheckinDate}
                onSelect={(date) => {
                  if (date) onCheckinDateChange(date);
                  onCheckinOpenChange(false);
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Popover open={checkoutOpen} onOpenChange={onCheckoutOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 px-4 bg-transparent hover:bg-white/5 rounded-none text-sm justify-start font-normal border-l border-border/30"
              >
                {newCheckoutDate ? format(newCheckoutDate, 'MMM dd') : 'Return'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <CalendarComponent
                mode="single"
                selected={newCheckoutDate}
                onSelect={(date) => {
                  if (date) onCheckoutDateChange(date);
                  onCheckoutOpenChange(false);
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          type="submit"
          className="h-12 px-4 bg-white/20 hover:bg-white/30 text-white rounded-r-full border-l border-border/30 search-icon-glow"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBarWithSuggestions;
