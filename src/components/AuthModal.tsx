import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PrivacyModal from '@/components/PrivacyModal';
import TermsModal from '@/components/TermsModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESEND_COOLDOWN = 60; // seconds — respects the provider send rate limit (Supabase email / Twilio Verify SMS)
const CODE_LENGTH = 6; // matches the project's Supabase Auth OTP length (email + SMS)

// Phone sign-in is fixed to +1 (US / Canada) for now: Twilio is on a trial that
// only delivers to numbers pre-verified in its console. International support is a
// future improvement — non-US users sign in with email, still offered on the
// choice screen. A fixed prefix also keeps the value handed to Supabase
// unambiguously E.164.
const PHONE_COUNTRY = '+1';

type Step = 'choice' | 'email' | 'phone' | 'code';
type Channel = 'email' | 'phone';

// Passwordless OTP (6-digit code) sign-in, email or SMS.
//
// Replaces magic links, whose emailRedirectTo resolves to capacitor://localhost
// inside a native webview and dies. verifyOtp returns the session in-place — no
// redirect — and fires the same onAuthStateChange the magic link did, so the
// downstream session/onboarding chain (AuthContext, RequireOnboarding) is reused
// unchanged. On success we just close the modal; the route guard takes over.
//
// A phone sign-in additionally lets IdentityStep pre-fill its (required) phone
// field from the verified number on the auth user — see IdentityStep.tsx.
const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<Step>('choice');
  // Which channel drove the current 'code' screen — picks the verifyOtp type,
  // the resend call, and the "use a different …" copy.
  const [channel, setChannel] = useState<Channel>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // national digits only; the value sent is PHONE_COUNTRY + phone
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [legal, setLegal] = useState<null | 'privacy' | 'terms'>(null);
  const { toast } = useToast();
  const { isDevBypassEnabled, signInAsDevUser } = useAuth();

  const emailValid = !!email.trim() && email.includes('@');
  const phoneValid = phone.length === 10;
  const phoneE164 = `${PHONE_COUNTRY}${phone}`;
  const codeDestination = channel === 'phone' ? `${PHONE_COUNTRY} ${phone}` : email;

  // Resend cooldown tick.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const requestOtp = () =>
    channel === 'email'
      ? supabase.auth.signInWithOtp({ email: email.trim() })
      : supabase.auth.signInWithOtp({ phone: phoneE164 });

  const sendCode = async () => {
    if (channel === 'email' ? !emailValid : !phoneValid) return;
    setIsSending(true);
    try {
      // Email: no emailRedirectTo — the message carries a {{ .Token }} code, not a
      // link. Phone: Supabase relays to Twilio Verify, which sends the SMS.
      const { error } = await requestOtp();
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
      const { error } = await requestOtp();
      if (error) throw error;
      setCode('');
      setResendIn(RESEND_COOLDOWN);
      toast({ title: 'New code sent', description: `Check ${codeDestination} for a fresh code.` });
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
      const { error } =
        channel === 'email'
          ? await supabase.auth.verifyOtp({ email: email.trim(), token: value, type: 'email' })
          : await supabase.auth.verifyOtp({ phone: phoneE164, token: value, type: 'sms' });
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
      setStep('choice');
      setChannel('email');
      setEmail('');
      setPhone('');
      setCode('');
      setIsSending(false);
      setIsVerifying(false);
      setResendIn(0);
    }, 200);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {step === 'code' ? 'Enter your code' : 'Sign in or create your account'}
          </DialogTitle>
        </DialogHeader>

        {step === 'choice' && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Choose how to sign in or get started — we'll send you a 6-digit code.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                setChannel('email');
                setStep('email');
              }}
            >
              Continue with email
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setChannel('phone');
                setStep('phone');
              }}
            >
              Continue with phone
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
        )}

        {step === 'email' && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your email — we'll send you a 6-digit code to sign in or get started.
            </p>
            <div>
              <Label htmlFor="auth-email" className="sr-only">Email</Label>
              <Input
                id="auth-email"
                type="email"
                className="text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <Button onClick={sendCode} className="w-full" disabled={isSending || !emailValid}>
              {isSending ? 'Sending...' : 'Send code'}
            </Button>
            <button
              type="button"
              onClick={() => setStep('choice')}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0"
            >
              ← Other sign-in options
            </button>
          </div>
        )}

        {step === 'phone' && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Enter your mobile number — we'll text you a 6-digit code. US &amp; Canada numbers only for now.
            </p>
            <div>
              <Label htmlFor="auth-phone" className="sr-only">Phone number</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  {PHONE_COUNTRY}
                </span>
                <Input
                  id="auth-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  className="rounded-l-none text-foreground"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                  placeholder="5551234567"
                  autoFocus
                />
              </div>
            </div>
            <Button onClick={sendCode} className="w-full" disabled={isSending || !phoneValid}>
              {isSending ? 'Sending...' : 'Send code'}
            </Button>
            <button
              type="button"
              onClick={() => setStep('choice')}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0"
            >
              ← Other sign-in options
            </button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{codeDestination}</span>. Enter it below.
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={CODE_LENGTH}
                value={code}
                onChange={setCode}
                onComplete={(value) => verifyCode(value)}
                autoComplete="one-time-code"
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
                  setStep(channel);
                  setCode('');
                }}
                className="underline underline-offset-2 hover:text-foreground bg-transparent border-0 cursor-pointer p-0"
              >
                {channel === 'phone' ? 'Use a different number' : 'Use a different email'}
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
