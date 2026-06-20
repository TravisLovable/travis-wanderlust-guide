// visa-requirements — READ path for the rebuilt EntryCard (Path A).
//
// Returns three layers for a (origin, destination) pair, honestly:
//   data           Layer 1 — synthesized headline from the visa_requirements
//                  cache (Travel Buddy AI), with source + syncedAt provenance.
//                  null on cache miss (NEVER fabricated).
//   officialSource Layer 2 — curated official government verification link from
//                  country_visa_official_sources. Stands alone even if data is
//                  null. null only if we have no curated source for the country.
//
// Replaces the legacy implementation entirely: the old hardcoded visa map, the
// always-failing .from('visa_requirements') legacy-schema query, and the
// unreachable OpenAI streaming path are all gone. Cache miss -> 200 with
// data:null (UI shows "—"); only a real DB error returns 500.
//
// Input body: { destinationCountryCode?, userNationality?, destination? }
//   destinationCountryCode  ISO 3166-1 alpha-2 (preferred; EntryCard sends this)
//   userNationality         ISO alpha-2 origin; defaults "US" (US-only for now)
//   destination             legacy free-text ("Paris, France") — resolved to a
//                           code via NAME_TO_ISO2 for the deploy window only.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Legacy fallback: resolve a free-text destination to an ISO alpha-2 code. Only
// used when destinationCountryCode is absent (old frontend during deploy window).
// Keys are matched as substrings of the lowercased input, longest-first.
const NAME_TO_ISO2: Record<string, string> = {
  'united arab emirates': 'AE', 'dominican republic': 'DO', 'united kingdom': 'GB',
  'ho chi minh': 'VN', 'south korea': 'KR', 'buenos aires': 'AR', 'costa rica': 'CR',
  'são paulo': 'BR', 'sao paulo': 'BR', 'rio de janeiro': 'BR', 'abu dhabi': 'AE',
  'switzerland': 'CH', 'netherlands': 'NL', 'argentina': 'AR', 'indonesia': 'ID',
  'australia': 'AU', 'colombia': 'CO', 'portugal': 'PT', 'thailand': 'TH',
  'germany': 'DE', 'istanbul': 'TR', 'türkiye': 'TR', 'turkiye': 'TR', 'vietnam': 'VN',
  'barcelona': 'ES', 'amsterdam': 'NL', 'shanghai': 'CN', 'jamaica': 'JM',
  'bahamas': 'BS', 'mexico': 'MX', 'canada': 'CA', 'france': 'FR', 'greece': 'GR',
  'britain': 'GB', 'england': 'GB', 'ireland': 'IE', 'germany ': 'DE', 'beijing': 'CN',
  'bangkok': 'TH', 'melbourne': 'AU', 'mumbai': 'IN', 'jakarta': 'ID', 'zurich': 'CH',
  'geneva': 'CH', 'madrid': 'ES', 'athens': 'GR', 'lisbon': 'PT', 'dublin': 'IE',
  'sydney': 'AU', 'turkey': 'TR', 'vietnam ': 'VN', 'bogota': 'CO', 'brazil': 'BR',
  'italy': 'IT', 'japan': 'JP', 'spain': 'ES', 'china': 'CN', 'korea': 'KR',
  'india': 'IN', 'peru': 'PE', 'lima': 'PE', 'paris': 'FR', 'london': 'GB',
  'tokyo': 'JP', 'rome': 'IT', 'berlin': 'DE', 'delhi': 'IN', 'seoul': 'KR',
  'dubai': 'AE', 'bali': 'ID', 'hanoi': 'VN', 'uae': 'AE', 'uk': 'GB',
}
const NAME_KEYS = Object.keys(NAME_TO_ISO2).sort((a, b) => b.length - a.length)

function resolveDestCode(body: any): string | null {
  const code = body?.destinationCountryCode
  if (typeof code === 'string' && /^[A-Za-z]{2}$/.test(code.trim())) {
    return code.trim().toUpperCase()
  }
  const legacy = body?.destination
  if (typeof legacy === 'string' && legacy.trim()) {
    const hay = legacy.toLowerCase()
    for (const key of NAME_KEYS) {
      if (hay.includes(key)) return NAME_TO_ISO2[key]
    }
  }
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const body = await req.json().catch(() => ({} as any))

  const originRaw = body?.userNationality
  const origin = (typeof originRaw === 'string' && /^[A-Za-z]{2}$/.test(originRaw.trim()))
    ? originRaw.trim().toUpperCase()
    : 'US'
  const dest = resolveDestCode(body)

  // Can't resolve a destination country -> nothing to look up. Honest empty.
  if (!dest) {
    return json({ originCountryCode: origin, destinationCountryCode: null, data: null, officialSource: null })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )

  // Layer 1 (cache) + Layer 2 (official source) — both public-read.
  const [cacheRes, srcRes] = await Promise.all([
    supabase
      .from('visa_requirements')
      .select('status, status_label, rule, max_stay_days, evisa_link, registration_note, source, synced_at')
      .eq('origin_country_code', origin)
      .eq('destination_country_code', dest)
      .maybeSingle(),
    supabase
      .from('country_visa_official_sources')
      .select('official_url, url_label, source_authority, language, notes')
      .eq('destination_country_code', dest)
      .eq('is_active', true)
      .eq('is_primary', true)
      .maybeSingle(),
  ])

  // A real DB error (not "no rows") is honest 500 — never fake data.
  if (cacheRes.error) return json({ error: `visa cache lookup failed: ${cacheRes.error.message}` }, 500)
  if (srcRes.error) return json({ error: `official source lookup failed: ${srcRes.error.message}` }, 500)

  const c = cacheRes.data
  const s = srcRes.data

  return json({
    originCountryCode: origin,
    destinationCountryCode: dest,
    data: c
      ? {
          status: c.status,
          statusLabel: c.status_label,
          rule: c.rule,
          maxStayDays: c.max_stay_days,
          evisaLink: c.evisa_link,
          registrationNote: c.registration_note,
          source: c.source,
          syncedAt: c.synced_at,
        }
      : null,
    officialSource: s
      ? {
          url: s.official_url,
          label: s.url_label,
          authority: s.source_authority,
          language: s.language,
          notes: s.notes,
        }
      : null,
  })
})
