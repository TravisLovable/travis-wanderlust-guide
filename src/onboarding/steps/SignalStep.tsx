// Step 7 — Step 07 Signal (Checkpoint D).
//
// One field: alert_preferences (jsonb map of alertKey -> bool). Rendered as a
// stack of toggle rows. All default ON; the defaults are persisted on mount so
// the saved row reflects them even if the user never toggles. Continue is
// always enabled (defaults are fine).

import { useEffect } from 'react';
import { useOnboarding } from '@/onboarding/OnboardingProvider';

interface AlertDef {
  key: string;
  label: string;
  desc: string;
}

const ALERTS: AlertDef[] = [
  { key: 'visa', label: 'Visa & entry rules', desc: "Policy changes for countries you've saved." },
  { key: 'safety', label: 'Safety advisories', desc: 'Travel warnings from State Dept and FCDO.' },
  { key: 'weather', label: 'Weather disruption', desc: 'Storms, closures, or extreme temps near departure.' },
  { key: 'currency', label: 'Currency moves', desc: 'Exchange-rate swings affecting your trip cost.' },
  { key: 'health', label: 'Health & vaccination', desc: 'Outbreak alerts and entry health requirements.' },
];

const DEFAULTS: Record<string, boolean> = Object.fromEntries(ALERTS.map((a) => [a.key, true]));

/** Pill toggle: OFF = hairline track + left knob, ON = --ink-3 fill + right knob. */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
        width: 40,
        height: 22,
        padding: 0,
        borderRadius: 999,
        border: `1px solid ${on ? 'transparent' : 'var(--hair)'}`,
        background: on ? 'var(--ink-3)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.18s ease, border-color 0.18s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: on ? 20 : 2,
          width: 16,
          height: 16,
          marginTop: -8,
          borderRadius: '50%',
          background: on ? 'var(--ink)' : 'var(--ink-3)',
          transition: 'left 0.18s ease, background 0.18s ease',
        }}
      />
    </button>
  );
}

export default function SignalStep() {
  const { data, patch } = useOnboarding();

  useEffect(() => {
    if (!data.alertPreferences) patch({ alertPreferences: DEFAULTS });
  }, [data.alertPreferences, patch]);

  const prefs = data.alertPreferences ?? DEFAULTS;
  const set = (key: string, val: boolean) => patch({ alertPreferences: { ...prefs, [key]: val } });

  return (
    <div className="flex flex-col" style={{ maxWidth: 560 }}>
      {ALERTS.map((a, i) => {
        const on = prefs[a.key] ?? true;
        return (
          <div
            key={a.key}
            className="flex items-center justify-between"
            style={{
              gap: 24,
              padding: '18px 0',
              borderTop: i === 0 ? '1px solid var(--hair)' : undefined,
              borderBottom: '1px solid var(--hair)',
            }}
          >
            <div>
              <div className="font-travis" style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
                {a.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.45 }}>{a.desc}</div>
            </div>
            <Toggle on={on} onChange={(v) => set(a.key, v)} label={a.label} />
          </div>
        );
      })}
    </div>
  );
}
