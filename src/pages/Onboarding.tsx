// Step 7 — /onboarding route.
//
// Access rules (no redirect loops):
//   - not authenticated            -> bounce to / (sign-in lives there)
//   - authenticated, already done  -> bounce to / (RequireOnboarding lets / through)
//   - authenticated, needs it      -> render the wizard
//
// Screens 1–5 are forms; 6 (Complete) is a terminal recap that owns its own
// ENTER TRAVIS action and renders no Back/Continue footer.

import type { CSSProperties, ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  OnboardingProvider,
  useOnboarding,
  type OnboardingData,
} from '@/onboarding/OnboardingProvider';
import { OnboardingLayout } from '@/onboarding/OnboardingLayout';
import { STEPS, FIRST_WIZARD_INDEX } from '@/onboarding/steps';
import IdentityStep from '@/onboarding/steps/IdentityStep';
import PassportStep from '@/onboarding/steps/PassportStep';
import AirlineStep from '@/onboarding/steps/AirlineStep';
import TravelStyleStep from '@/onboarding/steps/TravelStyleStep';
import SignalStep from '@/onboarding/steps/SignalStep';
import CompleteStep from '@/onboarding/steps/CompleteStep';

// Real content screens. Step 08 (complete) is handled separately below — it has
// no standard footer — so it is intentionally absent from this map.
const STEP_BODY: Record<string, ComponentType> = {
  identity: IdentityStep,
  passport: PassportStep,
  airline: AirlineStep,
  style: TravelStyleStep,
  signal: SignalStep,
};

// Heading chrome per real step: bold clause + a muted continuation, matching
// the rail's "Travis works better when it knows you." treatment.
const STEP_COPY: Record<string, { strong: string; muted: string; sub: string }> = {
  identity: {
    strong: 'The basics,',
    muted: 'first.',
    sub: 'Your name and primary departure city.',
  },
  passport: {
    strong: 'Which passport',
    muted: 'do you carry?',
    sub: 'It drives every visa, entry, and border-rule call Travis makes for you.',
  },
  airline: {
    strong: 'Who do',
    muted: 'you fly?',
    sub: 'Pick up to three carriers and Travis prioritizes their fares, alerts, and lounges.',
  },
  style: {
    strong: 'How do',
    muted: 'you move?',
    sub: 'Frequency, pace, and the kind of trips that pull you in.',
  },
  signal: {
    strong: 'What should we',
    muted: 'ping you about?',
    sub: 'Travis only sends signals you opt into. Change these anytime.',
  },
};

/** Whether the current step's required fields are filled (gates Continue). */
function isStepComplete(stepId: string, data: OnboardingData): boolean {
  if (stepId === 'identity') {
    return Boolean(
      data.firstName?.trim() && data.lastName?.trim() && data.homeCity?.trim(),
    );
  }
  if (stepId === 'passport') return Boolean(data.passportCountry);
  if (stepId === 'style') return Boolean(data.travelFrequency && data.travelPace);
  // Airline and signal are optional; complete has its own CTA, not Continue.
  return true;
}

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
  const { stepIdx, data, next, back } = useOnboarding();
  const step = STEPS[stepIdx];
  const isFirst = stepIdx === FIRST_WIZARD_INDEX;
  const isComplete = step.id === 'complete';

  const Body = STEP_BODY[step.id];
  const copy = STEP_COPY[step.id];
  const canContinue = isStepComplete(step.id, data);

  return (
    <OnboardingLayout>
      <div>
        {isComplete ? (
          // Terminal screen: owns its heading + ENTER TRAVIS CTA, no footer.
          <CompleteStep />
        ) : (
          Body &&
          copy && (
            <>
              <h2 className="font-travis" style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 18px' }}>
                {copy.strong}{' '}
                <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>{copy.muted}</span>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.5, maxWidth: 560, margin: '0 0 38px' }}>
                {copy.sub}
              </p>
              <Body />
            </>
          )
        )}

        {!isComplete && (
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
            <button
              className="font-travis-mono"
              style={btn(true, !canContinue)}
              disabled={!canContinue}
              onClick={() => canContinue && next()}
            >
              CONTINUE →
            </button>
          </div>
        )}
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
