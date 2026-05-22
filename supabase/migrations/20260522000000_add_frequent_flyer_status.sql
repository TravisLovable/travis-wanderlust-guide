-- Step 7.5 — Onboarding polish: frequent flyer status.
-- Adds a dedicated nullable column for the user's highest frequent-flyer tier,
-- mirroring how travel_pace stores a stable key. NULLABLE with NO default: a
-- metadata-only catalog change (no table rewrite, no long lock), idempotent via
-- IF NOT EXISTS. RLS is unchanged — the existing row-ownership policies on
-- public.users (see 20260331000000 / 20260511000000) cover new columns
-- automatically, since Postgres RLS is row-level, not column-level.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS frequent_flyer_status text;

COMMENT ON COLUMN public.users.frequent_flyer_status IS 'Onboarding: highest frequent-flyer tier the user holds; stable key (none|silver|gold|platinum|diamond). Display label lives in the UI only. Distinct from frequent_flyer_number (the membership ID).';
