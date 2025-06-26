
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignInButtonProps {
  onClick: () => void;
  className?: string;
}

const SignInButton = ({ onClick, className = '' }: SignInButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`
        bg-white/10 backdrop-blur-sm border border-white/20 
        text-white hover:bg-white/20 hover:text-white 
        transition-all duration-300 rounded-full px-4 py-2
        ${className}
      `}
    >
      <User className="w-4 h-4 mr-2" />
      Sign In / Create Account
    </Button>
  );
};

export default SignInButton;
