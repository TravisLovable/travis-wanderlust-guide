// Step 7 — Step 04 Passport (Checkpoint C).
//
// Single required field: passport country, stored as the country *name* (see
// the users.passport_country column comment). Country list is the shared FLAG
// data via src/onboarding/countries.ts — same source the visa cards render.

import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { COUNTRIES } from '@/onboarding/countries';
import { Field, SelectField, type SelectOption } from './fields';

const OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.name,
  label: c.name,
  flag: c.flag,
}));

export default function PassportStep() {
  const { data, patch } = useOnboarding();

  return (
    <div className="flex flex-col" style={{ gap: 16, maxWidth: 460 }}>
      <Field label="Passport country" htmlFor="onb-passport">
        <SelectField
          id="onb-passport"
          searchable
          pinnedFirst
          value={data.passportCountry ?? ''}
          options={OPTIONS}
          placeholder="Select your passport country"
          onChange={(v) => patch({ passportCountry: v })}
        />
      </Field>
    </div>
  );
}
