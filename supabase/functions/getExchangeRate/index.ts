
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      symbol: targetCurrency === 'BRL' ? 'R$' : targetCurrency,
      name: targetCurrency === 'BRL' ? 'Brazilian Real' : targetCurrency,
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
