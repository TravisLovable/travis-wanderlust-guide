// Step 7 — Step 08 Complete (Checkpoint D).
//
// Terminal screen: a recap of what was captured + a single ENTER TRAVIS CTA.
// Owns the finish action because Onboarding.tsx suppresses the standard
// Back/Continue footer here. complete() (provider) flips onboarding_completed
// in the DB and refreshes the profile flag; only then do we navigate to / so
// the RequireOnboarding guard lets the user through.

import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { useToast } from '@/hooks/use-toast';
import { airlineName } from '@/onboarding/airlines';
import { tierLabel } from '@/onboarding/frequentFlyerPrograms';

// Mirrors Onboarding.tsx's primary btn(true). Kept in sync by hand — it's one
// button, and importing across the page/step boundary would be circular.
const enterBtn = (busy: boolean): CSSProperties => ({
  background: busy ? 'oklch(1 0 0 / 0.12)' : 'var(--ink)',
  color: busy ? 'var(--ink-3)' : 'var(--bg)',
  border: 0,
  padding: '13px 24px',
  borderRadius: 6,
  fontSize: 12,
  letterSpacing: '0.08em',
  fontWeight: 500,
  cursor: busy ? 'not-allowed' : 'pointer',
});

export default function CompleteStep() {
  const { data, complete } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const fullName = [data.firstName, data.lastName].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  const selectedAirlines = data.airlines ?? [];
  const carriers = selectedAirlines.map(airlineName).join(' · ');
  const statusByAirline = data.frequentFlyerStatusByAirline ?? {};

  // One row per selected airline with a stored tier — not one global "Status"
  // row, since status is per-airline now. Airlines with no program or no tier
  // picked yet just don't get a row (nothing to show).
  const statusRows: { label: string; value: string }[] = selectedAirlines
    .filter((code) => statusByAirline[code])
    .map((code) => ({ label: airlineName(code), value: tierLabel(code, statusByAirline[code]) }));

  const rows: { label: string; value: string }[] = [
    { label: 'Name', value: fullName || '—' },
    { label: 'From', value: data.homeCity || '—' },
    { label: 'Passport', value: data.passportCountry || '—' },
    { label: 'Carriers', value: carriers || '—' },
    ...statusRows,
  ];

  const onEnter = async () => {
    if (busy) return;
    setBusy(true);
    const res = await complete();
    if (res.ok) {
      navigate('/', { replace: true });
    } else {
      toast({ title: 'Could not finish onboarding', description: res.error, variant: 'destructive' });
      setBusy(false);
    }
  };

  return (
    <>
      <h2
        className="font-travis"
        style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.02, margin: '0 0 18px' }}
      >
        You're <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>set.</span>
      </h2>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.5, maxWidth: 540, margin: '0 0 40px' }}>
        Travis knows enough to start working for you. Drop in a destination and it'll handle the rest.
      </p>

      <div style={{ maxWidth: 480 }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="font-travis-mono flex items-baseline"
            style={{
              gap: 10,
              padding: '11px 0',
              borderTop: i === 0 ? '1px solid var(--hair)' : undefined,
              borderBottom: '1px solid var(--hair)',
            }}
          >
            <span
              style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', minWidth: 88 }}
            >
              {r.label}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end" style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--hair)' }}>
        <button className="font-travis-mono" style={enterBtn(busy)} disabled={busy} onClick={onEnter}>
          {busy ? 'ENTERING…' : 'ENTER TRAVIS →'}
        </button>
      </div>
    </>
  );
}
