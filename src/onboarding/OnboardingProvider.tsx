// Step 7 — Onboarding state container (Checkpoint B scaffolding).
//
// Responsibilities:
//  - hold step index + captured data
//  - localStorage buffer so a refresh / tab-close resumes in place
//  - progressive, debounced write to public.users (real sessions only)
//  - completion: flip onboarding_completed and clear the buffer
//
// NOTE (Checkpoint B): screens are placeholders, so `data` is effectively
// empty here. The persistence pipeline is real and fully wired; Checkpoints
// C/D populate `data`, Checkpoint E consumes it. `mapDataToUsersRow` already
// targets the columns added in Checkpoint A.

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { FIRST_WIZARD_INDEX, LAST_WIZARD_INDEX, clampStep } from './steps';

const STEP_KEY = 'travis:onboard:step';
const DATA_KEY = 'travis:onboard:data';
const DEBOUNCE_MS = 800;

/** Captured onboarding data. All optional — populated across Checkpoints C/D. */
export interface OnboardingData {
  /** Composed into full_name on save (there are no first/last columns). */
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  phoneCountryCode?: string;
  homeCity?: string;
  /**
   * True once homeCity was set by picking a real Places suggestion; false the
   * moment the user types after that (invalidating the prior pick); undefined
   * for drafts saved before this flag existed — treated as valid (grandfathered)
   * by the identity step's Continue gate, since there's no way to know
   * retroactively. Client-side only — not written to the users table.
   */
  homeCitySelected?: boolean;
  passportCountry?: string;
  airlines?: string[];
  /**
   * Per-airline tier: IATA code -> tier key (see frequentFlyerPrograms.ts).
   * Matches the frequent_flyer_status_by_airline jsonb column 1:1. Replaces
   * the old single global frequentFlyerStatus, which had no way to record
   * which airline a tier belonged to. The legacy frequent_flyer_status
   * column/value is left alone — not read, not written, not migrated.
   */
  frequentFlyerStatusByAirline?: Record<string, string>;
  alertPreferences?: Record<string, boolean>;
}

type UsersUpdate = Database['public']['Tables']['users']['Update'];

/** Map captured data → public.users columns (Checkpoint A schema). */
function mapDataToUsersRow(d: OnboardingData): UsersUpdate {
  const row: UsersUpdate = {};
  // No first_name/last_name columns exist (Checkpoint A added none), so the
  // Identity step's two inputs compose full_name. Fall back to a pre-set
  // fullName if first/last were never captured.
  if (d.firstName !== undefined || d.lastName !== undefined) {
    const full = [d.firstName, d.lastName].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
    row.full_name = full || null;
  } else if (d.fullName !== undefined) {
    row.full_name = d.fullName || null;
  }
  if (d.phone !== undefined) row.phone = d.phone || null;
  if (d.phoneCountryCode !== undefined) row.phone_country_code = d.phoneCountryCode || null;
  if (d.homeCity !== undefined) row.home_city = d.homeCity || null;
  if (d.passportCountry !== undefined) row.passport_country = d.passportCountry || null;
  if (d.airlines !== undefined) row.airlines = d.airlines.length ? d.airlines : null;
  // frequent_flyer_status (legacy, global) is intentionally never written here.
  if (d.frequentFlyerStatusByAirline !== undefined) {
    row.frequent_flyer_status_by_airline = d.frequentFlyerStatusByAirline;
  }
  if (d.alertPreferences !== undefined) row.alert_preferences = d.alertPreferences;
  return row;
}

interface OnboardingContextValue {
  stepIdx: number;
  data: OnboardingData;
  /** 'idle' | 'saving' | 'saved' | 'local-only' — surfaced in the toolbar. */
  saveState: 'idle' | 'saving' | 'saved' | 'local-only';
  patch: (p: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
  goTo: (i: number) => void;
  complete: () => Promise<{ ok: boolean; error?: string }>;
  /** Abandon onboarding: discard the local draft and sign out. */
  exit: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

function readStep(): number {
  try {
    const raw = localStorage.getItem(STEP_KEY);
    return raw == null ? FIRST_WIZARD_INDEX : clampStep(Number(raw));
  } catch {
    return FIRST_WIZARD_INDEX;
  }
}
function readData(): OnboardingData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : {};
  } catch {
    return {};
  }
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, session, updateProfile, userProfile, signOut } = useAuth();

  const [stepIdx, setStepIdx] = useState<number>(readStep);
  const [data, setData] = useState<OnboardingData>(readData);
  const [saveState, setSaveState] = useState<OnboardingContextValue['saveState']>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A real Supabase session (not the dev-bypass mock) is required for RLS-safe DB writes.
  const canPersistDb = !!session?.access_token && !!user?.id && user.id !== 'dev-bypass-user-id';
  const authId = user?.id ?? null;

  // localStorage buffer — always on, survives refresh/close.
  useEffect(() => {
    try { localStorage.setItem(STEP_KEY, String(stepIdx)); } catch { /* quota / private mode */ }
  }, [stepIdx]);
  useEffect(() => {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* quota / private mode */ }
  }, [data]);

  // Progressive debounced DB write (real sessions only). Uses UPDATE-or-INSERT
  // rather than .upsert({ onConflict: 'auth_id' }): the auth_id unique index is
  // partial (... WHERE auth_id IS NOT NULL), which PostgREST's onConflict can't
  // target, so the upsert 400s (see complete()). Errors only flip saveState to
  // 'idle' — this is a background op, so no toast.
  useEffect(() => {
    if (!canPersistDb || !authId) {
      setSaveState('local-only');
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setSaveState('saving');
    timer.current = setTimeout(async () => {
      const row = { onboarding_completed: false, ...mapDataToUsersRow(data) };
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update(row)
        .eq('auth_id', authId)
        .select()
        .maybeSingle();
      let error = updateError;
      if (!updateError && !updated) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({ auth_id: authId, ...row });
        error = insertError;
      }
      setSaveState(error ? 'idle' : 'saved');
    }, DEBOUNCE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [data, canPersistDb, authId]);

  const patch = useCallback((p: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...p }));
  }, []);
  const next = useCallback(() => setStepIdx((i) => clampStep(i + 1)), []);
  const back = useCallback(() => setStepIdx((i) => clampStep(i - 1)), []);
  const goTo = useCallback((i: number) => setStepIdx(clampStep(i)), []);

  const complete = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (canPersistDb && authId) {
      // The unique index on auth_id is PARTIAL (... WHERE auth_id IS NOT NULL),
      // so PostgREST's .upsert({ onConflict: 'auth_id' }) has no arbiter index
      // to target and 400s ("no unique or exclusion constraint matching the
      // ON CONFLICT specification"). Do a constraint-free UPDATE ... WHERE
      // auth_id = uid instead, falling back to INSERT when no row exists yet
      // (RLS permits both for the owner). .maybeSingle() so "no row matched"
      // returns null rather than erroring.
      const row = { onboarding_completed: true, ...mapDataToUsersRow(data) };
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update(row)
        .eq('auth_id', authId)
        .select()
        .maybeSingle();
      if (updateError) return { ok: false, error: updateError.message };
      if (!updated) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({ auth_id: authId, ...row });
        if (insertError) return { ok: false, error: insertError.message };
      }
      updateProfile({ ...(userProfile ?? {}), onboarding_completed: true });
    } else {
      // Dev-bypass / no real session: reflect completion in context only.
      updateProfile({ ...(userProfile ?? {}), onboarding_completed: true });
    }
    try {
      localStorage.removeItem(STEP_KEY);
      localStorage.removeItem(DATA_KEY);
    } catch { /* ignore */ }
    return { ok: true };
  }, [canPersistDb, authId, data, updateProfile, userProfile]);

  // Exit: discard the in-progress draft so the next sign-in starts fresh, then
  // sign out. The /onboarding guard sees the now-unauthenticated user and sends
  // them to the signed-out home (a plain "go home" while logged in would just
  // bounce back here via RequireOnboarding).
  const exit = useCallback(async () => {
    try {
      localStorage.removeItem(STEP_KEY);
      localStorage.removeItem(DATA_KEY);
    } catch { /* ignore */ }
    await signOut();
  }, [signOut]);

  const value: OnboardingContextValue = {
    stepIdx, data, saveState, patch, next, back, goTo, complete, exit,
  };
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}

export { FIRST_WIZARD_INDEX, LAST_WIZARD_INDEX };
