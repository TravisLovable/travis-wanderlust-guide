
export const getContextualDestinations = (destination: string): string[] => {
  const lowerDest = destination.toLowerCase();
  
  // Peru
  if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
    return ['Miraflores', 'San Isidro', 'Barranco', 'Cusco'];
  }
  
  if (lowerDest.includes('cusco') || lowerDest.includes('cuzco')) {
    return ['Sacred Valley', 'Ollantaytambo', 'Pisac', 'Machu Picchu'];
  }
  
  // Spain
  if (lowerDest.includes('madrid')) {
    return ['Malasaña', 'Chueca', 'La Latina', 'Retiro'];
  }
  
  if (lowerDest.includes('barcelona')) {
    return ['Gothic Quarter', 'Eixample', 'Gràcia', 'El Born'];
  }
  
  if (lowerDest.includes('seville') || lowerDest.includes('sevilla')) {
    return ['Santa Cruz', 'Triana', 'Alameda', 'Macarena'];
  }
  
  if (lowerDest.includes('canary islands') || lowerDest.includes('gran canaria') || lowerDest.includes('tenerife')) {
    return ['Las Palmas', 'Santa Cruz', 'Playa del Inglés', 'Puerto de la Cruz'];
  }
  
  if (lowerDest.includes('spain') && !lowerDest.includes('madrid') && !lowerDest.includes('barcelona')) {
    return ['Madrid', 'Barcelona', 'Seville', 'Valencia'];
  }
  
  // Portugal
  if (lowerDest.includes('lisbon') || lowerDest.includes('lisboa')) {
    return ['Alfama', 'Bairro Alto', 'Chiado', 'Belém'];
  }
  
  if (lowerDest.includes('porto') || lowerDest.includes('oporto')) {
    return ['Ribeira', 'Cedofeita', 'Vila Nova de Gaia', 'Foz do Douro'];
  }
  
  if (lowerDest.includes('portugal') && !lowerDest.includes('lisbon') && !lowerDest.includes('porto')) {
    return ['Lisbon', 'Porto', 'Sintra', 'Cascais'];
  }
  
  // France
  if (lowerDest.includes('paris')) {
    return ['Montmartre', 'Le Marais', 'Saint-Germain', 'Champs-Élysées'];
  }
  
  if (lowerDest.includes('nice')) {
    return ['Vieux Nice', 'Promenade des Anglais', 'Cannes', 'Monaco'];
  }
  
  if (lowerDest.includes('lyon')) {
    return ['Vieux Lyon', 'Presqu\'île', 'Croix-Rousse', 'Confluence'];
  }
  
  if (lowerDest.includes('france') && !lowerDest.includes('paris') && !lowerDest.includes('nice')) {
    return ['Paris', 'Nice', 'Lyon', 'Marseille'];
  }
  
  // Italy
  if (lowerDest.includes('rome') || lowerDest.includes('roma')) {
    return ['Trastevere', 'Centro Storico', 'Vatican City', 'Testaccio'];
  }
  
  if (lowerDest.includes('milan') || lowerDest.includes('milano')) {
    return ['Brera', 'Navigli', 'Quadrilatero', 'Porta Nuova'];
  }
  
  if (lowerDest.includes('florence') || lowerDest.includes('firenze')) {
    return ['Centro Storico', 'Oltrarno', 'Santa Croce', 'San Lorenzo'];
  }
  
  if (lowerDest.includes('venice') || lowerDest.includes('venezia')) {
    return ['San Marco', 'Dorsoduro', 'Cannaregio', 'Castello'];
  }
  
  if (lowerDest.includes('naples') || lowerDest.includes('napoli')) {
    return ['Centro Storico', 'Vomero', 'Chiaia', 'Quartieri Spagnoli'];
  }
  
  if (lowerDest.includes('italy') && !lowerDest.includes('rome') && !lowerDest.includes('milan')) {
    return ['Rome', 'Milan', 'Florence', 'Venice'];
  }
  
  // Greece
  if (lowerDest.includes('athens') || lowerDest.includes('athina')) {
    return ['Plaka', 'Monastiraki', 'Psyrri', 'Kolonaki'];
  }
  
  if (lowerDest.includes('santorini')) {
    return ['Oia', 'Fira', 'Imerovigli', 'Kamari'];
  }
  
  if (lowerDest.includes('mykonos')) {
    return ['Mykonos Town', 'Paradise Beach', 'Super Paradise', 'Little Venice'];
  }
  
  if (lowerDest.includes('greece') && !lowerDest.includes('athens') && !lowerDest.includes('santorini')) {
    return ['Athens', 'Santorini', 'Mykonos', 'Thessaloniki'];
  }
  
  // Germany
  if (lowerDest.includes('berlin')) {
    return ['Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Charlottenburg'];
  }
  
  if (lowerDest.includes('munich') || lowerDest.includes('münchen')) {
    return ['Altstadt', 'Schwabing', 'Maxvorstadt', 'Glockenbachviertel'];
  }
  
  if (lowerDest.includes('hamburg')) {
    return ['St. Pauli', 'HafenCity', 'Speicherstadt', 'Altona'];
  }
  
  if (lowerDest.includes('germany') && !lowerDest.includes('berlin') && !lowerDest.includes('munich')) {
    return ['Berlin', 'Munich', 'Hamburg', 'Cologne'];
  }
  
  // United Kingdom
  if (lowerDest.includes('london')) {
    return ['Westminster', 'Camden', 'Shoreditch', 'Kensington'];
  }
  
  if (lowerDest.includes('edinburgh')) {
    return ['Old Town', 'New Town', 'Leith', 'Stockbridge'];
  }
  
  if (lowerDest.includes('uk') || lowerDest.includes('united kingdom')) {
    return ['London', 'Edinburgh', 'Bath', 'Oxford'];
  }
  
  // Netherlands
  if (lowerDest.includes('amsterdam')) {
    return ['Jordaan', 'De Pijp', 'Vondelpark', 'Red Light District'];
  }
  
  if (lowerDest.includes('netherlands') && !lowerDest.includes('amsterdam')) {
    return ['Amsterdam', 'Utrecht', 'Rotterdam', 'The Hague'];
  }
  
  // United States
  if (lowerDest.includes('new york')) {
    return ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx'];
  }
  
  if (lowerDest.includes('los angeles')) {
    return ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice Beach'];
  }
  
  if (lowerDest.includes('san francisco')) {
    return ['Union Square', 'Fisherman\'s Wharf', 'Chinatown', 'Castro'];
  }
  
  if (lowerDest.includes('chicago')) {
    return ['The Loop', 'Lincoln Park', 'Wicker Park', 'River North'];
  }
  
  if (lowerDest.includes('miami')) {
    return ['South Beach', 'Wynwood', 'Little Havana', 'Coral Gables'];
  }
  
  if (lowerDest.includes('seattle')) {
    return ['Capitol Hill', 'Fremont', 'Ballard', 'Queen Anne'];
  }
  
  if (lowerDest.includes('boston')) {
    return ['Back Bay', 'North End', 'Beacon Hill', 'Cambridge'];
  }
  
  if (lowerDest.includes('united states') || lowerDest.includes('usa')) {
    return ['New York', 'Los Angeles', 'Chicago', 'Miami'];
  }
  
  // Canada
  if (lowerDest.includes('toronto')) {
    return ['Downtown', 'Kensington Market', 'Distillery District', 'Queen Street West'];
  }
  
  if (lowerDest.includes('vancouver')) {
    return ['Gastown', 'Yaletown', 'Granville Island', 'Kitsilano'];
  }
  
  if (lowerDest.includes('montreal')) {
    return ['Old Montreal', 'Plateau', 'Downtown', 'Mile End'];
  }
  
  if (lowerDest.includes('canada') && !lowerDest.includes('toronto') && !lowerDest.includes('vancouver')) {
    return ['Toronto', 'Vancouver', 'Montreal', 'Calgary'];
  }
  
  // Mexico
  if (lowerDest.includes('mexico city')) {
    return ['Roma Norte', 'Condesa', 'Polanco', 'Coyoacán'];
  }
  
  if (lowerDest.includes('cancun')) {
    return ['Hotel Zone', 'Downtown Cancun', 'Playa del Carmen', 'Tulum'];
  }
  
  if (lowerDest.includes('playa del carmen')) {
    return ['Fifth Avenue', 'Playacar', 'Cancun', 'Cozumel'];
  }
  
  if (lowerDest.includes('mexico') && !lowerDest.includes('mexico city') && !lowerDest.includes('cancun')) {
    return ['Mexico City', 'Cancun', 'Guadalajara', 'Puerto Vallarta'];
  }
  
  // Brazil
  if (lowerDest.includes('rio de janeiro')) {
    return ['Copacabana', 'Ipanema', 'Santa Teresa', 'Leblon'];
  }
  
  if (lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
    return ['Vila Madalena', 'Jardins', 'Centro', 'Liberdade'];
  }
  
  if (lowerDest.includes('salvador')) {
    return ['Pelourinho', 'Barra', 'Rio Vermelho', 'Itapuã'];
  }
  
  if (lowerDest.includes('brazil') && !lowerDest.includes('rio') && !lowerDest.includes('são paulo')) {
    return ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília'];
  }
  
  // Argentina
  if (lowerDest.includes('buenos aires')) {
    return ['Palermo', 'Recoleta', 'San Telmo', 'Puerto Madero'];
  }
  
  if (lowerDest.includes('argentina') && !lowerDest.includes('buenos aires')) {
    return ['Buenos Aires', 'Bariloche', 'Mendoza', 'Córdoba'];
  }
  
  // Chile
  if (lowerDest.includes('santiago')) {
    return ['Providencia', 'Las Condes', 'Ñuñoa', 'Bellavista'];
  }
  
  if (lowerDest.includes('chile') && !lowerDest.includes('santiago')) {
    return ['Santiago', 'Valparaíso', 'Viña del Mar', 'Atacama'];
  }
  
  // Colombia
  if (lowerDest.includes('bogota') || lowerDest.includes('bogotá')) {
    return ['La Candelaria', 'Zona Rosa', 'Chapinero', 'Usaquén'];
  }
  
  if (lowerDest.includes('medellin') || lowerDest.includes('medellín')) {
    return ['El Poblado', 'Laureles', 'Envigado', 'Centro'];
  }
  
  if (lowerDest.includes('cartagena')) {
    return ['Old City', 'Bocagrande', 'Getsemaní', 'San Diego'];
  }
  
  if (lowerDest.includes('colombia') && !lowerDest.includes('bogota') && !lowerDest.includes('medellin')) {
    return ['Bogotá', 'Medellín', 'Cartagena', 'Cali'];
  }
  
  // Japan
  if (lowerDest.includes('tokyo')) {
    return ['Shibuya', 'Shinjuku', 'Harajuku', 'Ginza'];
  }
  
  if (lowerDest.includes('osaka')) {
    return ['Dotonbori', 'Namba', 'Umeda', 'Shinsekai'];
  }
  
  if (lowerDest.includes('kyoto')) {
    return ['Gion', 'Arashiyama', 'Fushimi', 'Higashiyama'];
  }
  
  if (lowerDest.includes('japan') && !lowerDest.includes('tokyo') && !lowerDest.includes('osaka')) {
    return ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'];
  }
  
  // South Korea
  if (lowerDest.includes('seoul')) {
    return ['Gangnam', 'Myeongdong', 'Hongdae', 'Itaewon'];
  }
  
  if (lowerDest.includes('south korea') && !lowerDest.includes('seoul')) {
    return ['Seoul', 'Busan', 'Jeju Island', 'Incheon'];
  }
  
  // China
  if (lowerDest.includes('beijing')) {
    return ['Forbidden City', 'Hutongs', 'Chaoyang', 'Wangfujing'];
  }
  
  if (lowerDest.includes('shanghai')) {
    return ['The Bund', 'French Concession', 'Pudong', 'Xintiandi'];
  }
  
  if (lowerDest.includes('hong kong')) {
    return ['Central', 'Tsim Sha Tsui', 'Causeway Bay', 'Mong Kok'];
  }
  
  if (lowerDest.includes('china') && !lowerDest.includes('beijing') && !lowerDest.includes('shanghai')) {
    return ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'];
  }
  
  // Thailand
  if (lowerDest.includes('bangkok')) {
    return ['Khao San Road', 'Sukhumvit', 'Silom', 'Chatuchak'];
  }
  
  if (lowerDest.includes('chiang mai')) {
    return ['Old City', 'Nimman', 'Night Bazaar', 'Doi Suthep'];
  }
  
  if (lowerDest.includes('phuket')) {
    return ['Patong Beach', 'Kata Beach', 'Phuket Town', 'Kamala'];
  }
  
  if (lowerDest.includes('thailand') && !lowerDest.includes('bangkok') && !lowerDest.includes('chiang mai')) {
    return ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'];
  }
  
  // Vietnam
  if (lowerDest.includes('ho chi minh') || lowerDest.includes('saigon')) {
    return ['District 1', 'District 3', 'Cholon', 'Thao Dien'];
  }
  
  if (lowerDest.includes('hanoi')) {
    return ['Old Quarter', 'French Quarter', 'West Lake', 'Dong Da'];
  }
  
  if (lowerDest.includes('vietnam') && !lowerDest.includes('ho chi minh') && !lowerDest.includes('hanoi')) {
    return ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An'];
  }
  
  // Indonesia
  if (lowerDest.includes('jakarta')) {
    return ['Menteng', 'Kemang', 'Senayan', 'Thamrin'];
  }
  
  if (lowerDest.includes('bali')) {
    return ['Ubud', 'Seminyak', 'Canggu', 'Sanur'];
  }
  
  if (lowerDest.includes('indonesia') && !lowerDest.includes('jakarta') && !lowerDest.includes('bali')) {
    return ['Jakarta', 'Bali', 'Yogyakarta', 'Surabaya'];
  }
  
  // Malaysia
  if (lowerDest.includes('kuala lumpur')) {
    return ['KLCC', 'Bukit Bintang', 'Chinatown', 'Mont Kiara'];
  }
  
  if (lowerDest.includes('malaysia') && !lowerDest.includes('kuala lumpur')) {
    return ['Kuala Lumpur', 'Penang', 'Langkawi', 'Johor Bahru'];
  }
  
  // Singapore
  if (lowerDest.includes('singapore')) {
    return ['Marina Bay', 'Orchard Road', 'Chinatown', 'Little India'];
  }
  
  // Philippines
  if (lowerDest.includes('manila')) {
    return ['Makati', 'BGC', 'Malate', 'Quezon City'];
  }
  
  if (lowerDest.includes('cebu')) {
    return ['Cebu City', 'Lahug', 'IT Park', 'Colon'];
  }
  
  if (lowerDest.includes('philippines') && !lowerDest.includes('manila') && !lowerDest.includes('cebu')) {
    return ['Manila', 'Cebu', 'Boracay', 'Palawan'];
  }
  
  // India
  if (lowerDest.includes('delhi')) {
    return ['Connaught Place', 'Khan Market', 'Hauz Khas', 'Chandni Chowk'];
  }
  
  if (lowerDest.includes('mumbai')) {
    return ['Colaba', 'Bandra', 'Juhu', 'Fort'];
  }
  
  if (lowerDest.includes('bangalore') || lowerDest.includes('bengaluru')) {
    return ['MG Road', 'Koramangala', 'Indiranagar', 'Whitefield'];
  }
  
  if (lowerDest.includes('goa')) {
    return ['Panaji', 'Calangute', 'Anjuna', 'Vagator'];
  }
  
  if (lowerDest.includes('india') && !lowerDest.includes('delhi') && !lowerDest.includes('mumbai')) {
    return ['Delhi', 'Mumbai', 'Bangalore', 'Goa'];
  }
  
  // UAE
  if (lowerDest.includes('dubai')) {
    return ['Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Deira'];
  }
  
  if (lowerDest.includes('abu dhabi')) {
    return ['Corniche', 'Saadiyat Island', 'Yas Island', 'Al Ain'];
  }
  
  if (lowerDest.includes('uae') || lowerDest.includes('united arab emirates')) {
    return ['Dubai', 'Abu Dhabi', 'Sharjah', 'Fujairah'];
  }
  
  // Turkey
  if (lowerDest.includes('istanbul')) {
    return ['Sultanahmet', 'Beyoğlu', 'Galata', 'Beşiktaş'];
  }
  
  if (lowerDest.includes('turkey') && !lowerDest.includes('istanbul')) {
    return ['Istanbul', 'Ankara', 'Cappadocia', 'Antalya'];
  }
  
  // Egypt
  if (lowerDest.includes('cairo')) {
    return ['Islamic Cairo', 'Zamalek', 'Heliopolis', 'Maadi'];
  }
  
  if (lowerDest.includes('egypt') && !lowerDest.includes('cairo')) {
    return ['Cairo', 'Alexandria', 'Luxor', 'Aswan'];
  }
  
  // Morocco
  if (lowerDest.includes('marrakech') || lowerDest.includes('marrakesh')) {
    return ['Medina', 'Gueliz', 'Majorelle', 'Palmeraie'];
  }
  
  if (lowerDest.includes('casablanca')) {
    return ['Hassan II', 'Ain Diab', 'Maarif', 'Habous'];
  }
  
  if (lowerDest.includes('morocco') && !lowerDest.includes('marrakech') && !lowerDest.includes('casablanca')) {
    return ['Marrakech', 'Casablanca', 'Fez', 'Rabat'];
  }
  
  // South Africa
  if (lowerDest.includes('cape town')) {
    return ['V&A Waterfront', 'City Bowl', 'Camps Bay', 'Stellenbosch'];
  }
  
  if (lowerDest.includes('johannesburg')) {
    return ['Sandton', 'Rosebank', 'Maboneng', 'Soweto'];
  }
  
  if (lowerDest.includes('south africa') && !lowerDest.includes('cape town') && !lowerDest.includes('johannesburg')) {
    return ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'];
  }
  
  // Kenya
  if (lowerDest.includes('nairobi')) {
    return ['Westlands', 'Karen', 'Kilimani', 'CBD'];
  }
  
  if (lowerDest.includes('kenya') && !lowerDest.includes('nairobi')) {
    return ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];
  }
  
  // Australia
  if (lowerDest.includes('sydney')) {
    return ['Circular Quay', 'Bondi Beach', 'Darling Harbour', 'The Rocks'];
  }
  
  if (lowerDest.includes('melbourne')) {
    return ['CBD', 'St Kilda', 'Fitzroy', 'South Yarra'];
  }
  
  if (lowerDest.includes('brisbane')) {
    return ['South Bank', 'Fortitude Valley', 'West End', 'CBD'];
  }
  
  if (lowerDest.includes('australia') && !lowerDest.includes('sydney') && !lowerDest.includes('melbourne')) {
    return ['Sydney', 'Melbourne', 'Brisbane', 'Perth'];
  }
  
  // New Zealand
  if (lowerDest.includes('auckland')) {
    return ['CBD', 'Viaduct Harbour', 'Ponsonby', 'Mission Bay'];
  }
  
  if (lowerDest.includes('wellington')) {
    return ['Te Aro', 'Mount Victoria', 'Thorndon', 'Newtown'];
  }
  
  if (lowerDest.includes('new zealand') && !lowerDest.includes('auckland') && !lowerDest.includes('wellington')) {
    return ['Auckland', 'Wellington', 'Queenstown', 'Christchurch'];
  }
  
  // Default fallback - popular global city neighborhoods/areas
  return ['Times Square, NYC', 'Champs-Élysées, Paris', 'Shibuya, Tokyo', 'Piccadilly, London'];
};
