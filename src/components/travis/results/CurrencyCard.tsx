import * as React from "react";
import { SubcardFrame } from "./SubcardFrame";
import { KeyValueRow } from "./KeyValueRow";
import { ArrowIcon } from "../IconSet";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import type { SelectedPlace } from "@/types/place";

type CurrencyCardProps = {
  placeDetails: SelectedPlace | null;
  /** Source currency. Defaults to USD. */
  baseCurrency?: string;
};

const asString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
};

const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function CurrencyCard({
  placeDetails,
  baseCurrency = "USD",
}: CurrencyCardProps) {
  const place = placeDetails
    ? {
        country_code: placeDetails.country_code,
        formatted_address: placeDetails.formatted_address,
        name: placeDetails.name,
      }
    : undefined;

  const { currencyData, targetCurrency, isLoading, error } = useCurrencyExchange(
    baseCurrency,
    place,
  );

  const rate = currencyData?.rate;
  const targetSymbol = asString(currencyData?.symbol);
  const targetName = asString(currencyData?.name);
  const lastUpdated = asString(currencyData?.lastUpdated);

  const [amount, setAmount] = React.useState<number>(100);
  const converted =
    typeof rate === "number" && Number.isFinite(rate)
      ? amount * rate
      : null;

  const sameCurrency = baseCurrency === targetCurrency;
  const headerLabel = sameCurrency
    ? `Currency · ${baseCurrency}`
    : `Currency · ${baseCurrency} → ${targetCurrency ?? "—"}`;

  // "Live" only on real, error-free data. With the fallback mock removed, a
  // failure leaves rate undefined + error set → show "Unavailable", never "Live".
  const meta = isLoading ? (
    <span style={{ color: "var(--ink-3)" }}>Loading…</span>
  ) : rate && !error ? (
    <span
      className="inline-flex items-center gap-1.5 font-travis-mono uppercase"
      style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--signal-ok)" }}
    >
      <span
        aria-hidden
        className="travis-pulse"
        style={{
          width: 6,
          height: 6,
          background: "var(--signal-ok)",
          display: "inline-block",
        }}
      />
      Live
    </span>
  ) : error ? (
    <span
      className="font-travis-mono uppercase"
      style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-4)" }}
    >
      Unavailable
    </span>
  ) : undefined;

  const footnote = lastUpdated
    ? `Mid-market · updated ${lastUpdated}`
    : undefined;

  return (
    <SubcardFrame label={headerLabel} meta={meta} footnote={footnote}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--hair)" }}>
        <div
          className="grid items-baseline"
          style={{ gridTemplateColumns: "1fr auto 1fr", gap: 16 }}
        >
          <div>
            <div
              className="font-travis-mono uppercase"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.16em",
                color: "var(--ink-4)",
                marginBottom: 6,
              }}
            >
              You pay
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-travis-mono"
                style={{ fontSize: 22, color: "var(--ink-3)" }}
              >
                {symbolFor(baseCurrency)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={Number.isFinite(amount) ? amount : ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAmount(Number.isFinite(v) ? v : 0);
                }}
                className="font-travis-mono tabular-nums bg-transparent border-0 outline-none"
                style={{
                  fontSize: 28,
                  fontWeight: 300,
                  color: "var(--ink)",
                  width: "100%",
                  minWidth: 0,
                  padding: 0,
                  letterSpacing: "-0.01em",
                }}
              />
            </div>
          </div>

          <ArrowIcon style={{ color: "var(--ink-4)", alignSelf: "center" }} />

          <div style={{ textAlign: "right" }}>
            <div
              className="font-travis-mono uppercase"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.16em",
                color: "var(--ink-4)",
                marginBottom: 6,
              }}
            >
              You receive
            </div>
            <div
              className="font-travis-mono tabular-nums"
              style={{
                fontSize: 28,
                fontWeight: 300,
                color: converted !== null ? "var(--ink)" : "var(--ink-4)",
                letterSpacing: "-0.01em",
              }}
            >
              {targetSymbol ?? ""}
              {converted !== null ? fmt(converted) : "—"}
            </div>
          </div>
        </div>

        <div
          className="font-travis-mono"
          style={{
            marginTop: 14,
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          {rate
            ? `1 ${baseCurrency} = ${rate.toFixed(4)} ${targetCurrency ?? ""}${targetName ? ` · ${targetName}` : ""}`
            : "Rate unavailable"}
        </div>
      </div>

      <div style={{ padding: "12px 20px 14px" }}>
        <KeyValueRow label="Tipping" value={undefined} mono={false} />
        <KeyValueRow label="Cards" value={undefined} mono={false} />
        <KeyValueRow label="Cash" value={undefined} mono={false} />
        <KeyValueRow label="ATMs" value={undefined} mono={false} noBorder />
      </div>
    </SubcardFrame>
  );
}

function symbolFor(code: string): string {
  const map: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
    KRW: "₩",
    MXN: "$",
    BRL: "R$",
    SGD: "S$",
    THB: "฿",
  };
  return map[code] ?? code;
}
