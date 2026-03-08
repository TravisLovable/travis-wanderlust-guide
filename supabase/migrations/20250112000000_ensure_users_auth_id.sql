-- Ensure public.users has auth_id so pinned_locations RLS policies can link to auth.uid()
-- Run before 20250115000000_create_pinned_locations.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_key ON public.users (auth_id)
  WHERE auth_id IS NOT NULL;

COMMENT ON COLUMN public.users.auth_id IS 'Links to Supabase auth.users(id) for RLS and app auth';
