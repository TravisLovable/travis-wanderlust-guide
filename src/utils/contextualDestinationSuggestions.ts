
export const getContextualDestinations = (destination: string): string[] => {
  const lowerDest = destination.toLowerCase();
  
  // United States - Specific Cities
  if (lowerDest.includes('kansas city')) {
    return ['St. Louis', 'Omaha', 'Des Moines', 'Oklahoma City'];
  }
  
  if (lowerDest.includes('st. louis') || lowerDest.includes('saint louis')) {
    return ['Kansas City', 'Chicago', 'Nashville', 'Indianapolis'];
  }
  
  if (lowerDest.includes('milwaukee')) {
    return ['Chicago', 'Madison', 'Minneapolis', 'Green Bay'];
  }
  
  if (lowerDest.includes('minneapolis')) {
    return ['Milwaukee', 'Chicago', 'Des Moines', 'Duluth'];
  }
  
  if (lowerDest.includes('cleveland')) {
    return ['Pittsburgh', 'Detroit', 'Columbus', 'Cincinnati'];
  }
  
  if (lowerDest.includes('detroit')) {
    return ['Chicago', 'Cleveland', 'Grand Rapids', 'Toledo'];
  }
  
  if (lowerDest.includes('indianapolis')) {
    return ['Chicago', 'Cincinnati', 'Louisville', 'St. Louis'];
  }
  
  if (lowerDest.includes('columbus')) {
    return ['Cleveland', 'Cincinnati', 'Pittsburgh', 'Indianapolis'];
  }
  
  if (lowerDest.includes('pittsburgh')) {
    return ['Cleveland', 'Philadelphia', 'Columbus', 'Buffalo'];
  }
  
  if (lowerDest.includes('cincinnati')) {
    return ['Louisville', 'Columbus', 'Indianapolis', 'Nashville'];
  }
  
  if (lowerDest.includes('omaha')) {
    return ['Kansas City', 'Des Moines', 'Lincoln', 'Sioux City'];
  }
  
  if (lowerDest.includes('des moines')) {
    return ['Omaha', 'Kansas City', 'Minneapolis', 'Cedar Rapids'];
  }
  
  // Peru
  if (lowerDest.includes('peru') || lowerDest.includes('lima')) {
    return ['Cusco', 'Arequipa', 'Trujillo', 'Iquitos'];
  }
  
  if (lowerDest.includes('cusco') || lowerDest.includes('cuzco')) {
    return ['Lima', 'Arequipa', 'Puno', 'Huacachina'];
  }
  
  // Spain
  if (lowerDest.includes('madrid')) {
    return ['Barcelona', 'Seville', 'Valencia', 'Bilbao'];
  }
  
  if (lowerDest.includes('barcelona')) {
    return ['Madrid', 'Valencia', 'Seville', 'Bilbao'];
  }
  
  if (lowerDest.includes('seville') || lowerDest.includes('sevilla')) {
    return ['Madrid', 'Barcelona', 'Granada', 'Córdoba'];
  }
  
  if (lowerDest.includes('canary islands') || lowerDest.includes('gran canaria') || lowerDest.includes('tenerife')) {
    return ['Madrid', 'Barcelona', 'Lisbon', 'Marrakech'];
  }
  
  if (lowerDest.includes('spain') && !lowerDest.includes('madrid') && !lowerDest.includes('barcelona')) {
    return ['Madrid', 'Barcelona', 'Seville', 'Valencia'];
  }
  
  // Portugal
  if (lowerDest.includes('lisbon') || lowerDest.includes('lisboa')) {
    return ['Porto', 'Madrid', 'Seville', 'Faro'];
  }
  
  if (lowerDest.includes('porto') || lowerDest.includes('oporto')) {
    return ['Lisbon', 'Braga', 'Coimbra', 'Santiago de Compostela'];
  }
  
  if (lowerDest.includes('portugal') && !lowerDest.includes('lisbon') && !lowerDest.includes('porto')) {
    return ['Lisbon', 'Porto', 'Madrid', 'Seville'];
  }
  
  // France
  if (lowerDest.includes('paris')) {
    return ['Lyon', 'Marseille', 'Nice', 'Bordeaux'];
  }
  
  if (lowerDest.includes('nice')) {
    return ['Monaco', 'Cannes', 'Marseille', 'Barcelona'];
  }
  
  if (lowerDest.includes('lyon')) {
    return ['Paris', 'Marseille', 'Geneva', 'Bordeaux'];
  }
  
  if (lowerDest.includes('france') && !lowerDest.includes('paris') && !lowerDest.includes('nice')) {
    return ['Paris', 'Nice', 'Lyon', 'Marseille'];
  }
  
  // Italy
  if (lowerDest.includes('rome') || lowerDest.includes('roma')) {
    return ['Florence', 'Naples', 'Milan', 'Venice'];
  }
  
  if (lowerDest.includes('milan') || lowerDest.includes('milano')) {
    return ['Rome', 'Florence', 'Venice', 'Turin'];
  }
  
  if (lowerDest.includes('florence') || lowerDest.includes('firenze')) {
    return ['Rome', 'Milan', 'Pisa', 'Siena'];
  }
  
  if (lowerDest.includes('venice') || lowerDest.includes('venezia')) {
    return ['Milan', 'Florence', 'Rome', 'Verona'];
  }
  
  if (lowerDest.includes('naples') || lowerDest.includes('napoli')) {
    return ['Rome', 'Amalfi', 'Pompeii', 'Capri'];
  }
  
  if (lowerDest.includes('italy') && !lowerDest.includes('rome') && !lowerDest.includes('milan')) {
    return ['Rome', 'Milan', 'Florence', 'Venice'];
  }
  
  // Greece
  if (lowerDest.includes('athens') || lowerDest.includes('athina')) {
    return ['Santorini', 'Mykonos', 'Thessaloniki', 'Rhodes'];
  }
  
  if (lowerDest.includes('santorini')) {
    return ['Mykonos', 'Athens', 'Crete', 'Paros'];
  }
  
  if (lowerDest.includes('mykonos')) {
    return ['Santorini', 'Athens', 'Paros', 'Naxos'];
  }
  
  if (lowerDest.includes('greece') && !lowerDest.includes('athens') && !lowerDest.includes('santorini')) {
    return ['Athens', 'Santorini', 'Mykonos', 'Thessaloniki'];
  }
  
  // Germany
  if (lowerDest.includes('berlin')) {
    return ['Munich', 'Hamburg', 'Cologne', 'Frankfurt'];
  }
  
  if (lowerDest.includes('munich') || lowerDest.includes('münchen')) {
    return ['Berlin', 'Vienna', 'Salzburg', 'Frankfurt'];
  }
  
  if (lowerDest.includes('hamburg')) {
    return ['Berlin', 'Amsterdam', 'Copenhagen', 'Bremen'];
  }
  
  if (lowerDest.includes('germany') && !lowerDest.includes('berlin') && !lowerDest.includes('munich')) {
    return ['Berlin', 'Munich', 'Hamburg', 'Cologne'];
  }
  
  // United Kingdom
  if (lowerDest.includes('london')) {
    return ['Edinburgh', 'Manchester', 'Liverpool', 'Bath'];
  }
  
  if (lowerDest.includes('edinburgh')) {
    return ['London', 'Glasgow', 'Inverness', 'York'];
  }
  
  if (lowerDest.includes('uk') || lowerDest.includes('united kingdom')) {
    return ['London', 'Edinburgh', 'Bath', 'Oxford'];
  }
  
  // Netherlands
  if (lowerDest.includes('amsterdam')) {
    return ['Utrecht', 'Rotterdam', 'The Hague', 'Brussels'];
  }
  
  if (lowerDest.includes('netherlands') && !lowerDest.includes('amsterdam')) {
    return ['Amsterdam', 'Utrecht', 'Rotterdam', 'The Hague'];
  }
  
  // United States - Major Cities
  if (lowerDest.includes('new york')) {
    return ['Philadelphia', 'Boston', 'Washington DC', 'Newark'];
  }
  
  if (lowerDest.includes('los angeles')) {
    return ['San Diego', 'San Francisco', 'Las Vegas', 'Phoenix'];
  }
  
  if (lowerDest.includes('san francisco')) {
    return ['Los Angeles', 'San Jose', 'Oakland', 'Sacramento'];
  }
  
  if (lowerDest.includes('chicago')) {
    return ['Milwaukee', 'Detroit', 'Indianapolis', 'St. Louis'];
  }
  
  if (lowerDest.includes('miami')) {
    return ['Fort Lauderdale', 'Orlando', 'Tampa', 'Key West'];
  }
  
  if (lowerDest.includes('seattle')) {
    return ['Portland', 'Vancouver', 'Spokane', 'Tacoma'];
  }
  
  if (lowerDest.includes('boston')) {
    return ['New York', 'Portland ME', 'Providence', 'Hartford'];
  }
  
  if (lowerDest.includes('denver')) {
    return ['Colorado Springs', 'Boulder', 'Salt Lake City', 'Aspen'];
  }
  
  if (lowerDest.includes('austin')) {
    return ['San Antonio', 'Houston', 'Dallas', 'Fort Worth'];
  }
  
  if (lowerDest.includes('nashville')) {
    return ['Memphis', 'Louisville', 'Chattanooga', 'Knoxville'];
  }
  
  // US Regional patterns
  if ((lowerDest.includes('missouri') || lowerDest.includes('kansas') || lowerDest.includes('iowa') || lowerDest.includes('nebraska')) && !lowerDest.includes('kansas city')) {
    return ['Kansas City', 'St. Louis', 'Des Moines', 'Omaha'];
  }
  
  if ((lowerDest.includes('ohio') || lowerDest.includes('michigan') || lowerDest.includes('indiana') || lowerDest.includes('wisconsin')) && !lowerDest.includes('chicago')) {
    return ['Chicago', 'Detroit', 'Cleveland', 'Milwaukee'];
  }
  
  if (lowerDest.includes('united states') || lowerDest.includes('usa')) {
    return ['New York', 'Los Angeles', 'Chicago', 'Miami'];
  }
  
  // Canada
  if (lowerDest.includes('toronto')) {
    return ['Montreal', 'Ottawa', 'Niagara Falls', 'Hamilton'];
  }
  
  if (lowerDest.includes('vancouver')) {
    return ['Seattle', 'Victoria', 'Calgary', 'Whistler'];
  }
  
  if (lowerDest.includes('montreal')) {
    return ['Toronto', 'Quebec City', 'Ottawa', 'Boston'];
  }
  
  if (lowerDest.includes('canada') && !lowerDest.includes('toronto') && !lowerDest.includes('vancouver')) {
    return ['Toronto', 'Vancouver', 'Montreal', 'Calgary'];
  }
  
  // Mexico
  if (lowerDest.includes('mexico city')) {
    return ['Guadalajara', 'Puebla', 'Querétaro', 'Toluca'];
  }
  
  if (lowerDest.includes('cancun')) {
    return ['Playa del Carmen', 'Cozumel', 'Tulum', 'Mérida'];
  }
  
  if (lowerDest.includes('playa del carmen')) {
    return ['Cancun', 'Tulum', 'Cozumel', 'Akumel'];
  }
  
  if (lowerDest.includes('mexico') && !lowerDest.includes('mexico city') && !lowerDest.includes('cancun')) {
    return ['Mexico City', 'Cancun', 'Guadalajara', 'Puerto Vallarta'];
  }
  
  // Brazil
  if (lowerDest.includes('rio de janeiro')) {
    return ['São Paulo', 'Brasília', 'Salvador', 'Belo Horizonte'];
  }
  
  if (lowerDest.includes('são paulo') || lowerDest.includes('sao paulo')) {
    return ['Rio de Janeiro', 'Brasília', 'Campinas', 'Santos'];
  }
  
  if (lowerDest.includes('salvador')) {
    return ['Rio de Janeiro', 'São Paulo', 'Recife', 'Fortaleza'];
  }
  
  if (lowerDest.includes('brazil') && !lowerDest.includes('rio') && !lowerDest.includes('são paulo')) {
    return ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília'];
  }
  
  // Argentina
  if (lowerDest.includes('buenos aires')) {
    return ['Córdoba', 'Rosario', 'Mendoza', 'Montevideo'];
  }
  
  if (lowerDest.includes('argentina') && !lowerDest.includes('buenos aires')) {
    return ['Buenos Aires', 'Bariloche', 'Mendoza', 'Córdoba'];
  }
  
  // Chile
  if (lowerDest.includes('santiago')) {
    return ['Valparaíso', 'Viña del Mar', 'Concepción', 'La Serena'];
  }
  
  if (lowerDest.includes('chile') && !lowerDest.includes('santiago')) {
    return ['Santiago', 'Valparaíso', 'Viña del Mar', 'Atacama'];
  }
  
  // Colombia
  if (lowerDest.includes('bogota') || lowerDest.includes('bogotá')) {
    return ['Medellín', 'Cartagena', 'Cali', 'Barranquilla'];
  }
  
  if (lowerDest.includes('medellin') || lowerDest.includes('medellín')) {
    return ['Bogotá', 'Cartagena', 'Cali', 'Pereira'];
  }
  
  if (lowerDest.includes('cartagena')) {
    return ['Bogotá', 'Medellín', 'Barranquilla', 'Santa Marta'];
  }
  
  if (lowerDest.includes('colombia') && !lowerDest.includes('bogota') && !lowerDest.includes('medellin')) {
    return ['Bogotá', 'Medellín', 'Cartagena', 'Cali'];
  }
  
  // Japan
  if (lowerDest.includes('tokyo')) {
    return ['Osaka', 'Kyoto', 'Yokohama', 'Hiroshima'];
  }
  
  if (lowerDest.includes('osaka')) {
    return ['Tokyo', 'Kyoto', 'Kobe', 'Nara'];
  }
  
  if (lowerDest.includes('kyoto')) {
    return ['Tokyo', 'Osaka', 'Nara', 'Hiroshima'];
  }
  
  if (lowerDest.includes('japan') && !lowerDest.includes('tokyo') && !lowerDest.includes('osaka')) {
    return ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'];
  }
  
  // South Korea
  if (lowerDest.includes('seoul')) {
    return ['Busan', 'Incheon', 'Daegu', 'Jeju'];
  }
  
  if (lowerDest.includes('south korea') && !lowerDest.includes('seoul')) {
    return ['Seoul', 'Busan', 'Jeju Island', 'Incheon'];
  }
  
  // China
  if (lowerDest.includes('beijing')) {
    return ['Shanghai', 'Tianjin', 'Xi\'an', 'Chengdu'];
  }
  
  if (lowerDest.includes('shanghai')) {
    return ['Beijing', 'Hangzhou', 'Suzhou', 'Nanjing'];
  }
  
  if (lowerDest.includes('hong kong')) {
    return ['Macau', 'Shenzhen', 'Guangzhou', 'Taipei'];
  }
  
  if (lowerDest.includes('china') && !lowerDest.includes('beijing') && !lowerDest.includes('shanghai')) {
    return ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'];
  }
  
  // Thailand
  if (lowerDest.includes('bangkok')) {
    return ['Chiang Mai', 'Phuket', 'Pattaya', 'Ayutthaya'];
  }
  
  if (lowerDest.includes('chiang mai')) {
    return ['Bangkok', 'Chiang Rai', 'Pai', 'Sukhothai'];
  }
  
  if (lowerDest.includes('phuket')) {
    return ['Bangkok', 'Krabi', 'Koh Samui', 'Phi Phi'];
  }
  
  if (lowerDest.includes('thailand') && !lowerDest.includes('bangkok') && !lowerDest.includes('chiang mai')) {
    return ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'];
  }
  
  // Vietnam
  if (lowerDest.includes('ho chi minh') || lowerDest.includes('saigon')) {
    return ['Hanoi', 'Da Nang', 'Hoi An', 'Nha Trang'];
  }
  
  if (lowerDest.includes('hanoi')) {
    return ['Ho Chi Minh City', 'Halong Bay', 'Sapa', 'Hue'];
  }
  
  if (lowerDest.includes('vietnam') && !lowerDest.includes('ho chi minh') && !lowerDest.includes('hanoi')) {
    return ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An'];
  }
  
  // Indonesia
  if (lowerDest.includes('jakarta')) {
    return ['Bandung', 'Surabaya', 'Yogyakarta', 'Semarang'];
  }
  
  if (lowerDest.includes('bali')) {
    return ['Jakarta', 'Yogyakarta', 'Lombok', 'Gili Islands'];
  }
  
  if (lowerDest.includes('indonesia') && !lowerDest.includes('jakarta') && !lowerDest.includes('bali')) {
    return ['Jakarta', 'Bali', 'Yogyakarta', 'Surabaya'];
  }
  
  // Malaysia
  if (lowerDest.includes('kuala lumpur')) {
    return ['Penang', 'Johor Bahru', 'Ipoh', 'Melaka'];
  }
  
  if (lowerDest.includes('malaysia') && !lowerDest.includes('kuala lumpur')) {
    return ['Kuala Lumpur', 'Penang', 'Langkawi', 'Johor Bahru'];
  }
  
  // Singapore
  if (lowerDest.includes('singapore')) {
    return ['Kuala Lumpur', 'Jakarta', 'Bangkok', 'Ho Chi Minh City'];
  }
  
  // Philippines
  if (lowerDest.includes('manila')) {
    return ['Cebu', 'Davao', 'Iloilo', 'Baguio'];
  }
  
  if (lowerDest.includes('cebu')) {
    return ['Manila', 'Bohol', 'Dumaguete', 'Siquijor'];
  }
  
  if (lowerDest.includes('philippines') && !lowerDest.includes('manila') && !lowerDest.includes('cebu')) {
    return ['Manila', 'Cebu', 'Boracay', 'Palawan'];
  }
  
  // India
  if (lowerDest.includes('delhi')) {
    return ['Mumbai', 'Jaipur', 'Agra', 'Gurgaon'];
  }
  
  if (lowerDest.includes('mumbai')) {
    return ['Delhi', 'Pune', 'Bangalore', 'Goa'];
  }
  
  if (lowerDest.includes('bangalore') || lowerDest.includes('bengaluru')) {
    return ['Mumbai', 'Chennai', 'Hyderabad', 'Mysore'];
  }
  
  if (lowerDest.includes('goa')) {
    return ['Mumbai', 'Bangalore', 'Pune', 'Chennai'];
  }
  
  if (lowerDest.includes('india') && !lowerDest.includes('delhi') && !lowerDest.includes('mumbai')) {
    return ['Delhi', 'Mumbai', 'Bangalore', 'Goa'];
  }
  
  // UAE
  if (lowerDest.includes('dubai')) {
    return ['Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Fujairah'];
  }
  
  if (lowerDest.includes('abu dhabi')) {
    return ['Dubai', 'Al Ain', 'Sharjah', 'Ras Al Khaimah'];
  }
  
  if (lowerDest.includes('uae') || lowerDest.includes('united arab emirates')) {
    return ['Dubai', 'Abu Dhabi', 'Sharjah', 'Fujairah'];
  }
  
  // Turkey
  if (lowerDest.includes('istanbul')) {
    return ['Ankara', 'Antalya', 'Izmir', 'Cappadocia'];
  }
  
  if (lowerDest.includes('turkey') && !lowerDest.includes('istanbul')) {
    return ['Istanbul', 'Ankara', 'Cappadocia', 'Antalya'];
  }
  
  // Egypt
  if (lowerDest.includes('cairo')) {
    return ['Alexandria', 'Luxor', 'Aswan', 'Sharm El Sheikh'];
  }
  
  if (lowerDest.includes('egypt') && !lowerDest.includes('cairo')) {
    return ['Cairo', 'Alexandria', 'Luxor', 'Aswan'];
  }
  
  // Morocco
  if (lowerDest.includes('marrakech') || lowerDest.includes('marrakesh')) {
    return ['Casablanca', 'Fez', 'Rabat', 'Chefchaouen'];
  }
  
  if (lowerDest.includes('casablanca')) {
    return ['Marrakech', 'Rabat', 'Fez', 'Tangier'];
  }
  
  if (lowerDest.includes('morocco') && !lowerDest.includes('marrakech') && !lowerDest.includes('casablanca')) {
    return ['Marrakech', 'Casablanca', 'Fez', 'Rabat'];
  }
  
  // South Africa
  if (lowerDest.includes('cape town')) {
    return ['Johannesburg', 'Durban', 'Port Elizabeth', 'Stellenbosch'];
  }
  
  if (lowerDest.includes('johannesburg')) {
    return ['Cape Town', 'Durban', 'Pretoria', 'Bloemfontein'];
  }
  
  if (lowerDest.includes('south africa') && !lowerDest.includes('cape town') && !lowerDest.includes('johannesburg')) {
    return ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'];
  }
  
  // Kenya
  if (lowerDest.includes('nairobi')) {
    return ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  }
  
  if (lowerDest.includes('kenya') && !lowerDest.includes('nairobi')) {
    return ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];
  }
  
  // Australia
  if (lowerDest.includes('sydney')) {
    return ['Melbourne', 'Brisbane', 'Gold Coast', 'Newcastle'];
  }
  
  if (lowerDest.includes('melbourne')) {
    return ['Sydney', 'Adelaide', 'Brisbane', 'Geelong'];
  }
  
  if (lowerDest.includes('brisbane')) {
    return ['Sydney', 'Gold Coast', 'Melbourne', 'Sunshine Coast'];
  }
  
  if (lowerDest.includes('australia') && !lowerDest.includes('sydney') && !lowerDest.includes('melbourne')) {
    return ['Sydney', 'Melbourne', 'Brisbane', 'Perth'];
  }
  
  // New Zealand
  if (lowerDest.includes('auckland')) {
    return ['Wellington', 'Christchurch', 'Hamilton', 'Rotorua'];
  }
  
  if (lowerDest.includes('wellington')) {
    return ['Auckland', 'Christchurch', 'Palmerston North', 'Nelson'];
  }
  
  if (lowerDest.includes('new zealand') && !lowerDest.includes('auckland') && !lowerDest.includes('wellington')) {
    return ['Auckland', 'Wellington', 'Queenstown', 'Christchurch'];
  }
  
  // Default fallback - popular global destinations
  return ['Paris', 'London', 'Tokyo', 'New York'];
};
