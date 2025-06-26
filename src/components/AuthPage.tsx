
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSignIn = async () => {
    console.log('Attempting sign in with:', formData.email);
    
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      
      if (signInError.message.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.');
      } else if (signInError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(signInError.message || 'Failed to sign in. Please try again.');
      }
      return;
    }

    if (data.user) {
      console.log('Sign in successful:', data.user.id);
      setSuccess('Sign in successful! Redirecting...');
      
      // Wait a moment for the success message to show, then redirect back to homepage
      setTimeout(() => {
        if (onBack) {
          onBack();
        }
      }, 1500);
    }
  };

  const handleSignUp = async () => {
    console.log('Starting sign up process for:', formData.email);

    try {
      // Only create auth account - no profile data yet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(authError.message || 'Failed to create account');
        }
        return;
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.');
        return;
      }

      console.log('Auth account created successfully. User ID:', authData.user.id);
      
      // Show verification screen
      setVerificationEmail(formData.email);
      setShowVerificationScreen(true);
      
      // Clear the form
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignUp = () => {
    setShowVerificationScreen(false);
    setVerificationEmail('');
    setIsSignUp(false);
  };

  // Verification Screen
  if (showVerificationScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center p-6">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToSignUp}
          className="absolute top-6 left-6 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {/* Verification Card */}
        <Card className="w-full max-w-md bg-black/40 border border-white/20 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Check Your Email
              </CardTitle>
              <p className="text-white/70">
                We've sent a confirmation email to
              </p>
              <p className="text-blue-400 font-medium mt-1">
                {verificationEmail}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/80 text-sm">
                  Click the verification link in your email to activate your account and complete your travel profile setup.
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <p className="text-white/60 text-sm">
                  Didn't receive the email? Check your spam folder or try signing up again.
                </p>
                
                <Button
                  onClick={handleBackToSignUp}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  Back to Sign Up
                </Button>
              </div>
            </div>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

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

      {/* Main Auth Card */}
      <Card className="w-full max-w-md bg-black/40 border border-white/20 backdrop-blur-xl shadow-2xl">
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
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500 bg-green-500/10">
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-12 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="text-center pt-4">
            <p className="text-white/60">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                disabled={isLoading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
            {isSignUp && (
              <p className="text-white/50 text-xs mt-2">
                After email verification, you'll complete your travel preferences.
              </p>
            )}
          </div>

          {/* Forgot Password Link (Sign In Only) */}
          {!isSignUp && (
            <div className="text-center">
              <button 
                className="text-white/60 hover:text-white/80 text-sm transition-colors"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}
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
