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
}

const VisaContainer: React.FC<VisaContainerProps> = ({ placeDetails, userNationality = 'US' }) => {
    const [visaData, setVisaData] = useState<VisaData>({ visaRequired: 'unknown', isLoading: true });

    useEffect(() => {
        const fetchVisaRequirements = async () => {
            if (!placeDetails) {
                setVisaData({ visaRequired: 'unknown', isLoading: false, error: 'No destination provided' });
                return;
            }

            try {
                const destinationName = placeDetails.formatted_address || placeDetails.name;

                const { data, error: functionError } = await supabase.functions.invoke('visa-requirements', {
                    body: {
                        destination: destinationName,
                        userNationality: userNationality
                    }
                });

                if (functionError) {
                    console.error('Visa requirements function error:', functionError);
                    throw functionError;
                }

                console.log(`✅ Visa requirements loaded for ${destinationName}:`, data);
                setVisaData({ ...data, isLoading: false });

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
