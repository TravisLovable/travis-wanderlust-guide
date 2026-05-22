// Step 7 — Onboarding layout shell (Checkpoint B scaffolding).
//
// Left rail (logo, heading, step list, progress) + right pane (toolbar,
// content slot, footer). Per locked decision 4B the rail is hidden on
// mobile; a compact step/progress strip takes its place at the top of the
// right pane. Colours come from the existing Travis tokens
// (src/design-system/tokens.css); fonts via the font-travis* Tailwind
// families. `--hair-active` → `--hair-strong` and `--serif` → `--display`
// (the only two design vars without an exact token).

import React from 'react';
import { STEPS } from './steps';
import { useOnboarding } from './OnboardingProvider';

const saveLabel: Record<string, string> = {
  idle: 'NOT SAVED',
  saving: 'SAVING…',
  saved: '✓ SAVED',
  'local-only': 'LOCAL DRAFT',
};

export function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { stepIdx, goTo, saveState } = useOnboarding();
  const step = STEPS[stepIdx];
  const total = STEPS.length;
  const pct = (stepIdx / (total - 1)) * 100;

  return (
    <div
      className="min-h-screen lg:grid lg:grid-cols-[420px_1fr]"
      style={{ background: 'var(--bg)', color: 'var(--ink)' }}
    >
      {/* Left rail — desktop only */}
      <aside
        className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen"
        style={{
          borderRight: '1px solid var(--hair)',
          padding: '28px 32px',
          background: 'var(--bg-inset)',
          gap: 28,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-travis" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Travis
          </span>
          <span className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Onboarding · v1
          </span>
        </div>

        <div>
          <div className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 16 }}>
            Getting you calibrated
          </div>
          <h1 className="font-travis" style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 0 14px' }}>
            Travis works better{' '}
            <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>when it knows you.</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5, margin: 0 }}>
            A few minutes now, four seconds a trip after.
          </p>
        </div>

        <nav style={{ marginTop: 10 }}>
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const current = i === stepIdx;
            const isAuth = s.kind === 'auth';
            const clickable = !isAuth && done;
            const status = isAuth ? '✓ DONE' : done ? '✓ SAVED' : current ? 'ACTIVE' : 'QUEUED';
            const statusColor = isAuth || done ? 'var(--signal-ok)' : current ? 'var(--signal-warn)' : 'var(--ink-4)';
            return (
              <div
                key={s.id}
                onClick={() => clickable && goTo(i)}
                className="grid items-center"
                style={{
                  gridTemplateColumns: '28px 1fr auto',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--hair)',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: !done && !current && !isAuth ? 0.5 : 1,
                }}
              >
                <span className="font-travis-mono" style={{ fontSize: 10, color: isAuth || done ? 'var(--signal-ok)' : 'var(--ink-4)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 13, fontWeight: current ? 500 : 400, color: current ? 'var(--ink)' : isAuth || done ? 'var(--ink-2)' : 'var(--ink-3)' }}>
                  {s.label}
                </span>
                <span className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: statusColor }}>
                  {status}
                </span>
              </div>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div
            className="font-travis-mono"
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: 8 }}
          >
            <span>{stepIdx}/{total - 1} COMPLETE</span>
            <span>{saveLabel[saveState]}</span>
          </div>
          <div style={{ height: 2, background: 'var(--hair)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--signal-ok)', transition: 'width 0.3s' }} />
          </div>
        </div>
      </aside>

      {/* Right pane */}
      <main className="flex flex-col min-h-screen">
        {/* Mobile-only step + progress strip (decision 4B) */}
        <div
          className="lg:hidden"
          style={{ padding: '14px 20px', borderBottom: '1px solid var(--hair)', background: 'var(--bg-inset)' }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
              Step {String(stepIdx + 1).padStart(2, '0')} · {step.label}
            </span>
            <span className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-4)' }}>
              {saveLabel[saveState]}
            </span>
          </div>
          <div style={{ height: 2, background: 'var(--hair)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--signal-ok)', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Desktop toolbar */}
        <div
          className="hidden lg:flex items-center justify-between"
          style={{ padding: '18px 40px', borderBottom: '1px solid var(--hair)' }}
        >
          <div className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Step {String(stepIdx + 1).padStart(2, '0')} · {step.label}
          </div>
          <span className="font-travis-mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.08em' }}>
            PROGRESS SAVED AUTOMATICALLY
          </span>
        </div>

        <div className="flex-1 flex flex-col">
          <div
            key={step.id}
            className="travis-rise flex-1"
            style={{ padding: '40px clamp(20px, 6vw, 80px)', maxWidth: 960 }}
          >
            {children}
          </div>

          <footer
            className="font-travis-mono flex justify-between"
            style={{
              padding: '14px clamp(20px, 6vw, 40px)',
              borderTop: '1px solid var(--hair)',
              fontSize: 10.5,
              letterSpacing: '0.12em',
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
            }}
          >
            <span>Travis · secure by default</span>
            <span className="hidden sm:inline">No passport number stored</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
