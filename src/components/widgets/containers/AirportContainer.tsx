import React from 'react';
import AirportPresenter from '../presenters/AirportPresenter';
import { Destination } from '@/types/destination';
import { getDestinationString } from '@/utils/destinationHelpers';

interface AirportContainerProps {
    destination: Destination;
}

const AirportContainer: React.FC<AirportContainerProps> = ({ destination }) => {
    // Dynamic airport data based on destination
    const getAirportData = (dest: string) => {
        const lowerDest = dest.toLowerCase();

        if (lowerDest.includes('lima') || lowerDest.includes('peru')) {
            return {
                code: 'LIM',
                name: 'Jorge Chávez International Airport',
                address: 'Lima, Peru',
                distance: '11 km',
                travelTime: '30-60 min',
                options: 'Bus, Taxi, Uber'
            };
        }

        if (lowerDest.includes('são paulo') || lowerDest.includes('sao paulo') || lowerDest.includes('brazil')) {
            return {
                code: 'GRU',
                name: 'São Paulo/Guarulhos International Airport',
                address: 'Guarulhos, São Paulo',
                distance: '25 km',
                travelTime: '45-90 min',
                options: 'Metro, Bus, Taxi'
            };
        }

        if (lowerDest.includes('london') || lowerDest.includes('uk') || lowerDest.includes('united kingdom')) {
            return {
                code: 'LHR',
                name: 'London Heathrow Airport',
                address: 'London, United Kingdom',
                distance: '24 km',
                travelTime: '45-75 min',
                options: 'Tube, Bus, Taxi'
            };
        }

        if (lowerDest.includes('paris') || lowerDest.includes('france')) {
            return {
                code: 'CDG',
                name: 'Charles de Gaulle Airport',
                address: 'Paris, France',
                distance: '25 km',
                travelTime: '45-75 min',
                options: 'RER, Bus, Taxi'
            };
        }

        if (lowerDest.includes('tokyo') || lowerDest.includes('japan')) {
            return {
                code: 'NRT',
                name: 'Narita International Airport',
                address: 'Tokyo, Japan',
                distance: '60 km',
                travelTime: '60-90 min',
                options: 'Train, Bus, Taxi'
            };
        }

        // Generic fallback
        return {
            code: 'N/A',
            name: 'Primary Airport',
            address: `${dest}`,
            distance: 'Variable',
            travelTime: 'Variable',
            options: 'Multiple options available'
        };
    };

    const destinationString = getDestinationString(destination);
    const airportData = getAirportData(destinationString);

    return (
        <AirportPresenter data={airportData} />
    );
};

export default AirportContainer;
