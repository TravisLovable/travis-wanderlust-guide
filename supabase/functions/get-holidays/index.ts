
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { country, year } = await req.json();
    
    if (!country) {
      return new Response(
        JSON.stringify({ error: 'Country parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const timeAndDateApiKey = '6NbsuamveP';
    
    // Use current year if not provided
    const targetYear = year || new Date().getFullYear();
    
    console.log(`Fetching holidays for country: ${country}, year: ${targetYear}`);

    // Call Time and Date Holidays API
    const holidayUrl = `https://api.timezonedb.com/v2.1/list-holidays?key=${timeAndDateApiKey}&format=json&country=${country}&year=${targetYear}`;
    
    const response = await fetch(holidayUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Time and Date API error: ${response.status} ${response.statusText}`);
      
      // Fallback to nager.at API if Time and Date API fails
      const fallbackUrl = `https://date.nager.at/api/v3/PublicHolidays/${targetYear}/${country}`;
      console.log(`Falling back to nager.at API: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!fallbackResponse.ok) {
        return new Response(
          JSON.stringify({ 
            error: `Failed to fetch holidays from both APIs: ${response.status} ${response.statusText}` 
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const fallbackData = await fallbackResponse.json();
      console.log(`Successfully fetched ${fallbackData.length} holidays from fallback API`);

      // Transform fallback data to consistent format
      const holidays = fallbackData.map((holiday: any) => ({
        date: holiday.date,
        name: holiday.name,
        localName: holiday.localName,
        countryCode: holiday.countryCode,
        fixed: holiday.fixed,
        global: holiday.global,
        counties: holiday.counties,
        type: holiday.type || 'Public',
        region: holiday.counties ? holiday.counties.join(', ') : 'National'
      }));

      const result = {
        country,
        year: targetYear,
        totalHolidays: holidays.length,
        allHolidays: holidays,
        source: 'fallback'
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const holidayData = await response.json();
    console.log(`Successfully fetched holidays from Time and Date API`);

    // Transform Time and Date API data to consistent format
    let holidays = [];
    if (holidayData.holidays && Array.isArray(holidayData.holidays)) {
      holidays = holidayData.holidays.map((holiday: any) => ({
        date: holiday.date,
        name: holiday.name,
        localName: holiday.localname || holiday.name,
        countryCode: country,
        fixed: true,
        global: holiday.type === 'national',
        type: holiday.type || 'Public',
        region: holiday.locations || 'National'
      }));
    }

    const result = {
      country,
      year: targetYear,
      totalHolidays: holidays.length,
      allHolidays: holidays,
      source: 'timeanddate'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-holidays function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
