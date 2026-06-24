import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PrivacyModal from '@/components/PrivacyModal';
import TermsModal from '@/components/TermsModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [legal, setLegal] = useState<null | 'privacy' | 'terms'>(null);
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
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isSent ? 'Check your email' : 'Sign in or create your account'}
          </DialogTitle>
        </DialogHeader>

        {!isSent ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your email — we'll send you a link to sign in or get started.
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
              We sent a link to <span className="font-medium text-foreground">{email}</span>. Click the link in your email to continue.
            </p>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setLegal('privacy')}
            className="underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0"
          >
            Privacy Policy
          </button>
          <span className="px-2" aria-hidden>·</span>
          <button
            type="button"
            onClick={() => setLegal('terms')}
            className="underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0"
          >
            Terms of Service
          </button>
        </div>
      </DialogContent>
    </Dialog>

      <PrivacyModal isOpen={legal === 'privacy'} onClose={() => setLegal(null)} />
      <TermsModal isOpen={legal === 'terms'} onClose={() => setLegal(null)} />
    </>
  );
};

export default AuthModal;
