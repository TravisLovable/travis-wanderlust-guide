-- Per-airline frequent-flyer status.
-- The existing frequent_flyer_status column is a single global value with no
-- link to a specific airline, which can't represent "Gold on Delta, Platinum
-- on United" once status is tracked per selected carrier. Adds a new jsonb
-- column mapping IATA code -> tier key, e.g. {"DL": "gold_medallion", "EK":
-- "gold"}. Metadata-only catalog change (no table rewrite, no long lock),
-- idempotent via IF NOT EXISTS. NOT NULL DEFAULT '{}'::jsonb so application
-- code can treat it as always-present, unlike the nullable alert_preferences
-- precedent (20260518000000) -- this column is meant to be read/written on
-- every onboarding save, not left unset.
--
-- frequent_flyer_status is intentionally left untouched: its existing stored
-- values were never linked to an airline, so there is no way to backfill
-- which airline they belong to. It stays as-is, unused going forward;
-- deprecating/dropping it is a separate future decision.
--
-- RLS is unchanged: the existing row-level policies on public.users
-- (20260331000000_enable_users_rls.sql and
-- 20260511000000_add_with_check_to_users_update_rls.sql) gate the whole row
-- on auth.uid() = auth_id. Postgres RLS is row-level, not column-level, so
-- this new column is automatically covered by "Users can update their own
-- profile". No policy changes required.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS frequent_flyer_status_by_airline jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.users.frequent_flyer_status_by_airline IS 'Onboarding: map of IATA airline code -> frequent-flyer tier key for that airline, e.g. {"DL": "gold_medallion", "EK": "gold"}. Tier keys and program definitions live in application code, not the database. Distinct from (and not backfilled from) the legacy single-value frequent_flyer_status column.';
