
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Currency symbols mapping
const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'BRL': 'R$',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'INR': '₹',
  'KRW': '₩',
  'MXN': '$',
  'SGD': 'S$',
  'THB': '฿',
  'NOK': 'kr',
  'SEK': 'kr',
  'DKK': 'kr',
  'RUB': '₽',
  'TRY': '₺',
  'ZAR': 'R',
  'AED': 'د.إ',
  'SAR': 'ر.س',
  'ILS': '₪',
  'EGP': 'E£',
  'ARS': '$',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/'
};

// Currency names mapping
const currencyNames: { [key: string]: string } = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'JPY': 'Japanese Yen',
  'BRL': 'Brazilian Real',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'CHF': 'Swiss Franc',
  'CNY': 'Chinese Yuan',
  'INR': 'Indian Rupee',
  'KRW': 'South Korean Won',
  'MXN': 'Mexican Peso',
  'SGD': 'Singapore Dollar',
  'THB': 'Thai Baht',
  'NOK': 'Norwegian Krone',
  'SEK': 'Swedish Krona',
  'DKK': 'Danish Krone',
  'RUB': 'Russian Ruble',
  'TRY': 'Turkish Lira',
  'ZAR': 'South African Rand',
  'AED': 'UAE Dirham',
  'SAR': 'Saudi Riyal',
  'ILS': 'Israeli Shekel',
  'EGP': 'Egyptian Pound',
  'ARS': 'Argentine Peso',
  'CLP': 'Chilean Peso',
  'COP': 'Colombian Peso',
  'PEN': 'Peruvian Sol'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { baseCurrency, targetCurrency } = await req.json()
    
    console.log(`Fetching exchange rate from ${baseCurrency} to ${targetCurrency}`)
    
    // Using a free exchange rate API
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates from external API')
    }
    
    const data = await response.json()
    const rate = data.rates[targetCurrency]
    
    if (!rate) {
      throw new Error(`Exchange rate for ${targetCurrency} not found`)
    }

    // Return the formatted response
    const result = {
      rate: rate,
      symbol: currencySymbols[targetCurrency] || targetCurrency,
      name: currencyNames[targetCurrency] || targetCurrency,
      lastUpdated: new Date().toLocaleTimeString()
    }

    console.log('Exchange rate fetched successfully:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in getExchangeRate function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch exchange rates' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
