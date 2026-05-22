-- Step 7 — Onboarding wizard.
-- Add the columns the 8-step onboarding wizard captures into public.users.
-- All columns are NULLABLE with NO default and NO NOT NULL constraint, so this
-- is a metadata-only catalog change: no table rewrite, no long lock, safe on an
-- empty or populated table. IF NOT EXISTS makes it idempotent / re-runnable.
--
-- RLS is unchanged: the existing row-level policies on public.users
-- (see 20260331000000_enable_users_rls.sql and
-- 20260511000000_add_with_check_to_users_update_rls.sql) gate the whole row on
-- auth.uid() = auth_id. Postgres RLS is row-level, not column-level, so new
-- columns are automatically covered by "Users can update their own profile".
-- No policy changes are required.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_country_code text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS home_city text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passport_country text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS airlines text[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS travel_styles text[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS travel_frequency text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS travel_pace text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS alert_preferences jsonb;

COMMENT ON COLUMN public.users.phone               IS 'Onboarding: national phone number digits (E.164 local part).';
COMMENT ON COLUMN public.users.phone_country_code  IS 'Onboarding: phone dial code, e.g. "+1".';
COMMENT ON COLUMN public.users.home_city           IS 'Onboarding: home city; drives distance / time-offset / fly-out logic.';
COMMENT ON COLUMN public.users.passport_country    IS 'Onboarding: passport country name. No passport number is ever stored. Coexists with country_data.';
COMMENT ON COLUMN public.users.airlines            IS 'Onboarding: up to 3 preferred airline codes (e.g. AA, UA).';
COMMENT ON COLUMN public.users.travel_styles       IS 'Onboarding: stable travel-style keys (e.g. business, nomad).';
COMMENT ON COLUMN public.users.travel_frequency    IS 'Onboarding: stable frequency key; display string lives in the UI only.';
COMMENT ON COLUMN public.users.travel_pace         IS 'Onboarding: stable pace key; display string lives in the UI only.';
COMMENT ON COLUMN public.users.alert_preferences   IS 'Onboarding: object map of alert key -> bool, e.g. {"visa": true, "safety": true}.';
