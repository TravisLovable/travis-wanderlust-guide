
import { useState, useEffect } from 'react';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyData {
  rate: number;
  symbol: string;
  name: string;
  lastUpdated: string;
}

export const useCurrencyExchange = (baseCurrency: string = 'USD', targetCurrency: string = 'BRL') => {
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Using a free exchange rate API
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        const rate = data.rates[targetCurrency];
        
        if (!rate) {
          throw new Error(`Exchange rate for ${targetCurrency} not found`);
        }

        setCurrencyData({
          rate: rate,
          symbol: targetCurrency === 'BRL' ? 'R$' : targetCurrency,
          name: targetCurrency === 'BRL' ? 'Brazilian Real' : targetCurrency,
          lastUpdated: new Date().toLocaleTimeString()
        });
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
        
        // Fallback to mock data if API fails
        setCurrencyData({
          rate: 5.15,
          symbol: 'R$',
          name: 'Brazilian Real',
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
  }, [baseCurrency, targetCurrency]);

  return { currencyData, isLoading, error, refetch: () => window.location.reload() };
};
