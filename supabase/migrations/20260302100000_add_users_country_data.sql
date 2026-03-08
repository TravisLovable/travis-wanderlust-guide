-- Ensure public.users has all columns expected by types.ts (public.Tables.users.Row)
-- Add any missing columns so schema cache and app match. Safe to run on existing tables.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country_data jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS frequent_flyer_number text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_airline text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_photo_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS travel_type text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_key ON public.users (auth_id) WHERE auth_id IS NOT NULL;
COMMENT ON TABLE public.users IS 'User profiles; columns match src/integrations/supabase/types.ts public.Tables.users';
