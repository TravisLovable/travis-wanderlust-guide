// Step 7 — Step 05 Airline (Checkpoint C).
//
// Two optional fields: up to 3 preferred carriers (search-to-add multi-select;
// chips show the carrier name but the IATA code is stored, per the
// users.airlines column comment) and frequent-flyer status (single-select;
// stored as a stable key in users.frequent_flyer_status). Both optional —
// Continue stays enabled with nothing selected, unlike Identity.

import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, Chip, MultiSelectField, type SelectOption } from './fields';
import { AIRLINES, FREQUENT_FLYER_OPTIONS } from '@/onboarding/airlines';

const MAX = 3;

const AIRLINE_OPTIONS: SelectOption[] = AIRLINES.map((a) => ({
  value: a.code,
  label: a.name,
  hint: a.code,
}));

export default function AirlineStep() {
  const { data, patch } = useOnboarding();
  const selected = data.airlines ?? [];

  return (
    <div className="flex flex-col" style={{ gap: 20, maxWidth: 640 }}>
      <Field label={`Airlines — pick up to ${MAX}`}>
        <MultiSelectField
          values={selected}
          options={AIRLINE_OPTIONS}
          max={MAX}
          placeholder="Search airlines…"
          onChange={(next) => patch({ airlines: next })}
        />
      </Field>

      <div className="flex items-center justify-between" style={{ maxWidth: 640 }}>
        <span
          className="font-travis-mono"
          style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase' }}
        >
          {selected.length} / {MAX} selected
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          Optional — skip if you're not loyal to a carrier.
        </span>
      </div>

      <Field label="Frequent flyer status">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {FREQUENT_FLYER_OPTIONS.map((o) => (
            <Chip
              key={o.key}
              selected={data.frequentFlyerStatus === o.key}
              onClick={() => patch({ frequentFlyerStatus: o.key })}
            >
              {o.label}
            </Chip>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, margin: '14px 0 0', maxWidth: 520 }}>
          If your top airline has tiers, pick the highest you currently hold.
        </p>
      </Field>
    </div>
  );
}
