-- B2 (in-app account deletion): the delete-account Edge Function must enumerate
-- every storage object owned by a user so it can remove them via the Storage API
-- (no path guessing). PostgREST does not expose the `storage` schema, so the
-- function can't query storage.objects directly. This SECURITY DEFINER helper
-- reads it on the function's behalf, matching either ownership column.
--
-- Locked to service_role only — it can reveal any user's object paths, so it must
-- never be callable by anon/authenticated clients. The delete-account function
-- invokes it with the service-role key.
create or replace function public.list_owned_storage_objects(p_uid uuid)
returns table (bucket_id text, name text)
language sql
security definer
set search_path = ''
as $$
  select o.bucket_id, o.name
  from storage.objects o
  where o.owner = p_uid or o.owner_id = p_uid::text
$$;

revoke all on function public.list_owned_storage_objects(uuid) from public;
revoke all on function public.list_owned_storage_objects(uuid) from anon, authenticated;
grant execute on function public.list_owned_storage_objects(uuid) to service_role;
