import React, { useState, useRef, useEffect } from 'react';
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

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const currentCountry = PASSPORT_COUNTRIES.find(c => c.code === nationality || c.name === nationality) || { code: 'US', name: 'United States' };

    const filteredCountries = PASSPORT_COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (dropdownOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [dropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (country: typeof PASSPORT_COUNTRIES[0]) => {
        onNationalityChange?.(country.code);
        setDropdownOpen(false);
        setSearchQuery('');
    };

    const PassportSelector = () => (
        <div className="relative mb-2" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
            >
                <span className="tracking-wide">Passport:</span>
                <span className="text-foreground/70 font-medium">{currentCountry.name}</span>
                <ChevronDown className={`w-2.5 h-2.5 text-muted-foreground/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 overflow-hidden bg-card/95 backdrop-blur-sm border border-border/40 rounded-lg shadow-2xl z-50">
                    <div className="px-2 pt-2 pb-1.5">
                        <div className="flex items-center gap-1.5 px-1.5 py-1 bg-secondary/20 rounded-md">
                            <Search className="w-3 h-3 text-muted-foreground/30" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/25 outline-none w-full"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-36 pb-1">
                        {filteredCountries.map((country) => (
                            <button
                                key={country.code}
                                onClick={() => handleSelect(country)}
                                className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                                    country.code === currentCountry.code
                                        ? 'text-foreground/90 font-medium bg-secondary/30'
                                        : 'text-muted-foreground/50 hover:text-foreground/70 hover:bg-secondary/15'
                                }`}
                            >
                                {country.name}
                            </button>
                        ))}
                        {filteredCountries.length === 0 && (
                            <p className="px-3 py-2 text-[10px] text-muted-foreground/30">No countries found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const cardClassName = 'travis-card';
    const contentMinHeight = '';

    // Show loading state
    if (isLoading) {
        return (
            <Card className={cardClassName}>
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-red-500/10 text-red-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Entry Requirements</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className={`p-0 pt-0 flex flex-col ${contentMinHeight}`}>
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
                        </div>
                        <div className="flex items-center space-x-1">
                            {hasDbData && <Database className="w-3 h-3 text-green-400" />}
                            <Bot className={`w-3 h-3 text-blue-400 ${isStreaming ? 'animate-pulse' : ''}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className={`space-y-3 p-0 pt-0 ${contentMinHeight}`}>
                    <PassportSelector />
                    {/* Primary signal */}
                    <div className="flex items-center gap-2">
                        {parsedData?.isVisaFree ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="text-base font-semibold text-foreground">
                            {parsedData?.isVisaFree ? 'Visa-free entry' : 'Visa required'}
                        </span>
                    </div>

                    {/* Requirements list */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                        {(parsedData?.maxStay || maxStay) && (
                            <p>Max stay: <span className="text-foreground/90">{parsedData?.maxStay || maxStay}</span></p>
                        )}
                        {(parsedData?.passportValidity || passportValidity) && (
                            <p>Passport validity: <span className="text-foreground/90">{parsedData?.passportValidity || passportValidity}</span></p>
                        )}
                        <p>Health requirements: <span className="text-foreground/90">{parsedData?.healthRequirements || yellowFever || 'None'}</span></p>
                    </div>
                </CardContent>
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
                        <h3 className="widget-title">Visa & Entry</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                        {hasDbData && <Database className="w-3 h-3 text-green-400" />}
                        <Bot className="w-3 h-3 text-blue-400" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className={`space-y-3 p-0 pt-0 ${contentMinHeight}`}>
                <PassportSelector />
                {error && (
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-red-500">Error loading data</span>
                    </div>
                )}

                {/* Main visa status */}
                <div className="flex items-center space-x-2">
                    {isVisaFree ? (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium">Visa-Free Entry</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-medium">Visa Required</span>
                        </>
                    )}
                </div>

                {/* Key requirements */}
                <div className="space-y-1.5">
                    {maxStay && (
                        <div className="flex items-center space-x-2 text-xs">
                            <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span>Max stay: {maxStay}</span>
                        </div>
                    )}
                    {passportValidity && (
                        <div className="flex items-center space-x-2 text-xs">
                            <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span>Passport: {passportValidity}</span>
                        </div>
                    )}
                    {yellowFever && (
                        <div className="flex items-center space-x-2 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                            <span>Yellow fever: {yellowFever}</span>
                        </div>
                    )}
                </div>

                {/* Notes — truncated */}
                {notes && (
                    <p className="text-[11px] text-muted-foreground/70 line-clamp-2">{notes}</p>
                )}
            </CardContent>
        </Card>
    );
});

VisaPresenter.displayName = 'VisaPresenter';

export default VisaPresenter;
