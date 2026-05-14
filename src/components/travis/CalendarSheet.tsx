import * as React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BottomSheet } from "./native/BottomSheet";
import { ChevronLeftIcon, ChevronRightIcon } from "./IconSet";
import { cn } from "@/lib/utils";

export type CalDate = { y: number; m: number; d: number };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const dateKey = (a: CalDate) => a.y * 10000 + a.m * 100 + a.d;
const dateCmp = (a: CalDate, b: CalDate) => dateKey(a) - dateKey(b);

export function toISO(d: CalDate): string {
  const mm = String(d.m + 1).padStart(2, "0");
  const dd = String(d.d).padStart(2, "0");
  return `${d.y}-${mm}-${dd}`;
}

export function formatRange(dep: CalDate | null, ret: CalDate | null): string {
  if (!dep) return "";
  const d1 = `${MONTHS_SHORT[dep.m]} ${dep.d}`;
  if (!ret) return d1;
  const sameMonth = dep.m === ret.m && dep.y === ret.y;
  const d2 = sameMonth ? String(ret.d) : `${MONTHS_SHORT[ret.m]} ${ret.d}`;
  return `${d1} → ${d2}`;
}

type CalendarSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depart: CalDate | null;
  ret: CalDate | null;
  onChange: (depart: CalDate | null, ret: CalDate | null) => void;
};

export function CalendarSheet({
  open,
  onOpenChange,
  depart,
  ret,
  onChange,
}: CalendarSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const initial = depart
    ? { y: depart.y, m: depart.m }
    : { y: new Date().getFullYear(), m: new Date().getMonth() };
  const [view, setView] = React.useState(initial);
  const [pickingReturn, setPickingReturn] = React.useState(false);
  const [hoverDay, setHoverDay] = React.useState<CalDate | null>(null);

  React.useEffect(() => {
    if (open && depart) setView({ y: depart.y, m: depart.m });
  }, [open, depart]);

  const next = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  const prev = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));

  const handlePick = (picked: CalDate) => {
    if (!pickingReturn || !depart) {
      onChange(picked, null);
      setPickingReturn(true);
      return;
    }
    if (dateCmp(picked, depart) < 0) {
      onChange(picked, null);
      setPickingReturn(true);
      return;
    }
    onChange(depart, picked);
    setPickingReturn(false);
    window.setTimeout(() => onOpenChange(false), 180);
  };

  const monthA = view;
  const monthB = view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 };

  const body = (
    <div>
      <div
        className="flex justify-between items-center"
        style={{
          marginBottom: 12,
          paddingBottom: 12,
          borderBottom: "1px solid var(--hair)",
        }}
      >
        <div className="flex gap-6">
          <ReadoutCell label="Depart" date={depart} />
          <ReadoutCell
            label="Return"
            date={ret}
            placeholder={pickingReturn ? "Select return" : "—"}
          />
        </div>
        <div className="flex gap-1.5">
          <NavBtn ariaLabel="Previous month" onClick={prev}>
            <ChevronLeftIcon width={12} height={12} />
          </NavBtn>
          <NavBtn ariaLabel="Next month" onClick={next}>
            <ChevronRightIcon width={12} height={12} />
          </NavBtn>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          isDesktop ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        <MonthGrid
          view={monthA}
          depart={depart}
          ret={ret}
          hoverDay={hoverDay}
          setHoverDay={setHoverDay}
          pickingReturn={pickingReturn}
          onPick={handlePick}
        />
        {isDesktop && (
          <MonthGrid
            view={monthB}
            depart={depart}
            ret={ret}
            hoverDay={hoverDay}
            setHoverDay={setHoverDay}
            pickingReturn={pickingReturn}
            onPick={handlePick}
          />
        )}
      </div>

      <div
        className="flex justify-between items-center"
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--hair)",
        }}
      >
        <span
          className="font-travis-mono uppercase"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.1em",
            color: "var(--ink-4)",
          }}
        >
          {depart && ret
            ? `${Math.max(1, Math.round((dateKey(ret) - dateKey(depart)) / 100))} day stay`
            : pickingReturn
              ? "Pick return date"
              : "Pick depart date"}
        </span>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="cursor-pointer border-0 font-travis-mono uppercase"
          style={{
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "7px 16px",
            borderRadius: 4,
            fontSize: 10.5,
            letterSpacing: "0.06em",
            fontWeight: 500,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    if (!open) return null;
    return (
      <div
        data-dates-popover
        className="absolute right-0 mt-2 z-50 rounded-lg border border-travis-hair-strong travis-live-fade"
        style={{
          width: 580,
          background: "var(--bg-raised)",
          boxShadow: "0 16px 44px oklch(0 0 0 / 0.55)",
          padding: "16px 18px 14px",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {body}
      </div>
    );
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Dates"
      description="Tap depart, then return."
    >
      {body}
    </BottomSheet>
  );
}

function ReadoutCell({
  label,
  date,
  placeholder = "Select date",
}: {
  label: string;
  date: CalDate | null;
  placeholder?: string;
}) {
  return (
    <div>
      <div
        className="font-travis-mono uppercase"
        style={{
          fontSize: 9.5,
          letterSpacing: "0.1em",
          color: "var(--ink-4)",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        className="font-travis"
        style={{
          fontSize: 13.5,
          color: date ? "var(--ink)" : "var(--ink-4)",
          fontWeight: 500,
          letterSpacing: "-0.005em",
        }}
      >
        {date
          ? `${MONTHS_SHORT[date.m]} ${date.d}, ${date.y}`
          : placeholder}
      </div>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="grid place-items-center cursor-pointer border border-travis-hair bg-transparent text-travis-ink-3"
      style={{ width: 26, height: 26, borderRadius: 4 }}
    >
      {children}
    </button>
  );
}

type MonthGridProps = {
  view: { y: number; m: number };
  depart: CalDate | null;
  ret: CalDate | null;
  hoverDay: CalDate | null;
  setHoverDay: (d: CalDate | null) => void;
  pickingReturn: boolean;
  onPick: (d: CalDate) => void;
};

function MonthGrid({
  view,
  depart,
  ret,
  hoverDay,
  setHoverDay,
  pickingReturn,
  onPick,
}: MonthGridProps) {
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const todayCD: CalDate = {
    y: today.getFullYear(),
    m: today.getMonth(),
    d: today.getDate(),
  };

  const isEndpoint = (d: number, target: CalDate | null) =>
    !!target && view.y === target.y && view.m === target.m && d === target.d;

  const isInRange = (d: number) => {
    if (!depart) return false;
    const cur: CalDate = { y: view.y, m: view.m, d };
    if (ret) return dateCmp(cur, depart) > 0 && dateCmp(cur, ret) < 0;
    if (pickingReturn && hoverDay && dateCmp(hoverDay, depart) > 0) {
      return dateCmp(cur, depart) > 0 && dateCmp(cur, hoverDay) < 0;
    }
    return false;
  };

  return (
    <div>
      <div
        className="text-center font-travis"
        style={{
          fontSize: 12.5,
          fontWeight: 500,
          color: "var(--ink)",
          marginBottom: 10,
        }}
      >
        {MONTHS[view.m]} {view.y}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="font-travis-mono text-center uppercase"
            style={{
              fontSize: 9.5,
              letterSpacing: "0.08em",
              color: "var(--ink-4)",
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ height: 32 }} />;
          const isDepart = isEndpoint(d, depart);
          const isReturn = isEndpoint(d, ret);
          const inRange = isInRange(d);
          const isPast =
            dateCmp({ y: view.y, m: view.m, d }, todayCD) < 0;
          const isToday =
            todayCD.y === view.y && todayCD.m === view.m && todayCD.d === d;
          const isEndpointAny = isDepart || isReturn;

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onMouseEnter={() => setHoverDay({ y: view.y, m: view.m, d })}
              onMouseLeave={() => setHoverDay(null)}
              onClick={() => onPick({ y: view.y, m: view.m, d })}
              className={cn(
                "grid place-items-center font-travis-mono border-0",
                isPast ? "cursor-not-allowed" : "cursor-pointer",
              )}
              style={{
                height: 32,
                background: isEndpointAny
                  ? "var(--ink)"
                  : inRange
                    ? "oklch(1 0 0 / 0.06)"
                    : "transparent",
                color: isEndpointAny
                  ? "var(--bg)"
                  : isPast
                    ? "var(--ink-4)"
                    : "var(--ink-2)",
                borderRadius:
                  isDepart && !ret
                    ? 4
                    : isDepart
                      ? "4px 0 0 4px"
                      : isReturn
                        ? "0 4px 4px 0"
                        : 0,
                fontSize: 12,
                fontWeight: isEndpointAny ? 500 : 400,
                opacity: isPast ? 0.4 : 1,
                position: "relative",
              }}
            >
              {d}
              {isToday && !isEndpointAny && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: 3,
                    width: 4,
                    height: 1,
                    background: "var(--signal-ok)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
