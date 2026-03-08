import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();
  const { isDevBypassEnabled, signInAsDevUser } = useAuth();

  const handleSendLink = async () => {
    if (!email.trim() || !email.includes('@')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setEmail('');
      setIsSent(false);
      setIsLoading(false);
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isSent ? 'Check your email' : 'Sign in to Travis'}
          </DialogTitle>
        </DialogHeader>

        {!isSent ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a sign-in link.
            </p>
            <div>
              <Label htmlFor="magic-email" className="sr-only">Email</Label>
              <Input
                id="magic-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <Button
              onClick={handleSendLink}
              className="w-full"
              disabled={isLoading || !email.trim() || !email.includes('@')}
            >
              {isLoading ? 'Sending...' : 'Send magic link'}
            </Button>
            {isDevBypassEnabled && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 text-muted-foreground"
                onClick={() => signInAsDevUser()}
              >
                Dev: Sign in without email (bypass rate limit)
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>. Click the link in your email to continue.
            </p>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
