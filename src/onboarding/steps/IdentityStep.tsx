// Step 7 — Step 03 Identity (Checkpoint C).
//
// Captures first/last name, phone, and primary departure city into the
// onboarding draft. Renders form fields only; the heading, kicker and nav
// buttons are layout chrome owned by Onboarding.tsx. There is no
// first_name/last_name column — the provider composes full_name from these
// two inputs (see mapDataToUsersRow).
//
// Phone was previously removed from this step and deferred to a future
// notification-enablement flow — that's reversed here, for a different
// reason: the Legal step's optional SMS opt-in needs a real number to
// reference, and Legal comes later in this same wizard, so the number has
// to be captured here first.

import { useEffect, useRef } from 'react';
import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Field, TextField, SelectField, type SelectOption } from './fields';
import { CityAutocomplete } from '@/onboarding/CityAutocomplete';

/** As-you-type grouping for display only — data.phone always stays digits-only. */
function formatPhoneDisplay(digits: string): string {
  const core = digits.slice(0, 10);
  const extra = digits.slice(10);
  let formatted = core;
  if (core.length > 6) formatted = `(${core.slice(0, 3)}) ${core.slice(3, 6)}-${core.slice(6)}`;
  else if (core.length > 3) formatted = `(${core.slice(0, 3)}) ${core.slice(3)}`;
  return extra ? `${formatted} ${extra}` : formatted;
}

// Minimum required set per the spec, value = E.164 dial code.
const DIAL_CODES: SelectOption[] = [
  { value: '+1', label: '+1', flag: '🇺🇸', hint: 'US / CA' },
  { value: '+44', label: '+44', flag: '🇬🇧', hint: 'UK' },
  { value: '+33', label: '+33', flag: '🇫🇷', hint: 'FR' },
  { value: '+49', label: '+49', flag: '🇩🇪', hint: 'DE' },
  { value: '+34', label: '+34', flag: '🇪🇸', hint: 'ES' },
  { value: '+351', label: '+351', flag: '🇵🇹', hint: 'PT' },
  { value: '+39', label: '+39', flag: '🇮🇹', hint: 'IT' },
  { value: '+81', label: '+81', flag: '🇯🇵', hint: 'JP' },
  { value: '+52', label: '+52', flag: '🇲🇽', hint: 'MX' },
  { value: '+55', label: '+55', flag: '🇧🇷', hint: 'BR' },
];

/**
 * Split a verified E.164 number — as Supabase stores it on user.phone: digits
 * only, no '+' (e.g. "19133139406") — into the onboarding shape: a dial code
 * from DIAL_CODES plus the national remainder (digits only, matching how
 * data.phone is stored). Longest known code wins; falls back to +1 (stripping a
 * leading NANP "1" when present) so the result is always usable.
 */
function splitVerifiedPhone(e164Digits: string): { phoneCountryCode: string; phone: string } {
  const digits = e164Digits.replace(/\D/g, '');
  const codes = DIAL_CODES.map((c) => c.value.replace('+', '')).sort((a, b) => b.length - a.length);
  const match = codes.find((c) => digits.startsWith(c));
  if (match) return { phoneCountryCode: `+${match}`, phone: digits.slice(match.length) };
  if (digits.length === 11 && digits.startsWith('1')) return { phoneCountryCode: '+1', phone: digits.slice(1) };
  return { phoneCountryCode: '+1', phone: digits };
}

export default function IdentityStep() {
  const { data, patch } = useOnboarding();
  const { user } = useAuth();

  // Dial code has a sensible default; persist it so the saved row never lacks a
  // code even if the user never opens the select.
  useEffect(() => {
    if (!data.phoneCountryCode) patch({ phoneCountryCode: '+1' });
  }, [data.phoneCountryCode, patch]);

  // One-shot pre-fill from a phone sign-in. Supabase puts the verified number on
  // user.phone (E.164 digits, no '+') ONLY for SMS sign-ins — email sign-ins and
  // the dev-bypass mock user leave it undefined, so this no-ops for them and the
  // field stays blank exactly as before. Guards, all required:
  //   - ref latch: fire at most once per mount, so a later edit is never undone
  //   - !data.phone: never clobber a typed value or one restored from the draft
  //   - user?.phone: only phone sign-ins carry a number to pre-fill
  // Same "don't clobber user input" principle as the dial-code default above.
  const prefilledFromAuth = useRef(false);
  useEffect(() => {
    if (prefilledFromAuth.current || data.phone || !user?.phone) return;
    prefilledFromAuth.current = true;
    patch(splitVerifiedPhone(user.phone));
  }, [data.phone, user?.phone, patch]);

  return (
    <div className="flex flex-col" style={{ gap: 30, maxWidth: 580 }}>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 28 }}>
        <Field label="First name" htmlFor="onb-first">
          <TextField
            id="onb-first"
            autoComplete="given-name"
            autoFocus
            value={data.firstName ?? ''}
            placeholder="Jordan"
            onChange={(v) => patch({ firstName: v })}
          />
        </Field>
        <Field label="Last name" htmlFor="onb-last">
          <TextField
            id="onb-last"
            autoComplete="family-name"
            value={data.lastName ?? ''}
            placeholder="Rivera"
            onChange={(v) => patch({ lastName: v })}
          />
        </Field>
      </div>

      <Field label="Phone" htmlFor="onb-phone">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <SelectField
            id="onb-dial"
            compact
            value={data.phoneCountryCode ?? '+1'}
            options={DIAL_CODES}
            onChange={(v) => patch({ phoneCountryCode: v })}
          />
          <div style={{ flex: 1 }}>
            <TextField
              id="onb-phone"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={20}
              value={formatPhoneDisplay(data.phone ?? '')}
              placeholder="(555) 123-4567"
              // Display is grouped as-you-type; the stored value stays digits-only
              // (column stores the E.164 local part) — formatting is display-layer only.
              onChange={(v) => patch({ phone: v.replace(/[^\d]/g, '') })}
            />
          </div>
        </div>
      </Field>

      <Field label="Primary departure city" htmlFor="onb-city">
        <CityAutocomplete
          id="onb-city"
          value={data.homeCity ?? ''}
          placeholder="Start typing a city…"
          onChange={(v) => patch({ homeCity: v })}
          onSelectedChange={(selected) => patch({ homeCitySelected: selected })}
        />
      </Field>
    </div>
  );
}
