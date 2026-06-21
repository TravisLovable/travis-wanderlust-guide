import * as React from "react";
import type { SelectedPlace } from "@/hooks/useGooglePlaces";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";
import type { PinnedLocationRow } from "@/hooks/usePinnedLocationsDb";

import { Topbar } from "./Topbar";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { DestinationSheet } from "./DestinationSheet";
import { CalendarSheet, formatRange, toISO, type CalDate } from "./CalendarSheet";
import { MonitoringList } from "./MonitoringList";
import { ArrowIcon, PinIcon, CalendarIcon, ChevronDownIcon } from "./IconSet";
import { ContextPicker } from "./ContextPicker";
import { cn } from "@/lib/utils";

export type HomeProps = {
  onSearch: (place: SelectedPlace, dates: { checkin: string; checkout: string }) => void;
};

export function Home({ onSearch }: HomeProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { userProfile } = useAuth();

  const [place, setPlace] = React.useState<SelectedPlace | null>(null);
  const [depart, setDepart] = React.useState<CalDate | null>(null);
  const [ret, setRet] = React.useState<CalDate | null>(null);

  const [destOpen, setDestOpen] = React.useState(false);
  const [datesOpen, setDatesOpen] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);

  const [passport, setPassport] = React.useState<string>(
    () => userProfile?.country_data?.name ?? "United States",
  );
  const [origin, setOrigin] = React.useState<string>("NYC");

  React.useEffect(() => {
    if (userProfile?.country_data?.name) setPassport(userProfile.country_data.name);
  }, [userProfile?.country_data?.name]);

  const destFieldRef = React.useRef<HTMLDivElement | null>(null);
  const datesFieldRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isDesktop) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (destOpen && destFieldRef.current && !destFieldRef.current.contains(target)) {
        const inSheet = (e.target as HTMLElement).closest("[data-dest-popover]");
        if (!inSheet) setDestOpen(false);
      }
      if (datesOpen && datesFieldRef.current && !datesFieldRef.current.contains(target)) {
        const inSheet = (e.target as HTMLElement).closest("[data-dates-popover]");
        if (!inSheet) setDatesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [destOpen, datesOpen, isDesktop]);

  const submit = () => {
    if (!place || !depart || !ret) return;
    onSearch(place, { checkin: toISO(depart), checkout: toISO(ret) });
  };

  const canSubmit = !!place && !!depart && !!ret;
  const passportShort =
    passport === "United States" ? "US" : passport.toUpperCase().slice(0, 3);
  const dateLabel = formatRange(depart, ret) || "May 7 → May 21";

  const systemContext = { clockLocal: localClock(), passport: passportShort, home: origin };

  return (
    <div
      className="min-h-screen w-full font-travis"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <Topbar context={systemContext} onContextClick={() => setContextOpen(true)} />

      {/* Mobile header — desktop uses the sticky Topbar above (hidden under md). */}
      <header
        className="flex md:hidden items-center justify-between gap-3 px-5 border-b border-travis-hair"
        style={{ height: 56 }}
      >
        <Logo />
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 font-travis-mono uppercase"
            style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-3)" }}
          >
            <span
              aria-hidden
              className="travis-pulse"
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: "var(--signal-ok)",
                display: "inline-block",
              }}
            />
            Live
          </span>
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            aria-label="Travel context"
            className="inline-flex items-center gap-1.5 font-travis-mono uppercase cursor-pointer"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "var(--ink-2)",
              border: "1px solid var(--hair-strong)",
              borderRadius: 6,
              padding: "5px 8px",
              background: "var(--bg-inset)",
            }}
          >
            <span>{passportShort}</span>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <span>{origin}</span>
            <ChevronDownIcon width={10} height={10} style={{ color: "var(--ink-3)" }} />
          </button>
          <UserMenu />
        </div>
      </header>

      <main className="px-5 md:px-8 pt-10 md:pt-16">
        <div className="travis-rise max-w-[1180px] mx-auto w-full">
          <div
            className="font-travis-mono uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.34)",
              marginBottom: 12,
            }}
          >
            Enter a destination — get what matters.
          </div>

          <h1
            className="font-travis-display uppercase"
            style={{
              fontWeight: 500,
              fontSize: "clamp(64px, 19.5vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              margin: "0 0 clamp(48px, 14vw, 72px) 0",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            The world
            <br />
            awaits.
          </h1>

          {/* Query bar — stacked on mobile, single row on desktop */}
          <div
            className={cn(
              "border border-travis-hair overflow-visible relative",
              "flex flex-col md:grid md:grid-cols-[1.6fr_1fr_auto]",
            )}
            style={{
              background: "var(--bg-raised)",
              borderRadius: 12,
              padding: 6,
            }}
          >
            <div ref={destFieldRef} className="relative">
              <FieldButton
                label="Destination"
                icon={<PinIcon style={{ color: "var(--ink-3)" }} />}
                value={place?.formatted_address ?? "City or country"}
                muted={!place}
                onClick={() => {
                  setDestOpen(true);
                  setDatesOpen(false);
                }}
                divider
              />
              <DestinationSheet
                open={destOpen}
                onOpenChange={setDestOpen}
                initialQuery={place?.name ?? ""}
                onSelect={(p) => {
                  setPlace(p);
                  setDestOpen(false);
                  setDatesOpen(true);
                }}
              />
            </div>

            <div ref={datesFieldRef} className="relative">
              <FieldButton
                label="Dates"
                icon={<CalendarIcon style={{ color: "var(--ink-3)" }} />}
                value={dateLabel}
                muted={!depart || !ret}
                onClick={() => {
                  setDatesOpen(true);
                  setDestOpen(false);
                }}
              />
              <CalendarSheet
                open={datesOpen}
                onOpenChange={setDatesOpen}
                depart={depart}
                ret={ret}
                onChange={(d, r) => {
                  setDepart(d);
                  setRet(r);
                }}
              />
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className={cn(
                "w-full md:w-auto cursor-pointer border-0 font-travis flex items-center justify-center gap-2.5",
                "transition-all",
                canSubmit ? "travis-cta-ambient" : "cursor-not-allowed",
              )}
              style={{
                background: "var(--ink)",
                color: "var(--bg)",
                padding: "18px 24px",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                borderRadius: 8,
                margin: "6px 0 0 0",
              }}
            >
              Get Intel
              <ArrowIcon width={16} height={16} />
            </button>
          </div>

          <p
            className="font-travis"
            style={{
              marginTop: 20,
              fontSize: 12.5,
              color: "rgba(255,255,255,0.42)",
              letterSpacing: "-0.005em",
              lineHeight: 1.5,
            }}
          >
            Entry rules, airport friction, weather, currency — resolved before you go.
          </p>
        </div>

        <div className="max-w-[1180px] mx-auto w-full">
          <MonitoringList
            onPick={(row) => {
              const synth: SelectedPlace = {
                name: row.name,
                formatted_address: row.formatted_address,
                country_code: row.country_code ?? undefined,
                latitude: Number(row.latitude),
                longitude: Number(row.longitude),
                region: row.region ?? undefined,
                place_id: row.place_id ?? row.id,
              };
              setPlace(synth);
              if (depart && ret) {
                onSearch(synth, { checkin: toISO(depart), checkout: toISO(ret) });
              } else {
                setDatesOpen(true);
              }
            }}
          />
        </div>

        <div className="pb-12 md:pb-20" />
      </main>

      <ContextPicker
        open={contextOpen}
        onOpenChange={setContextOpen}
        passport={passport}
        setPassport={setPassport}
        origin={origin}
        setOrigin={setOrigin}
      />
    </div>
  );
}

type FieldButtonProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  muted?: boolean;
  divider?: boolean;
  onClick: () => void;
};

function FieldButton({
  label,
  icon,
  value,
  muted = false,
  divider = false,
  onClick,
}: FieldButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left cursor-pointer bg-transparent border-0 transition-colors",
        "hover:bg-white/[0.02] rounded-lg",
        divider && "md:border-r md:border-travis-hair",
      )}
      style={{ padding: "14px 22px" }}
    >
      <div
        className="font-travis-mono uppercase flex items-center gap-2"
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--ink-4)",
          marginBottom: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        className="font-travis truncate"
        style={{
          fontSize: 14.5,
          fontWeight: 500,
          lineHeight: 1.15,
          color: muted ? "var(--ink-3)" : "rgba(255,255,255,0.98)",
          letterSpacing: "-0.005em",
        }}
      >
        {value}
      </div>
    </button>
  );
}

function localClock(): string {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop() ?? "";
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return tz ? `${hh}:${mm} ${tz}` : `${hh}:${mm}`;
}
