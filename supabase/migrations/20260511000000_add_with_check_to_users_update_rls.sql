-- Replace the UPDATE policy on public.users so it enforces auth.uid() = auth_id
-- on both the existing row (USING) and the proposed new row (WITH CHECK),
-- preventing a user from reassigning auth_id to another auth user.

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);
