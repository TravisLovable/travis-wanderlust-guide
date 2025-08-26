import React from 'react';
import VisaPresenter from '../presenters/VisaPresenter';
import { Destination } from '@/types/destination';
import { getDestinationString } from '@/utils/destinationHelpers';

interface VisaContainerProps {
    destination: Destination;
}

const VisaContainer: React.FC<VisaContainerProps> = ({ destination }) => {
    // Dynamic visa data based on destination
    const getVisaData = (dest: string) => {
        const lowerDest = dest.toLowerCase();

        if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: '6 months minimum',
                yellowFever: 'Vaccination recommended',
                notes: 'For US passport holders'
            };
        }

        if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: '6 months minimum',
                yellowFever: 'Vaccination required for some regions',
                notes: 'For US passport holders'
            };
        }

        if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london')) {
            return {
                visaRequired: false,
                maxStay: '6 months',
                passportValidity: 'Valid for entire stay',
                yellowFever: 'Not required',
                notes: 'For US passport holders'
            };
        }

        if (lowerDest.includes('france') || lowerDest.includes('paris')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: '3 months beyond stay',
                yellowFever: 'Not required',
                notes: 'For US passport holders (Schengen)'
            };
        }

        if (lowerDest.includes('japan') || lowerDest.includes('tokyo')) {
            return {
                visaRequired: false,
                maxStay: '90 days',
                passportValidity: 'Valid for entire stay',
                yellowFever: 'Not required',
                notes: 'For US passport holders'
            };
        }

        // Generic fallback
        return {
            visaRequired: 'Check requirements',
            maxStay: 'Variable',
            passportValidity: 'Check requirements',
            yellowFever: 'Check requirements',
            notes: 'Requirements vary by nationality'
        };
    };

    const destinationString = getDestinationString(destination);
    const visaData = getVisaData(destinationString);

    return (
        <VisaPresenter data={visaData} />
    );
};

export default VisaContainer;
