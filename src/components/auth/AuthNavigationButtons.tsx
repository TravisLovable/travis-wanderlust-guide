
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthNavigationButtonsProps {
  onBack?: () => void;
}

const AuthNavigationButtons = ({ onBack }: AuthNavigationButtonsProps) => {
  const handleClose = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to home if no onBack callback
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Temporary testing element to confirm rendering */}
      <div 
        className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs z-[9999]"
        style={{ zIndex: 9999 }}
      >
        TESTING - AuthNavigationButtons is rendering
      </div>

      {/* Back Button - only show if onBack is provided */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-6 left-6 text-white/70 hover:text-white hover:bg-white/10 z-[9999]"
          style={{ zIndex: 9999 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      )}

      {/* Close Button - Always visible with maximum z-index */}
      <Button
        variant="ghost"
        onClick={handleClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10 p-2 z-[9999]"
        style={{ zIndex: 9999 }}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </Button>
    </>
  );
};

export default AuthNavigationButtons;
