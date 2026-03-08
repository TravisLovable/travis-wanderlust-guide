import React from 'react';
import CulturalPresenter, { CulturalData } from '../presenters/CulturalPresenter';

interface CulturalContainerProps {
  destination: string;
  animationDelay?: string;
}

function getCulturalData(destination: string): CulturalData {
  const lower = destination.toLowerCase();

  // Japan
  if (['japan', 'tokyo', 'osaka', 'kyoto'].some(k => lower.includes(k))) {
    return {
      religion: 'Shinto & Buddhism practiced together (70%+). Temples and shrines are distinct — shoes off at both.',
      dressCode: 'Conservative dress at temples. Cover shoulders and knees. Remove shoes indoors.',
      greetingsTipping: 'Bow when greeting — deeper = more respect. Tipping is not customary and can be seen as rude.',
      sensitivities: [
        'Quiet on public transport',
        'Never stick chopsticks upright in rice',
        'Remove shoes when entering homes',
        'Avoid eating while walking',
      ],
    };
  }

  // France
  if (['france', 'paris', 'lyon', 'marseille', 'nice'].some(k => lower.includes(k))) {
    return {
      religion: 'Roman Catholic (51%). Churches are active — dress modestly when visiting.',
      dressCode: 'Stylish and put-together expected. Avoid sportswear outside gyms. Elegant casual is standard.',
      greetingsTipping: 'Say "Bonjour" when entering any shop. La bise (cheek kisses) among acquaintances. Tip 5-10% for good service.',
      sensitivities: [
        'Always greet shopkeepers on entry/exit',
        'Use "vous" (formal you) with strangers',
        'Lunch is sacred — 12-2 PM',
        'Avoid loud conversations in restaurants',
      ],
    };
  }

  // UK
  if (['uk', 'united kingdom', 'london', 'england', 'scotland', 'edinburgh', 'manchester'].some(k => lower.includes(k))) {
    return {
      religion: 'Christianity (46%), No religion (37%). Sunday services still common in rural areas.',
      dressCode: 'Smart casual widely accepted. Some restaurants and clubs enforce dress codes. Layers essential.',
      greetingsTipping: 'Firm handshake. Queueing is sacred — never skip. Tip 10-12% at restaurants; round up for taxis.',
      sensitivities: [
        'Respect the queue at all times',
        '"Please" and "sorry" are essential',
        'Avoid comparing to Americans loudly',
        'Pub etiquette: buy rounds in groups',
      ],
    };
  }

  // Peru
  if (['peru', 'lima', 'cusco', 'arequipa', 'machu picchu'].some(k => lower.includes(k))) {
    return {
      religion: 'Roman Catholic (76%). Religious festivals are major cultural events. Respect Pachamama traditions in Andes.',
      dressCode: 'Modest dress at churches. Layers needed for altitude changes. Casual is fine in cities.',
      greetingsTipping: 'Handshake or single cheek kiss. "Gracias" goes far. Tip 10% at restaurants; small tips for guides.',
      sensitivities: [
        'Ask before photographing indigenous people',
        'Respect coca leaf traditions',
        'Avoid rushing — time is flexible',
        'Haggling expected in markets only',
      ],
    };
  }

  // Brazil
  if (['brazil', 'rio', 'são paulo', 'sao paulo', 'salvador', 'brasilia'].some(k => lower.includes(k))) {
    return {
      religion: 'Roman Catholic (65%) with strong Afro-Brazilian spiritual traditions. Churches are significant landmarks.',
      dressCode: 'Casual and colorful. Beachwear only at beaches. Dress up for nice restaurants and clubs.',
      greetingsTipping: 'Warm hugs and cheek kisses (1-3 depending on region). Tip 10% if not included. "Obrigado/a" essential.',
      sensitivities: [
        'Personal space is smaller than US norm',
        'Avoid discussing politics initially',
        'Be cautious with valuables in crowds',
        'Soccer is a serious passion',
      ],
    };
  }

  // Germany
  if (['germany', 'berlin', 'munich', 'hamburg', 'frankfurt'].some(k => lower.includes(k))) {
    return {
      religion: 'Christianity (54%), No religion (38%). Quiet hours (Ruhezeit) are legally observed.',
      dressCode: 'Practical and understated. Smart casual for dining. Avoid flashy logos.',
      greetingsTipping: 'Firm handshake with eye contact. Tip 5-10% by rounding up. Say "Danke" directly to server.',
      sensitivities: [
        'Punctuality is extremely important',
        'Direct communication is normal, not rude',
        'Recycling and sorting waste is expected',
        'Sunday is rest day — most shops closed',
      ],
    };
  }

  // India
  if (['india', 'delhi', 'mumbai', 'bangalore', 'jaipur', 'goa', 'kolkata'].some(k => lower.includes(k))) {
    return {
      religion: 'Hindu (80%), Muslim (14%). Temples, mosques, and gurudwaras each have dress rules. Remove shoes.',
      dressCode: 'Cover shoulders and knees at religious sites. Modest dress in rural areas. Light fabrics recommended.',
      greetingsTipping: 'Namaste (palms together) is universal. Tip 10% at restaurants; small tips for drivers and porters.',
      sensitivities: [
        'Use right hand for eating and greetings',
        'Remove shoes before entering homes/temples',
        'Head wobble means agreement',
        'Avoid beef in Hindu areas, pork in Muslim areas',
      ],
    };
  }

  // Thailand
  if (['thailand', 'bangkok', 'chiang mai', 'phuket', 'pattaya'].some(k => lower.includes(k))) {
    return {
      religion: 'Buddhist (95%). Monks are highly revered. Women must not touch monks or their belongings.',
      dressCode: 'Cover shoulders and knees at temples. No shoes inside. Casual elsewhere but avoid very revealing clothing.',
      greetingsTipping: 'Wai (palms together, slight bow) for greeting. Tip 20-50 baht at restaurants; round up for taxis.',
      sensitivities: [
        'Never touch anyone\'s head',
        'Don\'t point feet at people or Buddha images',
        'Royal family criticism is illegal',
        'Stay calm — losing temper is taboo',
      ],
    };
  }

  // Kenya / Ghana / Nigeria / Africa
  if (['kenya', 'nairobi', 'ghana', 'accra', 'nigeria', 'lagos', 'tanzania', 'cape town', 'south africa'].some(k => lower.includes(k))) {
    return {
      religion: 'Predominantly Christian (71%+) with significant Muslim population. Sunday mornings are quiet.',
      dressCode: 'Smart casual accepted. Cover shoulders and knees at religious sites. Beachwear only at beaches.',
      greetingsTipping: 'Greetings matter — take time to say hello. Handshakes common. Tip 10-15% at restaurants, round up for taxis.',
      sensitivities: [
        'Use right hand for greetings and eating',
        'Ask before photographing people',
        'Haggling expected in markets',
        'Elders are addressed with respect',
      ],
    };
  }

  // Italy
  if (['italy', 'rome', 'milan', 'florence', 'venice', 'naples'].some(k => lower.includes(k))) {
    return {
      religion: 'Roman Catholic (83%). Vatican City dress code is enforced — no bare shoulders or knees.',
      dressCode: 'Italians dress well. Smart casual minimum for restaurants. Cover up at churches.',
      greetingsTipping: 'Kiss on both cheeks among friends. "Ciao" is informal. Tip by rounding up — coperto (cover charge) is common.',
      sensitivities: [
        'Cappuccino only before 11 AM',
        'Don\'t ask for parmesan on seafood pasta',
        'Dinner starts after 8 PM',
        'Avoid sitting at café tables unless ordering',
      ],
    };
  }

  // Spain
  if (['spain', 'madrid', 'barcelona', 'seville', 'malaga'].some(k => lower.includes(k))) {
    return {
      religion: 'Roman Catholic (58%). Semana Santa (Holy Week) processions are major cultural events.',
      dressCode: 'Stylish casual. Cover shoulders at churches. Spaniards dress well for evening outings.',
      greetingsTipping: 'Two cheek kisses among friends. Tip small — round up or leave 1-2 euros. Service often included.',
      sensitivities: [
        'Lunch is 2-4 PM, dinner after 9 PM',
        'Siesta hours: some shops close 2-5 PM',
        'Avoid rushing meals — dining is social',
        'Regional identities are strong (Catalonia, Basque)',
      ],
    };
  }

  // Mexico
  if (['mexico', 'mexico city', 'cancun', 'playa del carmen', 'oaxaca', 'guadalajara'].some(k => lower.includes(k))) {
    return {
      religion: 'Roman Catholic (78%). Religious festivals like Day of the Dead are cultural highlights.',
      dressCode: 'Casual and relaxed. Cover up at churches. Beach towns are very informal.',
      greetingsTipping: 'Warm handshake or cheek kiss. Tip 10-15% at restaurants; tip in pesos preferred.',
      sensitivities: [
        'Avoid "Montezuma\'s revenge" jokes',
        'Mezcal ≠ tequila — locals appreciate the distinction',
        'Punctuality is relaxed socially',
        'Avoid sensitive political topics (cartels, border)',
      ],
    };
  }

  // Default — generic international travel
  return {
    religion: 'Research local religious practices before visiting. Dress modestly at places of worship.',
    dressCode: 'Smart casual is generally safe. Cover shoulders and knees at religious and government sites.',
    greetingsTipping: 'Handshake is widely understood. Research local tipping customs — they vary widely.',
    sensitivities: [
      'Ask before photographing people',
      'Research local customs before visiting',
      'Respect local dress codes',
      'Learn basic greetings in the local language',
    ],
  };
}

const CulturalContainer: React.FC<CulturalContainerProps> = ({ destination, animationDelay }) => {
  const data = getCulturalData(destination);
  return <CulturalPresenter data={data} animationDelay={animationDelay} />;
};

export default CulturalContainer;
