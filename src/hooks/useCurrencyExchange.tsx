
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyFromDestination } from '@/utils/currencyMapping';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyData {
  rate: number;
  symbol: string;
  name: string;
  lastUpdated: string;
}

export const useCurrencyExchange = (baseCurrency: string = 'USD', destination?: string) => {
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine target currency from destination
  const targetCurrencyInfo = destination ? getCurrencyFromDestination(destination) : { code: 'USD', symbol: '$', name: 'US Dollar' };
  const targetCurrency = targetCurrencyInfo.code;

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Using your Supabase edge function
        const { data, error: functionError } = await supabase.functions.invoke('getExchangeRate', {
          body: {
            baseCurrency,
            targetCurrency
          }
        });
        
        if (functionError) {
          throw new Error(functionError.message || 'Failed to fetch exchange rates');
        }
        
        if (!data || !data.rate) {
          throw new Error(`Exchange rate for ${targetCurrency} not found`);
        }

        setCurrencyData({
          rate: data.rate,
          symbol: data.symbol || targetCurrencyInfo.symbol,
          name: data.name || targetCurrencyInfo.name,
          lastUpdated: data.lastUpdated || new Date().toLocaleTimeString()
        });
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
        
        // Fallback to mock data if API fails
        setCurrencyData({
          rate: targetCurrency === 'BRL' ? 5.15 : 1.0,
          symbol: targetCurrencyInfo.symbol,
          name: targetCurrencyInfo.name,
          lastUpdated: 'API Error - Using fallback'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [baseCurrency, targetCurrency, targetCurrencyInfo.symbol, targetCurrencyInfo.name]);

  return { currencyData, isLoading, error, refetch: () => window.location.reload() };
};
