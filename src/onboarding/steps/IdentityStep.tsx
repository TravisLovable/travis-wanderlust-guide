// Step 7 — Step 03 Identity (Checkpoint C).
//
// Captures first/last name, phone (dial code + national number) and home city
// into the onboarding draft. Renders form fields only; the heading, kicker and
// nav buttons are layout chrome owned by Onboarding.tsx. There is no
// first_name/last_name column — the provider composes full_name from these two
// inputs (see mapDataToUsersRow).

import { useEffect } from 'react';
import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, TextField, SelectField, type SelectOption } from './fields';
import { CityAutocomplete } from '@/onboarding/CityAutocomplete';

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

export default function IdentityStep() {
  const { data, patch } = useOnboarding();

  // Dial code has a sensible default; persist it so the saved row never lacks a
  // code even if the user never opens the select.
  useEffect(() => {
    if (!data.phoneCountryCode) patch({ phoneCountryCode: '+1' });
  }, [data.phoneCountryCode, patch]);

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
              maxLength={15}
              value={data.phone ?? ''}
              placeholder="555 123 4567"
              // Numeric mask: keep digits only (column stores the E.164 local part).
              onChange={(v) => patch({ phone: v.replace(/[^\d]/g, '') })}
            />
          </div>
        </div>
      </Field>

      <Field label="Home city" htmlFor="onb-city">
        <CityAutocomplete
          id="onb-city"
          value={data.homeCity ?? ''}
          placeholder="Start typing a city…"
          onChange={(v) => patch({ homeCity: v })}
        />
      </Field>
    </div>
  );
}
