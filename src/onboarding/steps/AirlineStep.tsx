// Step 7 — Step 05 Airline (Checkpoint C).
//
// Optional multi-select: up to 3 preferred carriers. Chips show the carrier
// name; the stored value is the IATA code, per the users.airlines column
// comment ("up to 3 preferred airline codes, e.g. AA, UA"). Continue stays
// enabled with nothing selected — this is optional info, unlike Identity.

import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, Chip } from './fields';

const AIRLINES: { code: string; name: string }[] = [
  { code: 'AA', name: 'American' },
  { code: 'DL', name: 'Delta' },
  { code: 'UA', name: 'United' },
  { code: 'WN', name: 'Southwest' },
  { code: 'B6', name: 'JetBlue' },
  { code: 'AS', name: 'Alaska' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM' },
  { code: 'IB', name: 'Iberia' },
  { code: 'TP', name: 'TAP Portugal' },
  { code: 'AZ', name: 'ITA Airways' },
  { code: 'NH', name: 'ANA' },
  { code: 'JL', name: 'JAL' },
  { code: 'AM', name: 'Aeromexico' },
  { code: 'LA', name: 'LATAM' },
  { code: 'G3', name: 'GOL' },
];

const MAX = 3;

// TODO(Checkpoint D / schema): frequent_flyer_status is intentionally omitted.
// Checkpoint A added `airlines text[]` but no frequent-flyer column, and
// `travel_styles` is reserved for the Travel Style step. Add a dedicated column
// (e.g. frequent_flyer jsonb / text) before capturing elite status here; do not
// overload travel_styles.

export default function AirlineStep() {
  const { data, patch } = useOnboarding();
  const selected = data.airlines ?? [];
  const atMax = selected.length >= MAX;

  const toggle = (code: string) => {
    const next = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : atMax
        ? selected
        : [...selected, code];
    patch({ airlines: next });
  };

  return (
    <div className="flex flex-col" style={{ gap: 20, maxWidth: 640 }}>
      <Field label={`Airlines — pick up to ${MAX}`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {AIRLINES.map((a) => {
            const isSel = selected.includes(a.code);
            return (
              <Chip key={a.code} selected={isSel} disabled={!isSel && atMax} onClick={() => toggle(a.code)}>
                {a.name}
              </Chip>
            );
          })}
        </div>
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
    </div>
  );
}
