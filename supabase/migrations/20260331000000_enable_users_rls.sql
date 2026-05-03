-- Enable Row Level Security on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies (DROP IF EXISTS to avoid conflicts with earlier migrations)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid()::text = auth_id);

CREATE POLICY "Users can create their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid()::text = auth_id);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid()::text = auth_id);

CREATE POLICY "Users can delete their own profile"
ON public.users FOR DELETE
USING (auth.uid()::text = auth_id);
