// sync-visa-requirements — populates the public.visa_requirements cache from
// Travel Buddy AI (RapidAPI). US-only origin to start.
//
// Modes (POST body { mode }):
//   "validate"  -> fetch ONE pair, return raw + mapped response, write nothing.
//                  Used to confirm endpoint/field shape before trusting the sync.
//                  Body: { mode:"validate", destination:"TH" }
//   "sync"      -> (default; cron) loop US x active curated destinations, upsert
//                  into the cache. Guarded by the x-sync-secret header.
//
// Secrets (Supabase > Edge Functions > Secrets):
//   TRAVELBUDDY_RAPIDAPI_KEY  (required)  RapidAPI key for the $5 Travel Buddy plan
//   SYNC_SECRET               (optional)  shared secret the cron must send to run sync
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
}

// --- Travel Buddy AI (RapidAPI) ---
// VERIFY at first validation run: exact host/path, request body shape, and
// response field names. Defaults follow the published v2 docs + RapidAPI host.
const TB_HOST = 'visa-requirement.p.rapidapi.com'
const TB_CHECK_URL = `https://${TB_HOST}/v2/visa/check`

const ORIGIN = 'US' // US-only to start

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
  status: string
  status_label: string | null
  rule: string | null
  max_stay_days: number | null
  evisa_link: string | null
  registration_note: string | null
}

// Map a Travel Buddy /v2/visa/check response -> our cache row. Tolerant of both
// the documented v2 shape (data.visa_rules.primary_rule) and the flatter widget
// shape (status/statusLabel/rule/days). Tighten after the validation run confirms
// the exact field names (esp. the mandatory-registration field for TDAC).
function mapResponse(payload: any): MappedVisa {
  const data = payload?.data ?? payload ?? {}
  const primary = data?.visa_rules?.primary_rule ?? null
  const secondary = data?.visa_rules?.secondary_rule ?? null

  const reg = data?.mandatory_registration ?? data?.registration ?? null
  const registration_note = reg
    ? (typeof reg === 'string' ? reg : (reg?.name ?? reg?.label ?? reg?.description ?? null))
    : null

  if (primary) {
    return {
      status: String(data?.status ?? primary?.code ?? primary?.name ?? 'unknown'),
      status_label: primary?.name ?? data?.statusLabel ?? null,
      rule: primary?.name ?? data?.rule ?? null,
      max_stay_days: parseDays(primary?.duration ?? data?.days),
      evisa_link: secondary?.link ?? primary?.link ?? data?.evisa_link ?? null,
      registration_note,
    }
  }
  // flat / widget fallback shape
  return {
    status: String(data?.status ?? 'unknown'),
    status_label: data?.statusLabel ?? null,
    rule: data?.rule ?? null,
    max_stay_days: parseDays(data?.days),
    evisa_link: data?.evisa_link ?? null,
    registration_note,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const apiKey = Deno.env.get('TRAVELBUDDY_RAPIDAPI_KEY')
  if (!apiKey) {
    return json({ error: 'TRAVELBUDDY_RAPIDAPI_KEY not configured in Edge Function secrets' }, 503)
  }

  const body = await req.json().catch(() => ({} as any))
  const mode = body?.mode ?? 'sync'

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

  // --- sync: cron path, guarded by shared secret (default-deny if unset) ---
  const syncSecret = Deno.env.get('SYNC_SECRET')
  if (!syncSecret) {
    return json({ error: 'sync disabled: SYNC_SECRET not configured' }, 503)
  }
  if (req.headers.get('x-sync-secret') !== syncSecret) {
    return json({ error: 'unauthorized' }, 401)
  }

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

  for (const dest of codes) {
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
