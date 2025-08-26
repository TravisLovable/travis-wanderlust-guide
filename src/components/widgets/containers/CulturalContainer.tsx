import React from 'react';
import CulturalPresenter from '../presenters/CulturalPresenter';
import { Destination } from '@/types/destination';

interface CulturalContainerProps {
    destination: Destination;
}

const CulturalContainer: React.FC<CulturalContainerProps> = ({ destination }) => {
    // Dynamic cultural data based on destination
    const getCulturalData = (dest: string) => {
        const lowerDest = dest.toLowerCase();

        // Peru cultural data
        if (lowerDest.includes('peru') || lowerDest.includes('lima') || lowerDest.includes('cusco') || lowerDest.includes('arequipa')) {
            return {
                language: {
                    primary: 'Spanish (84%)',
                    secondary: 'Quechua (13%), English (limited in tourist areas)'
                },
                religion: {
                    primary: 'Roman Catholic (76%)',
                    secondary: 'Protestant (14%), Other (10%)'
                },
                etiquette: [
                    'Warm greetings with handshakes or cheek kisses',
                    'Dress modestly, especially in religious sites',
                    'Always say "gracias" and "por favor"',
                    'Respect indigenous customs and traditions',
                    'Family and community values are very important'
                ],
                customs: [
                    'Late dining (8-10 PM is common)',
                    'Strong coffee culture and chicha consumption',
                    'Food culture is central to Peruvian identity',
                    'Music and dance vary by region (marinera, huayno)',
                    'Pachamama (Mother Earth) reverence in Andean areas'
                ]
            };
        }

        // Brazil cultural data
        if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('sao paulo') || lowerDest.includes('rio de janeiro') || lowerDest.includes('salvador')) {
            return {
                language: {
                    primary: 'Portuguese (98%)',
                    secondary: 'English (limited in tourist areas), Spanish (some understanding)'
                },
                religion: {
                    primary: 'Roman Catholic (64.6%)',
                    secondary: 'Protestant (22.2%), Spiritism (2%), Other (11.2%)'
                },
                etiquette: [
                    'Warm greetings with hugs and kisses on cheek',
                    'Dress well, appearance matters culturally',
                    'Always say "obrigado/obrigada" (thank you)',
                    'Avoid discussing politics initially',
                    'Personal space is smaller than North American norm'
                ],
                customs: [
                    'Late dining (8-10 PM is normal)',
                    'Strong coffee culture throughout day',
                    'Soccer (futebol) is a national passion',
                    'Carnival and festa culture year-round',
                    'Music and dance are central to social life'
                ]
            };
        }

        // United Kingdom cultural data
        if (lowerDest.includes('uk') || lowerDest.includes('united kingdom') || lowerDest.includes('london') || lowerDest.includes('england') || lowerDest.includes('scotland')) {
            return {
                language: {
                    primary: 'English (95%)',
                    secondary: 'Welsh (1%), Scottish Gaelic (<1%), Various immigrant languages'
                },
                religion: {
                    primary: 'Christianity (46%)',
                    secondary: 'No religion (37%), Islam (6%), Other (11%)'
                },
                etiquette: [
                    'Polite greetings with firm handshakes',
                    'Queueing (waiting in line) is very important',
                    'Always say "please," "thank you," and "sorry"',
                    'Avoid discussing personal income or politics',
                    'Punctuality is highly valued'
                ],
                customs: [
                    'Tea culture and afternoon tea traditions',
                    'Pub culture for socializing',
                    'Weather is a common conversation topic',
                    'Royal family and traditions are respected',
                    'Dry humor and understatement are common'
                ]
            };
        }

        // France cultural data
        if (lowerDest.includes('france') || lowerDest.includes('paris') || lowerDest.includes('lyon') || lowerDest.includes('marseille')) {
            return {
                language: {
                    primary: 'French (88%)',
                    secondary: 'Regional languages (Breton, Occitan), English (moderate in tourist areas)'
                },
                religion: {
                    primary: 'Roman Catholic (51%)',
                    secondary: 'No religion (40%), Islam (5%), Other (4%)'
                },
                etiquette: [
                    'Formal greetings with "Bonjour/Bonsoir"',
                    'Dress elegantly, style is important',
                    'Always greet shopkeepers when entering',
                    'Use formal "vous" until invited to use "tu"',
                    'Food and meal times are sacred'
                ],
                customs: [
                    'Long lunch breaks and late dinners',
                    'Wine culture and appreciation',
                    'Café culture for socializing',
                    'Art, literature, and philosophy valued',
                    'Strikes and protests are common forms of expression'
                ]
            };
        }

        // Japan cultural data
        if (lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('osaka') || lowerDest.includes('kyoto')) {
            return {
                language: {
                    primary: 'Japanese (99%)',
                    secondary: 'English (limited but improving in tourist areas)'
                },
                religion: {
                    primary: 'Shinto (70%)',
                    secondary: 'Buddhism (69%), Christianity (1.5%) - Many practice both Shinto and Buddhism'
                },
                etiquette: [
                    'Bow when greeting, deeper bow shows more respect',
                    'Remove shoes when entering homes and some establishments',
                    'Quiet behavior on public transportation',
                    'Gift-giving is important with proper wrapping',
                    'Punctuality is extremely important'
                ],
                customs: [
                    'Group harmony (wa) over individual expression',
                    'Tea ceremony and traditional arts valued',
                    'Seasonal awareness and appreciation',
                    'Work-life balance changing but long hours common',
                    'Technology integration in daily life'
                ]
            };
        }

        // Germany cultural data
        if (lowerDest.includes('germany') || lowerDest.includes('berlin') || lowerDest.includes('munich') || lowerDest.includes('hamburg')) {
            return {
                language: {
                    primary: 'German (95%)',
                    secondary: 'English (good in business/tourist areas), Turkish (2%)'
                },
                religion: {
                    primary: 'Christianity (54%)',
                    secondary: 'No religion (38%), Islam (5%), Other (3%)'
                },
                etiquette: [
                    'Firm handshakes with direct eye contact',
                    'Punctuality is extremely important',
                    'Direct communication style, honest feedback',
                    'Use titles and formal address initially',
                    'Quiet hours (Ruhezeit) respected in residential areas'
                ],
                customs: [
                    'Beer culture and beer gardens',
                    'Bread and pretzel traditions',
                    'Environmental consciousness and recycling',
                    'Work-life balance and vacation time valued',
                    'Christmas markets and seasonal celebrations'
                ]
            };
        }

        // Return null if no cultural data available for destination
        return null;
    };

    const culturalData = getCulturalData(destination.displayName);

    return (
        <CulturalPresenter data={culturalData} destination={destination} />
    );
};

export default CulturalContainer;
