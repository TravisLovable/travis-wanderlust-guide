import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Database, Bot, ExternalLink } from 'lucide-react';

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

    // Convert *italic* to subtle emphasis
    rendered = rendered.replace(/\*(.*?)\*/g, '<em class="text-gray-300 italic">$1</em>');

    // Convert ### Headers
    rendered = rendered.replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-white mt-3 mb-1">$1</h3>');

    // Convert ## Headers  
    rendered = rendered.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-3 mb-1">$1</h2>');

    // Convert bullet points
    rendered = rendered.replace(/^- (.*$)/gim, '<div class="flex items-start space-x-2 my-1"><span class="text-blue-400 mt-0.5 text-xs">•</span><span class="text-sm">$1</span></div>');

    // Convert numbered lists
    rendered = rendered.replace(/^\d+\. (.*$)/gim, '<div class="flex items-start space-x-2 my-1"><span class="text-blue-400 font-medium text-xs">•</span><span class="text-sm">$1</span></div>');

    // Add line breaks for paragraphs (smaller spacing for compact widget)
    rendered = rendered.replace(/\n\n/g, '<br /><br />');
    rendered = rendered.replace(/\n/g, '<br />');

    return rendered;
};

const VisaPresenter: React.FC<VisaPresenterProps> = ({ data }) => {
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

    // Show loading state
    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-64 flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        Visa & Entry
                        <div className="ml-auto">
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Bot className="w-4 h-4 animate-pulse" />
                            <span>Analyzing visa requirements...</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show streaming content
    if (isStreaming || streamingContent) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 flex flex-col max-h-[400px]">
                <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        Visa & Entry
                        <div className="ml-auto flex items-center space-x-1">
                            {hasDbData && <Database className="w-3 h-3 text-green-400" />}
                            <Bot className={`w-3 h-3 text-blue-400 ${isStreaming ? 'animate-pulse' : ''}`} />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                        <div className="prose prose-sm prose-invert max-w-none">
                            <div
                                className="text-sm leading-snug text-gray-200"
                                dangerouslySetInnerHTML={{
                                    __html: renderMarkdown(streamingContent || '')
                                }}
                            />
                            {isStreaming && (
                                <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
                            )}
                        </div>
                    </div>

                    {/* Fixed bottom section */}
                    <div className="flex-shrink-0 pt-2 space-y-2">
                        {/* Data source citation */}
                        {(dataSource || lastUpdated) && (
                            <div className="pt-2 border-t border-gray-700">
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

                        {/* Fixed bottom button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => window.open('https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html', '_blank')}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Verify with Official Sources
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show structured data (legacy format)
    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-64 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    Visa & Entry Overview
                    <div className="ml-auto flex items-center space-x-1">
                        {hasDbData && <Database className="w-3 h-3 text-green-400" />}
                        <Shield className="w-3 h-3 text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                    {error && (
                        <div className="p-2 bg-red-500/10 border-red-500/20 border rounded-lg">
                            <div className="font-medium text-sm text-red-400">⚠ {error}</div>
                        </div>
                    )}

                    <div className={`p-2 ${isVisaFree ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'} border rounded-lg`}>
                        <div className={`font-medium text-sm ${isVisaFree ? 'text-green-700' : 'text-orange-700'}`}>
                            {isVisaFree ? '✓ Visa-free entry' : '⚠ Check visa requirements'}
                        </div>
                        <div className="text-xs text-muted-foreground">{notes}</div>
                    </div>

                    {(maxStay || passportValidity || yellowFever) && (
                        <div className="text-xs space-y-1">
                            {maxStay && <p><span className="font-medium">Max stay:</span> {maxStay}</p>}
                            {passportValidity && <p><span className="font-medium">Passport validity:</span> {passportValidity}</p>}
                            {yellowFever && <p><span className="font-medium">Yellow fever:</span> {yellowFever}</p>}
                        </div>
                    )}
                </div>

                {/* Fixed bottom section */}
                <div className="flex-shrink-0 pt-2 space-y-2">
                    {/* Data source citation */}
                    {(dataSource || lastUpdated) && (
                        <div className="pt-2 border-t border-gray-700">
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
                                            <span>Fallback Data</span>
                                        </>
                                    )}
                                </div>
                                {lastUpdated && (
                                    <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fixed bottom button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => window.open('https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html', '_blank')}
                    >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Verify with Official Sources
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default VisaPresenter;
