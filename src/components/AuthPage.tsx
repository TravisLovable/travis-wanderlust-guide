
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AuthBackground from './auth/AuthBackground';
import AuthNavigationButtons from './auth/AuthNavigationButtons';
import AuthHeader from './auth/AuthHeader';
import AuthForm from './auth/AuthForm';
import SocialLogin from './auth/SocialLogin';
import AuthToggle from './auth/AuthToggle';

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in/sign up logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <AuthBackground />

      {/* Navigation Buttons */}
      <AuthNavigationButtons onBack={onBack} />

      {/* Main Auth Card */}
      <Card className="w-full max-w-md bg-black/40 border border-white/20 backdrop-blur-xl shadow-2xl">
        <AuthHeader isSignUp={isSignUp} />
        
        <CardContent className="space-y-6">
          <AuthForm
            isSignUp={isSignUp}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />

          <SocialLogin />

          <AuthToggle
            isSignUp={isSignUp}
            onToggle={() => setIsSignUp(!isSignUp)}
          />
        </CardContent>
      </Card>

      {/* Bottom Quote */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white/60 text-sm italic max-w-md">
          "The world is a book and those who do not travel read only one page."
        </p>
        <p className="text-white/40 text-xs mt-1">— Saint Augustine</p>
      </div>
    </div>
  );
};

export default AuthPage;
