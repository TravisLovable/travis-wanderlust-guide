import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESEND_COOLDOWN = 60; // seconds — respects Supabase's email send rate limit
const CODE_LENGTH = 6;

// Email OTP (6-digit code) sign-in.
//
// Replaces magic links, whose emailRedirectTo resolves to capacitor://localhost
// inside a native webview and dies. verifyOtp returns the session in-place — no
// redirect — and fires the same onAuthStateChange the magic link did, so the
// downstream session/onboarding chain (AuthContext, RequireOnboarding) is reused
// unchanged. On success we just close the modal; the route guard takes over.
const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const { toast } = useToast();
  const { isDevBypassEnabled, signInAsDevUser } = useAuth();

  // Resend cooldown tick.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const sendCode = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setIsSending(true);
    try {
      // No emailRedirectTo: the email now carries a {{ .Token }} code, not a link.
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      setStep('code');
      setCode('');
      setResendIn(RESEND_COOLDOWN);
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsSending(false);
  };

  const resendCode = async () => {
    if (resendIn > 0 || isSending) return;
    setIsSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      setCode('');
      setResendIn(RESEND_COOLDOWN);
      toast({ title: 'New code sent', description: `Check ${email} for a fresh code.` });
    } catch (error: any) {
      toast({
        title: 'Could not resend code',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsSending(false);
  };

  const verifyCode = async (value: string = code) => {
    if (value.length !== CODE_LENGTH || isVerifying) return;
    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: value,
        type: 'email',
      });
      if (error) throw error;
      // Session is set + onAuthStateChange fires; close and let the route guard
      // (RequireOnboarding / needsOnboarding) take it from here.
      handleClose();
    } catch (error: any) {
      setCode('');
      toast({
        title: 'Invalid or expired code',
        description: error.message ?? 'Check the code and try again, or resend.',
        variant: 'destructive',
      });
    }
    setIsVerifying(false);
  };

  const handleClose = () => {
    onClose();
    // Reset after the close animation so the next open starts clean.
    setTimeout(() => {
      setStep('email');
      setEmail('');
      setCode('');
      setIsSending(false);
      setIsVerifying(false);
      setResendIn(0);
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {step === 'code' ? 'Enter your code' : 'Sign in or create your account'}
          </DialogTitle>
        </DialogHeader>

        {step === 'email' ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your email — we'll send you a 6-digit code to sign in or get started.
            </p>
            <div>
              <Label htmlFor="auth-email" className="sr-only">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <Button
              onClick={sendCode}
              className="w-full"
              disabled={isSending || !email.trim() || !email.includes('@')}
            >
              {isSending ? 'Sending...' : 'Send code'}
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
              We sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{email}</span>. Enter it below.
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={CODE_LENGTH}
                value={code}
                onChange={setCode}
                onComplete={(value) => verifyCode(value)}
                autoFocus
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }, (_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              onClick={() => verifyCode()}
              className="w-full"
              disabled={isVerifying || code.length !== CODE_LENGTH}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                }}
                className="underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0"
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={resendIn > 0 || isSending}
                className="underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0 disabled:no-underline disabled:cursor-default disabled:opacity-70"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
