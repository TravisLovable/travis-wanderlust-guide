// Step 7 — route guard (Checkpoint B).
//
// Wraps protected app routes (/ and /search). An authenticated user who
// has not completed onboarding is bounced to /onboarding. Unauthenticated
// visitors pass straight through — Index/Home owns the sign-in UX, so the
// guard must not interfere with the logged-out experience.

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireOnboarding({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated, profileLoaded, needsOnboarding } = useAuth();

  // Still resolving session, or profile fetch in flight for a logged-in user.
  if (loading || (isAuthenticated && !profileLoaded)) return null;

  if (isAuthenticated && needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
