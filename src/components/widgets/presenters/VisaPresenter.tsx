import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, Bot, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

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

const VisaPresenter: React.FC<VisaPresenterProps> = React.memo(({ data }) => {
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

    // Shared min-height to prevent layout jitter when switching loading → streaming → content
    const cardClassName = 'travis-card h-full';
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
                            <h3 className="widget-title">Visa & Entry</h3>
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
                            <h3 className="widget-title">Visa & Entry</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                            {hasDbData && <Database className="w-3 h-3 text-green-400" />}
                            <Bot className={`w-3 h-3 text-blue-400 ${isStreaming ? 'animate-pulse' : ''}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className={`space-y-4 p-0 pt-0 ${contentMinHeight}`}>
                    {/* Main visa status with icon */}
                    <div className="flex items-center space-x-2">
                        {parsedData?.isVisaFree ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-medium">Visa-Free Entry</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    No Visa Required
                                </Badge>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="font-medium">Visa Required</span>
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    Apply Required
                                </Badge>
                            </>
                        )}
                    </div>

                    {/* Key requirements with icons */}
                    <div className="space-y-3">
                        {(parsedData?.maxStay || maxStay) && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Max stay: {parsedData?.maxStay || maxStay}</span>
                            </div>
                        )}

                        {(parsedData?.passportValidity || passportValidity) && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span>Passport: {parsedData?.passportValidity || passportValidity}</span>
                            </div>
                        )}

                        {(parsedData?.healthRequirements || yellowFever) && (
                            <div className="flex items-center space-x-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span>Health: {parsedData?.healthRequirements || yellowFever}</span>
                            </div>
                        )}
                    </div>

                    {/* Additional notes */}
                    {(parsedData?.notes || notes) && (
                        <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground text-red-600">{parsedData?.notes || notes}</p>
                        </div>
                    )}

                    {/* Debug: Show raw content if parsing failed */}
                    {streamingContent && !parsedData?.visaStatus && (
                        <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground font-mono bg-gray-100 p-2 rounded">
                                Debug - Raw AI content:<br />
                                {streamingContent.substring(0, 200)}...
                            </p>
                        </div>
                    )}

                    {/* Data source */}
                    {(dataSource || lastUpdated) && (
                        <div className="pt-2 border-t border-border">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    {hasDbData ? (
                                        <>
                                            <Database className="w-3 h-3" />
                                            <span>Source: {dataSource}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="w-3 h-3" />
                                            <span>AI Analysis</span>
                                        </>
                                    )}
                                </div>
                                {lastUpdated && (
                                    <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Official sources link */}
                    <div className="pt-2 border-t border-border">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => window.open('https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html', '_blank')}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Official Visa Information
                        </Button>
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
            <CardContent className={`space-y-4 p-0 pt-0 ${contentMinHeight}`}>
                {error && (
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-500">Error</span>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Failed
                        </Badge>
                    </div>
                )}

                {/* Main visa status with icon */}
                <div className="flex items-center space-x-2">
                    {isVisaFree ? (
                        <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Visa-Free Entry</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                No Visa Required
                            </Badge>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="font-medium">Visa Required</span>
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Apply Required
                            </Badge>
                        </>
                    )}
                </div>

                {/* Key requirements with icons */}
                <div className="space-y-3">
                    {maxStay && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Max stay: {maxStay}</span>
                        </div>
                    )}

                    {passportValidity && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span>Passport: {passportValidity}</span>
                        </div>
                    )}

                    {yellowFever && (
                        <div className="flex items-center space-x-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span>Yellow fever: {yellowFever}</span>
                        </div>
                    )}
                </div>

                {/* Additional notes */}
                {notes && (
                    <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">{notes}</p>
                    </div>
                )}

                {/* Data source */}
                {(dataSource || lastUpdated) && (
                    <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                                {hasDbData ? (
                                    <>
                                        <Database className="w-3 h-3" />
                                        <span>Source: {dataSource}</span>
                                    </>
                                ) : (
                                    <>
                                        <Bot className="w-3 h-3" />
                                        <span>AI Analysis</span>
                                    </>
                                )}
                            </div>
                            {lastUpdated && (
                                <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Official sources link */}
                <div className="pt-2 border-t border-border">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => window.open('https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html', '_blank')}
                    >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Official Visa Information
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

VisaPresenter.displayName = 'VisaPresenter';

export default VisaPresenter;
