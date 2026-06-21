-- Weekly link-rot health check on country_visa_official_sources official URLs.
--
-- NOT auto-applied — applied at cutover alongside the sync cron. Reuses the same
-- Vault secrets (project_url, sync_secret) and the SYNC_SECRET function secret.
--
-- Note: government WAFs frequently block datacenter IPs / non-browser clients,
-- so a number of rows return as "inconclusive" (403/timeout/TLS) every run; the
-- function classifies those separately and only flags `moved`/`dead` as
-- actionable. Reviewing means querying for non-actionable noise vs real rot.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'visa-source-healthcheck-weekly',
  '0 5 * * 0',  -- 05:00 UTC every Sunday
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/health-check-visa-sources',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret')
    ),
    body := jsonb_build_object('mode', 'healthcheck')
  );
  $$
);
