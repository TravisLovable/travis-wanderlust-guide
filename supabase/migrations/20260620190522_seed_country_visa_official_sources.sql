-- Seed the top-30 destination official government visa-info sources (Layer 2).
-- One primary source per country. Section A rule context lives in notes; Section B
-- URL choices approved, with Spain/Netherlands/Greece/China overridden to U.S.
-- State Dept country-information pages (fragmented/English-poor destination MFAs).
-- All URLs verified live on 2026-06-20.

INSERT INTO public.country_visa_official_sources
  (destination_country_code, official_url, url_label, language, notes, source_authority, is_primary, last_verified)
VALUES
  ('MX', 'https://www.inm.gob.mx/fmme/publico/en/solicitud.html', 'Mexico INM – FMM (entry form)', 'en', 'INM is the authority; the online FMM is often completed at the border.', 'immigration_dept', true, '2026-06-20'),
  ('CA', 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html', 'Canada IRCC – Entry requirements by country', 'en', 'US citizens are eTA-exempt; this page is the authoritative check.', 'immigration_dept', true, '2026-06-20'),
  ('GB', 'https://www.gov.uk/eta', 'UK ETA (gov.uk)', 'en', 'UK ETA mandatory for US citizens since Jan 2025; apply ONLY via gov.uk/eta — beware paid look-alikes.', 'immigration_dept', true, '2026-06-20'),
  ('FR', 'https://france-visas.gouv.fr/en/web/france-visas', 'France-Visas (official MEAE portal)', 'en', 'Visa-free for US tourists (Schengen). ETIAS expected late 2026, not yet required — see travel-europe.europa.eu/etias_en.', 'foreign_ministry', true, '2026-06-20'),
  ('IT', 'https://vistoperitalia.esteri.it/home/en', 'Italy MAECI – Visa for Italy', 'en', 'Visa-free for US tourists (Schengen). ETIAS expected late 2026, not yet required.', 'foreign_ministry', true, '2026-06-20'),
  ('JP', 'https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html', 'Japan MOFA – Visa exemption (short stay)', 'en', 'US citizens visa-exempt for up to 90 days.', 'foreign_ministry', true, '2026-06-20'),
  ('BR', 'https://brazil.vfsevisa.com/', 'Brazil e-Visa Portal (VFS, official)', 'en', 'eVisa required for US citizens since 2025-04-10. Official VFS-run portal; beware scam clones (e.g. evisabrazil.com.br).', 'evisa_portal', true, '2026-06-20'),
  ('DE', 'https://www.auswaertiges-amt.de/en/visa-service', 'Germany Federal Foreign Office – Visa', 'en', 'Visa-free for US tourists (Schengen). ETIAS expected late 2026, not yet required.', 'foreign_ministry', true, '2026-06-20'),
  ('ES', 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Spain.html', 'U.S. State Dept – Spain Country Information', 'en', 'State Dept used as official source (Spain MFA pages fragmented). Visa-free for US tourists (Schengen); ETIAS expected late 2026.', 'us_state_dept', true, '2026-06-20'),
  ('NL', 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Netherlands.html', 'U.S. State Dept – Netherlands Country Information', 'en', 'State Dept used as official source (MFA page structure shifts). Visa-free for US tourists (Schengen); ETIAS expected late 2026.', 'us_state_dept', true, '2026-06-20'),
  ('GR', 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Greece.html', 'U.S. State Dept – Greece Country Information', 'en', 'State Dept used as official source (Greece MFA fragmented). Visa-free for US tourists (Schengen); ETIAS expected late 2026.', 'us_state_dept', true, '2026-06-20'),
  ('CN', 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/China.html', 'U.S. State Dept – China Country Information', 'en', 'State Dept used as official source (fragmented/English-poor destination gov sites). US citizens generally need a visa; applications via visaforchina.cn; 240-hour visa-free transit at designated ports.', 'us_state_dept', true, '2026-06-20'),
  ('DO', 'https://eticket.migracion.gob.do/', 'Dominican Republic – E-Ticket (Migración)', 'es', 'Free E-Ticket mandatory for entry and exit; beware paid clone sites.', 'immigration_dept', true, '2026-06-20'),
  ('CR', 'https://www.migracion.go.cr/', 'Costa Rica – DGME (Migración)', 'es', 'US tourists visa-free up to 90 days. Site in Spanish.', 'immigration_dept', true, '2026-06-20'),
  ('JM', 'https://www.enterjamaica.gov.jm/', 'Jamaica – Enter Jamaica (PICA)', 'en', 'Visa-free; mandatory immigration/customs declaration via Enter Jamaica.', 'immigration_dept', true, '2026-06-20'),
  ('BS', 'https://www.immigration.gov.bs/entry-requirements/', 'Bahamas – Immigration: Entry Requirements', 'en', 'Visa-free for US tourists.', 'immigration_dept', true, '2026-06-20'),
  ('CO', 'https://apps.migracioncolombia.gov.co/pre-registro/en', 'Colombia – Check-MIG (Migración Colombia)', 'en', 'Free Check-MIG pre-registration required in and out; beware clone sites.', 'immigration_dept', true, '2026-06-20'),
  ('PT', 'https://vistos.mne.gov.pt/en/', 'Portugal MNE – Visas portal', 'en', 'Visa-free for US tourists (Schengen). ETIAS expected late 2026, not yet required.', 'foreign_ministry', true, '2026-06-20'),
  ('IE', 'https://www.irishimmigration.ie/coming-to-visit-ireland/', 'Ireland – Immigration Service (visit)', 'en', 'Not Schengen, not in ETIAS. US tourists visa-free up to 90 days.', 'immigration_dept', true, '2026-06-20'),
  ('TH', 'https://tdac.immigration.go.th/', 'Thailand – Digital Arrival Card (TDAC)', 'en', 'Visa-exempt 60 days, but TDAC digital arrival card mandatory since May 2025.', 'immigration_dept', true, '2026-06-20'),
  ('AU', 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601', 'Australia – ETA (subclass 601)', 'en', 'US citizens use ETA subclass 601 (apply via the official app); not eVisitor 651.', 'immigration_dept', true, '2026-06-20'),
  ('IN', 'https://indianvisaonline.gov.in/evisa/tvoa.html', 'India – official e-Visa portal', 'en', 'US citizens need an e-Visa. Only genuine portal — govt warns of clone sites.', 'evisa_portal', true, '2026-06-20'),
  ('AE', 'https://u.ae/en/information-and-services/visa-and-emirates-id/do-you-need-an-entry-permit-or-a-visa-to-enter-the-uae', 'UAE – Government portal: do you need a visa?', 'en', 'Free visa-on-arrival 90 days. Two issuers (ICP federal / GDRFA-Dubai); u.ae is the unified portal.', 'other', true, '2026-06-20'),
  ('KR', 'https://www.k-eta.go.kr/', 'South Korea – K-ETA (official)', 'en', 'US citizens K-ETA-exempt through 2026-12-31; K-ETA required from 2027-01-01.', 'immigration_dept', true, '2026-06-20'),
  ('AR', 'https://www.argentina.gob.ar/interior/migraciones', 'Argentina – DNM (Migraciones)', 'es', 'US tourists visa-free up to 90 days. Site in Spanish.', 'immigration_dept', true, '2026-06-20'),
  ('PE', 'https://www.gob.pe/migraciones', 'Peru – Migraciones', 'es', 'US tourists visa-free (up to 183 days). Site in Spanish.', 'immigration_dept', true, '2026-06-20'),
  ('CH', 'https://www.sem.admin.ch/sem/en/home/themen/einreise.html', 'Switzerland – SEM (entry)', 'en', 'Visa-free for US tourists (Schengen, non-EU). ETIAS expected late 2026, not yet required.', 'immigration_dept', true, '2026-06-20'),
  ('TR', 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa', 'Türkiye MFA – Visa information', 'en', 'US citizens visa-EXEMPT (90 days in 180) since Jan 2024 — do NOT use evisa.gov.tr.', 'foreign_ministry', true, '2026-06-20'),
  ('VN', 'https://evisa.gov.vn/', 'Vietnam – national e-Visa portal', 'en', 'US citizens need an e-Visa. Genuine national portal; many clones exist.', 'evisa_portal', true, '2026-06-20'),
  ('ID', 'https://evisa.imigrasi.go.id/', 'Indonesia – e-Visa / e-VOA (Imigrasi)', 'en', 'US citizens use e-VOA (visa on arrival). Direct gov portal; a VFS-run variant also exists.', 'evisa_portal', true, '2026-06-20')
ON CONFLICT (destination_country_code, official_url) DO NOTHING;
