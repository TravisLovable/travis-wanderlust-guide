// Step 7 — Legal/Consent step (last form step before Complete).
//
// Two rows: a mandatory Privacy Policy + Terms of Service agreement (gates
// Continue — see Onboarding.tsx's isStepComplete 'legal' branch) and an
// optional SMS opt-in for trip-alert texts, referencing the real phone
// number Identity now requires. No custom checkbox primitive exists in
// fields.tsx (onboarding deliberately avoids shadcn components elsewhere —
// SelectField/MultiSelectField/CityAutocomplete are all custom for the same
// reason), so ConsentCheckbox below matches the same border/checkmark
// language Chip/SelectField already use for selected/confirmed state
// (--hair-strong/--ink border, --signal-ok checkmark) rather than importing
// ui/checkbox.tsx or inventing something new.
//
// The checkbox button and its label text are siblings, not a <label>
// wrapping both — the mandatory row's label contains its own tappable
// Privacy/Terms links, and a wrapping <label> would make clicking those
// links also toggle the checkbox (native label-forwards-click-to-control
// behavior), which is exactly the kind of dead-simple bug worth avoiding by
// construction rather than patching with stopPropagation().
//
// Timestamps (agreedToTermsAt/smsOptInAt) are stamped here, at the moment of
// the click — not derived in OnboardingProvider's mapDataToUsersRow, which
// runs on every ~800ms autosave and would otherwise overwrite "the real
// moment of consent" with "whenever autosave last happened to fire".

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useOnboarding } from '@/onboarding/OnboardingProvider';
import PrivacyModal from '@/components/PrivacyModal';
import TermsModal from '@/components/TermsModal';

function ConsentCheckbox({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start" style={{ gap: 12 }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="flex items-center justify-center"
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          marginTop: 2,
          background: checked ? 'oklch(1 0 0 / 0.06)' : 'transparent',
          border: `1px solid ${checked ? 'var(--ink)' : 'var(--hair-strong)'}`,
          borderRadius: 4,
          padding: 0,
          cursor: 'pointer',
        }}
      >
        {checked && <span style={{ fontSize: 12, color: 'var(--signal-ok)' }}>✓</span>}
      </button>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{children}</p>
    </div>
  );
}

const linkStyle: CSSProperties = {
  background: 'transparent',
  border: 0,
  padding: 0,
  color: 'var(--ink)',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  cursor: 'pointer',
  font: 'inherit',
};

export default function LegalStep() {
  const { data, patch } = useOnboarding();
  const [legal, setLegal] = useState<null | 'privacy' | 'terms'>(null);

  const toggleTerms = () => {
    const next = !data.agreedToTerms;
    patch({ agreedToTerms: next, agreedToTermsAt: next ? new Date().toISOString() : undefined });
  };

  const toggleSms = () => {
    const next = !data.smsOptIn;
    patch({ smsOptIn: next, smsOptInAt: next ? new Date().toISOString() : undefined });
  };

  const formattedPhone = [data.phoneCountryCode, data.phone].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col" style={{ gap: 24, maxWidth: 560 }}>
      <ConsentCheckbox checked={!!data.agreedToTerms} onToggle={toggleTerms}>
        I agree to the{' '}
        <button type="button" style={linkStyle} onClick={() => setLegal('privacy')}>
          Privacy Policy
        </button>{' '}
        and{' '}
        <button type="button" style={linkStyle} onClick={() => setLegal('terms')}>
          Terms of Service
        </button>
        .
      </ConsentCheckbox>

      <ConsentCheckbox checked={!!data.smsOptIn} onToggle={toggleSms}>
        Get texts from Travis about your trips at {formattedPhone || 'the number you provided'}. Reply STOP anytime.
      </ConsentCheckbox>

      <PrivacyModal isOpen={legal === 'privacy'} onClose={() => setLegal(null)} />
      <TermsModal isOpen={legal === 'terms'} onClose={() => setLegal(null)} />
    </div>
  );
}
