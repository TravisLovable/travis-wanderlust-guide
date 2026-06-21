-- Lock down the updated_at trigger helper. It is SECURITY DEFINER and was exposed
-- as an executable RPC (/rest/v1/rpc/update_updated_at_column) to anon + authenticated
-- (Supabase security lints 0028/0029). Triggers fire regardless of EXECUTE grants,
-- so revoking EXECUTE does not affect updated_at maintenance on any table.
--
-- Version matches the ledger entry created by MCP apply_migration (kept in sync
-- per the migration-ledger-reconcile convention).
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
