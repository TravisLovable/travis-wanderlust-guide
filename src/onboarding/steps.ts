// Step 7 — Onboarding wizard step registry (Checkpoint B scaffolding).
//
// The design (design/Travis Onboarding.html) originally defined 8 steps;
// Travel Style and Signal were later removed entirely (Travel Style:
// write-only data nothing in the app read; Signal: granular notification
// preferences for a product the user hasn't experienced yet produce a
// meaningless signal either way, and Apple's HIG advises against requesting
// notification permission at first launch anyway — that flow belongs at a
// contextually obvious moment instead). Per locked decision 1A, sign-in +
// verify are owned by the existing AuthModal / Supabase magic-link flow —
// they stay in this registry for index/resume bookkeeping
// (FIRST_WIZARD_INDEX, stepIdx persistence) but are hidden from the rail
// entirely and are NOT navigable here. The wizard owns steps 1–4 (auth is a
// separate pre-onboarding phase and isn't counted in the visible total).

export type StepKind = 'auth' | 'form' | 'summary';

export interface OnboardingStep {
  /** Stable id (mirrors the design's STEPS ids). */
  id: 'signin' | 'verify' | 'identity' | 'passport' | 'airline' | 'complete';
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
  { id: 'complete', label: 'Complete', kind: 'summary' },
];

/** First index the wizard owns (steps 0–1 are auth, pre-completed). */
export const FIRST_WIZARD_INDEX = STEPS.findIndex((s) => s.kind !== 'auth');
/** Last navigable index (the summary step). */
export const LAST_WIZARD_INDEX = STEPS.length - 1;

export const clampStep = (i: number): number =>
  Math.max(FIRST_WIZARD_INDEX, Math.min(LAST_WIZARD_INDEX, i | 0));

/** 1-based step number for the visible "Step N" counter — wizard steps only, auth excluded. */
export const displayStep = (i: number): number => i - FIRST_WIZARD_INDEX + 1;
