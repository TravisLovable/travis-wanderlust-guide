
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface CurrencyExchangeWidgetProps {
  destination: string;
}

const CurrencyExchangeWidget = ({ destination }: CurrencyExchangeWidgetProps) => {
  return (
    <Card className="bg-black border-border shadow-xl w-full rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mr-3 shadow-lg">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          Currency Exchange
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Exchange rates for {destination}
          </div>
          <div className="p-4 bg-gray-900 rounded-lg">
            <p className="text-sm">Loading exchange rates...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyExchangeWidget;
