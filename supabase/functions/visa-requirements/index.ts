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
    const { destination, userNationality = 'US' } = await req.json()
    
    if (!destination) {
      return new Response(
        JSON.stringify({ error: 'Destination parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🛂 Checking visa requirements for ${userNationality} citizens traveling to: ${destination}`)

    // For MVP, we'll use a comprehensive visa database instead of external APIs
    // This provides reliable information without rate limits or API key requirements
    const visaInfo = getVisaRequirements(destination, userNationality)

    console.log(`✅ Visa requirements found for ${destination}:`, visaInfo)

    return new Response(
      JSON.stringify(visaInfo),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error checking visa requirements:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check visa requirements',
        visaRequired: 'unknown',
        recommendation: 'Contact embassy or consulate for current requirements'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getVisaRequirements(destination: string, userNationality: string) {
  const destLower = destination.toLowerCase()
  const nationalityLower = userNationality.toLowerCase()

  // For US passport holders (most common case for MVP)
  if (nationalityLower === 'us' || nationalityLower === 'usa' || nationalityLower === 'united states') {
    return getUSPassportVisaInfo(destLower)
  }

  // Generic fallback for other nationalities
  return getGenericVisaInfo(destLower, userNationality)
}

function getUSPassportVisaInfo(destination: string) {
  // Comprehensive visa-free destinations for US passport holders
  const visaFreeCountries = {
    // Europe (Schengen + UK/Ireland)
    'france': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'paris': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'spain': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'madrid': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'barcelona': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'italy': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'rome': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'germany': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'berlin': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'netherlands': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'amsterdam': { maxStay: '90 days (Schengen)', passportValidity: '3 months beyond stay', notes: 'Schengen area - visa-free tourism' },
    'uk': { maxStay: '6 months', passportValidity: 'Valid for entire stay', notes: 'No visa required for tourism' },
    'united kingdom': { maxStay: '6 months', passportValidity: 'Valid for entire stay', notes: 'No visa required for tourism' },
    'london': { maxStay: '6 months', passportValidity: 'Valid for entire stay', notes: 'No visa required for tourism' },

    // Americas
    'brazil': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free since 2019', yellowFever: 'Recommended for some regions' },
    'são paulo': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free since 2019', yellowFever: 'Recommended for some regions' },
    'sao paulo': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free since 2019', yellowFever: 'Recommended for some regions' },
    'rio de janeiro': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free since 2019', yellowFever: 'Recommended for some regions' },
    'argentina': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'buenos aires': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'chile': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'santiago': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'peru': { maxStay: '183 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism', yellowFever: 'Required for jungle regions' },
    'lima': { maxStay: '183 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism', yellowFever: 'Required for jungle regions' },
    'colombia': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism', yellowFever: 'Required for some regions' },
    'bogotá': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism', yellowFever: 'Required for some regions' },
    'mexico': { maxStay: '180 days', passportValidity: 'Valid for entire stay', notes: 'Tourist card required (FMM)' },
    'mexico city': { maxStay: '180 days', passportValidity: 'Valid for entire stay', notes: 'Tourist card required (FMM)' },

    // Asia-Pacific
    'japan': { maxStay: '90 days', passportValidity: 'Valid for entire stay', notes: 'Visa-free for tourism' },
    'tokyo': { maxStay: '90 days', passportValidity: 'Valid for entire stay', notes: 'Visa-free for tourism' },
    'south korea': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'seoul': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'singapore': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'australia': { maxStay: '90 days', passportValidity: 'Valid for entire stay', notes: 'ETA (Electronic Travel Authority) required', requiresETA: true },
    'sydney': { maxStay: '90 days', passportValidity: 'Valid for entire stay', notes: 'ETA (Electronic Travel Authority) required', requiresETA: true },
    'melbourne': { maxStay: '90 days', passportValidity: 'Valid for entire stay', notes: 'ETA (Electronic Travel Authority) required', requiresETA: true },
    'new zealand': { maxStay: '90 days', passportValidity: '3 months beyond stay', notes: 'NZeTA (Electronic Travel Authority) required', requiresETA: true },
    'auckland': { maxStay: '90 days', passportValidity: '3 months beyond stay', notes: 'NZeTA (Electronic Travel Authority) required', requiresETA: true },

    // Middle East & Africa
    'israel': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'tel aviv': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free for tourism' },
    'uae': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free since 2018' },
    'dubai': { maxStay: '90 days', passportValidity: '6 months minimum', notes: 'Visa-free since 2018' },
    'south africa': { maxStay: '90 days', passportValidity: '30 days beyond stay', notes: 'Visa-free for tourism', yellowFever: 'Required if coming from endemic areas' },
    'cape town': { maxStay: '90 days', passportValidity: '30 days beyond stay', notes: 'Visa-free for tourism', yellowFever: 'Required if coming from endemic areas' },
  }

  // Countries that typically require visas for US citizens
  const visaRequiredCountries = {
    'china': { reason: 'Tourist visa required', processingTime: '4-10 days', notes: 'Apply at Chinese consulate', exceptions: 'Some transit exemptions available' },
    'beijing': { reason: 'Tourist visa required', processingTime: '4-10 days', notes: 'Apply at Chinese consulate', exceptions: 'Some transit exemptions available' },
    'shanghai': { reason: 'Tourist visa required', processingTime: '4-10 days', notes: 'Apply at Chinese consulate', exceptions: 'Some transit exemptions available' },
    'russia': { reason: 'Tourist visa required', processingTime: '10-20 days', notes: 'Apply at Russian consulate', exceptions: 'E-visa available for some regions' },
    'moscow': { reason: 'Tourist visa required', processingTime: '10-20 days', notes: 'Apply at Russian consulate', exceptions: 'E-visa available for some regions' },
    'india': { reason: 'E-visa available', processingTime: '1-4 days', notes: 'Apply online for e-Tourist visa', cost: '$25-100 depending on duration' },
    'mumbai': { reason: 'E-visa available', processingTime: '1-4 days', notes: 'Apply online for e-Tourist visa', cost: '$25-100 depending on duration' },
    'delhi': { reason: 'E-visa available', processingTime: '1-4 days', notes: 'Apply online for e-Tourist visa', cost: '$25-100 depending on duration' },
    'vietnam': { reason: 'E-visa available', processingTime: '3 days', notes: 'Apply online for e-visa', cost: '$25' },
    'ho chi minh city': { reason: 'E-visa available', processingTime: '3 days', notes: 'Apply online for e-visa', cost: '$25' },
    'hanoi': { reason: 'E-visa available', processingTime: '3 days', notes: 'Apply online for e-visa', cost: '$25' },
  }

  // Check if destination matches visa-free country
  for (const [country, info] of Object.entries(visaFreeCountries)) {
    if (destination.includes(country)) {
      return {
        visaRequired: false,
        maxStay: info.maxStay,
        passportValidity: info.passportValidity,
        yellowFever: info.yellowFever || 'Not required',
        notes: info.notes,
        requiresETA: info.requiresETA || false,
        destination: destination,
        userNationality: 'US'
      }
    }
  }

  // Check if destination requires visa
  for (const [country, info] of Object.entries(visaRequiredCountries)) {
    if (destination.includes(country)) {
      return {
        visaRequired: true,
        reason: info.reason,
        processingTime: info.processingTime,
        cost: info.cost,
        notes: info.notes,
        exceptions: info.exceptions,
        destination: destination,
        userNationality: 'US'
      }
    }
  }

  // Generic fallback
  return {
    visaRequired: 'unknown',
    maxStay: 'Check with embassy',
    passportValidity: '6 months minimum (recommended)',
    yellowFever: 'Check requirements',
    notes: 'Contact the embassy or consulate for current requirements',
    destination: destination,
    userNationality: 'US',
    recommendation: 'Verify requirements with official sources before travel'
  }
}

function getGenericVisaInfo(destination: string, nationality: string) {
  return {
    visaRequired: 'unknown',
    maxStay: 'Varies by nationality',
    passportValidity: '6 months minimum (recommended)',
    yellowFever: 'Check requirements',
    notes: `Contact the embassy or consulate for ${nationality} passport holders`,
    destination: destination,
    userNationality: nationality,
    recommendation: 'Verify requirements with official sources before travel'
  }
}