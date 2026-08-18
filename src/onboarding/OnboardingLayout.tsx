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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { STEPS, displayStep, FIRST_WIZARD_INDEX, LAST_WIZARD_INDEX } from './steps';
import { useOnboarding } from './OnboardingProvider';

/** Small mono "Exit" affordance — same position on every step, never near Continue. */
function ExitButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-travis-mono"
      style={{
        fontSize: 10.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
        background: 'transparent',
        border: '1px solid var(--hair-strong)',
        borderRadius: 6,
        padding: '6px 12px',
        cursor: 'pointer',
      }}
    >
      Exit ✕
    </button>
  );
}

const saveLabel: Record<string, string> = {
  idle: 'NOT SAVED',
  saving: 'SAVING…',
  saved: '✓ SAVED',
  'local-only': 'LOCAL DRAFT',
};

export function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { stepIdx, goTo, saveState, exit } = useOnboarding();
  const [confirmExit, setConfirmExit] = React.useState(false);
  const step = STEPS[stepIdx];
  const total = STEPS.length;
  const pct = (stepIdx / (total - 1)) * 100;

  return (
    <div
      className="lg:grid lg:grid-cols-[420px_1fr] overflow-hidden"
      // Fixed viewport-height shell (matches Home.tsx): the toolbar stays
      // pinned and only the content region beneath it scrolls, so the page
      // itself never scrolls.
      style={{ height: '100dvh', background: 'var(--bg)', color: 'var(--ink)' }}
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
            if (s.kind === 'auth') return null;
            const done = i < stepIdx;
            const current = i === stepIdx;
            const clickable = done;
            const status = done ? '✓ SAVED' : current ? 'ACTIVE' : 'QUEUED';
            const statusColor = done ? 'var(--signal-ok)' : current ? 'var(--signal-warn)' : 'var(--ink-4)';
            return (
              <div
                key={s.id}
                onClick={() => clickable && goTo(i)}
                className="grid items-center"
                style={{
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--hair)',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: !done && !current ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: current ? 500 : 400, color: current ? 'var(--ink)' : done ? 'var(--ink-2)' : 'var(--ink-3)' }}>
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
            <span>{stepIdx - FIRST_WIZARD_INDEX}/{LAST_WIZARD_INDEX - FIRST_WIZARD_INDEX} COMPLETE</span>
            <span>{saveLabel[saveState]}</span>
          </div>
          <div style={{ height: 2, background: 'var(--hair)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--signal-ok)', transition: 'width 0.3s' }} />
          </div>
        </div>
      </aside>

      {/* Right pane */}
      <main className="flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
        {/* Mobile-only step + progress strip (decision 4B) — pinned, never scrolls. */}
        <div
          className="lg:hidden shrink-0"
          style={{ padding: '14px 20px', paddingTop: 'calc(14px + var(--sat))', borderBottom: '1px solid var(--hair)', background: 'var(--bg-inset)' }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
              Step {String(displayStep(stepIdx)).padStart(2, '0')} · {step.label}
            </span>
            <div className="flex items-center" style={{ gap: 12 }}>
              <span className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-4)' }}>
                {saveLabel[saveState]}
              </span>
              <ExitButton onClick={() => setConfirmExit(true)} />
            </div>
          </div>
          <div style={{ height: 2, background: 'var(--hair)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--signal-ok)', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Desktop toolbar — pinned, never scrolls. */}
        <div
          className="hidden lg:flex items-center justify-between shrink-0"
          style={{ padding: '18px 40px', borderBottom: '1px solid var(--hair)' }}
        >
          <div className="font-travis-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Step {String(displayStep(stepIdx)).padStart(2, '0')} · {step.label}
          </div>
          <div className="flex items-center" style={{ gap: 16 }}>
            <span className="font-travis-mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.08em' }}>
              PROGRESS SAVED AUTOMATICALLY
            </span>
            <ExitButton onClick={() => setConfirmExit(true)} />
          </div>
        </div>

        {/* Sole scrollable region — content + footer scroll together beneath
            the pinned toolbar. min-h-0 lets this flex child actually shrink
            so overflow-y-auto takes effect (matches Home.tsx's pattern). */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col"
          style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}
        >
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
              paddingBottom: 'calc(14px + var(--sab))',
              borderTop: '1px solid var(--hair)',
              fontSize: 10.5,
              letterSpacing: '0.12em',
              color: 'var(--ink-4)',
              textTransform: 'uppercase',
            }}
          >
            <span>Travis™</span>
          </footer>
        </div>
      </main>

      <Dialog open={confirmExit} onOpenChange={setConfirmExit}>
        <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Exit setup?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              You'll be signed out, and the answers you've entered so far won't be saved.
              You can start fresh next time you sign in.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 text-foreground" onClick={() => setConfirmExit(false)}>
                Keep setting up
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => { setConfirmExit(false); exit(); }}
              >
                Exit &amp; sign out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
