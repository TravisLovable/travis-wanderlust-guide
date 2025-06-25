
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthNavigationButtonsProps {
  onBack?: () => void;
}

const AuthNavigationButtons = ({ onBack }: AuthNavigationButtonsProps) => {
  // Always show the close button, even if onBack is not provided
  const handleClose = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback: navigate to home if no onBack callback
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-6 left-6 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      )}

      {/* Close Button - Always visible */}
      <Button
        variant="ghost"
        onClick={handleClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10 p-2"
      >
        <X className="w-5 h-5" />
      </Button>
    </>
  );
};

export default AuthNavigationButtons;
