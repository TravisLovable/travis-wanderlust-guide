import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, Bot, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, Search } from 'lucide-react';

// Add CSS for smooth cursor animation
const cursorStyles = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

// Inject styles into head if not already present
if (typeof document !== 'undefined' && !document.getElementById('visa-cursor-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'visa-cursor-styles';
    styleElement.textContent = cursorStyles;
    document.head.appendChild(styleElement);
}

const PASSPORT_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'TH', name: 'Thailand' },
  { code: 'IL', name: 'Israel' },
  { code: 'EG', name: 'Egypt' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
];

// Normalize raw requirement values for display
const formatRequirementValue = (value: string | undefined | null): string => {
    if (!value) return 'None';
    const trimmed = value.trim();
    if (!trimmed) return 'None';
    // Capitalize first letter if entirely lowercase
    if (trimmed === trimmed.toLowerCase() && trimmed.length > 0) {
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return trimmed;
};

interface VisaData {
    visaRequired: boolean | string;
    maxStay?: string;
    passportValidity?: string;
    yellowFever?: string;
    notes?: string;
    streamingContent?: string;
    isStreaming?: boolean;
    isLoading?: boolean;
    error?: string;
    dataSource?: string;
    lastUpdated?: string;
    hasDbData?: boolean;
}

interface VisaPresenterProps {
    data: VisaData;
    nationality?: string;
    onNationalityChange?: (nationality: string) => void;
}

// Helper function to parse AI response and extract structured data
const parseAIResponse = (content: string) => {
    const result = {
        visaStatus: '',
        maxStay: '',
        passportValidity: '',
        healthRequirements: '',
        notes: '',
        isVisaFree: false
    };

    console.log('🔍 Parsing AI content:', content.substring(0, 300));

    // Parse the new consistent format: VISA_STATUS: value
    const visaStatusMatch = content.match(/VISA_STATUS:\s*(.+)/);
    if (visaStatusMatch) {
        result.visaStatus = visaStatusMatch[1].trim();
        result.isVisaFree = result.visaStatus === 'NO_VISA_REQUIRED';
        console.log('✅ Parsed visa status:', result.visaStatus, 'isVisaFree:', result.isVisaFree);
    }

    const maxStayMatch = content.match(/MAX_STAY:\s*(.+)/);
    if (maxStayMatch) {
        result.maxStay = maxStayMatch[1].trim();
        console.log('✅ Parsed max stay:', result.maxStay);
    }

    const passportMatch = content.match(/PASSPORT_VALIDITY:\s*(.+)/);
    if (passportMatch) {
        result.passportValidity = passportMatch[1].trim();
        console.log('✅ Parsed passport:', result.passportValidity);
    }

    const healthMatch = content.match(/HEALTH_REQUIREMENTS:\s*(.+)/);
    if (healthMatch) {
        result.healthRequirements = healthMatch[1].trim();
        console.log('✅ Parsed health:', result.healthRequirements);
    }

    const notesMatch = content.match(/NOTES:\s*(.+)/);
    if (notesMatch) {
        result.notes = notesMatch[1].trim();
        console.log('✅ Parsed notes:', result.notes);
    }

    console.log('🎯 Final parsed result:', result);
    return result;
};

// Helper function to render markdown with consistent highlighting
const renderMarkdown = (text: string) => {
    let rendered = text;

    // Convert **bold** to important highlights (green for positive, red for requirements)
    rendered = rendered.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        const lowerContent = content.toLowerCase();

        // Green highlights for positive/good news
        if (lowerContent.includes('visa-free') || lowerContent.includes('no visa') ||
            lowerContent.includes('not required') || lowerContent.includes('90 days') ||
            lowerContent.includes('6 months') || lowerContent.includes('valid')) {
            return `<span class="font-semibold text-green-400 bg-green-400/10 px-1 rounded">${content}</span>`;
        }

        // Red highlights for requirements/warnings
        if (lowerContent.includes('visa required') || lowerContent.includes('required') ||
            lowerContent.includes('must') || lowerContent.includes('apply') ||
            lowerContent.includes('embassy') || lowerContent.includes('consulate')) {
            return `<span class="font-semibold text-red-400 bg-red-400/10 px-1 rounded">${content}</span>`;
        }

        // Default highlight for other important terms
        return `<span class="font-semibold text-blue-400 bg-blue-400/10 px-1 rounded">${content}</span>`;
    });

    // Convert [link text](url) to clickable links
    rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">$1</a>');

    // Convert plain URLs to clickable links (but avoid double-converting already processed links)
    rendered = rendered.replace(/(^|[^"'>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">$2</a>');

    // Convert *italic* to subtle emphasis
    rendered = rendered.replace(/\*(.*?)\*/g, '<em class="text-muted-foreground italic">$1</em>');

    // Convert ### Headers
    rendered = rendered.replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-foreground mt-3 mb-1">$1</h3>');

    // Convert ## Headers
    rendered = rendered.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-foreground mt-3 mb-1">$1</h2>');

    // Convert bullet points
    rendered = rendered.replace(/^- (.*$)/gim, '<div class="flex items-start space-x-2 my-1"><span class="text-blue-400 mt-0.5 text-xs">•</span><span class="text-sm">$1</span></div>');

    // Convert numbered lists
    rendered = rendered.replace(/^\d+\. (.*$)/gim, '<div class="flex items-start space-x-2 my-1"><span class="text-blue-400 font-medium text-xs">•</span><span class="text-sm">$1</span></div>');

    // Add line breaks for paragraphs (smaller spacing for compact widget)
    rendered = rendered.replace(/\n\n/g, '<br /><br />');
    rendered = rendered.replace(/\n/g, '<br />');

    return rendered;
};

const VisaPresenter: React.FC<VisaPresenterProps> = React.memo(({ data, nationality = 'US', onNationalityChange }) => {
    const {
        visaRequired,
        maxStay,
        passportValidity,
        yellowFever,
        notes,
        streamingContent,
        isStreaming,
        isLoading,
        error,
        dataSource,
        lastUpdated,
        hasDbData
    } = data;

    const isVisaFree = typeof visaRequired === 'boolean' && !visaRequired;

    // ── Floating passport menu state ──
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuSearch, setMenuSearch] = useState('');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuSearchRef = useRef<HTMLInputElement>(null);
    const menuListRef = useRef<HTMLDivElement>(null);

    const currentCountry = PASSPORT_COUNTRIES.find(c => c.code === nationality || c.name === nationality) || { code: 'US', name: 'United States' };

    const filteredCountries = PASSPORT_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(menuSearch.toLowerCase())
    );

    // Focus search when menu opens
    useEffect(() => {
        if (menuOpen) {
            requestAnimationFrame(() => menuSearchRef.current?.focus());
        } else {
            setMenuSearch('');
        }
    }, [menuOpen]);

    // Close on outside click — checks both the portal menu and the trigger
    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (menuRef.current?.contains(t)) return;
            if (triggerRef.current?.contains(t)) return;
            setMenuOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [menuOpen]);

    // Close on Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const handleSelect = (country: typeof PASSPORT_COUNTRIES[0]) => {
        onNationalityChange?.(country.code);
        setMenuOpen(false);
    };

    // ── Floating Menu (portal) ──
    const MENU_H = 320;
    const HEADER_H = 56;
    const LIST_H = MENU_H - HEADER_H;

    // Sort filtered countries: exact prefix matches first, then alphabetical
    const sortedCountries = menuSearch
        ? [...filteredCountries].sort((a, b) => {
            const q = menuSearch.toLowerCase();
            const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
            const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
            if (aStart !== bStart) return aStart - bStart;
            return a.name.localeCompare(b.name);
          })
        : filteredCountries;

    // Compute menu position from trigger ref
    const triggerRect = menuOpen && triggerRef.current ? triggerRef.current.getBoundingClientRect() : null;

    // ── Floating menu portal (rendered as JSX variable, NOT a component) ──
    const floatingMenu = menuOpen && triggerRect ? createPortal(
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: triggerRect.bottom + 6,
                    left: triggerRect.left,
                    width: 260,
                    height: MENU_H,
                    zIndex: 99999,
                    borderRadius: 14,
                    overflow: 'hidden',                         // clip children to rounded corners
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
            >
                {/* Opaque background layer — covers everything beneath */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#121215',                      // near-black solid surface
                    borderRadius: 14,
                }} />

                {/* Content sits above the background */}
                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>

                    {/* Search header — embedded feel, uniform left padding */}
                    <div style={{ height: HEADER_H, flexShrink: 0, padding: '12px 12px 8px' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                height: 32,
                                padding: '0 12px',
                                borderRadius: 7,
                                background: 'rgba(255,255,255,0.025)',
                                border: '1px solid rgba(255,255,255,0.04)',
                            }}
                        >
                            <Search style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                            <input
                                ref={menuSearchRef}
                                type="text"
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                placeholder="Search countries..."
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'rgba(255,255,255,0.8)',
                                    fontSize: 12,
                                    width: '100%',
                                }}
                            />
                        </div>
                    </div>

                    {/* Scrollable country list with fade masks */}
                    <div style={{ position: 'relative', height: LIST_H, flexShrink: 0 }}>
                        {/* Top fade */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 12,
                            background: 'linear-gradient(to bottom, #121215, transparent)',
                            zIndex: 1, pointerEvents: 'none',
                        }} />
                        {/* Bottom fade */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 16,
                            background: 'linear-gradient(to top, #121215, transparent)',
                            zIndex: 1, pointerEvents: 'none',
                        }} />

                        <div
                            ref={menuListRef}
                            style={{
                                height: '100%',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                paddingTop: 2,
                                paddingBottom: 8,
                            }}
                        >
                            {sortedCountries.map((country) => {
                                const selected = country.code === currentCountry.code;
                                return (
                                    <button
                                        key={country.code}
                                        onClick={() => handleSelect(country)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            width: '100%',
                                            height: 30,
                                            padding: '0 12px',
                                            border: 'none',
                                            background: selected ? 'rgba(255,255,255,0.03)' : 'transparent',
                                            color: selected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                                            fontSize: 12,
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'background 80ms, color 80ms',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!selected) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!selected) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                                            }
                                        }}
                                    >
                                        {selected ? (
                                            <CheckCircle style={{ width: 13, height: 13, color: '#34d399', flexShrink: 0 }} />
                                        ) : (
                                            <span style={{ width: 13, flexShrink: 0 }} />
                                        )}
                                        <span>{country.name}</span>
                                    </button>
                                );
                            })}
                            {sortedCountries.length === 0 && (
                                <p style={{ padding: '12px 12px', fontSize: 11, color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>
                                    No countries found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        ) : null;

    // ── Passport trigger + portal (inline JSX, not a component) ──
    const passportSelector = (
        <div style={{ marginBottom: 4 }}>
            <button
                ref={triggerRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-0 text-[12px] hover:opacity-80 transition-opacity"
            >
                <span className="text-muted-foreground/40">Passport:</span>
                <span className="text-foreground/75 ml-1">{currentCountry.name}</span>
                <ChevronDown className={`w-2.5 h-2.5 text-muted-foreground/25 ml-1 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {floatingMenu}
        </div>
    );

    const cardClassName = 'travis-card';

    // Show loading state — also treat 'unknown' with no content as loading
    // Loading: show spinner until streaming is DONE or we have complete structured data
    const showSpinner = isLoading || isStreaming;
    if (showSpinner) {
        return (
            <Card className={cardClassName}>
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-red-500/10 text-red-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Entry Requirements</h3>
                            <p className="widget-subtitle">Immigration</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 pt-0 flex-1 min-h-0 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-center flex-1 py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Checking requirements...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show streaming content
    if (isStreaming || streamingContent) {
        // Parse AI response to extract structured data
        const parsedData = streamingContent ? parseAIResponse(streamingContent) : null;

        // Debug logging
        console.log('🔍 VisaPresenter Debug:', {
            streamingContent: streamingContent?.substring(0, 200) + '...',
            parsedData,
            isStreaming,
            hasStreamingContent: !!streamingContent
        });

        return (
            <Card className={cardClassName}>
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-red-500/10 text-red-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Entry Requirements</h3>
                            <p className="widget-subtitle">Immigration</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 p-0 pt-0 flex-1 min-h-0 overflow-hidden">
                    {passportSelector}

                    {/* Visa status — decision-driving line, slightly elevated */}
                    {parsedData?.visaStatus ? (
                        <div className="flex items-center gap-1.5 mt-1 mb-3">
                            {parsedData.isVisaFree ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-[14px] font-medium text-foreground">
                                {parsedData.isVisaFree ? 'Visa-free entry' : 'Visa required'}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 mt-1 mb-3">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground/50 animate-spin" />
                            <span className="text-[14px] text-muted-foreground/40">Checking status...</span>
                        </div>
                    )}

                    {/* Requirements — single-line rows */}
                    <div className="space-y-1.5">
                        {(parsedData?.maxStay || maxStay) && (
                            <p className="text-[12px]">
                                <span className="text-muted-foreground/35">Stay limit: </span>
                                <span className="text-foreground/90">{formatRequirementValue(parsedData?.maxStay || maxStay)}</span>
                            </p>
                        )}
                        {(parsedData?.passportValidity || passportValidity) && (
                            <p className="text-[12px]">
                                <span className="text-muted-foreground/35">Passport validity: </span>
                                <span className="text-foreground/90">Valid for at least 6 months at entry</span>
                            </p>
                        )}
                    </div>

                </CardContent>
                <p className="text-[10px] text-muted-foreground/30 tracking-wide hover:text-muted-foreground/45 transition-colors cursor-default mt-auto pt-1 px-0">
                    {lastUpdated ? `Verified ${new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Verified recently'}
                    {' · '}Government immigration authority
                </p>
            </Card>
        );
    }

    // Show structured data (legacy format)
    return (
        <Card className={cardClassName}>
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-red-500/10 text-red-500">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Entry Requirements</h3>
                        <p className="widget-subtitle">Immigration</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 p-0 pt-0 flex-1 min-h-0 overflow-hidden">
                {passportSelector}
                {error && (
                    <div className="flex items-center gap-1 mb-1.5">
                        <AlertCircle className="w-3 h-3 text-red-400/40" />
                        <span className="text-[10px] text-red-400/40">Unable to verify — cached data</span>
                    </div>
                )}

                {/* Visa status — decision-driving line, slightly elevated */}
                <div className="flex items-center gap-1.5 mt-1 mb-3">
                    {isVisaFree ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-[14px] font-medium text-foreground">
                        {isVisaFree ? 'Visa-free entry' : 'Visa required'}
                    </span>
                </div>

                {/* Requirements — single-line rows */}
                <div className="space-y-1.5">
                    {maxStay && (
                        <p className="text-[12px]">
                            <span className="text-muted-foreground/35">Stay limit: </span>
                            <span className="text-foreground/90">{formatRequirementValue(maxStay)}</span>
                        </p>
                    )}
                    {passportValidity && (
                        <p className="text-[12px]">
                            <span className="text-muted-foreground/35">Passport validity: </span>
                            <span className="text-foreground/90">Valid for at least 6 months at entry</span>
                        </p>
                    )}
                </div>

            </CardContent>
            <p className="text-[10px] text-muted-foreground/30 tracking-wide hover:text-muted-foreground/45 transition-colors cursor-default mt-auto pt-1">
                {lastUpdated ? `Verified ${new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Verified recently'}
                {' · '}Government immigration authority
            </p>
        </Card>
    );
});

VisaPresenter.displayName = 'VisaPresenter';

export default VisaPresenter;
