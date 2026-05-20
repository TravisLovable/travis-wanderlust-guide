// Step 7 — /onboarding route (Checkpoint B scaffolding).
//
// Access rules (no redirect loops):
//   - not authenticated            -> bounce to / (sign-in lives there)
//   - authenticated, already done  -> bounce to / (RequireOnboarding lets / through)
//   - authenticated, needs it      -> render the wizard
//
// Content is PLACEHOLDER only. Real screens land in Checkpoints C/D; this
// proves the shell, navigation, persistence and guard wiring.

import type { CSSProperties } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OnboardingProvider, useOnboarding } from '@/onboarding/OnboardingProvider';
import { OnboardingLayout } from '@/onboarding/OnboardingLayout';
import { STEPS, FIRST_WIZARD_INDEX, LAST_WIZARD_INDEX } from '@/onboarding/steps';

function btn(primary: boolean, disabled = false): CSSProperties {
  return {
    background: disabled ? 'oklch(1 0 0 / 0.12)' : primary ? 'var(--ink)' : 'transparent',
    color: disabled ? 'var(--ink-3)' : primary ? 'var(--bg)' : 'var(--ink-2)',
    border: primary ? 0 : '1px solid var(--hair-strong)',
    padding: '13px 24px',
    borderRadius: 6,
    fontSize: 12,
    letterSpacing: '0.08em',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function Wizard() {
  const { stepIdx, next, back, complete } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const step = STEPS[stepIdx];
  const isFirst = stepIdx === FIRST_WIZARD_INDEX;
  const isLast = stepIdx === LAST_WIZARD_INDEX;

  const onFinish = async () => {
    const res = await complete();
    if (res.ok) {
      navigate('/', { replace: true });
    } else {
      toast({ title: 'Could not finish onboarding', description: res.error, variant: 'destructive' });
    }
  };

  return (
    <OnboardingLayout>
      <div>
        <div
          className="font-travis-mono"
          style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 14 }}
        >
          {String(stepIdx + 1).padStart(2, '0')} · {step.label}
        </div>
        <h2 className="font-travis" style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 20px' }}>
          {step.label}{' '}
          <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>placeholder.</span>
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.5, maxWidth: 560, margin: 0 }}>
          Step {String(stepIdx + 1).padStart(2, '0')} — “{step.label}” content arrives in{' '}
          {step.kind === 'summary' ? 'Checkpoint D' : 'Checkpoint C/D'}. Scaffolding only:
          navigation, localStorage + DB persistence, and the route guard are live.
        </p>

        <div
          className="flex justify-between items-center"
          style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--hair)' }}
        >
          <div>
            {!isFirst && (
              <button className="font-travis-mono" style={btn(false)} onClick={back}>
                ← BACK
              </button>
            )}
          </div>
          {isLast ? (
            <button className="font-travis-mono" style={btn(true)} onClick={onFinish}>
              FINISH →
            </button>
          ) : (
            <button className="font-travis-mono" style={btn(true)} onClick={next}>
              CONTINUE →
            </button>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function Onboarding() {
  const { loading, isAuthenticated, profileLoaded, needsOnboarding } = useAuth();

  if (loading || (isAuthenticated && !profileLoaded)) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!needsOnboarding) return <Navigate to="/" replace />;

  return (
    <OnboardingProvider>
      <Wizard />
    </OnboardingProvider>
  );
}
