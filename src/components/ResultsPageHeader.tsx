
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Globe, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import AuthModal from '@/components/AuthModal';
import SignInButton from '@/components/SignInButton';

interface ResultsPageHeaderProps {
  destination: string;
  newCheckinDate: Date;
  newCheckoutDate: Date;
  onBack: () => void;
  onCheckinDateChange: (date: Date) => void;
  onCheckoutDateChange: (date: Date) => void;
  onPinDestination: (dest: string) => void;
  getCountryFlag: (dest: string) => string | null;
}

const ResultsPageHeader = ({
  destination,
  newCheckinDate,
  newCheckoutDate,
  onBack,
  onCheckinDateChange,
  onCheckoutDateChange,
  onPinDestination,
  getCountryFlag
}: ResultsPageHeaderProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const formatDateRange = (checkin: Date, checkout: Date) => {
    const departFormatted = format(checkin, 'EEEE MMMM do');
    const returnFormatted = format(checkout, 'EEEE MMMM do');
    return `Depart: ${departFormatted} • Return: ${returnFormatted}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:bg-secondary/50 rounded-xl travis-interactive"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-foreground flex items-center tracking-tight">
                {destination}
                {getCountryFlag(destination) ? (
                  <img 
                    src={getCountryFlag(destination)!} 
                    alt="Country Flag" 
                    className="w-8 h-6 ml-3 mr-2 rounded shadow-sm"
                  />
                ) : (
                  <Globe className="w-8 h-6 ml-3 mr-2 text-blue-400" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPinDestination(destination)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Pin className="w-5 h-5" />
                </Button>
              </h1>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground flex items-center font-light p-0 h-auto hover:text-foreground transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDateRange(newCheckinDate, newCheckoutDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Depart Date</p>
                    <CalendarComponent
                      mode="single"
                      selected={newCheckinDate}
                      onSelect={(date) => {
                        if (date) onCheckinDateChange(date);
                      }}
                      className="pointer-events-auto"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Return Date</p>
                    <CalendarComponent
                      mode="single"
                      selected={newCheckoutDate}
                      onSelect={(date) => {
                        if (date) onCheckoutDateChange(date);
                      }}
                      className="pointer-events-auto"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SignInButton onClick={() => setIsAuthModalOpen(true)} />
          <div id="profile-container"></div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default ResultsPageHeader;
