import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destination, latitude, longitude } = await req.json()
    
    if (!destination) {
      return new Response(
        JSON.stringify({ error: 'Destination parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🚗 Checking Uber availability for: ${destination}`)

    // For MVP, we'll use a comprehensive city database instead of the Uber API
    // This provides reliable availability information without API rate limits
    const uberAvailableCities = getUberAvailableCities()
    
    const destLower = destination.toLowerCase()
    let uberData = null

    // Check if destination matches any known Uber city
    for (const city of uberAvailableCities) {
      if (destLower.includes(city.name.toLowerCase()) || 
          city.aliases.some(alias => destLower.includes(alias.toLowerCase()))) {
        uberData = city
        break
      }
    }

    if (uberData) {
      console.log(`✅ Uber is available in ${destination}`)
      return new Response(
        JSON.stringify({
          available: true,
          city: uberData.name,
          country: uberData.country,
          services: uberData.services,
          estimatedWaitTime: uberData.estimatedWaitTime,
          popularAlternatives: uberData.alternatives,
          notes: uberData.notes
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      console.log(`❌ Uber not available in ${destination}`)
      
      // Try to suggest regional alternatives
      const regionalData = getRegionalTransportData(destLower)
      
      return new Response(
        JSON.stringify({
          available: false,
          city: destination,
          alternatives: regionalData.alternatives,
          localApps: regionalData.localApps,
          publicTransport: regionalData.publicTransport,
          notes: regionalData.notes
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error checking Uber availability:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check Uber availability',
        available: false,
        alternatives: ['Taxi', 'Public Transport', 'Local ride-sharing apps']
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getUberAvailableCities() {
  return [
    // Major Global Cities
    {
      name: 'New York',
      country: 'United States',
      aliases: ['nyc', 'new york city', 'manhattan'],
      services: ['UberX', 'UberPool', 'Uber Black', 'Uber XL'],
      estimatedWaitTime: '2-8 minutes',
      alternatives: ['Yellow Taxi', 'Lyft', 'Via'],
      notes: 'Full Uber service available 24/7'
    },
    {
      name: 'Los Angeles',
      country: 'United States',
      aliases: ['la', 'hollywood', 'santa monica'],
      services: ['UberX', 'UberPool', 'Uber Black'],
      estimatedWaitTime: '3-10 minutes',
      alternatives: ['Lyft', 'Taxi'],
      notes: 'Essential for LA transportation'
    },
    {
      name: 'London',
      country: 'United Kingdom',
      aliases: ['london uk', 'greater london'],
      services: ['UberX', 'Uber Green', 'Uber Exec'],
      estimatedWaitTime: '3-7 minutes',
      alternatives: ['Black Cab', 'Bolt', 'Free Now'],
      notes: 'Competes with traditional black cabs'
    },
    {
      name: 'Paris',
      country: 'France',
      aliases: ['paris france'],
      services: ['UberX', 'Uber Green', 'Uber Van'],
      estimatedWaitTime: '4-8 minutes',
      alternatives: ['G7 Taxi', 'Bolt', 'Heetch'],
      notes: 'Available throughout greater Paris'
    },
    {
      name: 'São Paulo',
      country: 'Brazil',
      aliases: ['sao paulo', 'sp', 'sampa'],
      services: ['UberX', 'Uber Comfort', 'Uber Black'],
      estimatedWaitTime: '3-12 minutes',
      alternatives: ['99', 'inDrive', 'Taxi'],
      notes: 'Competes heavily with 99 app'
    },
    {
      name: 'Rio de Janeiro',
      country: 'Brazil',
      aliases: ['rio', 'rio de janeiro'],
      services: ['UberX', 'Uber Comfort'],
      estimatedWaitTime: '5-15 minutes',
      alternatives: ['99', 'Taxi'],
      notes: 'Popular for airport transfers'
    },
    {
      name: 'Mexico City',
      country: 'Mexico',
      aliases: ['cdmx', 'ciudad de mexico'],
      services: ['UberX', 'Uber Flash'],
      estimatedWaitTime: '4-10 minutes',
      alternatives: ['Didi', 'Beat', 'Taxi'],
      notes: 'Safer than traditional taxis'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      aliases: ['tokyo japan'],
      services: ['UberX', 'Uber Taxi'],
      estimatedWaitTime: '5-12 minutes',
      alternatives: ['JapanTaxi', 'Train system'],
      notes: 'Limited compared to other cities'
    },
    {
      name: 'Sydney',
      country: 'Australia',
      aliases: ['sydney australia'],
      services: ['UberX', 'Uber Comfort'],
      estimatedWaitTime: '3-8 minutes',
      alternatives: ['Taxi', 'Ola'],
      notes: 'Well-established service'
    },
    {
      name: 'Toronto',
      country: 'Canada',
      aliases: ['toronto canada'],
      services: ['UberX', 'Uber Comfort'],
      estimatedWaitTime: '3-10 minutes',
      alternatives: ['Lyft', 'Beck Taxi'],
      notes: 'Regulated service available'
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      aliases: ['dubai uae'],
      services: ['UberX', 'Uber Black'],
      estimatedWaitTime: '2-6 minutes',
      alternatives: ['Careem', 'Dubai Taxi'],
      notes: 'Premium service focus'
    },
    {
      name: 'Singapore',
      country: 'Singapore',
      aliases: ['singapore city'],
      services: ['UberX', 'Uber Premium'],
      estimatedWaitTime: '2-5 minutes',
      alternatives: ['Grab', 'ComfortDelGro'],
      notes: 'Limited since Grab acquisition'
    },
    {
      name: 'Lima',
      country: 'Peru',
      aliases: ['lima peru'],
      services: ['UberX', 'Uber Moto'],
      estimatedWaitTime: '5-15 minutes',
      alternatives: ['Beat', 'inDrive', 'Taxi'],
      notes: 'Popular alternative to taxis'
    },
    {
      name: 'Buenos Aires',
      country: 'Argentina',
      aliases: ['buenos aires', 'baires'],
      services: ['UberX', 'Uber Comfort'],
      estimatedWaitTime: '4-10 minutes',
      alternatives: ['Cabify', 'BA Taxi'],
      notes: 'Widely used in the city'
    },
    {
      name: 'Bogotá',
      country: 'Colombia',
      aliases: ['bogota', 'bogota colombia'],
      services: ['UberX', 'Uber Moto'],
      estimatedWaitTime: '5-12 minutes',
      alternatives: ['Beat', 'inDrive'],
      notes: 'Motorcycle taxis available'
    },
    // Add more cities as needed...
  ]
}

function getRegionalTransportData(destination: string) {
  // Default alternatives for regions where Uber isn't available
  if (destination.includes('china') || destination.includes('beijing') || destination.includes('shanghai')) {
    return {
      alternatives: ['Didi Chuxing', 'Traditional Taxi'],
      localApps: ['Didi (滴滴)', 'Shenzhou Zuche'],
      publicTransport: 'Extensive metro and bus systems',
      notes: 'Uber not available - use Didi app instead'
    }
  }
  
  if (destination.includes('india') || destination.includes('mumbai') || destination.includes('delhi')) {
    return {
      alternatives: ['Ola', 'Auto-rickshaw', 'Traditional Taxi'],
      localApps: ['Ola Cabs', 'Rapido'],
      publicTransport: 'Metro, buses, auto-rickshaws',
      notes: 'Ola is the local equivalent to Uber'
    }
  }
  
  if (destination.includes('russia') || destination.includes('moscow')) {
    return {
      alternatives: ['Yandex Taxi', 'Traditional Taxi'],
      localApps: ['Yandex.Taxi', 'Gett'],
      publicTransport: 'Extensive metro system',
      notes: 'Yandex Taxi is the dominant ride-sharing service'
    }
  }

  // Generic fallback
  return {
    alternatives: ['Local taxi services', 'Public transportation', 'Rental cars'],
    localApps: ['Check local ride-sharing apps'],
    publicTransport: 'Buses, trains, metro (where available)',
    notes: 'Contact local transportation services or hotel concierge for options'
  }
}