-- Daily visa-cache sync schedule (US x curated destinations) via pg_cron + pg_net.
--
-- NOT auto-applied with the rest of commit 3. Apply ONLY after:
--   1. the sync-visa-requirements Edge Function is deployed,
--   2. TRAVELBUDDY_RAPIDAPI_KEY and SYNC_SECRET are set as function secrets,
--   3. the first manual validation run (US->TH, US->BR) passes.
-- Auth secrets are read from Vault so no key is hardcoded here.
--
-- Create in Vault before applying (Supabase Studio > Vault, or SQL):
--   project_url -> https://jmoysndoynjokwrelpfk.supabase.co
--   sync_secret -> same value as the SYNC_SECRET edge function secret

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-visa-requirements-daily',
  '0 6 * * *',  -- 06:00 UTC daily (~900 req/mo at 30 destinations; cap is 3,000)
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/sync-visa-requirements',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret')
    ),
    body := jsonb_build_object('mode', 'sync')
  );
  $$
);
