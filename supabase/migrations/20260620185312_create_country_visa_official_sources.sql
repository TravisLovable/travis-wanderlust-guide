-- Official government visa-info source links per destination country (Layer 2 —
-- the PRIMARY trust anchor of the rebuilt EntryCard). Curated reference URLs,
-- seeded in a follow-up migration (top-30 destinations). Operational columns
-- (is_primary, http_status, last_checked_at, is_active) double as a link-health
-- dashboard fed by a weekly pg_cron health check.

-- Shared updated_at trigger function (idempotent; also created by older migrations,
-- but recreated here so this migration is self-contained regardless of ledger state).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.country_visa_official_sources (
  id                       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  destination_country_code char(2)     NOT NULL,  -- ISO 3166-1 alpha-2, uppercase
  official_url             text        NOT NULL,
  url_label                text        NOT NULL,  -- "Brazil e-Visa Portal (VFS)"
  language                 char(2),               -- ISO 639-1 of the linked page
  notes                    text,                  -- curation note ("toggle EN top-right"; date-gated rules)
  source_authority         text        NOT NULL
        CHECK (source_authority IN
          ('immigration_dept','foreign_ministry','evisa_portal','tourism_board','us_state_dept','other')),
  is_primary               boolean     NOT NULL DEFAULT false,  -- the row EntryCard renders by default
  last_verified            date,
  http_status              smallint,              -- last observed status from the health check
  last_checked_at          timestamptz,
  is_active                boolean     NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.country_visa_official_sources IS
  'Curated official government visa-info URLs per destination (ISO alpha-2). The primary verification link shown in EntryCard. Operational columns track link health via a weekly pg_cron check.';

-- Exactly one primary source per country.
CREATE UNIQUE INDEX IF NOT EXISTS cvos_one_primary
  ON public.country_visa_official_sources (destination_country_code)
  WHERE is_primary;

-- Dedupe identical URLs per country.
CREATE UNIQUE INDEX IF NOT EXISTS cvos_unique_url
  ON public.country_visa_official_sources (destination_country_code, official_url);

-- Fast active-row lookup.
CREATE INDEX IF NOT EXISTS cvos_lookup
  ON public.country_visa_official_sources (destination_country_code)
  WHERE is_active;

CREATE TRIGGER cvos_set_updated_at
  BEFORE UPDATE ON public.country_visa_official_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.country_visa_official_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "country_visa_official_sources public read"
  ON public.country_visa_official_sources FOR SELECT
  USING (true);
