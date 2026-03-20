import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';

interface HealthEntryCardProps {
  destination: string;
  passport?: string;
  animationDelay?: string;
}

// ── Priority tiers ──
const TIER_CRITICAL = 1;
const TIER_ACTIONABLE = 2;
const TIER_CONTEXTUAL = 3;
const TIER_BACKGROUND = 4;

interface PriorityItem {
  tier: number;
  label: string;
  value: string;
  section: 'required' | 'recommended' | 'risk';
}

// ── Helpers ──

function isRelevant(val: unknown): boolean {
  if (val === true || val === 'regional') return true;
  if (typeof val === 'string' && val.length > 0 && val !== 'null' && val !== 'none') return true;
  return false;
}

function mapBool(val: unknown, trueLabel = 'Required', falseLabel = 'Not required'): string {
  if (val === true) return trueLabel;
  if (val === false) return falseLabel;
  if (val === 'regional') return 'Advised in certain regions';
  if (typeof val === 'string' && val.length > 0) return val;
  return 'Check local guidance';
}

function truncateList(items: string[], max = 3): string {
  if (!items || items.length === 0) return 'None';
  if (items.length <= max) return items.join(', ');
  return `${items.slice(0, max).join(', ')} +${items.length - max}`;
}

function riskBadge(level: string | undefined) {
  const l = (level || '').toLowerCase();
  if (l === 'low') return { label: 'Low risk', cls: 'text-emerald-400 bg-emerald-400/10' };
  if (l === 'moderate') return { label: 'Moderate risk', cls: 'text-amber-400 bg-amber-400/10' };
  if (l === 'high') return { label: 'High risk', cls: 'text-red-400 bg-red-400/10' };
  return { label: 'Unknown', cls: 'text-muted-foreground/60 bg-secondary/30' };
}

// ── Disease/infection knowledge base ──
const DISEASE_INFO: Record<string, { desc: string; url: string }> = {
  'yellow fever': { desc: 'Mosquito-borne viral hemorrhagic disease. Vaccine available.', url: 'https://www.who.int/news-room/fact-sheets/detail/yellow-fever' },
  'malaria': { desc: 'Parasitic infection spread by mosquitoes. No vaccine — prevented with antimalarial medication (pills taken before, during, and after travel).', url: 'https://www.who.int/news-room/fact-sheets/detail/malaria' },
  'prophylaxis': { desc: 'Preventive medication — not a vaccine. For malaria, this means antimalarial pills prescribed by a doctor before travel.', url: 'https://www.who.int/news-room/fact-sheets/detail/malaria' },
  'dengue': { desc: 'Mosquito-borne viral infection causing high fever and joint pain.', url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue' },
  'zika': { desc: 'Mosquito-borne virus. Risk to pregnant travelers.', url: 'https://www.who.int/news-room/fact-sheets/detail/zika-virus' },
  'typhoid': { desc: 'Bacterial infection from contaminated food/water. Vaccine available.', url: 'https://www.who.int/news-room/fact-sheets/detail/typhoid' },
  'cholera': { desc: 'Severe diarrheal disease from contaminated water. Oral vaccine available.', url: 'https://www.who.int/news-room/fact-sheets/detail/cholera' },
  'hepatitis a': { desc: 'Viral liver infection from contaminated food/water. Vaccine available.', url: 'https://www.who.int/news-room/fact-sheets/detail/hepatitis-a' },
  'hepatitis b': { desc: 'Viral liver infection spread through blood/bodily fluids. Vaccine available.', url: 'https://www.who.int/news-room/fact-sheets/detail/hepatitis-b' },
  'rabies': { desc: 'Fatal viral disease from animal bites. Post-exposure treatment critical.', url: 'https://www.who.int/news-room/fact-sheets/detail/rabies' },
  'chikungunya': { desc: 'Mosquito-borne virus causing fever and severe joint pain.', url: 'https://www.who.int/news-room/fact-sheets/detail/chikungunya' },
  'japanese encephalitis': { desc: 'Mosquito-borne brain infection. Vaccine available for travelers.', url: 'https://www.who.int/news-room/fact-sheets/detail/japanese-encephalitis' },
  'meningitis': { desc: 'Bacterial/viral brain membrane infection. Vaccine available.', url: 'https://www.who.int/news-room/fact-sheets/detail/meningococcal-meningitis' },
  'tuberculosis': { desc: 'Airborne bacterial lung infection. Common in developing regions.', url: 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis' },
};

// Build a regex that matches any known disease name (case-insensitive)
const DISEASE_PATTERN = new RegExp(
  `\\b(${Object.keys(DISEASE_INFO).map(d => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi'
);

// Hoverable disease name with tooltip rendered as a portal (never clipped)
function DiseaseHover({ name, desc }: { name: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const onEnter = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setPos({ top: rect.top - 8, left: rect.left });
    }
    setHovered(true);
  };

  return (
    <>
      <span
        ref={spanRef}
        onMouseEnter={onEnter}
        onMouseLeave={() => setHovered(false)}
        className="text-amber-400/80 underline underline-offset-2 decoration-dotted decoration-amber-400/30 cursor-default"
      >
        {name}
      </span>
      {hovered && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: window.innerHeight - pos.top,
            left: pos.left,
            width: 240,
            padding: '10px 12px',
            borderRadius: 10,
            background: '#121215',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
            zIndex: 999999,
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>{name}</p>
          <p style={{ fontSize: 10, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
        </div>,
        document.body
      )}
    </>
  );
}

// Renders text with disease/infection names as hover-context tooltips
function RiskText({ text, className }: { text: string; className?: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  DISEASE_PATTERN.lastIndex = 0;
  while ((match = DISEASE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const name = match[0];
    const info = DISEASE_INFO[name.toLowerCase()];
    if (info) {
      parts.push(<DiseaseHover key={match.index} name={name} desc={info.desc} />);
    } else {
      parts.push(name);
    }
    lastIndex = match.index + name.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts.length > 0 ? parts : text}</span>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-[2px] min-w-0">
      <span className="text-[11px] text-muted-foreground/35 flex-shrink-0">{label}</span>
      <span className="text-[12px] text-foreground/85 text-right ml-4 line-clamp-2 max-w-[65%]">{value}</span>
    </div>
  );
}

// ── Max visible detail rows (keeps card at fixed 280px) ──
const MAX_ROWS = 5;

// ── Component ──

const HealthEntryCard: React.FC<HealthEntryCardProps> = ({
  destination,
  passport = 'United States',
  animationDelay = '0.16s',
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [risksOpen, setRisksOpen] = useState(false);
  const risksTriggerRef = useRef<HTMLButtonElement>(null);
  const risksMenuRef = useRef<HTMLDivElement>(null);
  const { insights, loading: insightsLoading } = useInsights();

  // Close risks portal on outside click
  useEffect(() => {
    if (!risksOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (risksMenuRef.current?.contains(t)) return;
      if (risksTriggerRef.current?.contains(t)) return;
      setRisksOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [risksOpen]);

  // Close on Escape
  useEffect(() => {
    if (!risksOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setRisksOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [risksOpen]);

  useEffect(() => {
    if (!destination) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ destination, passport }),
    })
      .then((res) => { if (!res.ok) throw new Error(`Health API: ${res.status}`); return res.json(); })
      .then((result) => { if (!cancelled) { if (result.error) throw new Error(result.error); setData(result); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [destination, passport]);

  // ── Priority-based item builder ──
  const { items, isLowFriction, riskLevel, vaccines } = useMemo(() => {
    if (!data) return { items: [], isLowFriction: true, riskLevel: 'low', vaccines: [] as string[] };

    const req = data.required_for_entry || {};
    const rec = data.recommended || {};
    const risks = data.regional_risks || {};
    const level = (data.summary?.risk_level || 'low').toLowerCase();
    const all: PriorityItem[] = [];

    // Tier 1 — Critical: entry requirements
    if (isRelevant(req.covid_vaccination)) all.push({ tier: TIER_CRITICAL, label: 'COVID vaccination', value: mapBool(req.covid_vaccination), section: 'required' });
    if (isRelevant(req.covid_test)) all.push({ tier: TIER_CRITICAL, label: 'COVID test', value: mapBool(req.covid_test), section: 'required' });
    if (isRelevant(req.health_declaration_form)) all.push({ tier: TIER_CRITICAL, label: 'Health declaration', value: mapBool(req.health_declaration_form), section: 'required' });
    if (isRelevant(req.quarantine)) all.push({ tier: TIER_CRITICAL, label: 'Quarantine', value: mapBool(req.quarantine), section: 'required' });
    if (isRelevant(req.entry_screening)) all.push({ tier: TIER_CRITICAL, label: 'Entry screening', value: mapBool(req.entry_screening), section: 'required' });

    // Tier 2 — Actionable: all vaccines on one row (comma-separated), malaria separate
    const vaccines = rec.vaccines && rec.vaccines.length > 0 ? rec.vaccines : [];
    // Vaccines listed directly under the Recommended section header, not as a labeled row
    if (isRelevant(rec.malaria_prophylaxis)) {
      // Add Malaria to the vaccine list display with region note
      vaccines.push('Malaria (Advised in certain regions)');
    }

    // Tier 3 — Contextual: regional risks, mosquito, food/water
    if (isRelevant(risks.malaria_risk_areas)) all.push({ tier: TIER_CONTEXTUAL, label: 'Malaria areas', value: risks.malaria_risk_areas, section: 'risk' });
    if (isRelevant(risks.mosquito_borne_illness)) all.push({ tier: TIER_CONTEXTUAL, label: 'Mosquito-borne', value: risks.mosquito_borne_illness, section: 'risk' });
    if (isRelevant(risks.other_advisories)) {
      const advisory = String(risks.other_advisories).toLowerCase();
      if (!advisory.includes('water quality') && !advisory.includes('water safety') && !advisory.includes('bottled water') && !advisory.includes('purified water') && !advisory.includes('tap water')) {
        all.push({ tier: TIER_CONTEXTUAL, label: 'Advisories', value: risks.other_advisories, section: 'risk' });
      }
    }

    // Tier 4 — Background: low-signal recommendations (hidden first)

    // Sort by tier, then slice to MAX_ROWS
    all.sort((a, b) => a.tier - b.tier);

    const hasCritical = all.some(i => i.tier === TIER_CRITICAL);
    const hasRisks = all.some(i => i.section === 'risk');
    const lowFriction = !hasCritical && !hasRisks;

    // For low-risk: show fewer rows. For high-risk: show more critical rows.
    const maxRows = level === 'high' ? MAX_ROWS : level === 'moderate' ? MAX_ROWS : Math.min(MAX_ROWS, 3);

    return {
      items: all.slice(0, maxRows),
      isLowFriction: lowFriction,
      riskLevel: level,
      vaccines,
    };
  }, [data]);

  const summary = data?.summary;
  const badge = riskBadge(summary?.risk_level);

  // Group visible items by section for rendering
  const requiredItems = items.filter(i => i.section === 'required');
  const recommendedItems = items.filter(i => i.section === 'recommended');
  const riskItems = items.filter(i => i.section === 'risk');

  // ── Loading ──
  if (loading) {
    return (
      <div className="widget-card animate-slide-up" style={{ animationDelay }}>
        <div className="widget-header">
          <div className="widget-icon bg-green-500/10 text-green-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="widget-title">Health Entry</h3>
            <p className="widget-subtitle">Vaccination & health requirements</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500/30 border-t-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      {/* Header */}
      <div className="widget-header">
        <div className="widget-icon bg-green-500/10 text-green-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Health Entry</h3>
          <p className="widget-subtitle">Vaccination & health requirements</p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-400/40 mb-1">Unable to load live data</p>
      )}

      <div className="flex-1 min-h-0 overflow-hidden space-y-2 mt-1">

        {/* ── Summary ── */}
        {summary && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {isLowFriction ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              <span className="text-[14px] font-medium text-foreground line-clamp-1">
                {summary.health_clearance}
              </span>
            </div>
            {/* Low-friction confidence line */}
            {isLowFriction && requiredItems.length === 0 && (
              <p className="text-[12px] text-muted-foreground/45 mt-1.5 line-clamp-1">
                No vaccines, testing, or health forms required
              </p>
            )}
            {/* key_action omitted — redundant with priority rows below */}
          </div>
        )}


        {/* ── Recommended ── */}
        {(vaccines.length > 0 || recommendedItems.length > 0) && (
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/30 mb-0.5">Recommended</p>
            {vaccines.length > 0 && (
              <p className="text-[12px] text-foreground/85 line-clamp-2">{vaccines.join(', ')}</p>
            )}
            {recommendedItems.map((r, i) => (
              <Row key={i} label={r.label} value={r.value} />
            ))}
          </div>
        )}

        {/* ── Regional risks (Tier 3) — floating portal ── */}
        {riskItems.length > 0 && (
          <div className="mt-1.5">
            <button
              ref={risksTriggerRef}
              onClick={() => setRisksOpen(!risksOpen)}
              className="flex items-center gap-1 w-full text-left group"
            >
              <ChevronDown
                className={`w-3 h-3 text-muted-foreground/30 transition-transform duration-200 ${risksOpen ? 'rotate-0' : '-rotate-90'}`}
              />
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">
                Regional risks ({riskItems.length})
              </span>
            </button>
            {risksOpen && risksTriggerRef.current && createPortal(
              <div
                ref={risksMenuRef}
                style={{
                  position: 'fixed',
                  top: risksTriggerRef.current.getBoundingClientRect().bottom + 6,
                  left: risksTriggerRef.current.getBoundingClientRect().left,
                  width: 280,
                  zIndex: 99999,
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#121215',
                  borderRadius: 12,
                }} />
                <div style={{ position: 'relative', padding: '12px 14px' }}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-400/50 mb-2">Regional risks</p>
                  <div className={riskItems.length > 3 ? 'max-h-[80px] overflow-y-auto' : ''}>
                    {riskItems.map((r, i) => (
                      <div key={i} className="flex items-baseline justify-between py-[3px] min-w-0">
                        <RiskText text={r.label} className="text-[11px] text-muted-foreground/35 flex-shrink-0" />
                        <RiskText text={r.value} className="text-[12px] text-foreground/85 text-right ml-4 max-w-[65%]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

      </div>

      <InsightLine insight={insights?.healthEntry} loading={insightsLoading} />
      <p className="text-[10px] text-muted-foreground/30 tracking-wide hover:text-muted-foreground/45 transition-colors cursor-default mt-auto pt-1">
        {data?.last_updated && data.last_updated.toLowerCase() === 'current'
          ? 'Verified now'
          : data?.last_updated ? `Verified ${data.last_updated}` : 'Verified recently'}
        {data?.source ? ` · ${data.source}` : ''}
      </p>
    </div>
  );
};

export default HealthEntryCard;
