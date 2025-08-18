import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, TrendingUp } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface CurrencyData {
    currencyAmount: number;
    onCurrencyAmountChange: (value: number) => void;
    baseCurrency: string;
    onBaseCurrencyChange: (currency: string) => void;
    currencyData: any;
    multiCurrencyData: any;
    isLoading: boolean;
    error: string | null;
}

interface CurrencyPresenterProps {
    data: CurrencyData;

    userLoading: boolean;
}

const CurrencyPresenter: React.FC<CurrencyPresenterProps> = ({ data, userLoading }) => {
    const {
        currencyAmount,
        onCurrencyAmountChange,
        baseCurrency,
        onBaseCurrencyChange,
        currencyData,
        multiCurrencyData,
        isLoading,
        error
    } = data;

    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-2">
                            <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        Currency
                        <TrendingUp className="w-3 h-3 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-2">
                        <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    Currency
                    <TrendingUp className="w-3 h-3 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                {/* Base Currency Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Amount in {baseCurrency}</label>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            value={currencyAmount}
                            onChange={(e) => onCurrencyAmountChange(Number(e.target.value))}
                            className="flex-1 bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl h-8 text-sm"
                            placeholder="Enter amount"
                        />
                        <Select value={baseCurrency} onValueChange={onBaseCurrencyChange}>
                            <SelectTrigger className="bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl h-8 text-sm min-w-[80px] flex-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="JPY">JPY</SelectItem>
                                <SelectItem value="CAD">CAD</SelectItem>
                                <SelectItem value="AUD">AUD</SelectItem>
                                <SelectItem value="CHF">CHF</SelectItem>
                                <SelectItem value="CNY">CNY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Exchange Rate Display */}
                {currencyData && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="text-left">
                                <span className="font-semibold text-sm">{currencyAmount} {baseCurrency}</span>
                                <div className="text-xs text-muted-foreground">Base Currency: {baseCurrency}</div>
                            </div>
                            <div className="text-center text-2xl">→</div>
                            <div className="text-right">
                                <span className="text-green-400 font-bold text-lg">
                                    {(currencyAmount * currencyData.rate).toFixed(2)} {currencyData.symbol}
                                </span>
                                <div className="text-xs text-muted-foreground">Target Currency: {currencyData.name}</div>
                            </div>
                        </div>

                        {/* Rate Information */}
                        <div className="text-center text-sm text-muted-foreground">
                            1 {baseCurrency} = {currencyData.rate.toFixed(4)} {currencyData.symbol}
                        </div>
                    </div>
                )}

                {/* Error or Status */}
                <div className="text-xs text-center">
                    {error ? (
                        <span className="text-orange-400">API Error - Using fallback</span>
                    ) : (
                        <span className="text-green-400">Live rate • {currencyData?.lastUpdated}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrencyPresenter;
