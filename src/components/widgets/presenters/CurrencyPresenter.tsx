import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Wallet } from 'lucide-react';

interface CurrencyData {
    currencyAmount: number;
    onCurrencyAmountChange: (value: number) => void;
    baseCurrency: string;
    onBaseCurrencyChange: (currency: string) => void;
    currencyData: { rate: number; symbol: string; name: string; lastUpdated: string } | null;
    multiCurrencyData: any;
    targetCurrency: string;
    isLoading: boolean;
    error: string | null;
}

interface CurrencyPresenterProps {
    data: CurrencyData;
    userLoading: boolean;
}

const CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
    'MXN', 'BRL', 'KRW', 'INR', 'SGD', 'NZD', 'THB', 'PEN',
    'COP', 'ARS', 'CLP', 'ZAR', 'AED', 'SAR', 'ILS', 'TRY',
    'NOK', 'SEK', 'DKK', 'PHP', 'IDR', 'MYR', 'VND', 'EGP',
    'NGN', 'KES',
];

const CODE_TO_SYMBOL: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$',
    CHF: 'CHF', CNY: '¥', MXN: '$', BRL: 'R$', KRW: '₩', INR: '₹',
    SGD: 'S$', NZD: 'NZ$', THB: '฿', PEN: 'S/', COP: '$', ARS: '$',
    CLP: '$', ZAR: 'R', AED: 'د.إ', SAR: 'ر.س', ILS: '₪', TRY: '₺',
    NOK: 'kr', SEK: 'kr', DKK: 'kr', PHP: '₱', IDR: 'Rp', MYR: 'RM',
    VND: '₫', EGP: 'E£', NGN: '₦', KES: 'KSh',
};

const CODE_TO_NAME: Record<string, string> = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan', MXN: 'Mexican Peso', BRL: 'Brazilian Real',
    KRW: 'South Korean Won', INR: 'Indian Rupee', SGD: 'Singapore Dollar',
    NZD: 'New Zealand Dollar', THB: 'Thai Baht', PEN: 'Peruvian Sol',
    COP: 'Colombian Peso', ARS: 'Argentine Peso', CLP: 'Chilean Peso',
    ZAR: 'South African Rand', AED: 'UAE Dirham', SAR: 'Saudi Riyal',
    ILS: 'Israeli Shekel', TRY: 'Turkish Lira', NOK: 'Norwegian Krone',
    SEK: 'Swedish Krona', DKK: 'Danish Krone', PHP: 'Philippine Peso',
    IDR: 'Indonesian Rupiah', MYR: 'Malaysian Ringgit', VND: 'Vietnamese Dong',
    EGP: 'Egyptian Pound', NGN: 'Nigerian Naira', KES: 'Kenyan Shilling',
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('currency-animations')) {
    const style = document.createElement('style');
    style.id = 'currency-animations';
    style.textContent = `
        @keyframes currency-gradient-flow {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }
        @keyframes currency-glow-breathe {
            0%, 100% { text-shadow: 0 0 8px rgba(16,185,129,0.1), 0 0 24px rgba(16,185,129,0.05); }
            50% { text-shadow: 0 0 16px rgba(16,185,129,0.25), 0 0 40px rgba(16,185,129,0.08); }
        }
        @keyframes currency-light-sweep {
            0% { left: -40%; opacity: 0; }
            15% { opacity: 0.5; }
            85% { opacity: 0.5; }
            100% { left: 130%; opacity: 0; }
        }
        @keyframes currency-dot-pulse {
            0%, 100% { opacity: 0.35; transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0); }
            50% { opacity: 1; transform: scale(1.15); box-shadow: 0 0 6px 2px rgba(16,185,129,0.2); }
        }
    `;
    document.head.appendChild(style);
}

function fmt(n: number): string {
    if (n === 0) return '0';
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const TOTAL_ROWS = 3;

const CurrencyPresenter: React.FC<CurrencyPresenterProps> = ({ data, userLoading }) => {
    const {
        currencyAmount,
        onCurrencyAmountChange,
        baseCurrency,
        onBaseCurrencyChange,
        currencyData,
        targetCurrency,
        isLoading,
        error
    } = data;

    const [swapped, setSwapped] = useState(false);
    const [displayedValue, setDisplayedValue] = useState('0.00');
    const prevConverted = useRef('0.00');

    const rate = currencyData?.rate || 0;
    const targetCode = targetCurrency || '';

    // Compute conversion (raw number for animation, formatted for display)
    const convertedRaw = useMemo(() => {
        if (!rate) return 0;
        return swapped ? currencyAmount / rate : currencyAmount * rate;
    }, [currencyAmount, rate, swapped]);

    // Smooth number transition
    useEffect(() => {
        const target = convertedRaw;
        const current = parseFloat(prevConverted.current);
        if (Math.abs(target - current) < 0.01) {
            setDisplayedValue(fmt(target));
            prevConverted.current = String(target);
            return;
        }
        const steps = 12;
        let step = 0;
        const diff = target - current;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = current + diff * eased;
            setDisplayedValue(fmt(val));
            if (step >= steps) {
                clearInterval(timer);
                setDisplayedValue(fmt(target));
                prevConverted.current = String(target);
            }
        }, 25);
        return () => clearInterval(timer);
    }, [convertedRaw]);

    // Main output label: full currency name + ISO code
    const outputCode = swapped ? baseCurrency : targetCode;
    const outputName = swapped
        ? (CODE_TO_NAME[baseCurrency] || baseCurrency)
        : (currencyData?.name || CODE_TO_NAME[targetCode] || targetCode);
    const outputLabel = outputName ? `${outputName} (${outputCode})` : outputCode;
    // Supporting rows use ISO codes
    const rateText = swapped
        ? `1 ${targetCode} = ${rate > 0 ? fmt(1 / rate) : '0'} ${baseCurrency}`
        : `1 ${baseCurrency} = ${fmt(rate)} ${targetCode}`;

    // Build detail rows from live data
    const details = useMemo(() => {
        if (!currencyData) return [];
        const rows: { label: string; value: string }[] = [];
        rows.push({ label: 'Exchange rate', value: rateText });
        rows.push({ label: 'Rate type', value: 'Mid-market rate' });
        rows.push({ label: 'Last updated', value: currencyData.lastUpdated || 'Just now' });
        return rows.slice(0, TOTAL_ROWS);
    }, [currencyData, rateText]);


    // Loading
    if (isLoading || userLoading) {
        return (
            <div className="widget-card animate-slide-up">
                <div className="flex items-center gap-3">
                    <div className="widget-icon bg-emerald-500/10 text-emerald-500">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="widget-title">Currency</h3>
                        <p className="widget-subtitle">Live exchange rates</p>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500/30 border-t-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="widget-card animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="widget-icon bg-emerald-500/10 text-emerald-500">
                    <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="widget-title">Currency</h3>
                    <p className="widget-subtitle">Live exchange rates</p>
                </div>
                {/* Live indicator */}
                <div className="flex items-center gap-1.5">
                    <div className="relative">
                        <div
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                            style={{ animation: 'currency-dot-pulse 2.5s ease-in-out infinite' }}
                        />
                    </div>
                    <span className="text-[10px] text-emerald-400/40 font-medium tracking-wide">Live</span>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 flex flex-col mt-3 overflow-hidden">

                {/* Converter block */}
                <div
                    className="rounded-xl px-4 py-3 mb-2 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(100deg, rgba(16,185,129,0.02) 0%, rgba(16,185,129,0.06) 40%, rgba(20,184,166,0.04) 70%, rgba(59,130,246,0.02) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'currency-gradient-flow 12s linear infinite',
                        border: '1px solid rgba(16,185,129,0.07)',
                    }}
                >
                    {/* Light sweep */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-20%',
                            bottom: '-20%',
                            width: '40%',
                            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%)',
                            filter: 'blur(12px)',
                            animation: 'currency-light-sweep 8s ease-in-out infinite',
                            pointerEvents: 'none',
                        }}
                    />
                    {/* Input row */}
                    <div className="flex items-center gap-1.5 mb-2 relative z-10">
                        <input
                            type="number"
                            value={currencyAmount || ''}
                            onChange={(e) => onCurrencyAmountChange(Number(e.target.value) || 0)}
                            className="flex-1 text-[13px] text-foreground/90 rounded-lg px-2.5 py-1.5 outline-none transition-all duration-200 w-0 min-w-0"
                            style={{
                                background: 'rgba(255,255,255,0.025)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: 'none',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(16,185,129,0.08)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="100"
                        />
                        <select
                            value={baseCurrency}
                            onChange={(e) => onBaseCurrencyChange(e.target.value)}
                            className="text-[11px] text-foreground/70 bg-white/[0.025] border border-white/[0.05] rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                        >
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button
                            onClick={() => setSwapped(!swapped)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.05] active:scale-95 transition-all flex-shrink-0"
                            title="Swap"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/40">
                                <path d="M3 5L7 1L11 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11 9L7 13L3 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    {/* Output */}
                    <div className="flex flex-col items-start relative z-10">
                        <div
                            style={{ animation: 'currency-glow-breathe 4s ease-in-out infinite' }}
                        >
                            <span className="text-[25px] font-bold text-emerald-400 tracking-tighter tabular-nums leading-none">
                                {displayedValue}
                            </span>
                        </div>
                        <p className="text-[10px] text-emerald-400/40 mt-0.5 truncate max-w-full">
                            {outputLabel}
                        </p>
                    </div>
                </div>

                {/* Detail rows */}
                <div className="flex-1 min-h-0 space-y-1">
                    {Array.from({ length: TOTAL_ROWS }).map((_, i) => {
                        const row = details[i];
                        const isLast = i === TOTAL_ROWS - 1;
                        return (
                            <div key={i} className="min-w-0">
                                {row ? (
                                    <p className={`text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${isLast ? 'text-muted-foreground/50' : 'text-muted-foreground/75'}`}>
                                        <span className={`font-medium ${isLast ? 'text-muted-foreground/30' : 'text-muted-foreground/40'}`}>{row.label}:</span>{' '}
                                        {row.value}
                                    </p>
                                ) : (
                                    <div className="h-[16px]" />
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default CurrencyPresenter;
