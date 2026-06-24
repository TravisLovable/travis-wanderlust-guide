import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Ticketmaster Discovery proxy.
//
// Holds TICKETMASTER_API_KEY as a secret so it never ships in the client
// bundle. Maps Ticketmaster's response to the app's TravisEvent shape and
// ALWAYS returns 200 with { events: [...] } — 401 (bad key), empty results,
// and upstream/parse errors all resolve to an empty list, never an error, so
// the events card degrades to its honest empty state instead of breaking.
//
// Date filtering uses `localStartDateTime` (venue-local, no trailing Z), NOT
// `startDateTime` (UTC). UTC midnight is the prior evening for western cities,
// which made Ticketmaster lead with day-before "bleed" events; local time
// pins the window to the trip's own clock.
//
// We paginate (not just page 0) so the merge layer can SEE an event's full
// spread of dates and tell a one-off concert from a daily-recurring Broadway
// run / standing museum admission. Bounded by Ticketmaster's deep-paging cap
// (page * size < 1000).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAGE_SIZE = 200;
const MAX_PAGES = 5; // 5 * 200 = 1000 = Ticketmaster's hard deep-paging ceiling.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Local wall-clock instant, no timezone suffix. Trip dates arrive as YYYY-MM-DD.
function toLocalInstant(date: unknown, endOfDay: boolean): string | null {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return `${date}T${endOfDay ? "23:59:59" : "00:00:00"}`;
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
    const { countryCode, city, startDate, endDate } = body ?? {};

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

    const baseParams = new URLSearchParams({
      apikey: apiKey,
      countryCode: cc,
      sort: "date,asc",
      size: String(PAGE_SIZE),
    });
    if (typeof city === "string" && city.trim()) {
      baseParams.set("city", city.trim());
    }
    // localStartDateTime takes a "start,end" range, both in venue-local time.
    const startLocal = toLocalInstant(startDate, false);
    const endLocal = toLocalInstant(endDate, true);
    if (startLocal && endLocal) {
      baseParams.set("localStartDateTime", `${startLocal},${endLocal}`);
    } else if (startLocal) {
      baseParams.set("localStartDateTime", startLocal);
    }

    const all: ReturnType<typeof mapEvent>[] = [];
    let truncated = false;

    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams(baseParams);
      params.set("page", String(page));
      const res = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`,
      );

      if (res.status === 401) {
        console.error("Ticketmaster 401 — invalid TICKETMASTER_API_KEY");
        return json({ events: [], source: "Ticketmaster", note: "invalid_key" });
      }
      if (!res.ok) {
        console.error(`Ticketmaster upstream error: ${res.status}`);
        break; // keep whatever earlier pages produced
      }

      const data = await res.json();
      const raw = data?._embedded?.events;
      if (!Array.isArray(raw) || raw.length === 0) break;

      for (const e of raw) {
        const mapped = mapEvent(e as TmEvent, cc);
        if (mapped) all.push(mapped);
      }

      const totalPages = Number(data?.page?.totalPages ?? 1);
      if (page + 1 >= totalPages) break;
      if (page + 1 >= MAX_PAGES && totalPages > MAX_PAGES) truncated = true;
    }

    // `truncated` = the city had more pages than Ticketmaster lets us read; the
    // merge-layer relevance filter still works on what we got, but the tail of a
    // very dense window may be unreachable. Surfaced for observability.
    return json({ events: all, source: "Ticketmaster", truncated });
  } catch (error) {
    console.error("ticketmaster-events error:", (error as Error)?.message);
    // Graceful empty, never a 500 — the card must not break on this provider.
    return json({ events: [], source: "Ticketmaster" });
  }
});
