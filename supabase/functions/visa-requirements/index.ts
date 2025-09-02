import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize OpenAI client
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { destination, userNationality = 'US', streamResponse = false } = await req.json()

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

        // First, try to get data from Supabase database
        const dbVisaInfo = await getVisaFromDatabase(destination, userNationality)
        
        if (dbVisaInfo && !streamResponse) {
            console.log(`✅ Visa requirements found in database for ${destination}:`, dbVisaInfo)
            return new Response(
                JSON.stringify(dbVisaInfo),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // If streaming is requested or no data in DB, use OpenAI with hybrid approach
        if (streamResponse && openai) {
            return await streamVisaResponse(destination, userNationality, dbVisaInfo)
        }

        // Fallback to hardcoded data if no OpenAI
        const fallbackInfo = getVisaRequirements(destination, userNationality)
        console.log(`✅ Using fallback visa requirements for ${destination}:`, fallbackInfo)

        return new Response(
            JSON.stringify(fallbackInfo),
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

// Function to query visa requirements from database
async function getVisaFromDatabase(destination: string, userNationality: string) {
    try {
        const destLower = destination.toLowerCase()
        
        // Query database for exact match or aliases
        const { data, error } = await supabase
            .from('visa_requirements')
            .select('*')
            .eq('origin_country', userNationality.toUpperCase())
            .or(`destination_country.ilike.%${destLower}%,destination_aliases.cs.{${destLower}}`)
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Database query error:', error)
            return null
        }

        if (data) {
            return {
                visaRequired: data.visa_required,
                maxStay: data.max_stay_description || `${data.max_stay_days} days`,
                passportValidity: data.passport_validity_description || `${data.passport_validity_months} months minimum`,
                yellowFever: data.yellow_fever_required ? 'Required' : 'Not required',
                notes: data.additional_notes || 'Check official sources for latest updates',
                requiresETA: data.requires_eta,
                processingTime: data.processing_time_description,
                cost: data.cost_description,
                exceptions: data.exceptions,
                dataSource: data.data_source,
                lastUpdated: data.last_updated,
                destination: destination,
                userNationality: userNationality
            }
        }

        return null
    } catch (error) {
        console.error('Error querying visa database:', error)
        return null
    }
}

// Function to stream OpenAI response for visa requirements
async function streamVisaResponse(destination: string, userNationality: string, dbData: any) {
    try {
        const prompt = createVisaPrompt(destination, userNationality, dbData)
        
        const stream = await openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a travel visa expert. Provide accurate, helpful visa requirement information. 
                    Always cite official sources and include disclaimers about verifying with embassies.
                    Format your response in a conversational but informative way.
                    Highlight important terms by wrapping them in **bold** markdown.
                    End with suggestions for official sources to verify information.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            stream: true,
            temperature: 0.3,
            max_tokens: 500
        })

        const encoder = new TextEncoder()
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || ''
                        if (content) {
                            const data = JSON.stringify({ 
                                content, 
                                type: 'chunk',
                                hasDbData: !!dbData,
                                dataSource: dbData?.dataSource || 'AI Analysis',
                                lastUpdated: dbData?.lastUpdated || new Date().toISOString()
                            })
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                        }
                    }
                    // Send completion signal
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`))
                    controller.close()
                } catch (error) {
                    console.error('Streaming error:', error)
                    controller.error(error)
                }
            }
        })

        return new Response(readable, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        })

    } catch (error) {
        console.error('OpenAI streaming error:', error)
        throw error
    }
}

// Create a detailed prompt for OpenAI
function createVisaPrompt(destination: string, userNationality: string, dbData: any): string {
    let prompt = `I need visa requirement information for ${userNationality} passport holders traveling to ${destination}.`
    
    if (dbData) {
        prompt += `\n\nI have some structured data: ${JSON.stringify(dbData, null, 2)}`
        prompt += `\n\nPlease interpret this data and present it in a clear, conversational way. Explain what it means for travelers and highlight important details.`
    } else {
        prompt += `\n\nI don't have specific data for this destination. Please provide general visa requirement information based on your knowledge, but emphasize the need to verify with official sources.`
    }
    
    prompt += `\n\nPlease include:
    - Whether a visa is required
    - Maximum stay duration
    - Passport validity requirements
    - Any special requirements (yellow fever, etc.)
    - Processing time and costs if applicable
    - Important exceptions or notes
    - Where to get official verification
    
    Format your response to be helpful for travelers planning their trip.`
    
    return prompt
}

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
