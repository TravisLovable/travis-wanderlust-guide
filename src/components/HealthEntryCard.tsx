import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface HealthEntryCardProps {
  destination: string;
  passport?: string;
  animationDelay?: string;
}

interface DetailRow {
  label: string;
  value: string;
}

interface HealthData {
  status: string;
  details: DetailRow[];
  summary: string;
}

function capitalizeWords(text: string): string {
  return text.replace(/(?:^|,\s*)([a-z])/g, (_, c) => _.replace(c, c.toUpperCase()));
}

// ── Disease definitions (placeholder — will be replaced by AI-generated content) ──
const DISEASE_DEFS: Record<string, string> = {
  'yellow fever': 'Mosquito-borne viral hemorrhagic disease. Vaccine available.',
  'malaria': 'Parasitic infection spread by mosquitoes. Prevented with antimalarial medication.',
  'prophylaxis': 'Preventive medication — for malaria, antimalarial pills prescribed before travel.',
  'dengue': 'Mosquito-borne viral infection causing high fever and joint pain.',
  'zika': 'Mosquito-borne virus. Risk to pregnant travelers.',
  'typhoid': 'Bacterial infection from contaminated food/water. Vaccine available.',
  'cholera': 'Severe diarrheal disease from contaminated water. Oral vaccine available.',
  'hepatitis a': 'Viral liver infection from contaminated food/water. Vaccine available.',
  'hepatitis b': 'Viral liver infection spread through blood/bodily fluids. Vaccine available.',
  'rabies': 'Fatal viral disease from animal bites. Post-exposure treatment critical.',
  'chikungunya': 'Mosquito-borne virus causing fever and severe joint pain.',
  'japanese encephalitis': 'Mosquito-borne brain infection. Vaccine available for travelers.',
  'meningitis': 'Bacterial/viral brain membrane infection. Vaccine available.',
  'tuberculosis': 'Airborne bacterial lung infection. Common in developing regions.',
};

const DISEASE_PATTERN = new RegExp(
  `\\b(${Object.keys(DISEASE_DEFS).map(d => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi'
);

function DiseaseHover({ name, definition }: { name: string; definition: string }) {
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
        className="text-muted-foreground/75 underline underline-offset-2 decoration-dotted decoration-muted-foreground/30 cursor-default"
      >
        {name}
      </span>
      {hovered && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: window.innerHeight - pos.top,
            left: pos.left,
            width: 220,
            padding: '10px 12px',
            borderRadius: 10,
            background: '#121215',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
            zIndex: 999999,
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>{name}</p>
          <p style={{ fontSize: 10, lineHeight: 1.5, color: 'rgba(255,255,255,0.55)' }}>{definition}</p>
        </div>,
        document.body
      )}
    </>
  );
}

function renderWithDiseaseHovers(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  DISEASE_PATTERN.lastIndex = 0;
  while ((match = DISEASE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const name = match[0];
    const def = DISEASE_DEFS[name.toLowerCase()];
    if (def) {
      parts.push(<DiseaseHover key={match.index} name={capitalizeWords(name)} definition={def} />);
    } else {
      parts.push(capitalizeWords(name));
    }
    lastIndex = match.index + name.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : capitalizeWords(text);
}

const TOTAL_ROWS = 3;

const HealthEntryCard: React.FC<HealthEntryCardProps> = ({
  destination,
  passport = 'United States',
  animationDelay = '0.16s',
}) => {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Normalize: support both new shape { status, details, summary }
  // and legacy shape { summary: { health_clearance, ... }, required_for_entry, recommended, regional_risks }
  const normalized = React.useMemo(() => {
    if (!data) return { status: '', details: [] as { label: string; value: string }[], summary: '' };

    // New shape — status is a string
    if (typeof data.status === 'string') {
      return {
        status: data.status,
        details: (data.details || []).slice(0, TOTAL_ROWS),
        summary: data.summary || '',
      };
    }

    // Legacy shape — derive from old fields
    const legacy = data as any;
    const statusText = legacy.summary?.health_clearance || 'No mandatory health requirements';
    const details: { label: string; value: string }[] = [];

    const vaccines = legacy.recommended?.vaccines;
    if (vaccines && vaccines.length > 0) {
      details.push({ label: 'Recommended', value: vaccines.slice(0, 4).join(', ') });
    }

    const risks = legacy.regional_risks || {};
    const riskParts: string[] = [];
    if (risks.malaria_risk_areas) riskParts.push('Malaria risk areas');
    if (risks.mosquito_borne_illness) riskParts.push(String(risks.mosquito_borne_illness));
    if (riskParts.length > 0) {
      details.push({ label: 'Regional risk', value: riskParts.join(', ') });
    }

    const req = legacy.required_for_entry || {};
    const docParts: string[] = [];
    if (req.health_declaration_form === true) docParts.push('Health declaration');
    if (req.covid_test === true) docParts.push('COVID test');
    if (req.covid_vaccination === true) docParts.push('COVID vaccination');
    if (docParts.length > 0) {
      details.push({ label: 'Documentation', value: docParts.join(', ') });
    }

    return {
      status: statusText,
      details: details.slice(0, TOTAL_ROWS),
      summary: legacy.summary?.key_action || '',
    };
  }, [data]);

  const isClear = normalized.status.toLowerCase().includes('no mandatory');
  const rows = normalized.details;

  // ── Loading ──
  if (loading) {
    return (
      <div className="widget-card animate-slide-up" style={{ animationDelay }}>
        <div className="flex items-center gap-3">
          <div className="widget-icon bg-green-500/10 text-green-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="widget-title">Health Entry</h3>
            <p className="widget-subtitle">Vaccination &amp; health requirements</p>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500/30 border-t-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="widget-icon bg-green-500/10 text-green-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Health Entry</h3>
          <p className="widget-subtitle">Vaccination &amp; health requirements</p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-400/40 mt-1">Unable to load live data</p>
      )}

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col mt-4 overflow-hidden">

        {/* Converter block — primary status */}
        <div
          className="rounded-xl px-4 py-3 mb-3 flex items-center gap-2.5"
          style={{
            background: isClear
              ? 'linear-gradient(100deg, rgba(16,185,129,0.03) 0%, rgba(16,185,129,0.07) 50%, rgba(16,185,129,0.03) 100%)'
              : 'linear-gradient(100deg, rgba(245,158,11,0.03) 0%, rgba(245,158,11,0.07) 50%, rgba(245,158,11,0.03) 100%)',
            border: isClear
              ? '1px solid rgba(16,185,129,0.1)'
              : '1px solid rgba(245,158,11,0.1)',
          }}
        >
          {isClear ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
          <span className="text-[14px] font-medium text-foreground truncate">
            {normalized.status || 'No mandatory health requirements'}
          </span>
        </div>

        {/* Supporting rows */}
        <div className="flex-1 min-h-0 space-y-1.5">
          {Array.from({ length: TOTAL_ROWS }).map((_, i) => {
            const row = rows[i];
            return (
              <div key={i} className="min-w-0">
                {row ? (
                  <p className="text-[12px] text-muted-foreground/75 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="text-muted-foreground/40 font-medium">{row.label}:</span>{' '}
                    {row.label.toLowerCase().includes('regional') ? renderWithDiseaseHovers(row.value) : capitalizeWords(row.value)}
                  </p>
                ) : (
                  <div className="h-[18px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Intelligence layer */}
        <div className="mt-auto pt-2.5 border-t border-border/15">
          <p className="text-[11px] text-muted-foreground/35 italic leading-snug truncate h-[16px]">
            {normalized.summary || '\u00A0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthEntryCard;
