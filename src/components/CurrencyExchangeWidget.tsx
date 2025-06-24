
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';

interface CurrencyExchangeWidgetProps {
  destination: string;
}

const CurrencyExchangeWidget = ({ destination }: CurrencyExchangeWidgetProps) => {
  const { currencyData, isLoading, error } = useCurrencyExchange('USD', destination);

  return (
    <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-2 shadow-md">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          Currency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-xs">Failed to load</div>
        ) : currencyData ? (
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {currencyData.symbol}{currencyData.rate.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">per 1 USD</div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-xs">No data</div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyExchangeWidget;
