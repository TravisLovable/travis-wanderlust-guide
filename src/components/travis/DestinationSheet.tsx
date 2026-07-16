import * as React from "react";
import { useGooglePlaces, type SelectedPlace } from "@/hooks/useGooglePlaces";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BottomSheet } from "./native/BottomSheet";
import { SearchIcon, PinIcon } from "./IconSet";
import { cn } from "@/lib/utils";

type DestinationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (place: SelectedPlace) => void;
  initialQuery?: string;
};

/**
 * Destination picker with Google Places autocomplete.
 *
 * On mobile: full-height bottom sheet.
 * On desktop: inline popover positioned by the parent field.
 *
 * Wraps the existing useGooglePlaces hook unchanged so Supabase Edge
 * Function fallback (google-places-autocomplete / google-place-details)
 * keeps working when VITE_GOOGLE_PLACES_KEY is unset.
 */
export function DestinationSheet({
  open,
  onOpenChange,
  onSelect,
  initialQuery = "",
}: DestinationSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    if (!open) return null;
    return (
      <div
        data-dest-popover
        className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-travis-hair-strong overflow-hidden travis-live-fade"
        style={{
          background: "var(--bg-raised)",
          boxShadow: "0 24px 60px oklch(0 0 0 / 0.55)",
        }}
      >
        <Body initialQuery={initialQuery} onSelect={onSelect} />
      </div>
    );
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Where to?"
      description="Search any city or country."
      contentClassName="max-h-[80vh]"
    >
      <Body initialQuery={initialQuery} onSelect={onSelect} />
    </BottomSheet>
  );
}

type BodyProps = {
  initialQuery: string;
  onSelect: (place: SelectedPlace) => void;
};

function Body({ initialQuery, onSelect }: BodyProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [resolving, setResolving] = React.useState<string | null>(null);
  const { suggestions, isLoading, getPlaceDetails } = useGooglePlaces(
    query,
    true,
  );

  const onPick = async (placeId: string) => {
    setResolving(placeId);
    const place = await getPlaceDetails(placeId);
    setResolving(null);
    if (place) onSelect(place);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 border border-travis-hair px-3",
        )}
        style={{ borderRadius: 6, background: "var(--bg-inset)" }}
      >
        <SearchIcon style={{ color: "var(--ink-3)" }} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="City or country"
          className="bg-transparent border-0 outline-none flex-1 font-travis"
          style={{
            color: "var(--ink)",
            padding: "12px 0",
            // Must stay >= 16px: iOS zooms the web view to any focused input with a
            // smaller font (by exactly 16/fontSize), and the zoom outlives the
            // keyboard — leaving the page scaled and panned under the status bar.
            fontSize: 16,
          }}
        />
      </div>

      <ul
        className="mt-2 max-h-[60vh] md:max-h-[320px] overflow-auto"
        role="listbox"
      >
        {suggestions.map((s) => (
          <li key={s.place_id}>
            <button
              type="button"
              role="option"
              aria-selected={false}
              disabled={resolving === s.place_id}
              onClick={() => onPick(s.place_id)}
              className="w-full flex items-center gap-3 cursor-pointer border-0 bg-transparent text-left"
              style={{
                padding: "12px 8px",
                borderBottom: "1px solid var(--hair)",
                opacity: resolving === s.place_id ? 0.5 : 1,
              }}
            >
              <PinIcon style={{ color: "var(--ink-3)", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div
                  className="font-travis truncate"
                  style={{ fontSize: 14, color: "var(--ink)" }}
                >
                  {s.structured_formatting.main_text || s.description}
                </div>
                {s.structured_formatting.secondary_text && (
                  <div
                    className="font-travis truncate"
                    style={{ fontSize: 12, color: "var(--ink-3)" }}
                  >
                    {s.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
              {resolving === s.place_id && (
                <span
                  className="font-travis-mono uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--ink-4)",
                  }}
                >
                  …
                </span>
              )}
            </button>
          </li>
        ))}
        {!isLoading && query.length >= 2 && suggestions.length === 0 && (
          <li
            className="font-travis text-center"
            style={{
              padding: 18,
              color: "var(--ink-4)",
              fontSize: 13,
            }}
          >
            No matching destinations.
          </li>
        )}
        {query.length < 2 && (
          <li
            className="font-travis text-center"
            style={{
              padding: 18,
              color: "var(--ink-4)",
              fontSize: 13,
            }}
          >
            Type at least 2 characters to search.
          </li>
        )}
      </ul>

      <div
        className="font-travis-mono uppercase flex justify-between"
        style={{
          fontSize: 9.5,
          letterSpacing: "0.1em",
          color: "var(--ink-4)",
          padding: "8px 4px 0",
          borderTop: "1px solid var(--hair)",
          marginTop: 8,
        }}
      >
        <span>Powered by Places API</span>
        <span>↵ to select</span>
      </div>
    </div>
  );
}
