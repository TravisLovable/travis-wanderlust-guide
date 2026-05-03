
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyFromPlace } from '@/utils/currencyMapping';



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

export const useCurrencyExchange = (baseCurrency: string = 'USD', placeDetails?: { country_code?: string; formatted_address?: string; name?: string }) => {
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [multiCurrencyData, setMultiCurrencyData] = useState<MultiCurrencyData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine target currency from place details
  const targetCurrencyInfo = placeDetails ? getCurrencyFromPlace(placeDetails) : { code: 'USD', symbol: '$', name: 'US Dollar' };
  const targetCurrency = targetCurrencyInfo.code;



  useEffect(() => {
    const fetchExchangeRates = async () => {


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

        // Fallback to approximate rates if API fails (USD base)
        const fallbackRates: Record<string, number> = {
          USD: 1, EUR: 0.92, GBP: 0.79, JPY: 154, CAD: 1.36, AUD: 1.53,
          CHF: 0.88, CNY: 7.24, MXN: 17.15, BRL: 5.15, KRW: 1330, INR: 83.5,
          SGD: 1.34, NZD: 1.64, THB: 35.5, PEN: 3.72, COP: 3950, ARS: 870,
          CLP: 950, ZAR: 18.6, AED: 3.67, SAR: 3.75, ILS: 3.65, TRY: 32.5,
          NOK: 10.7, SEK: 10.5, DKK: 6.88, PHP: 56.5, IDR: 15700, MYR: 4.72,
          VND: 24500, EGP: 48.5, NGN: 1550, KES: 153,
        };
        const baseToUsd = fallbackRates[baseCurrency] ? 1 / fallbackRates[baseCurrency] : 1;
        const usdToTarget = fallbackRates[targetCurrency] || 1;
        const fallbackData = {
          rate: baseToUsd * usdToTarget,
          symbol: targetCurrencyInfo.symbol,
          name: targetCurrencyInfo.name,
          lastUpdated: 'Approximate rate'
        };
        setCurrencyData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();

    // Refresh rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [baseCurrency, targetCurrency, targetCurrencyInfo.symbol, targetCurrencyInfo.name, placeDetails?.country_code]);

  return {
    currencyData,
    multiCurrencyData,
    targetCurrency,
    isLoading,
    error,
    refetch: () => window.location.reload()
  };
};
