// health-check-visa-sources — weekly link-rot check on the official government
// visa URLs in public.country_visa_official_sources (Layer 2 trust anchor).
//
// For each active row: GET the URL (browser UA) following redirects, record
// http_status + last_checked_at, and classify:
//   - ok           2xx, final host == stored host
//   - moved        2xx, final host != stored host (soft-404 signal: gov sites
//                  often 200 on a moved/"not found" page; status alone misses it)
//   - dead         404 / 410, or DNS resolution failure
//   - inconclusive 403 / 5xx / TLS / timeout / connection reset — government
//                  WAFs frequently block datacenter IPs and non-browser clients,
//                  so these are NOT treated as dead (would be false positives).
//
// Only `moved` and `dead` are actionable problems. Does NOT auto-disable rows
// (a transient failure shouldn't hide the user-facing verify link) — records
// status and returns a summary for human review. Guarded by x-sync-secret.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
}

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const PER_REQUEST_TIMEOUT_MS = 12000
const CONCURRENCY = 6
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

type Category = 'ok' | 'moved' | 'dead' | 'inconclusive'
type CheckResult = { category: Category; status: number; finalHost?: string; error?: string }

async function checkUrl(url: string): Promise<CheckResult> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), PER_REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*' },
    })
    let storedHost = ''
    let finalHost = ''
    try { storedHost = new URL(url).host } catch { /* ignore */ }
    try { finalHost = new URL(res.url || url).host } catch { /* ignore */ }
    const hostChanged = !!storedHost && !!finalHost && storedHost !== finalHost

    let category: Category
    if (res.ok) category = hostChanged ? 'moved' : 'ok'
    else if (res.status === 404 || res.status === 410) category = 'dead'
    else category = 'inconclusive' // 403 / 5xx / etc — likely WAF/bot block
    return { category, status: res.status, finalHost }
  } catch (e) {
    const msg = String(e)
    // DNS failure = dead domain; TLS/reset/timeout = inconclusive (not dead).
    const dnsDead = /failed to lookup|dns error|name not resolved|nodename nor servname/i.test(msg)
    return { category: dnsDead ? 'dead' : 'inconclusive', status: 0, error: msg }
  } finally {
    clearTimeout(timer)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = Deno.env.get('SYNC_SECRET')
  if (!secret) return json({ error: 'health check disabled: SYNC_SECRET not configured' }, 503)
  if (req.headers.get('x-sync-secret') !== secret) return json({ error: 'unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: rows, error } = await supabase
    .from('country_visa_official_sources')
    .select('id, destination_country_code, official_url')
    .eq('is_active', true)
  if (error) return json({ error: `failed to load sources: ${error.message}` }, 500)

  const list = rows ?? []
  const counts: Record<Category, number> = { ok: 0, moved: 0, dead: 0, inconclusive: 0 }
  const actionable: Array<Record<string, unknown>> = []

  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY)
    const settled = await Promise.all(
      batch.map(async (row: any) => {
        const r = await checkUrl(row.official_url)
        await supabase
          .from('country_visa_official_sources')
          .update({ http_status: r.status, last_checked_at: new Date().toISOString() })
          .eq('id', row.id)
        return { row, r }
      }),
    )
    for (const { row, r } of settled) {
      counts[r.category]++
      // Only moved/dead are worth a human's attention.
      if (r.category === 'moved' || r.category === 'dead') {
        actionable.push({
          code: row.destination_country_code,
          url: row.official_url,
          category: r.category,
          status: r.status,
          finalHost: r.finalHost,
          error: r.error,
        })
      }
    }
  }

  // Run-summary log for the cron (checkable via the visa_job_runs table).
  await supabase.from('visa_job_runs').insert({
    job: 'healthcheck',
    total: list.length,
    succeeded: counts.ok,
    failed: actionable.length,
    details: { counts, actionable },
  })

  return json({
    mode: 'healthcheck',
    checked: list.length,
    counts,
    actionableCount: actionable.length,
    actionable,
  })
})
