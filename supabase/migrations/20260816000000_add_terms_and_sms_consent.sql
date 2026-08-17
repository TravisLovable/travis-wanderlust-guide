-- Legal/Consent step (last step before Complete): terms agreement + optional
-- SMS opt-in for trip-alert texts. Both are booleans paired with a nullable
-- timestamp of the actual moment consent was given — the boolean alone isn't
-- a defensible consent record on its own, since "when" matters (e.g. if the
-- Privacy Policy or Terms text changes later, you need to know whether
-- agreement predates the change). NOT NULL DEFAULT false on the booleans
-- (same reasoning as frequent_flyer_status_by_airline: read/written on every
-- onboarding save, so always-present is more useful than nullable); the
-- *_at timestamps are nullable since "never agreed/opted in" has no
-- meaningful timestamp.
--
-- Metadata-only catalog change (no table rewrite, no long lock), idempotent
-- via IF NOT EXISTS.
--
-- RLS is unchanged: the existing row-level policies on public.users
-- (20260331000000_enable_users_rls.sql and
-- 20260511000000_add_with_check_to_users_update_rls.sql) gate the whole row
-- on auth.uid() = auth_id. Postgres RLS is row-level, not column-level, so
-- these new columns are automatically covered by "Users can update their own
-- profile". No policy changes required.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS terms_agreed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_opt_in_at timestamptz NULL;

COMMENT ON COLUMN public.users.terms_agreed IS 'Onboarding: whether the user has agreed to the Privacy Policy and Terms of Service. Mandatory step, gates Continue.';
COMMENT ON COLUMN public.users.terms_agreed_at IS 'Onboarding: timestamp of the actual agreement moment, for a genuine consent record (not just the current boolean state). Null until agreed.';
COMMENT ON COLUMN public.users.sms_opt_in IS 'Onboarding: optional opt-in to receive trip-alert texts via SMS. References the phone number captured on the Identity step.';
COMMENT ON COLUMN public.users.sms_opt_in_at IS 'Onboarding: timestamp of the actual opt-in moment. Null until opted in.';
