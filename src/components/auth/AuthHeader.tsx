
import React from 'react';
import { User } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader = ({ isSignUp }: AuthHeaderProps) => {
  return (
    <CardHeader className="text-center pb-8">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-white mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </CardTitle>
        <p className="text-white/70">
          {isSignUp 
            ? 'Join thousands of travelers exploring the world' 
            : 'Sign in to continue your travel journey'
          }
        </p>
      </div>
    </CardHeader>
  );
};

export default AuthHeader;
