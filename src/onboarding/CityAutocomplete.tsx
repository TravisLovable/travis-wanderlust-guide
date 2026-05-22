// Step 7.5 — City autocomplete for the Identity step's Home City field.
//
// Reuses the generic useGooglePlaces hook (same script-load singleton, edge-
// function fallback, `(cities)` filter and session tokens the destination field
// uses) and renders a wizard-themed dropdown on top — chrome matches the
// SelectField in steps/fields.tsx (.onb-input + .onb-option, --bg-raised panel).
//
// Graceful by design: the input is always a usable text field and free text is
// written through on every keystroke, so the user is never blocked. If the
// Places SDK is unavailable (bad key, network, rate limit), `hasApiAccess`
// goes false and it silently degrades to plain text — no toast, no crash.
//
// Stores a formatted "City, NY" (US) / "City, Country" (non-US) string in
// data.homeCity; the column stays plain text.

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useGooglePlaces, type SelectedPlace } from '@/hooks/useGooglePlaces';

interface CityAutocompleteProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** "New York, NY" for US (admin-area short code), "Lisbon, Portugal" otherwise. */
function formatCity(place: SelectedPlace): string {
  const city = (place.name ?? '').trim();
  if (!city) return (place.formatted_address ?? '').trim();
  const tail = place.country_code === 'us' ? place.region_code : place.country;
  return tail ? `${city}, ${tail}` : city;
}

export function CityAutocomplete({ id, value, onChange, placeholder, autoFocus }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  // Gates Places lookups: never fire for a pre-filled value, only once the user
  // types (so editing an existing homeCity just displays it).
  const [interacted, setInteracted] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, hasApiAccess, getPlaceDetails } = useGooglePlaces(query, interacted);

  // Close on outside click (Escape is handled in onKeyDown).
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const showDropdown = open && hasApiAccess && interacted && (suggestions.length > 0 || isLoading);

  const handleType = (v: string) => {
    setQuery(v);
    onChange(v); // write-through: free text is always stored, even without a pick
    setInteracted(true);
    setOpen(true);
    setActiveIndex(-1);
  };

  const choose = async (placeId: string, fallbackText: string) => {
    setOpen(false);
    setActiveIndex(-1);
    try {
      const place = await getPlaceDetails(placeId);
      const formatted = place ? formatCity(place) : fallbackText;
      setQuery(formatted);
      onChange(formatted);
    } catch (err) {
      // Graceful: keep the chosen city name, never block the user.
      console.error('[city-autocomplete] place details failed:', err);
      setQuery(fallbackText);
      onChange(fallbackText);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && suggestions.length) setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        const s = suggestions[activeIndex];
        choose(s.place_id, s.structured_formatting.main_text);
      }
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        id={id}
        className="font-travis onb-input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        placeholder={placeholder}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => {
          if (interacted && suggestions.length) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {showDropdown && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            zIndex: 30,
            background: 'var(--bg-raised)',
            border: '1px solid var(--hair-strong)',
            borderRadius: 2,
            maxHeight: 300,
            overflowY: 'auto',
            boxShadow: '0 14px 44px oklch(0 0 0 / 0.45)',
          }}
        >
          {suggestions.length === 0 && isLoading ? (
            <div
              className="font-travis-mono"
              style={{ padding: '12px 14px', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-4)' }}
            >
              SEARCHING…
            </div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={s.place_id}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                // preventDefault keeps input focus so the click resolves before blur.
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(s.place_id, s.structured_formatting.main_text)}
                className="font-travis onb-option"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  width: '100%',
                  background: i === activeIndex ? 'oklch(1 0 0 / 0.06)' : 'transparent',
                  border: 0,
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 15, color: 'var(--ink)' }}>{s.structured_formatting.main_text}</span>
                {s.structured_formatting.secondary_text && (
                  <span
                    className="font-travis-mono"
                    style={{ fontSize: 10.5, letterSpacing: '0.04em', color: 'var(--ink-4)' }}
                  >
                    {s.structured_formatting.secondary_text}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
