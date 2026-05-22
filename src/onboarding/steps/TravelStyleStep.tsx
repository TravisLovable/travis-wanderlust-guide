// Step 7 — Step 06 Travel style (Checkpoint D).
//
// Three fields: travel_frequency (single-select), travel_pace (single-select),
// travel_styles (multi-select, no cap). Stable keys are stored; chips show the
// label. Renders form fields only — heading/kicker/footer are layout chrome
// owned by Onboarding.tsx. Continue is gated on frequency + pace there.

import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, Chip } from './fields';
import { FREQUENCY_OPTIONS, PACE_OPTIONS, STYLE_OPTIONS } from '@/onboarding/travelStyle';

const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 10 } as const;

export default function TravelStyleStep() {
  const { data, patch } = useOnboarding();
  const styles = data.travelStyles ?? [];

  const toggleStyle = (key: string) => {
    patch({
      travelStyles: styles.includes(key) ? styles.filter((s) => s !== key) : [...styles, key],
    });
  };

  return (
    <div className="flex flex-col" style={{ gap: 34, maxWidth: 640 }}>
      <Field label="How often do you travel?">
        <div style={chipRow}>
          {FREQUENCY_OPTIONS.map((o) => (
            <Chip
              key={o.key}
              selected={data.travelFrequency === o.key}
              onClick={() => patch({ travelFrequency: o.key })}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Preferred pace">
        <div style={chipRow}>
          {PACE_OPTIONS.map((o) => (
            <Chip
              key={o.key}
              selected={data.travelPace === o.key}
              onClick={() => patch({ travelPace: o.key })}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Styles that fit you">
        <div style={chipRow}>
          {STYLE_OPTIONS.map((o) => (
            <Chip key={o.key} selected={styles.includes(o.key)} onClick={() => toggleStyle(o.key)}>
              {o.label}
            </Chip>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, margin: '14px 0 0', maxWidth: 520 }}>
          Pick any number — Travis blends these into recommendations.
        </p>
      </Field>
    </div>
  );
}
