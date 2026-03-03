import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';

const isDevBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

/** Mock user/session/profile for dev when email rate limit would be hit. Not a real Supabase session. */
function getDevBypassAuth() {
  const devUserId = 'dev-bypass-user-id';
  const devEmail = 'dev@localhost';
  const mockUser = {
    id: devUserId,
    email: devEmail,
    user_metadata: { full_name: 'Dev User', first_name: 'Dev', last_name: 'User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
  const mockSession = { user: mockUser, access_token: '', refresh_token: '', expires_in: 3600, expires_at: 0 } as Session;
  const mockProfile = {
    id: 'dev-profile-id',
    auth_id: devUserId,
    email: devEmail,
    full_name: 'Dev User',
    country_data: { code: 'US', name: 'United States', flag: 'https://flagcdn.com/us.svg', region: 'Americas' },
    onboarding_completed: true,
    preferred_airline: null,
    travel_type: null,
    profile_photo_url: null,
    frequent_flyer_number: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { mockUser, mockSession, mockProfile };
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: any;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isDevBypassEnabled: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  signInAsDevUser: () => void;
  updateProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authId: string) => {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    setUserProfile(profile);

    if (!profile || !profile.onboarding_completed) {
      setIsOnboardingOpen(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  const signInAsDevUser = () => {
    if (!isDevBypassEnabled) return;
    // Clear real Supabase session so function invokes don't send an expired/wrong Bearer JWT (which causes 401 Invalid JWT)
    supabase.auth.signOut().catch(() => {});
    const { mockUser, mockSession, mockProfile } = getDevBypassAuth();
    setSession(mockSession);
    setUser(mockUser);
    setUserProfile(mockProfile);
    setIsAuthModalOpen(false);
  };

  const value: AuthContextValue = {
    user,
    session,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAuthModalOpen,
    isDevBypassEnabled: !!isDevBypassEnabled,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
    signOut,
    signInAsDevUser,
    updateProfile: (profile) => setUserProfile(profile),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
