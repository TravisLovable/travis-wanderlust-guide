import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface CurrencyData {
    currencyAmount: number;
    onCurrencyAmountChange: (value: number) => void;
    baseCurrency: string;
    onBaseCurrencyChange: (currency: string) => void;
    currencyData: { rate: number; symbol: string; name: string; lastUpdated: string } | null;
    multiCurrencyData: any;
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

// Contextual insight based on rate magnitude
function getRateInsight(rate: number, targetName: string): string {
    if (!rate || rate === 0) return '';
    if (rate > 100) return 'Strong purchasing power at destination';
    if (rate > 10) return 'Favorable exchange rate';
    if (rate > 1.5) return 'Moderate rate — typical for this pair';
    if (rate > 0.8) return 'Near parity — straightforward pricing';
    return 'Premium currency at destination';
}


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

const CurrencyPresenter: React.FC<CurrencyPresenterProps> = ({ data, userLoading }) => {
    const {
        currencyAmount,
        onCurrencyAmountChange,
        baseCurrency,
        onBaseCurrencyChange,
        currencyData,
        isLoading,
        error
    } = data;

    const [swapped, setSwapped] = useState(false);
    const [displayedValue, setDisplayedValue] = useState('0.00');
    const prevConverted = useRef('0.00');

    const rate = currencyData?.rate || 0;
    const targetSymbol = currencyData?.symbol || '';

    // Compute conversion
    const converted = useMemo(() => {
        if (!rate) return '0.00';
        return swapped
            ? (currencyAmount / rate).toFixed(2)
            : (currencyAmount * rate).toFixed(2);
    }, [currencyAmount, rate, swapped]);

    // Smooth number transition
    useEffect(() => {
        const target = parseFloat(converted);
        const current = parseFloat(prevConverted.current);
        if (Math.abs(target - current) < 0.01) {
            setDisplayedValue(converted);
            prevConverted.current = converted;
            return;
        }
        const steps = 12;
        let step = 0;
        const diff = target - current;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const val = current + diff * eased;
            setDisplayedValue(val.toFixed(2));
            if (step >= steps) {
                clearInterval(timer);
                setDisplayedValue(converted);
                prevConverted.current = converted;
            }
        }, 25);
        return () => clearInterval(timer);
    }, [converted]);

    const fromAmount = swapped ? `${currencyAmount} ${targetSymbol}` : `${currencyAmount} ${baseCurrency}`;
    const toLabel = swapped ? baseCurrency : targetSymbol;
    const rateText = swapped
        ? `1 ${targetSymbol} = ${rate > 0 ? (1 / rate).toFixed(4) : '0'} ${baseCurrency}`
        : `1 ${baseCurrency} = ${rate.toFixed(4)} ${targetSymbol}`;

    const insight = useMemo(() => getRateInsight(rate, currencyData?.name || ''), [rate, currencyData?.name]);

    // Loading
    if (isLoading || userLoading) {
        return (
            <Card className="travis-card">
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-emerald-500/10 text-emerald-500">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Currency</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-0 pt-0 flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500/30 border-t-emerald-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="travis-card">
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-emerald-500/10 text-emerald-500">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Currency</h3>
                    </div>
                    {/* Live indicator with glow halo */}
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
            </CardHeader>

            <CardContent className="p-0 pt-0 flex-1 min-h-0 overflow-hidden flex flex-col">

                {/* Input controls */}
                <div className="flex items-center gap-1.5 mb-3">
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
                    <span className="text-[11px] text-foreground/45 font-medium flex-shrink-0">{toLabel}</span>
                </div>

                {/* Result card — directional energy flow */}
                {currencyData && (
                    <div
                        className="rounded-xl px-4 py-3.5 mb-2 relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(100deg, rgba(16,185,129,0.02) 0%, rgba(16,185,129,0.06) 40%, rgba(20,184,166,0.04) 70%, rgba(59,130,246,0.02) 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'currency-gradient-flow 12s linear infinite',
                            border: '1px solid rgba(16,185,129,0.07)',
                        }}
                    >
                        {/* Directional energy — soft light streak flowing L→R */}
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
                        <div className="flex items-center justify-between relative z-10">
                            {/* Source — receded */}
                            <p className="text-[11px] text-foreground/20 flex-shrink-0 font-light">{fromAmount}</p>
                            {/* Converted value — the hero */}
                            <div
                                className="text-right"
                                style={{ animation: 'currency-glow-breathe 4s ease-in-out infinite' }}
                            >
                                <span className="text-[25px] font-bold text-emerald-400 tracking-tighter tabular-nums leading-none">
                                    {displayedValue}
                                </span>
                                <span
                                    className="font-normal text-emerald-400/30 ml-2"
                                    style={{ fontSize: 10, letterSpacing: '0.12em' }}
                                >
                                    {toLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rate + insight */}
                {currencyData && (
                    <div className="space-y-1 mb-auto">
                        <p className="text-[11px] text-muted-foreground/35">{rateText}</p>
                        {insight && (
                            <p className="text-[10px] text-emerald-400/35 italic">{insight}</p>
                        )}
                    </div>
                )}

                {/* Footer */}
                <p className="text-[10px] text-muted-foreground/25 tracking-wide hover:text-muted-foreground/40 transition-colors cursor-default mt-auto pt-1">
                    {error
                        ? 'Using reference rate'
                        : `Mid-market rate · ${currencyData?.lastUpdated || 'Updated now'}`
                    }
                </p>
            </CardContent>
        </Card>
    );
};

export default CurrencyPresenter;
