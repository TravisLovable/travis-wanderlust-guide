
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

    const holidayApiKey = Deno.env.get('HOLIDAY_API_KEY');
    if (!holidayApiKey) {
      return new Response(
        JSON.stringify({ error: 'Holiday API key not found' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use current year if not provided
    const targetYear = year || new Date().getFullYear();
    
    console.log(`Fetching holidays for country: ${country}, year: ${targetYear}`);

    // Call Time and Date Holidays API
    const holidayUrl = `https://api.timezonedb.com/v2.1/list-time-zone?key=${holidayApiKey}&format=json&country=${country}&year=${targetYear}`;
    
    // Note: The actual Time and Date Holidays API endpoint would be different
    // Using a more appropriate endpoint for holidays
    const actualHolidayUrl = `https://date.nager.at/api/v3/PublicHolidays/${targetYear}/${country}`;
    
    const response = await fetch(actualHolidayUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Holiday API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch holidays: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const holidayData = await response.json();
    console.log(`Successfully fetched ${holidayData.length} holidays`);

    // Transform the data to a cleaner format
    const holidays = holidayData.map((holiday: any) => ({
      date: holiday.date,
      name: holiday.name,
      localName: holiday.localName,
      countryCode: holiday.countryCode,
      fixed: holiday.fixed,
      global: holiday.global,
      counties: holiday.counties,
      type: holiday.type || 'Public'
    }));

    // Filter for upcoming holidays (next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingHolidays = holidays.filter((holiday: any) => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= today && holidayDate <= thirtyDaysFromNow;
    });

    const result = {
      country,
      year: targetYear,
      totalHolidays: holidays.length,
      upcomingHolidays: upcomingHolidays.slice(0, 5), // Limit to 5 upcoming holidays
      allHolidays: holidays
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
