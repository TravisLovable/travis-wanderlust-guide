import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreditCard, TrendingUp } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface CurrencyData {
    currencyAmount: number;
    onCurrencyAmountChange: (value: number) => void;
    currencyData: any;
    isLoading: boolean;
    error: string | null;
}

interface CurrencyPresenterProps {
    data: CurrencyData;
    
    userLoading: boolean;
}

const CurrencyPresenter: React.FC<CurrencyPresenterProps> = ({ data, userLoading }) => {
    const { currencyAmount, onCurrencyAmountChange, currencyData, isLoading, error } = data;

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
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-2">
                        <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    Currency
                    <TrendingUp className="w-3 h-3 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <span className="font-semibold text-sm">1 USD</span>
                    <span className="text-green-400 font-bold text-sm">
                        {currencyData?.rate.toFixed(2)} {currencyData?.symbol}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        value={currencyAmount}
                        onChange={(e) => onCurrencyAmountChange(Number(e.target.value))}
                        className="flex-1 bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl h-8 text-sm"
                    />
                    <span className="text-green-400 font-semibold text-sm">
                        = {currencyData?.symbol}{currencyData ? (currencyAmount * currencyData.rate).toFixed(2) : '-.--'}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">
                    {error ? (
                        <span className="text-orange-400">API Error - Using fallback</span>
                    ) : (
                        `Live rate • ${currencyData?.lastUpdated}`
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrencyPresenter;
