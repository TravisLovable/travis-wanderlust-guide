// Step 7 — Step 03 Identity (Checkpoint C).
//
// Captures first/last name and home city into the onboarding draft. Renders
// form fields only; the heading, kicker and nav buttons are layout chrome
// owned by Onboarding.tsx. There is no first_name/last_name column — the
// provider composes full_name from these two inputs (see mapDataToUsersRow).
//
// Phone collection moved out of onboarding — it's asked later, in the
// notification system's setup flow, tied to the moment someone enables
// alerts. `phone`/`phoneCountryCode` stay defined on OnboardingData and
// mapped to their users columns (OnboardingProvider) for that future flow to
// reuse; this step just no longer writes to them.

import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, TextField } from './fields';
import { CityAutocomplete } from '@/onboarding/CityAutocomplete';

export default function IdentityStep() {
  const { data, patch } = useOnboarding();

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
