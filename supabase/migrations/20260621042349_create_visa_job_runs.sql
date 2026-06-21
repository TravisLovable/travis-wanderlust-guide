-- Run-summary log for the visa cron jobs (sync + health-check), so failures are
-- checkable without log diving. Written by the Edge Functions (service role);
-- read via the SQL editor / MCP (both bypass RLS). RLS on, no policies =
-- default-deny for anon/authenticated. Version matches the ledger entry.
create table if not exists public.visa_job_runs (
  id         bigint generated always as identity primary key,
  job        text        not null,          -- 'sync' | 'healthcheck'
  ran_at     timestamptz not null default now(),
  total      integer,
  succeeded  integer,
  failed     integer,
  details    jsonb
);

create index if not exists visa_job_runs_job_ran_at on public.visa_job_runs (job, ran_at desc);

alter table public.visa_job_runs enable row level security;
