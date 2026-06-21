// sync-visa-requirements — populates the public.visa_requirements cache from
// Travel Buddy AI (RapidAPI). US-only origin to start.
//
// Modes (POST body { mode }):
//   "validate"  -> fetch ONE pair, return raw + mapped response, write nothing.
//                  Body: { mode:"validate", destination:"TH" }
//   "sync"      -> (default; cron) loop US x active curated destinations, upsert
//                  into the cache. Guarded by the x-sync-secret header. Throttled
//                  to stay under the provider's per-second rate limit.
//
// Secrets (Supabase > Edge Functions > Secrets):
//   TRAVELBUDDY_RAPIDAPI_KEY  (required)  RapidAPI key for the Travel Buddy PRO plan
//   SYNC_SECRET               (required for sync)  shared secret the cron must send
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
}

const TB_HOST = 'visa-requirement.p.rapidapi.com'
const TB_CHECK_URL = `https://${TB_HOST}/v2/visa/check`

const ORIGIN = 'US' // US-only to start

// Provider enforces a per-second rate limit (PRO). Space sync calls out.
const THROTTLE_MS = 1500

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const parseDays = (duration?: string | number | null): number | null => {
  if (duration == null) return null
  if (typeof duration === 'number') return Number.isFinite(duration) ? duration : null
  const m = String(duration).match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

type MappedVisa = {
  status: string                 // category from primary_rule.color: green|blue|yellow|red
  status_label: string | null    // human rule name: "eVisa", "Visa not required", ...
  rule: string | null
  max_stay_days: number | null
  evisa_link: string | null
  registration_note: string | null
}

// Map a Travel Buddy /v2/visa/check response -> our cache row. Confirmed against
// live US->BR and US->TH payloads (2026-06-20):
//   data.visa_rules.primary_rule = { name, duration, color, link? }
//   data.visa_rules.secondary_rule = { ..., link? }   (alternative, e.g. eVisa)
//   data.mandatory_registration = { name, color, link }  (e.g. Thailand "Arrival Card")
// status stores the COLOR category (clean pip signal); name is the human label.
function mapResponse(payload: any): MappedVisa {
  const data = payload?.data ?? payload ?? {}
  const primary = data?.visa_rules?.primary_rule ?? null
  const secondary = data?.visa_rules?.secondary_rule ?? null
  const reg = data?.mandatory_registration ?? null

  return {
    status: String(primary?.color ?? data?.status ?? 'unknown'),
    status_label: primary?.name ?? data?.statusLabel ?? null,
    rule: primary?.name ?? data?.rule ?? null,
    max_stay_days: parseDays(primary?.duration ?? data?.days),
    evisa_link: primary?.link ?? secondary?.link ?? null,
    registration_note: reg ? (typeof reg === 'string' ? reg : (reg?.name ?? reg?.label ?? null)) : null,
  }
}

async function fetchPair(apiKey: string, destination: string) {
  const res = await fetch(TB_CHECK_URL, {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': TB_HOST,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ passport: ORIGIN, destination }),
  })
  const raw = await res.text()
  let parsed: any = null
  try { parsed = JSON.parse(raw) } catch { /* keep raw for debugging */ }
  return { ok: res.ok, status: res.status, parsed, raw }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const apiKey = Deno.env.get('TRAVELBUDDY_RAPIDAPI_KEY')
  if (!apiKey) {
    return json({ error: 'TRAVELBUDDY_RAPIDAPI_KEY not configured in Edge Function secrets' }, 503)
  }

  const body = await req.json().catch(() => ({} as any))
  const mode = body?.mode ?? 'sync'

  // Both validate and sync require the shared secret (prevents quota abuse of the
  // Travel Buddy API). Default-deny if the secret is not configured.
  const syncSecret = Deno.env.get('SYNC_SECRET')
  if (!syncSecret) {
    return json({ error: 'disabled: SYNC_SECRET not configured' }, 503)
  }
  if (req.headers.get('x-sync-secret') !== syncSecret) {
    return json({ error: 'unauthorized' }, 401)
  }

  // --- validate: single pair, raw + mapped, no writes ---
  if (mode === 'validate') {
    const dest = String(body?.destination ?? 'BR').toUpperCase()
    const r = await fetchPair(apiKey, dest)
    return json({
      mode: 'validate',
      destination: dest,
      upstreamStatus: r.status,
      mapped: r.parsed ? mapResponse(r.parsed) : null,
      raw: r.parsed ?? r.raw,
    }, r.ok ? 200 : 502)
  }

  // --- sync: cron path ---
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Sync set = the destinations we curate official sources for.
  const { data: dests, error: destErr } = await supabase
    .from('country_visa_official_sources')
    .select('destination_country_code')
    .eq('is_active', true)
  if (destErr) return json({ error: `failed to load destinations: ${destErr.message}` }, 500)

  const codes = [...new Set((dests ?? []).map((d: any) => d.destination_country_code))]
  const results: Array<Record<string, unknown>> = []
  let synced = 0, failed = 0

  for (let i = 0; i < codes.length; i++) {
    const dest = codes[i]
    if (i > 0) await sleep(THROTTLE_MS) // stay under the per-second rate limit
    try {
      const r = await fetchPair(apiKey, dest)
      if (!r.ok || !r.parsed) { failed++; results.push({ dest, ok: false, upstreamStatus: r.status }); continue }
      const m = mapResponse(r.parsed)
      const { error: upErr } = await supabase.from('visa_requirements').upsert({
        origin_country_code: ORIGIN,
        destination_country_code: dest,
        status: m.status,
        status_label: m.status_label,
        rule: m.rule,
        max_stay_days: m.max_stay_days,
        evisa_link: m.evisa_link,
        registration_note: m.registration_note,
        source: 'Travel Buddy AI',
        synced_at: new Date().toISOString(),
      }, { onConflict: 'origin_country_code,destination_country_code' })
      if (upErr) { failed++; results.push({ dest, ok: false, error: upErr.message }) }
      else { synced++; results.push({ dest, ok: true, status: m.status }) }
    } catch (e) {
      failed++; results.push({ dest, ok: false, error: String(e) })
    }
  }

  return json({ mode: 'sync', origin: ORIGIN, total: codes.length, synced, failed, results }, 200)
})
