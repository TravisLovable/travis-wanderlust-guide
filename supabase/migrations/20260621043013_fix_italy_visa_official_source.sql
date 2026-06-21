-- Italy's MFA visa portal (vistoperitalia.esteri.it/home/en) now 404s — caught by
-- the visa-source health check (visa_job_runs). Switch IT to the U.S. State Dept
-- country page, matching the fallback used for ES/NL/GR/CN. Version matches the
-- ledger entry. (Runs after the seed, so a fresh reset converges correctly.)
update public.country_visa_official_sources
set official_url = 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Italy.html',
    url_label = 'U.S. State Dept – Italy Country Information',
    source_authority = 'us_state_dept',
    notes = 'State Dept used as official source (Italy MFA portal vistoperitalia.esteri.it returned 404). Visa-free for US tourists (Schengen); ETIAS expected late 2026.',
    last_verified = '2026-06-21',
    http_status = null,
    last_checked_at = null
where destination_country_code = 'IT' and is_primary = true;
