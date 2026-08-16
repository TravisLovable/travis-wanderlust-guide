// Step 7 — Step 05 Airline (Checkpoint C).
//
// Up to 3 preferred carriers (search-to-add multi-select). The search input
// and its dropdown results are the MultiSelectField's own — unchanged, that's
// a genuinely different moment (browsing/picking a candidate). The instant an
// airline is picked, though, it leaves the compact-chip system entirely and
// becomes a full-width AirlineCard in the list below (hideSelectedChips on
// MultiSelectField suppresses its own built-in "selected as chips" block,
// since these cards replace that). One card per selected airline, in
// selection order — not two disconnected pieces (a small chip + a separately-
// labeled status section) like the previous iteration had. If the airline has
// a real documented loyalty program (frequentFlyerPrograms.ts), the card's
// secondary line shows current status and expands in place to reveal tier
// Chips; airlines without a program (Ryanair, easyJet, most of the ~954-
// airline list) render as a name-only card — nothing to expand, nothing more
// to do. PRIMARY goes to whichever card is in position 0 — no auto-skip
// logic for no-program airlines; dragging one to the top by its handle is a
// deliberate choice and gets PRIMARY same as any other. Reordering (Framer
// Motion's Reorder.Group/Item, as="div" since this file has no ul/li
// elsewhere) drags the underlying selected-airlines array itself, not a
// separate display-order — position 0 is the single source of truth for
// both what's saved and what's PRIMARY. The drag handle uses
// dragListener={false} + useDragControls(), started only from the handle's
// onPointerDown, so dragging never conflicts with the status row's tap-to-
// expand or the remove button.
//
// Cards are a collapsed-by-default accordion, not always-expanded chip
// grids: at 3/3 selected with a program each, three sprawling grids (Iberia
// alone has 7 tiers) would push the footer off-screen. Only one card expands
// at a time (single expandedCode, not a Set — opening one inherently closes
// any other), and picking a tier auto-collapses back to a settled summary as
// the acknowledgement of the choice. Animation timing/easing (duration 0.28,
// ease [0.22,1,0.36,1], height+opacity via AnimatePresence) is copied
// verbatim from Home.tsx's `reveal` variant — the only other place this app
// animates a reveal/collapse — rather than inventing new numbers.
//
// Both fields optional — Continue stays enabled with nothing selected,
// unlike Identity.

import { useState } from 'react';
import { AnimatePresence, motion, Reorder, useDragControls, type DragControls } from 'framer-motion';
import { useOnboarding } from '@/onboarding/OnboardingProvider';
import { Field, Chip, MultiSelectField, type SelectOption } from './fields';
import { AIRLINES } from '@/onboarding/airlines';
import { FREQUENT_FLYER_PROGRAMS, type FrequentFlyerProgram } from '@/onboarding/frequentFlyerPrograms';

const MAX = 3;

// Matches Home.tsx's `reveal` exactly — see file header.
const reveal = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' as const },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

const AIRLINE_OPTIONS: SelectOption[] = AIRLINES.map((a) => ({
  value: a.code,
  label: a.name,
  hint: a.code,
}));

/** Grip glyph; drag only starts from here, via the passed-in DragControls. */
function DragHandle({ controls }: { controls: DragControls }) {
  return (
    <span
      onPointerDown={(e) => controls.start(e)}
      aria-hidden="true"
      className="font-travis-mono"
      style={{
        color: 'var(--ink-4)',
        fontSize: 15,
        lineHeight: 1,
        cursor: 'grab',
        touchAction: 'none',
        padding: 4,
      }}
    >
      ⠿
    </span>
  );
}

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

/**
 * One selected airline, full-width. Header (name + PRIMARY + remove) is
 * always present; the status line + expandable tier Chips only render when
 * `program` is defined — otherwise the card is just the header, nothing to
 * tap, nothing more to do.
 */
function AirlineCard({
  name,
  program,
  isPrimary,
  isExpanded,
  tierKey,
  dragControls,
  onToggleExpand,
  onSelectTier,
  onRemove,
}: {
  name: string;
  program?: FrequentFlyerProgram;
  isPrimary: boolean;
  isExpanded: boolean;
  tierKey?: string;
  dragControls: DragControls;
  onToggleExpand: () => void;
  onSelectTier: (tierKey: string) => void;
  onRemove: () => void;
}) {
  const currentTier = program?.tiers.find((t) => t.key === tierKey);

  return (
    <div
      style={{
        background: 'var(--bg-raised)',
        // Matches Chip's own selected-state convention (border: var(--ink)
        // vs var(--hair-strong)) rather than inventing a new emphasis color.
        border: `1px solid ${isPrimary ? 'var(--ink)' : 'var(--hair-strong)'}`,
        borderRadius: 2,
        padding: '14px 16px',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center" style={{ gap: 6 }}>
          <DragHandle controls={dragControls} />
          <span className="font-travis" style={{ fontSize: 16, color: 'var(--ink)' }}>
            {name}
          </span>
          {isPrimary && <PrimaryTag />}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="font-travis-mono"
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--ink-4)',
            fontSize: 13,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {program && (
        <>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            className="font-travis flex items-center justify-between"
            style={{
              width: '100%',
              background: 'oklch(1 0 0 / 0.05)',
              border: 0,
              borderRadius: 4,
              marginTop: 10,
              padding: '10px 12px',
              fontSize: 14,
              color: currentTier ? 'var(--ink-2)' : 'var(--ink-4)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span className="flex items-center" style={{ gap: 8 }}>
              {currentTier ? currentTier.label : 'Select your status'}
              {currentTier && <span style={{ fontSize: 12, color: 'var(--signal-ok)' }}>✓</span>}
            </span>
            <span
              style={{
                fontSize: 15,
                color: 'var(--ink-3)',
                transform: isExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            >
              ▼
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div {...reveal} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 14 }}>
                  {program.tiers.map((t) => (
                    <Chip key={t.key} selected={tierKey === t.key} onClick={() => onSelectTier(t.key)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/**
 * useDragControls() must be called once per draggable item, which a .map()
 * callback in the parent can't do (rules of hooks) — hence this thin wrapper:
 * owns the controls instance and the Reorder.Item, delegates everything else
 * to AirlineCard.
 */
function SortableAirlineCard({
  code,
  name,
  program,
  isPrimary,
  isExpanded,
  tierKey,
  onToggleExpand,
  onSelectTier,
  onRemove,
}: {
  code: string;
  name: string;
  program?: FrequentFlyerProgram;
  isPrimary: boolean;
  isExpanded: boolean;
  tierKey?: string;
  onToggleExpand: () => void;
  onSelectTier: (tierKey: string) => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={code}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      {...reveal}
      style={{ overflow: 'hidden' }}
    >
      <AirlineCard
        name={name}
        program={program}
        isPrimary={isPrimary}
        isExpanded={isExpanded}
        tierKey={tierKey}
        dragControls={dragControls}
        onToggleExpand={onToggleExpand}
        onSelectTier={onSelectTier}
        onRemove={onRemove}
      />
    </Reorder.Item>
  );
}

export default function AirlineStep() {
  const { data, patch } = useOnboarding();
  const selected = data.airlines ?? [];
  const statusByAirline = data.frequentFlyerStatusByAirline ?? {};
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

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
    // Don't leave the accordion pointing at a card that no longer exists.
    if (expandedCode && !nextCodes.has(expandedCode)) setExpandedCode(null);
  };

  const removeAirline = (code: string) => setAirlines(selected.filter((c) => c !== code));

  const setTier = (code: string, tierKey: string) => {
    patch({ frequentFlyerStatusByAirline: { ...statusByAirline, [code]: tierKey } });
    // Auto-collapse: the settled summary is the acknowledgement of the pick.
    setExpandedCode(null);
  };

  return (
    <div className="flex flex-col" style={{ gap: 20, maxWidth: 640 }}>
      {selected.length < MAX && (
        <Field label={`Airlines — pick up to ${MAX}`}>
          <MultiSelectField
            values={selected}
            options={AIRLINE_OPTIONS}
            max={MAX}
            placeholder="Search airlines…"
            onChange={setAirlines}
            hideSelectedChips
          />
        </Field>
      )}

      <div className="flex items-center justify-between" style={{ maxWidth: 640 }}>
        <span
          className="font-travis-mono"
          style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--ink-4)', textTransform: 'uppercase' }}
        >
          {selected.length} / {MAX} selected
        </span>
        {selected.length === 0 && (
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Optional — skip if you're not loyal to a carrier.
          </span>
        )}
      </div>

      <Reorder.Group
        as="div"
        axis="y"
        values={selected}
        onReorder={setAirlines}
        className="flex flex-col"
        style={{ gap: 20 }}
      >
        <AnimatePresence initial={false}>
          {selected.map((code, i) => {
            const program = FREQUENT_FLYER_PROGRAMS[code];
            const airline = AIRLINES.find((a) => a.code === code);
            return (
              <SortableAirlineCard
                key={code}
                code={code}
                name={airline?.name ?? code}
                program={program}
                isPrimary={i === 0}
                isExpanded={expandedCode === code}
                tierKey={statusByAirline[code]}
                onToggleExpand={() => setExpandedCode((cur) => (cur === code ? null : code))}
                onSelectTier={(tierKey) => setTier(code, tierKey)}
                onRemove={() => removeAirline(code)}
              />
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
