// Step 7 — shared form-field primitives for the onboarding steps (Checkpoint C).
//
// Inline-styled to match OnboardingLayout's visual language: monospace labels
// (uppercase, tracked, --ink-3), display-scale inputs in --ink, hairline bottom
// borders that thicken to --hair-strong on focus, ≤2px radii, no shadows on the
// inputs themselves. Pseudo-states (focus / placeholder / hover) live in
// src/onboarding/onboarding.css. Spacing mirrors the layout's px scale —
// tokens.css defines no --space-* vars.

import React, { useEffect, useRef, useState, type ReactNode } from 'react';

/** Label + control wrapper. Mono uppercase label in the layout's --ink-3 tone. */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="font-travis-mono"
        style={{
          display: 'block',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/** Transparent text input, hairline bottom border (styling in onboarding.css). */
export function TextField({
  id,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
  autoFocus,
  maxLength,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'tel';
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
}) {
  return (
    <input
      id={id}
      className="font-travis onb-input"
      type="text"
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      maxLength={maxLength}
      // Names (and the numeric phone field) aren't dictionary words — the red
      // squiggly spellcheck underline is a false positive here, not a real hint.
      spellCheck={false}
      autoCorrect="off"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
  flag?: string;
  hint?: string;
}

/**
 * Lightweight dark-themed dropdown used for the phone dial code (compact) and
 * the passport country (searchable). Closes on outside-click / Escape. Built
 * custom rather than via shadcn Select so it inherits the onboarding hairline
 * aesthetic and renders flags consistently.
 */
export function SelectField({
  id,
  value,
  options,
  onChange,
  placeholder,
  compact = false,
  searchable = false,
}: {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  compact?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  // Reset the highlighted row whenever the visible list changes shape, so a
  // stale index from a previous search never points at the wrong option.
  useEffect(() => {
    setActiveIndex(-1);
  }, [filtered.length, open]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  // Matches CityAutocomplete's onKeyDown pattern so both searchable dropdowns
  // in onboarding behave identically for keyboard users.
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        choose(filtered[activeIndex].value);
      }
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="font-travis onb-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: compact ? 'auto' : '100%',
          minWidth: compact ? 92 : undefined,
          background: 'transparent',
          border: 0,
          borderBottom: `1px solid ${open ? 'var(--hair-strong)' : 'var(--hair)'}`,
          borderRadius: 0,
          padding: '10px 2px',
          fontSize: compact ? 18 : 22,
          color: selected ? 'var(--ink)' : 'var(--ink-4)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selected?.flag && <span style={{ fontSize: 20 }}>{selected.flag}</span>}
          <span>{selected ? selected.label : placeholder}</span>
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'var(--ink-3)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: compact ? 240 : '100%',
            zIndex: 30,
            background: 'var(--bg-raised)',
            border: '1px solid var(--hair-strong)',
            borderRadius: 2,
            maxHeight: 300,
            overflowY: 'auto',
            boxShadow: '0 14px 44px oklch(0 0 0 / 0.45)',
          }}
        >
          {searchable && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="SEARCH…"
              className="font-travis-mono"
              style={{
                width: '100%',
                background: 'transparent',
                border: 0,
                borderBottom: '1px solid var(--hair)',
                borderRadius: 0,
                padding: '12px 14px',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
          )}
          {filtered.length === 0 ? (
            <div
              className="font-travis-mono"
              style={{ padding: 14, fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)' }}
            >
              NO MATCHES
            </div>
          ) : (
            filtered.map((o, i) => {
              const isSel = o.value === value;
              const isActive = i === activeIndex;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => choose(o.value)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className="font-travis onb-option"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    background: isActive
                      ? 'oklch(1 0 0 / 0.1)'
                      : isSel
                        ? 'oklch(1 0 0 / 0.06)'
                        : 'transparent',
                    border: 0,
                    padding: '11px 14px',
                    fontSize: 15,
                    color: isSel ? 'var(--ink)' : 'var(--ink-2)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {o.flag && <span style={{ fontSize: 18 }}>{o.flag}</span>}
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {o.hint && (
                    <span
                      className="font-travis-mono"
                      style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-4)' }}
                    >
                      {o.hint}
                    </span>
                  )}
                  {isSel && <span style={{ fontSize: 12, color: 'var(--signal-ok)' }}>✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/** Selectable pill. Selected = --ink (primary) border, per the spec. */
export function Chip({
  selected,
  disabled = false,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className="font-travis-mono"
      style={{
        background: selected ? 'oklch(1 0 0 / 0.06)' : 'transparent',
        color: selected ? 'var(--ink)' : disabled ? 'var(--ink-4)' : 'var(--ink-2)',
        border: `1px solid ${selected ? 'var(--ink)' : 'var(--hair-strong)'}`,
        borderRadius: 2,
        padding: '10px 16px',
        fontSize: 12.5,
        letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}
