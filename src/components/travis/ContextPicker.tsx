import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomSheet } from "./native/BottomSheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SearchIcon } from "./IconSet";
import { FLAG } from "./FLAG";
import { cn } from "@/lib/utils";

/**
 * Country list seed. This is a representative subset — extend or replace
 * with a full ISO-3166 list when the wizard / picker is wired to real data.
 */
const COUNTRIES: Array<{ name: string; code: string; region: string }> = [
  { name: "United States",  code: "US", region: "North America" },
  { name: "Canada",         code: "CA", region: "North America" },
  { name: "Mexico",         code: "MX", region: "North America" },
  { name: "Portugal",       code: "PT", region: "Europe" },
  { name: "Spain",          code: "ES", region: "Europe" },
  { name: "France",         code: "FR", region: "Europe" },
  { name: "Italy",          code: "IT", region: "Europe" },
  { name: "Greece",         code: "GR", region: "Europe" },
  { name: "Germany",        code: "DE", region: "Europe" },
  { name: "United Kingdom", code: "GB", region: "Europe" },
  { name: "Ireland",        code: "IE", region: "Europe" },
  { name: "Netherlands",    code: "NL", region: "Europe" },
  { name: "Switzerland",    code: "CH", region: "Europe" },
  { name: "Iceland",        code: "IS", region: "Europe" },
  { name: "Japan",          code: "JP", region: "Asia" },
  { name: "Thailand",       code: "TH", region: "Asia" },
  { name: "Vietnam",        code: "VN", region: "Asia" },
  { name: "South Korea",    code: "KR", region: "Asia" },
  { name: "Indonesia",      code: "ID", region: "Asia" },
  { name: "Morocco",        code: "MA", region: "Africa" },
  { name: "Egypt",          code: "EG", region: "Africa" },
  { name: "Kenya",          code: "KE", region: "Africa" },
  { name: "South Africa",   code: "ZA", region: "Africa" },
  { name: "Cuba",           code: "CU", region: "Caribbean" },
  { name: "Brazil",         code: "BR", region: "South America" },
  { name: "Argentina",      code: "AR", region: "South America" },
  { name: "Peru",           code: "PE", region: "South America" },
  { name: "Colombia",       code: "CO", region: "South America" },
  { name: "Australia",      code: "AU", region: "Oceania" },
  { name: "New Zealand",    code: "NZ", region: "Oceania" },
];

const ORIGINS: Array<{ name: string; code: string }> = [
  { name: "New York",     code: "NYC" },
  { name: "Los Angeles",  code: "LAX" },
  { name: "Chicago",      code: "ORD" },
  { name: "San Francisco", code: "SFO" },
  { name: "Miami",        code: "MIA" },
  { name: "Boston",       code: "BOS" },
  { name: "Seattle",      code: "SEA" },
  { name: "Austin",       code: "AUS" },
  { name: "Denver",       code: "DEN" },
  { name: "Atlanta",      code: "ATL" },
  { name: "London",       code: "LON" },
  { name: "Paris",        code: "PAR" },
  { name: "Tokyo",        code: "TYO" },
  { name: "Singapore",    code: "SIN" },
  { name: "Dubai",        code: "DXB" },
];

type Tab = "passport" | "origin";

export type ContextPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passport: string;
  setPassport: (value: string) => void;
  origin: string;
  setOrigin: (value: string) => void;
};

export function ContextPicker(props: ContextPickerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [tab, setTab] = React.useState<Tab>("passport");

  const body = <ContextPickerBody {...props} tab={tab} setTab={setTab} />;

  if (isDesktop) {
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="bg-travis-bg-raised border-travis-hair-strong font-travis text-travis-ink max-w-[540px] p-0">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="font-travis-display text-travis-ink">
              Travel context
            </DialogTitle>
            <DialogDescription className="text-travis-ink-3">
              Used to scope visa, health, and currency intelligence.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-2">{body}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Travel context"
      description="Used to scope visa, health, and currency intelligence."
    >
      {body}
    </BottomSheet>
  );
}

function ContextPickerBody({
  passport,
  setPassport,
  origin,
  setOrigin,
  tab,
  setTab,
  onOpenChange,
}: ContextPickerProps & {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const [query, setQuery] = React.useState("");
  const lower = query.trim().toLowerCase();

  const items =
    tab === "passport"
      ? COUNTRIES.filter(
          (c) =>
            !lower ||
            c.name.toLowerCase().includes(lower) ||
            c.code.toLowerCase().includes(lower) ||
            c.region.toLowerCase().includes(lower),
        )
      : ORIGINS.filter(
          (o) =>
            !lower ||
            o.name.toLowerCase().includes(lower) ||
            o.code.toLowerCase().includes(lower),
        );

  const onPick = (name: string) => {
    if (tab === "passport") setPassport(name);
    else setOrigin(name);
    onOpenChange(false);
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {(["passport", "origin"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "font-travis-mono uppercase cursor-pointer border",
              "transition-colors",
            )}
            style={{
              padding: "8px 14px",
              fontSize: 11,
              letterSpacing: "0.12em",
              borderRadius: 4,
              borderColor:
                tab === k ? "var(--hair-strong)" : "var(--hair)",
              background:
                tab === k ? "var(--bg-inset)" : "transparent",
              color: tab === k ? "var(--ink)" : "var(--ink-3)",
            }}
          >
            {k === "passport" ? "Passport" : "Home"}
          </button>
        ))}
      </div>

      <div
        className="flex items-center gap-2 border border-travis-hair px-3 mb-3"
        style={{ borderRadius: 6, background: "var(--bg-inset)" }}
      >
        <SearchIcon style={{ color: "var(--ink-3)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "passport" ? "Search country" : "Search city"}
          className="bg-transparent border-0 outline-none flex-1 font-travis"
          style={{
            color: "var(--ink)",
            padding: "10px 0",
            fontSize: 14,
          }}
        />
      </div>

      <ul
        className="space-y-0.5 max-h-[360px] overflow-auto pr-1"
        role="listbox"
      >
        {items.map((item) => {
          const isSelected =
            (tab === "passport" && passport === item.name) ||
            (tab === "origin" && origin === item.name);
          const isCountry = "region" in item;
          return (
            <li key={item.code}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onPick(item.name)}
                className="w-full flex items-center gap-3 cursor-pointer border-0 bg-transparent"
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  borderRadius: 4,
                  background: isSelected
                    ? "color-mix(in oklch, var(--signal-ok) 12%, transparent)"
                    : "transparent",
                }}
              >
                <span style={{ fontSize: 18, opacity: 0.9 }}>
                  {FLAG[item.name] ?? ""}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-travis"
                    style={{ fontSize: 14, color: "var(--ink)" }}
                  >
                    {item.name}
                  </div>
                  {isCountry && (
                    <div
                      className="font-travis"
                      style={{ fontSize: 12, color: "var(--ink-3)" }}
                    >
                      {(item as { region: string }).region}
                    </div>
                  )}
                </div>
                <span
                  className="font-travis-mono uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--ink-4)",
                  }}
                >
                  {item.code}
                </span>
              </button>
            </li>
          );
        })}
        {items.length === 0 && (
          <li
            className="font-travis text-center"
            style={{
              padding: 20,
              color: "var(--ink-4)",
              fontSize: 13,
            }}
          >
            No matches.
          </li>
        )}
      </ul>
    </div>
  );
}
