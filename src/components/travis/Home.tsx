import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SelectedPlace } from "@/hooks/useGooglePlaces";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";
import type { PinnedLocationRow } from "@/hooks/usePinnedLocationsDb";

import { Topbar } from "./Topbar";
import { MobileHeader } from "./MobileHeader";
import { DestinationSheet } from "./DestinationSheet";
import { CalendarSheet, formatRange, toISO, type CalDate } from "./CalendarSheet";
import { MonitoringList } from "./MonitoringList";
import { ArrowIcon, PinIcon, CalendarIcon } from "./IconSet";
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

  // Progressive disclosure via a SINGLE bar that repurposes in place:
  //   no place            → bar prompts for a destination (Places autocomplete)
  //   place, no dates      → same bar prompts for dates (opens the calendar)
  //   place + dates        → the "Get Intel" CTA is revealed
  // barFade crossfades the bar's content on each swap; reveal grows the CTA in.
  const barFade = {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.22, ease: "easeOut" as const },
  };
  const reveal = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" as const },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  };

  const [passport, setPassport] = React.useState<string>(
    () => userProfile?.country_data?.name ?? "United States",
  );
  const [origin, setOrigin] = React.useState<string>("NYC");

  React.useEffect(() => {
    if (userProfile?.country_data?.name) setPassport(userProfile.country_data.name);
  }, [userProfile?.country_data?.name]);

  // Single bar → single anchor for the desktop popovers + outside-click close.
  const barRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isDesktop) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if ((destOpen || datesOpen) && barRef.current && !barRef.current.contains(target)) {
        const inPopover =
          target.closest("[data-dest-popover]") || target.closest("[data-dates-popover]");
        if (!inPopover) {
          setDestOpen(false);
          setDatesOpen(false);
        }
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

  // A vaul bottom sheet locks body scroll while open (position:fixed) and
  // restores it on close; in the WKWebView that restore can leave the document
  // with a stuck horizontal scrollLeft, shifting the page sideways. Snap any
  // horizontal document scroll back to 0 once no sheet is open (now, next
  // frame, and after the ~300ms close animation).
  React.useEffect(() => {
    if (destOpen || datesOpen) return;
    const reset = () => {
      if (document.documentElement.scrollLeft) document.documentElement.scrollLeft = 0;
      if (document.body.scrollLeft) document.body.scrollLeft = 0;
    };
    reset();
    const raf = requestAnimationFrame(reset);
    const t = setTimeout(reset, 350);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [destOpen, datesOpen]);

  return (
    <div
      className="w-full font-travis flex flex-col overflow-hidden"
      // Fixed viewport-height shell: the header stays pinned and the content
      // beneath it scrolls, so nothing (e.g. MONITORING) clips at the bottom.
      // 100dvh + viewport-fit=cover spans the full screen incl. safe areas.
      style={{ height: "100dvh", background: "var(--bg)", color: "var(--ink)" }}
    >
      {/* Fixed header — never scrolls. Safe-area top inset lives inside the header. */}
      <div className="shrink-0">
        <Topbar context={systemContext} onContextClick={() => setContextOpen(true)} />

        {/* Mobile header — desktop uses the sticky Topbar above (hidden under md). */}
        <MobileHeader
          passport={passport}
          origin={origin}
          onContextClick={() => setContextOpen(true)}
        />
      </div>

      {/* Scrollable content region beneath the fixed header. min-h-0 lets the
          flex child shrink so overflow-y-auto actually scrolls. overflow-x-hidden
          + touch-action:pan-y + overscroll-behavior-x:none keep it strictly
          vertical — no horizontal drag, pan, or rubber-band. */}
      <main
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 md:px-8 pt-10 md:pt-16"
        style={{ touchAction: "pan-y", overscrollBehaviorX: "none" }}
      >
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

          {/* Single search bar — one bar that repurposes in place:
              destination → dates. No second field is ever added. */}
          <div
            className="border border-travis-hair overflow-visible relative"
            style={{
              background: "var(--bg-raised)",
              borderRadius: 12,
              padding: 6,
            }}
          >
            <div ref={barRef} className="relative">
              {/* The bar's content crossfades between the two prompts. */}
              <AnimatePresence mode="wait" initial={false}>
                {!place ? (
                  <motion.div key="bar-destination" {...barFade}>
                    <FieldButton
                      label="Destination"
                      icon={<PinIcon style={{ color: "var(--ink-3)" }} />}
                      value="City or country"
                      muted
                      onClick={() => {
                        setDestOpen(true);
                        setDatesOpen(false);
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="bar-dates" {...barFade}>
                    <FieldButton
                      label={place.formatted_address}
                      icon={<CalendarIcon style={{ color: "var(--ink-3)" }} />}
                      value={depart && ret ? dateLabel : "Add your dates"}
                      muted={!depart || !ret}
                      onClick={() => {
                        setDatesOpen(true);
                        setDestOpen(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sheets: portaled bottom sheets on mobile, anchored popovers on
                  desktop. Always mounted; driven by the open state above. */}
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

            {/* Get Intel — revealed only once dates are set. */}
            <AnimatePresence initial={false}>
              {canSubmit && (
                <motion.div key="cta" {...reveal} style={{ overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={submit}
                    className={cn(
                      "w-full cursor-pointer border-0 font-travis flex items-center justify-center gap-2.5",
                      "transition-all travis-cta-ambient",
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
                </motion.div>
              )}
            </AnimatePresence>
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

        <div className="pb-[calc(3rem+var(--sab))] md:pb-20" />
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
