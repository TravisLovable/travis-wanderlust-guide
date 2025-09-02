import React, { useState, useEffect } from 'react';
import VisaPresenter from '../presenters/VisaPresenter';
import { supabase } from '@/integrations/supabase/client';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface VisaContainerProps {
    placeDetails: SelectedPlace | null;
    userNationality?: string;
}

interface VisaData {
    visaRequired: boolean | string;
    maxStay?: string;
    passportValidity?: string;
    yellowFever?: string;
    notes?: string;
    reason?: string;
    processingTime?: string;
    cost?: string;
    exceptions?: string;
    requiresETA?: boolean;
    recommendation?: string;
    isLoading?: boolean;
    error?: string;
    streamingContent?: string;
    isStreaming?: boolean;
    dataSource?: string;
    lastUpdated?: string;
    hasDbData?: boolean;
}

const VisaContainer: React.FC<VisaContainerProps> = ({ placeDetails, userNationality = 'US' }) => {
    const [visaData, setVisaData] = useState<VisaData>({ visaRequired: 'unknown', isLoading: true });

    useEffect(() => {
        console.log('🔄 VisaContainer useEffect triggered with:', { placeDetails, userNationality });

        const fetchVisaRequirements = async () => {
            if (!placeDetails) {
                console.log('❌ No place details provided');
                setVisaData({ visaRequired: 'unknown', isLoading: false, error: 'No destination provided' });
                return;
            }

            try {
                const destinationName = placeDetails.formatted_address || placeDetails.name;

                // Always use streaming for better UX (combines DB data + AI interpretation)
                console.log(`🤖 Using AI streaming for ${destinationName}`);
                setVisaData(prev => ({
                    ...prev,
                    isLoading: false,
                    isStreaming: true,
                    streamingContent: '',
                    visaRequired: 'unknown'
                }));

                await streamVisaRequirements(destinationName, userNationality);

            } catch (error) {
                console.error('Error fetching visa requirements:', error);

                // Fallback to basic hardcoded data
                const destinationName = placeDetails?.formatted_address || placeDetails?.name || 'Unknown';
                const fallbackData = getFallbackVisaData(destinationName);
                setVisaData({
                    ...fallbackData,
                    isLoading: false,
                    error: 'Using offline data - verify with official sources'
                });
            }
        };

        const streamVisaRequirements = async (destinationName: string, userNationality: string) => {
            try {
                console.log('🚀 Starting streaming request for:', destinationName);

                // Use the same values as the Supabase client
                const SUPABASE_URL = "https://jmbjxlijwojvavmmzpmo.supabase.co";
                const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptYmp4bGlqd29qdmF2bW16cG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NzQ2NjcsImV4cCI6MjA3MDM1MDY2N30.RR7vxI8Q1kQ0Qsb20f4QK5fD4CY4zehwuq65NVgbVNo";

                // Set a timeout for the streaming request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                const url = `${SUPABASE_URL}/functions/v1/visa-requirements`;
                console.log('📡 Making request to:', url);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({
                        destination: destinationName,
                        userNationality: userNationality,
                        streamResponse: true
                    }),
                    signal: controller.signal
                }
                );

                clearTimeout(timeoutId);
                console.log('📨 Response received:', response.status, response.statusText);

                if (!response.ok) {
                    console.error('❌ Response not ok:', response.status, response.statusText);
                    throw new Error(`Streaming request failed: ${response.status}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error('No response stream available');
                }

                let accumulatedContent = '';
                let hasReceivedData = false;

                try {
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    hasReceivedData = true;

                                    if (data.type === 'chunk') {
                                        accumulatedContent += data.content;
                                        setVisaData(prev => ({
                                            ...prev,
                                            streamingContent: accumulatedContent,
                                            dataSource: data.dataSource,
                                            lastUpdated: data.lastUpdated,
                                            hasDbData: data.hasDbData
                                        }));
                                    } else if (data.type === 'complete') {
                                        setVisaData(prev => ({
                                            ...prev,
                                            isStreaming: false
                                        }));
                                        return; // Exit successfully
                                    }
                                } catch (parseError) {
                                    console.warn('Failed to parse streaming data:', parseError);
                                }
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }

                // If we didn't receive any data, throw an error
                if (!hasReceivedData) {
                    throw new Error('No data received from stream');
                }

            } catch (streamError) {
                console.error('Streaming error:', streamError);

                // Fallback to hardcoded data on streaming failure
                const fallbackData = getFallbackVisaData(destinationName);
                setVisaData({
                    ...fallbackData,
                    isStreaming: false,
                    isLoading: false,
                    error: 'AI analysis unavailable - using offline data'
                });
            }
        };

        fetchVisaRequirements();
    }, [placeDetails, userNationality]);

    // Fallback visa data for when API fails
    const getFallbackVisaData = (dest: string): VisaData => {
        const lowerDest = dest.toLowerCase();

        if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
            return {
                visaRequired: false,
                maxStay: '183 days',
                passportValidity: '6 months minimum',
                yellowFever: 'Required for jungle regions',
                notes: 'For US passport holders - visa-free tourism'
            };
        }

        if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: '6 months minimum',
                yellowFever: 'Recommended for some regions',
                notes: 'For US passport holders - visa-free since 2019'
            };
        }

        if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london')) {
            return {
                visaRequired: false,
                maxStay: '6 months',
                passportValidity: 'Valid for entire stay',
                yellowFever: 'Not required',
                notes: 'For US passport holders - no visa required'
            };
        }

        if (lowerDest.includes('france') || lowerDest.includes('paris')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: '3 months beyond stay',
                yellowFever: 'Not required',
                notes: 'For US passport holders (Schengen area)'
            };
        }

        if (lowerDest.includes('japan') || lowerDest.includes('tokyo')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: 'Valid for entire stay',
                yellowFever: 'Not required',
                notes: 'For US passport holders - visa-free tourism'
            };
        }

        // Generic fallback
        return {
            visaRequired: 'unknown',
            maxStay: 'Varies',
            passportValidity: '6 months minimum (recommended)',
            yellowFever: 'Check requirements',
            notes: 'Contact embassy for current requirements',
            recommendation: 'Verify with official sources before travel'
        };
    };

    return (
        <VisaPresenter data={visaData} />
    );
};

export default VisaContainer;
