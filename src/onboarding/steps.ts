// Step 7 — Onboarding wizard step registry (Checkpoint B scaffolding).
//
// The design (design/Travis Onboarding.html) defines 8 steps. Per locked
// decision 1A, sign-in + verify are owned by the existing AuthModal /
// Supabase magic-link flow — they are shown in the rail as pre-completed
// and are NOT navigable here. The wizard owns steps 03–08.

export type StepKind = 'auth' | 'form' | 'summary';

export interface OnboardingStep {
  /** Stable id (mirrors the design's STEPS ids). */
  id: 'signin' | 'verify' | 'identity' | 'passport' | 'airline' | 'style' | 'signal' | 'complete';
  /** Rail label. */
  label: string;
  kind: StepKind;
}

export const STEPS: OnboardingStep[] = [
  { id: 'signin', label: 'Sign in', kind: 'auth' },
  { id: 'verify', label: 'Verify', kind: 'auth' },
  { id: 'identity', label: 'Identity', kind: 'form' },
  { id: 'passport', label: 'Passport', kind: 'form' },
  { id: 'airline', label: 'Airline', kind: 'form' },
  { id: 'style', label: 'Travel style', kind: 'form' },
  { id: 'signal', label: 'Signal', kind: 'form' },
  { id: 'complete', label: 'Complete', kind: 'summary' },
];

/** First index the wizard owns (steps 0–1 are auth, pre-completed). */
export const FIRST_WIZARD_INDEX = STEPS.findIndex((s) => s.kind !== 'auth');
/** Last navigable index (the summary step). */
export const LAST_WIZARD_INDEX = STEPS.length - 1;

export const clampStep = (i: number): number =>
  Math.max(FIRST_WIZARD_INDEX, Math.min(LAST_WIZARD_INDEX, i | 0));
