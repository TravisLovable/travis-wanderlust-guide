-- Capture the passport-validity requirement (e.g. "6 months", "Valid for period
-- of stay") that the Travel Buddy payload already returns at data.destination.
-- Additive, nullable — no rewrite, backfilled by the next sync.
-- Version matches the ledger entry created by MCP apply_migration.
alter table public.visa_requirements add column if not exists passport_validity text;
