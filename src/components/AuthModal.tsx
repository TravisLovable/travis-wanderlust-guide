
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onSignInSuccess }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSignUp = async () => {
    if (signUpStep < 3) {
      setSignUpStep(signUpStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
            full_name: `${signUpData.firstName} ${signUpData.lastName}`
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a verification link to complete your registration.",
      });
      
      onClose();
      setSignUpStep(1);
      setSignUpData({ firstName: '', lastName: '', email: '', password: '' });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      onSignInSuccess();
      onClose();
      setSignInData({ email: '', password: '' });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const canProceedSignUp = () => {
    switch (signUpStep) {
      case 1:
        return signUpData.firstName.trim() && signUpData.lastName.trim();
      case 2:
        return signUpData.email.trim() && signUpData.email.includes('@');
      case 3:
        return signUpData.password.length >= 6;
      default:
        return false;
    }
  };

  const renderSignUpStep = () => {
    switch (signUpStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={signUpData.firstName}
                onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={signUpData.lastName}
                onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter your last name"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={signUpData.email}
              onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={signUpData.password}
              onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password (min 6 characters)"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Travis</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={signInData.email}
                onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={signInData.password}
                onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
              />
            </div>
            <Button 
              onClick={handleSignIn} 
              className="w-full" 
              disabled={isLoading || !signInData.email || !signInData.password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="text-sm text-muted-foreground mb-4">
              Step {signUpStep} of 3
            </div>
            
            {renderSignUpStep()}
            
            <div className="flex space-x-2">
              {signUpStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setSignUpStep(signUpStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleSignUp} 
                className="flex-1"
                disabled={isLoading || !canProceedSignUp()}
              >
                {isLoading ? "Processing..." : signUpStep === 3 ? "Create Account" : "Next"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
