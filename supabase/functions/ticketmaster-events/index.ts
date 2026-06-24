import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Ticketmaster Discovery proxy.
//
// Holds TICKETMASTER_API_KEY as a secret so it never ships in the client
// bundle. Maps Ticketmaster's response to the app's TravisEvent shape and
// ALWAYS returns 200 with { events: [...] } — 401 (bad key), empty results,
// and upstream/parse errors all resolve to an empty list, never an error, so
// the events card degrades to its honest empty state instead of breaking.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Ticketmaster wants YYYY-MM-DDTHH:mm:ssZ. Trip dates arrive as YYYY-MM-DD.
function toIsoInstant(date: unknown, endOfDay: boolean): string | null {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return `${date}T${endOfDay ? "23:59:59" : "00:00:00"}Z`;
}

interface TmVenue {
  name?: string;
  city?: { name?: string };
  country?: { countryCode?: string };
}
interface TmEvent {
  id?: string;
  name?: string;
  url?: string;
  dates?: { start?: { localDate?: string }; end?: { localDate?: string } };
  classifications?: Array<{ segment?: { name?: string } }>;
  _embedded?: { venues?: TmVenue[] };
}

function mapEvent(e: TmEvent, fallbackCountry: string) {
  const title = e?.name;
  const startDate = e?.dates?.start?.localDate;
  if (!title || !startDate) return null;

  const venue = e?._embedded?.venues?.[0];
  return {
    id: `tm-${e?.id ?? `${startDate}-${title}`}`,
    title,
    category: e?.classifications?.[0]?.segment?.name ?? "Event",
    startDate,
    endDate: e?.dates?.end?.localDate || undefined,
    venue: venue?.name || undefined,
    city: venue?.city?.name ?? "",
    country: venue?.country?.countryCode ?? fallbackCountry,
    url: e?.url || undefined,
    source: "Ticketmaster",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { countryCode, city, startDate, endDate, size } = body ?? {};

    const apiKey = Deno.env.get("TICKETMASTER_API_KEY");
    if (!apiKey) {
      console.warn("TICKETMASTER_API_KEY not set — returning empty events");
      return json({ events: [], source: "Ticketmaster", note: "not_configured" });
    }

    const cc =
      typeof countryCode === "string" ? countryCode.trim().toUpperCase() : "";
    if (!cc) {
      return json({ events: [], source: "Ticketmaster" });
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      countryCode: cc,
      size: String(Math.min(Math.max(Number(size) || 20, 1), 50)),
      sort: "date,asc",
    });
    if (typeof city === "string" && city.trim()) params.set("city", city.trim());
    const startIso = toIsoInstant(startDate, false);
    const endIso = toIsoInstant(endDate, true);
    if (startIso) params.set("startDateTime", startIso);
    if (endIso) params.set("endDateTime", endIso);

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;
    const res = await fetch(url);

    if (res.status === 401) {
      console.error("Ticketmaster 401 — invalid TICKETMASTER_API_KEY");
      return json({ events: [], source: "Ticketmaster", note: "invalid_key" });
    }
    if (!res.ok) {
      console.error(`Ticketmaster upstream error: ${res.status}`);
      return json({ events: [], source: "Ticketmaster" });
    }

    const data = await res.json();
    const raw = data?._embedded?.events;
    if (!Array.isArray(raw)) {
      // No _embedded.events => no matches. Honest empty.
      return json({ events: [], source: "Ticketmaster" });
    }

    const events = raw
      .map((e: TmEvent) => mapEvent(e, cc))
      .filter((e: unknown) => e !== null);

    return json({ events, source: "Ticketmaster" });
  } catch (error) {
    console.error("ticketmaster-events error:", (error as Error)?.message);
    // Graceful empty, never a 500 — the card must not break on this provider.
    return json({ events: [], source: "Ticketmaster" });
  }
});
