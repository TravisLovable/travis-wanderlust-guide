-- Create public.users first so later migrations (pinned_locations, ensure_users_auth_id) can reference it.
-- Matches types.ts and 20250809214338; that migration will skip create (IF NOT EXISTS) and add RLS/policies.

CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  profile_photo_url text,
  country_data jsonb,
  onboarding_completed boolean NOT NULL DEFAULT false,
  travel_type text,
  preferred_airline text,
  frequent_flyer_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_key ON public.users (auth_id) WHERE auth_id IS NOT NULL;
