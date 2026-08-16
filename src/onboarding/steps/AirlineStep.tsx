// Step 7 — Step 05 Airline (Checkpoint C).
//
// Up to 3 preferred carriers (search-to-add multi-select; chips show the
// carrier name but the IATA code is stored, per the users.airlines column
// comment). For each selected airline that has a real documented loyalty
// program (frequentFlyerPrograms.ts), a dedicated status section appears
// with that airline's actual tier names — no generic global status block.
// Airlines without a program (Ryanair, easyJet, most of the ~954-airline
// list) get no section; there's nothing to ask. Sections render in selection
// order; the first one (with a program) is tagged PRIMARY, making explicit
// the meaning selection order already carried ("top airline"). Both fields
// optional — Continue stays enabled with nothing selected, unlike Identity.

import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, Chip, MultiSelectField, type SelectOption } from './fields';
import { AIRLINES } from '@/onboarding/airlines';
import { FREQUENT_FLYER_PROGRAMS } from '@/onboarding/frequentFlyerPrograms';

const MAX = 3;

const AIRLINE_OPTIONS: SelectOption[] = AIRLINES.map((a) => ({
  value: a.code,
  label: a.name,
  hint: a.code,
}));

function PrimaryTag() {
  return (
    <span
      className="font-travis-mono"
      style={{
        fontSize: 9,
        letterSpacing: '0.1em',
        color: 'var(--ink-4)',
        border: '1px solid var(--hair-strong)',
        borderRadius: 2,
        padding: '2px 6px',
        textTransform: 'uppercase',
      }}
    >
      Primary
    </span>
  );
}

export default function AirlineStep() {
  const { data, patch } = useOnboarding();
  const selected = data.airlines ?? [];
  const statusByAirline = data.frequentFlyerStatusByAirline ?? {};

  const setAirlines = (next: string[]) => {
    patch({ airlines: next });
    // Deselecting an airline clears any tier stored for it.
    const nextCodes = new Set(next);
    const nextStatus = Object.fromEntries(
      Object.entries(statusByAirline).filter(([code]) => nextCodes.has(code)),
    );
    if (Object.keys(nextStatus).length !== Object.keys(statusByAirline).length) {
      patch({ frequentFlyerStatusByAirline: nextStatus });
    }
  };

  const setTier = (code: string, tierKey: string) => {
    patch({ frequentFlyerStatusByAirline: { ...statusByAirline, [code]: tierKey } });
  };

  // Selected airlines that have a real program, in selection order.
  const withPrograms = selected.filter((code) => FREQUENT_FLYER_PROGRAMS[code]);

  return (
    <div className="flex flex-col" style={{ gap: 20, maxWidth: 640 }}>
      <Field label={`Airlines — pick up to ${MAX}`}>
        <MultiSelectField
          values={selected}
          options={AIRLINE_OPTIONS}
          max={MAX}
          placeholder="Search airlines…"
          onChange={setAirlines}
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

      {withPrograms.map((code, i) => {
        const program = FREQUENT_FLYER_PROGRAMS[code];
        const airline = AIRLINES.find((a) => a.code === code);
        return (
          <Field
            key={code}
            label={
              <span className="flex items-center" style={{ gap: 8 }}>
                {(airline?.name ?? code)} status
                {i === 0 && <PrimaryTag />}
              </span>
            }
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {program.tiers.map((t) => (
                <Chip
                  key={t.key}
                  selected={statusByAirline[code] === t.key}
                  onClick={() => setTier(code, t.key)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </Field>
        );
      })}
    </div>
  );
}
