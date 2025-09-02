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

// Helper function to highlight important words in markdown
const highlightMarkdown = (text: string) => {
    // Convert **bold** to highlighted spans
    let highlighted = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-yellow-400 bg-yellow-400/10 px-1 rounded">$1</span>');
    
    // Add line breaks for better readability
    highlighted = highlighted.replace(/\n/g, '<br />');
    
    // Highlight specific visa-related terms
    const importantTerms = [
        'visa required', 'visa-free', 'no visa', 'tourist visa', 'e-visa', 'ETA',
        'passport', 'yellow fever', 'vaccination', 'embassy', 'consulate',
        'processing time', 'validity', 'days', 'months'
    ];
    
    importantTerms.forEach(term => {
        const regex = new RegExp(`\\b(${term})\\b`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="font-medium text-blue-300">$1</span>');
    });
    
    return highlighted;
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
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-full flex flex-col">
                <CardHeader className="pb-3">
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
                <CardContent className="space-y-3 flex-1 flex items-center justify-center">
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
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-full flex flex-col">
                <CardHeader className="pb-3">
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
                <CardContent className="space-y-3 flex-1">
                    <div className="prose prose-sm prose-invert max-w-none">
                        <div 
                            className="text-sm leading-relaxed text-gray-200"
                            dangerouslySetInnerHTML={{ 
                                __html: highlightMarkdown(streamingContent || '') 
                            }}
                        />
                        {isStreaming && (
                            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
                        )}
                    </div>
                    
                    {/* Data source citation */}
                    {(dataSource || lastUpdated) && (
                        <div className="mt-4 pt-3 border-t border-gray-700">
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

                    {/* Official sources button */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs mt-3"
                        onClick={() => window.open('https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html', '_blank')}
                    >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Verify with Official Sources
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Show structured data (legacy format)
    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    Visa & Entry
                    <div className="ml-auto flex items-center space-x-1">
                        {hasDbData && <Database className="w-3 h-3 text-green-400" />}
                        <Shield className="w-3 h-3 text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
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
                
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => window.open('https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages.html', '_blank')}
                >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Verify with Official Sources
                </Button>
            </CardContent>
        </Card>
    );
};

export default VisaPresenter;
