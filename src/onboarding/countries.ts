// Step 7 — lightweight country list for the onboarding Passport step.
//
// Reuses the same name→flag data the results / visa-requirements cards render
// (src/components/travis/FLAG.ts), so the passport selector and the visa cards
// stay in sync from a single source. `public.users.passport_country` stores the
// country *name* (see the Checkpoint A column comment), so `name` is both the
// label and the stored value.

import { FLAG } from '@/components/travis/FLAG';

export interface Country {
  /** Stored value + label — the country name (matches users.passport_country). */
  name: string;
  /** Emoji flag for display. */
  flag: string;
}

export const COUNTRIES: Country[] = Object.entries(FLAG)
  .map(([name, flag]) => ({ name, flag }))
  .sort((a, b) => a.name.localeCompare(b.name));
