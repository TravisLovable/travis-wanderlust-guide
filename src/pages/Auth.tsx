
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated and email is confirmed
  useEffect(() => {
    if (user && user.email_confirmed_at) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        setMessage('Please check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show message if user is not confirmed
  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gray-400 dark:bg-black flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-black border-gray-600 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Email Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Please check your email and click the confirmation link to verify your account.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
            <Button
              onClick={() => supabase.auth.signOut()}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-400 dark:bg-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-black border-gray-600 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            {error && (
              <div className="text-red-400 bg-red-400/10 text-sm p-2 rounded">
                {error}
              </div>
            )}
            {message && (
              <div className="text-green-400 bg-green-400/10 text-sm p-2 rounded">
                {message}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
