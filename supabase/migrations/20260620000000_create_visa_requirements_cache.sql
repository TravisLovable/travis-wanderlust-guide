-- Visa requirements CACHE table (Path A rebuild).
--
-- SUPERSEDES three earlier migrations that created a DB-backed visa_requirements
-- table with a different (manual-curation) schema:
--   20250110000000_create_visa_requirements
--   20250902192955_create_visa_requirements_if_not_exists
--   20250902193359_create_visa_requirements_safe
-- The live migration ledger records all three as applied, but the table does NOT
-- exist in the database (ledger/schema divergence — pre-existing tech debt). The
-- old schema also seeded a now-STALE row (US->Brazil "visa-free"), the original
-- source of the visa data bug. This migration is therefore SELF-HEALING: it drops
-- any prior visa_requirements (old schema + stale seed, if a fresh rebuild ever
-- recreates it) and recreates it as a sync cache. No seed data lives here — rows
-- are populated at runtime by the get-visa-requirements sync job from Travel
-- Buddy AI, each stamped with source + synced_at for provenance.

DROP TABLE IF EXISTS public.visa_requirements CASCADE;

CREATE TABLE public.visa_requirements (
  origin_country_code      char(2)     NOT NULL,  -- ISO 3166-1 alpha-2, uppercase (US-only to start)
  destination_country_code char(2)     NOT NULL,  -- ISO 3166-1 alpha-2, uppercase
  status                   text        NOT NULL,  -- provider category code: vf|ev|vr|voa|...
  status_label             text,                  -- human label, e.g. "Visa-free", "eTA"
  rule                     text,                  -- provider rule text, e.g. "Visa not required"
  max_stay_days            integer,               -- nullable; some rules have no fixed cap
  evisa_link               text,                  -- official eVisa/application URL when the provider supplies one
  registration_note        text,                  -- arrival-card / registration requirement (e.g. Thailand TDAC)
  source                   text        NOT NULL DEFAULT 'Travel Buddy AI',
  synced_at                timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (origin_country_code, destination_country_code)
);

COMMENT ON TABLE public.visa_requirements IS
  'Sync CACHE of visa rules from Travel Buddy AI, keyed (origin, destination) ISO alpha-2. Populated by the get-visa-requirements Edge Function sync job; NOT hand-seeded. Every row carries source + synced_at for provenance.';

ALTER TABLE public.visa_requirements ENABLE ROW LEVEL SECURITY;

-- Public read (reference data). Writes are performed by the sync job using the
-- service role, which bypasses RLS — so no write policy is defined (default deny).
CREATE POLICY "visa_requirements public read"
  ON public.visa_requirements FOR SELECT
  USING (true);
