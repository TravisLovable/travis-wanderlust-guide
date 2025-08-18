
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

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  time_last_update_utc: string;
}

interface MultiCurrencyData {
  [currencyCode: string]: {
    rate: number;
    symbol: string;
    name: string;
    lastUpdated: string;
  };
}

export const useCurrencyExchange = (baseCurrency: string = 'USD', destination?: string) => {
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [multiCurrencyData, setMultiCurrencyData] = useState<MultiCurrencyData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine target currency from destination
  const targetCurrencyInfo = destination ? getCurrencyFromDestination(destination) : { code: 'USD', symbol: '$', name: 'US Dollar' };
  const targetCurrency = targetCurrencyInfo.code;

  console.log("baseCurrency", baseCurrency);
  console.log("targetCurrency", targetCurrency);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      console.log('🔄 Starting currency exchange fetch...');
      console.log('📊 Input params:', { baseCurrency, targetCurrency, targetCurrencyInfo });

      try {
        setIsLoading(true);
        setError(null);

        // Build API URL
        const apiUrl = `https://v6.exchangerate-api.com/v6/6897784afe683a22eac3ba86/pair/${baseCurrency}/${targetCurrency}`;
        console.log('🌐 API URL:', apiUrl);

        // Fetch exchange rate using Exchange Rate API
        console.log('📡 Making API request...');
        const response = await fetch(apiUrl);
        console.log('📥 Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ HTTP Error Response:', errorText);
          throw new Error(`Exchange Rate API error: ${response.status} - ${errorText}`);
        }

        console.log('📋 Parsing response JSON...');
        const data: ExchangeRateResponse = await response.json();
        console.log('📊 API Response Data:', data);

        if (data.result !== 'success') {
          console.error('❌ API returned non-success result:', data.result);
          throw new Error(`Failed to fetch exchange rate: ${data.result}`);
        }

        console.log('✅ API call successful, updating state...');

        // Update single currency data
        const newCurrencyData = {
          rate: data.conversion_rate,
          symbol: targetCurrencyInfo.symbol,
          name: targetCurrencyInfo.name,
          lastUpdated: new Date(data.time_last_update_utc).toLocaleTimeString()
        };
        console.log('💰 New currency data:', newCurrencyData);
        setCurrencyData(newCurrencyData);

        // Update multi-currency data
        const newMultiCurrencyData = {
          ...multiCurrencyData,
          [targetCurrency]: {
            rate: data.conversion_rate,
            symbol: targetCurrencyInfo.symbol,
            name: targetCurrencyInfo.name,
            lastUpdated: new Date(data.time_last_update_utc).toLocaleTimeString()
          }
        };
        console.log('🔄 Multi-currency data updated:', newMultiCurrencyData);
        setMultiCurrencyData(newMultiCurrencyData);

      } catch (err) {
        console.error('💥 Error in currency exchange fetch:', err);
        console.error('📋 Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace',
          baseCurrency,
          targetCurrency
        });

        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');

        // Fallback to mock data if API fails
        console.log('🔄 Setting fallback data...');
        const fallbackData = {
          rate: targetCurrency === 'BRL' ? 5.15 : 1.0,
          symbol: targetCurrencyInfo.symbol,
          name: targetCurrencyInfo.name,
          lastUpdated: 'API Error - Using fallback'
        };
        console.log('📊 Fallback data:', fallbackData);
        setCurrencyData(fallbackData);
      } finally {
        console.log('🏁 Currency exchange fetch completed');
        setIsLoading(false);
      }
    };

    fetchExchangeRates();

    // Refresh rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [baseCurrency, targetCurrency, targetCurrencyInfo.symbol, targetCurrencyInfo.name]);

  return {
    currencyData,
    multiCurrencyData,
    isLoading,
    error,
    refetch: () => window.location.reload()
  };
};
