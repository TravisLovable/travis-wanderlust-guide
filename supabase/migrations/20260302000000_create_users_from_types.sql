-- Recreate public.users from src/integrations/supabase/types.ts
-- Table: users (Row type in types.ts)

CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id text NOT NULL,
  email text,
  full_name text,
  profile_photo_url text,
  country_data jsonb,
  onboarding_completed boolean NOT NULL DEFAULT false,
  travel_type text,
  preferred_airline text,
  frequent_flyer_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Optional: unique constraint so one profile per auth user
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_key ON public.users (auth_id);

-- Optional: RLS (enable if you use Row Level Security)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.users IS 'User profiles; mirrors types.ts public.Tables.users';
