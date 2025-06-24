
export const getContextualDestinations = (destination: string): string[] => {
  const lowerDest = destination.toLowerCase();
  
  // Europe
  if (lowerDest.includes('spain') || lowerDest.includes('madrid') || lowerDest.includes('barcelona') || 
      lowerDest.includes('seville') || lowerDest.includes('valencia') || lowerDest.includes('canary islands') ||
      lowerDest.includes('balearic islands') || lowerDest.includes('mallorca') || lowerDest.includes('ibiza')) {
    return ['Portugal', 'France', 'Italy', 'Morocco'];
  }
  
  if (lowerDest.includes('portugal') || lowerDest.includes('lisbon') || lowerDest.includes('porto')) {
    return ['Spain', 'Morocco', 'France', 'Azores'];
  }
  
  if (lowerDest.includes('france') || lowerDest.includes('paris') || lowerDest.includes('lyon') || 
      lowerDest.includes('marseille') || lowerDest.includes('nice') || lowerDest.includes('cannes')) {
    return ['Spain', 'Italy', 'Switzerland', 'Belgium'];
  }
  
  if (lowerDest.includes('italy') || lowerDest.includes('rome') || lowerDest.includes('milan') || 
      lowerDest.includes('florence') || lowerDest.includes('venice') || lowerDest.includes('naples')) {
    return ['France', 'Switzerland', 'Austria', 'Greece'];
  }
  
  if (lowerDest.includes('greece') || lowerDest.includes('athens') || lowerDest.includes('santorini') || 
      lowerDest.includes('mykonos') || lowerDest.includes('crete')) {
    return ['Italy', 'Turkey', 'Cyprus', 'Croatia'];
  }
  
  if (lowerDest.includes('germany') || lowerDest.includes('berlin') || lowerDest.includes('munich') || 
      lowerDest.includes('hamburg') || lowerDest.includes('cologne')) {
    return ['Austria', 'Switzerland', 'Netherlands', 'Czech Republic'];
  }
  
  if (lowerDest.includes('united kingdom') || lowerDest.includes('uk') || lowerDest.includes('london') || 
      lowerDest.includes('edinburgh') || lowerDest.includes('manchester') || lowerDest.includes('glasgow')) {
    return ['Ireland', 'France', 'Netherlands', 'Belgium'];
  }
  
  if (lowerDest.includes('netherlands') || lowerDest.includes('amsterdam') || lowerDest.includes('rotterdam')) {
    return ['Belgium', 'Germany', 'United Kingdom', 'Denmark'];
  }
  
  if (lowerDest.includes('switzerland') || lowerDest.includes('zurich') || lowerDest.includes('geneva') || 
      lowerDest.includes('bern') || lowerDest.includes('basel')) {
    return ['Austria', 'Germany', 'France', 'Italy'];
  }
  
  if (lowerDest.includes('austria') || lowerDest.includes('vienna') || lowerDest.includes('salzburg') || 
      lowerDest.includes('innsbruck')) {
    return ['Germany', 'Switzerland', 'Italy', 'Czech Republic'];
  }
  
  if (lowerDest.includes('czech republic') || lowerDest.includes('prague') || lowerDest.includes('brno')) {
    return ['Austria', 'Germany', 'Slovakia', 'Poland'];
  }
  
  if (lowerDest.includes('poland') || lowerDest.includes('warsaw') || lowerDest.includes('krakow') || 
      lowerDest.includes('gdansk')) {
    return ['Czech Republic', 'Germany', 'Lithuania', 'Slovakia'];
  }
  
  if (lowerDest.includes('scandinavia') || lowerDest.includes('sweden') || lowerDest.includes('stockholm') || 
      lowerDest.includes('gothenburg') || lowerDest.includes('malmö')) {
    return ['Norway', 'Denmark', 'Finland', 'Germany'];
  }
  
  if (lowerDest.includes('norway') || lowerDest.includes('oslo') || lowerDest.includes('bergen') || 
      lowerDest.includes('trondheim')) {
    return ['Sweden', 'Denmark', 'Iceland', 'Finland'];
  }
  
  if (lowerDest.includes('denmark') || lowerDest.includes('copenhagen') || lowerDest.includes('aarhus')) {
    return ['Sweden', 'Norway', 'Germany', 'Netherlands'];
  }
  
  if (lowerDest.includes('finland') || lowerDest.includes('helsinki') || lowerDest.includes('tampere')) {
    return ['Sweden', 'Norway', 'Estonia', 'Russia'];
  }
  
  if (lowerDest.includes('iceland') || lowerDest.includes('reykjavik')) {
    return ['Norway', 'Denmark', 'United Kingdom', 'Faroe Islands'];
  }
  
  // Eastern Europe
  if (lowerDest.includes('russia') || lowerDest.includes('moscow') || lowerDest.includes('st petersburg')) {
    return ['Finland', 'Estonia', 'Latvia', 'Lithuania'];
  }
  
  if (lowerDest.includes('ukraine') || lowerDest.includes('kiev') || lowerDest.includes('lviv')) {
    return ['Poland', 'Romania', 'Hungary', 'Moldova'];
  }
  
  if (lowerDest.includes('romania') || lowerDest.includes('bucharest') || lowerDest.includes('brasov')) {
    return ['Hungary', 'Bulgaria', 'Serbia', 'Moldova'];
  }
  
  if (lowerDest.includes('hungary') || lowerDest.includes('budapest') || lowerDest.includes('debrecen')) {
    return ['Austria', 'Slovakia', 'Romania', 'Serbia'];
  }
  
  if (lowerDest.includes('croatia') || lowerDest.includes('zagreb') || lowerDest.includes('split') || 
      lowerDest.includes('dubrovnik')) {
    return ['Slovenia', 'Bosnia and Herzegovina', 'Montenegro', 'Italy'];
  }
  
  if (lowerDest.includes('serbia') || lowerDest.includes('belgrade') || lowerDest.includes('novi sad')) {
    return ['Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'Hungary'];
  }
  
  // North America
  if (lowerDest.includes('united states') || lowerDest.includes('usa') || lowerDest.includes('new york') || 
      lowerDest.includes('los angeles') || lowerDest.includes('chicago') || lowerDest.includes('miami') || 
      lowerDest.includes('san francisco') || lowerDest.includes('seattle') || lowerDest.includes('boston')) {
    return ['Canada', 'Mexico', 'Bermuda', 'Bahamas'];
  }
  
  if (lowerDest.includes('canada') || lowerDest.includes('toronto') || lowerDest.includes('vancouver') || 
      lowerDest.includes('montreal') || lowerDest.includes('calgary') || lowerDest.includes('ottawa')) {
    return ['United States', 'Iceland', 'Greenland', 'Alaska'];
  }
  
  if (lowerDest.includes('mexico') || lowerDest.includes('mexico city') || lowerDest.includes('cancun') || 
      lowerDest.includes('guadalajara') || lowerDest.includes('playa del carmen') || lowerDest.includes('tulum')) {
    return ['United States', 'Guatemala', 'Belize', 'Cuba'];
  }
  
  // Central America & Caribbean
  if (lowerDest.includes('guatemala') || lowerDest.includes('guatemala city') || lowerDest.includes('antigua')) {
    return ['Mexico', 'Belize', 'El Salvador', 'Honduras'];
  }
  
  if (lowerDest.includes('costa rica') || lowerDest.includes('san jose') || lowerDest.includes('manuel antonio')) {
    return ['Panama', 'Nicaragua', 'Colombia', 'United States'];
  }
  
  if (lowerDest.includes('panama') || lowerDest.includes('panama city')) {
    return ['Costa Rica', 'Colombia', 'Nicaragua', 'United States'];
  }
  
  if (lowerDest.includes('cuba') || lowerDest.includes('havana') || lowerDest.includes('varadero')) {
    return ['Mexico', 'Jamaica', 'Bahamas', 'Dominican Republic'];
  }
  
  if (lowerDest.includes('jamaica') || lowerDest.includes('kingston') || lowerDest.includes('montego bay')) {
    return ['Cuba', 'Bahamas', 'Cayman Islands', 'Dominican Republic'];
  }
  
  if (lowerDest.includes('dominican republic') || lowerDest.includes('santo domingo') || lowerDest.includes('punta cana')) {
    return ['Haiti', 'Puerto Rico', 'Cuba', 'Jamaica'];
  }
  
  if (lowerDest.includes('puerto rico') || lowerDest.includes('san juan')) {
    return ['Dominican Republic', 'US Virgin Islands', 'British Virgin Islands', 'Barbados'];
  }
  
  if (lowerDest.includes('barbados') || lowerDest.includes('bridgetown')) {
    return ['Trinidad and Tobago', 'Saint Lucia', 'Grenada', 'Saint Vincent'];
  }
  
  // South America
  if (lowerDest.includes('brazil') || lowerDest.includes('são paulo') || lowerDest.includes('rio de janeiro') || 
      lowerDest.includes('salvador') || lowerDest.includes('brasília') || lowerDest.includes('fortaleza')) {
    return ['Argentina', 'Peru', 'Colombia', 'Uruguay'];
  }
  
  if (lowerDest.includes('peru') || lowerDest.includes('lima') || lowerDest.includes('cusco') || 
      lowerDest.includes('arequipa') || lowerDest.includes('trujillo')) {
    return ['Bolivia', 'Ecuador', 'Colombia', 'Chile'];
  }
  
  if (lowerDest.includes('argentina') || lowerDest.includes('buenos aires') || lowerDest.includes('cordoba') || 
      lowerDest.includes('mendoza') || lowerDest.includes('bariloche')) {
    return ['Chile', 'Uruguay', 'Brazil', 'Paraguay'];
  }
  
  if (lowerDest.includes('chile') || lowerDest.includes('santiago') || lowerDest.includes('valparaiso') || 
      lowerDest.includes('atacama')) {
    return ['Argentina', 'Peru', 'Bolivia', 'Easter Island'];
  }
  
  if (lowerDest.includes('colombia') || lowerDest.includes('bogota') || lowerDest.includes('medellin') || 
      lowerDest.includes('cartagena') || lowerDest.includes('cali')) {
    return ['Ecuador', 'Peru', 'Panama', 'Venezuela'];
  }
  
  if (lowerDest.includes('ecuador') || lowerDest.includes('quito') || lowerDest.includes('guayaquil') || 
      lowerDest.includes('galapagos')) {
    return ['Peru', 'Colombia', 'Galapagos Islands', 'Panama'];
  }
  
  if (lowerDest.includes('bolivia') || lowerDest.includes('la paz') || lowerDest.includes('sucre') || 
      lowerDest.includes('santa cruz')) {
    return ['Peru', 'Chile', 'Argentina', 'Paraguay'];
  }
  
  if (lowerDest.includes('uruguay') || lowerDest.includes('montevideo') || lowerDest.includes('punta del este')) {
    return ['Argentina', 'Brazil', 'Paraguay', 'Chile'];
  }
  
  if (lowerDest.includes('venezuela') || lowerDest.includes('caracas') || lowerDest.includes('valencia')) {
    return ['Colombia', 'Guyana', 'Trinidad and Tobago', 'Brazil'];
  }
  
  // Asia
  if (lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('osaka') || 
      lowerDest.includes('kyoto') || lowerDest.includes('hiroshima') || lowerDest.includes('nara')) {
    return ['South Korea', 'China', 'Taiwan', 'Philippines'];
  }
  
  if (lowerDest.includes('south korea') || lowerDest.includes('seoul') || lowerDest.includes('busan') || 
      lowerDest.includes('jeju')) {
    return ['Japan', 'China', 'Taiwan', 'North Korea'];
  }
  
  if (lowerDest.includes('china') || lowerDest.includes('beijing') || lowerDest.includes('shanghai') || 
      lowerDest.includes('guangzhou') || lowerDest.includes('shenzhen') || lowerDest.includes('hong kong')) {
    return ['Japan', 'South Korea', 'Taiwan', 'Vietnam'];
  }
  
  if (lowerDest.includes('taiwan') || lowerDest.includes('taipei') || lowerDest.includes('kaohsiung')) {
    return ['Japan', 'Philippines', 'China', 'South Korea'];
  }
  
  if (lowerDest.includes('thailand') || lowerDest.includes('bangkok') || lowerDest.includes('chiang mai') || 
      lowerDest.includes('phuket') || lowerDest.includes('koh samui')) {
    return ['Vietnam', 'Cambodia', 'Laos', 'Malaysia'];
  }
  
  if (lowerDest.includes('vietnam') || lowerDest.includes('ho chi minh city') || lowerDest.includes('hanoi') || 
      lowerDest.includes('da nang') || lowerDest.includes('hoi an')) {
    return ['Cambodia', 'Thailand', 'Laos', 'China'];
  }
  
  if (lowerDest.includes('cambodia') || lowerDest.includes('phnom penh') || lowerDest.includes('siem reap')) {
    return ['Vietnam', 'Thailand', 'Laos', 'Malaysia'];
  }
  
  if (lowerDest.includes('laos') || lowerDest.includes('vientiane') || lowerDest.includes('luang prabang')) {
    return ['Thailand', 'Vietnam', 'Cambodia', 'Myanmar'];
  }
  
  if (lowerDest.includes('malaysia') || lowerDest.includes('kuala lumpur') || lowerDest.includes('penang') || 
      lowerDest.includes('langkawi')) {
    return ['Singapore', 'Thailand', 'Indonesia', 'Brunei'];
  }
  
  if (lowerDest.includes('singapore')) {
    return ['Malaysia', 'Indonesia', 'Thailand', 'Philippines'];
  }
  
  if (lowerDest.includes('indonesia') || lowerDest.includes('jakarta') || lowerDest.includes('bali') || 
      lowerDest.includes('yogyakarta') || lowerDest.includes('lombok')) {
    return ['Malaysia', 'Singapore', 'Philippines', 'Australia'];
  }
  
  if (lowerDest.includes('philippines') || lowerDest.includes('manila') || lowerDest.includes('cebu') || 
      lowerDest.includes('boracay') || lowerDest.includes('palawan')) {
    return ['Taiwan', 'Malaysia', 'Indonesia', 'Vietnam'];
  }
  
  if (lowerDest.includes('india') || lowerDest.includes('delhi') || lowerDest.includes('mumbai') || 
      lowerDest.includes('bangalore') || lowerDest.includes('goa') || lowerDest.includes('kerala')) {
    return ['Nepal', 'Sri Lanka', 'Bhutan', 'Maldives'];
  }
  
  if (lowerDest.includes('nepal') || lowerDest.includes('kathmandu') || lowerDest.includes('pokhara')) {
    return ['India', 'Tibet', 'Bhutan', 'Bangladesh'];
  }
  
  if (lowerDest.includes('sri lanka') || lowerDest.includes('colombo') || lowerDest.includes('kandy')) {
    return ['India', 'Maldives', 'Bangladesh', 'Myanmar'];
  }
  
  if (lowerDest.includes('maldives') || lowerDest.includes('male')) {
    return ['Sri Lanka', 'India', 'Mauritius', 'Seychelles'];
  }
  
  // Middle East
  if (lowerDest.includes('united arab emirates') || lowerDest.includes('uae') || lowerDest.includes('dubai') || 
      lowerDest.includes('abu dhabi') || lowerDest.includes('sharjah')) {
    return ['Oman', 'Qatar', 'Saudi Arabia', 'Bahrain'];
  }
  
  if (lowerDest.includes('qatar') || lowerDest.includes('doha')) {
    return ['UAE', 'Bahrain', 'Saudi Arabia', 'Kuwait'];
  }
  
  if (lowerDest.includes('oman') || lowerDest.includes('muscat')) {
    return ['UAE', 'Yemen', 'Saudi Arabia', 'Iran'];
  }
  
  if (lowerDest.includes('saudi arabia') || lowerDest.includes('riyadh') || lowerDest.includes('jeddah') || 
      lowerDest.includes('mecca')) {
    return ['UAE', 'Jordan', 'Kuwait', 'Qatar'];
  }
  
  if (lowerDest.includes('jordan') || lowerDest.includes('amman') || lowerDest.includes('petra')) {
    return ['Israel', 'Syria', 'Saudi Arabia', 'Iraq'];
  }
  
  if (lowerDest.includes('israel') || lowerDest.includes('tel aviv') || lowerDest.includes('jerusalem')) {
    return ['Jordan', 'Palestine', 'Lebanon', 'Egypt'];
  }
  
  if (lowerDest.includes('turkey') || lowerDest.includes('istanbul') || lowerDest.includes('ankara') || 
      lowerDest.includes('cappadocia') || lowerDest.includes('antalya')) {
    return ['Greece', 'Bulgaria', 'Georgia', 'Armenia'];
  }
  
  if (lowerDest.includes('iran') || lowerDest.includes('tehran') || lowerDest.includes('isfahan')) {
    return ['Turkey', 'Iraq', 'Afghanistan', 'Armenia'];
  }
  
  // Africa
  if (lowerDest.includes('south africa') || lowerDest.includes('cape town') || lowerDest.includes('johannesburg') || 
      lowerDest.includes('durban') || lowerDest.includes('pretoria')) {
    return ['Namibia', 'Botswana', 'Zimbabwe', 'Lesotho'];
  }
  
  if (lowerDest.includes('egypt') || lowerDest.includes('cairo') || lowerDest.includes('alexandria') || 
      lowerDest.includes('luxor') || lowerDest.includes('aswan')) {
    return ['Jordan', 'Israel', 'Sudan', 'Libya'];
  }
  
  if (lowerDest.includes('morocco') || lowerDest.includes('marrakech') || lowerDest.includes('casablanca') || 
      lowerDest.includes('rabat') || lowerDest.includes('fez')) {
    return ['Spain', 'Portugal', 'Algeria', 'Tunisia'];
  }
  
  if (lowerDest.includes('tunisia') || lowerDest.includes('tunis') || lowerDest.includes('sousse')) {
    return ['Morocco', 'Algeria', 'Libya', 'Italy'];
  }
  
  if (lowerDest.includes('kenya') || lowerDest.includes('nairobi') || lowerDest.includes('mombasa')) {
    return ['Tanzania', 'Uganda', 'Ethiopia', 'Rwanda'];
  }
  
  if (lowerDest.includes('tanzania') || lowerDest.includes('dar es salaam') || lowerDest.includes('dodoma') || 
      lowerDest.includes('arusha') || lowerDest.includes('zanzibar')) {
    return ['Kenya', 'Uganda', 'Rwanda', 'Burundi'];
  }
  
  if (lowerDest.includes('uganda') || lowerDest.includes('kampala')) {
    return ['Kenya', 'Tanzania', 'Rwanda', 'Democratic Republic of Congo'];
  }
  
  if (lowerDest.includes('rwanda') || lowerDest.includes('kigali')) {
    return ['Uganda', 'Tanzania', 'Burundi', 'Democratic Republic of Congo'];
  }
  
  if (lowerDest.includes('ethiopia') || lowerDest.includes('addis ababa')) {
    return ['Kenya', 'Sudan', 'Eritrea', 'Somalia'];
  }
  
  if (lowerDest.includes('nigeria') || lowerDest.includes('lagos') || lowerDest.includes('abuja')) {
    return ['Ghana', 'Benin', 'Cameroon', 'Niger'];
  }
  
  if (lowerDest.includes('ghana') || lowerDest.includes('accra') || lowerDest.includes('kumasi')) {
    return ['Togo', 'Burkina Faso', 'Côte d\'Ivoire', 'Nigeria'];
  }
  
  if (lowerDest.includes('senegal') || lowerDest.includes('dakar')) {
    return ['Gambia', 'Mauritania', 'Mali', 'Guinea'];
  }
  
  if (lowerDest.includes('madagascar') || lowerDest.includes('antananarivo')) {
    return ['Mauritius', 'Comoros', 'Réunion', 'Seychelles'];
  }
  
  if (lowerDest.includes('mauritius') || lowerDest.includes('port louis')) {
    return ['Réunion', 'Madagascar', 'Seychelles', 'Rodrigues'];
  }
  
  if (lowerDest.includes('seychelles') || lowerDest.includes('victoria')) {
    return ['Mauritius', 'Madagascar', 'Comoros', 'Maldives'];
  }
  
  if (lowerDest.includes('zimbabwe') || lowerDest.includes('harare') || lowerDest.includes('bulawayo')) {
    return ['Botswana', 'South Africa', 'Zambia', 'Mozambique'];
  }
  
  if (lowerDest.includes('botswana') || lowerDest.includes('gaborone')) {
    return ['South Africa', 'Namibia', 'Zimbabwe', 'Zambia'];
  }
  
  if (lowerDest.includes('namibia') || lowerDest.includes('windhoek')) {
    return ['South Africa', 'Botswana', 'Angola', 'Zambia'];
  }
  
  if (lowerDest.includes('zambia') || lowerDest.includes('lusaka')) {
    return ['Zimbabwe', 'Botswana', 'Namibia', 'Malawi'];
  }
  
  if (lowerDest.includes('malawi') || lowerDest.includes('lilongwe') || lowerDest.includes('blantyre')) {
    return ['Zambia', 'Tanzania', 'Mozambique', 'Zimbabwe'];
  }
  
  if (lowerDest.includes('mozambique') || lowerDest.includes('maputo')) {
    return ['South Africa', 'Zimbabwe', 'Malawi', 'Tanzania'];
  }
  
  if (lowerDest.includes('angola') || lowerDest.includes('luanda')) {
    return ['Namibia', 'Zambia', 'Democratic Republic of Congo', 'Republic of Congo'];
  }
  
  // Oceania
  if (lowerDest.includes('australia') || lowerDest.includes('sydney') || lowerDest.includes('melbourne') || 
      lowerDest.includes('brisbane') || lowerDest.includes('perth') || lowerDest.includes('adelaide')) {
    return ['New Zealand', 'Fiji', 'Papua New Guinea', 'Indonesia'];
  }
  
  if (lowerDest.includes('new zealand') || lowerDest.includes('auckland') || lowerDest.includes('wellington') || 
      lowerDest.includes('christchurch') || lowerDest.includes('queenstown')) {
    return ['Australia', 'Fiji', 'Cook Islands', 'Samoa'];
  }
  
  if (lowerDest.includes('fiji') || lowerDest.includes('suva') || lowerDest.includes('nadi')) {
    return ['New Zealand', 'Australia', 'Vanuatu', 'Tonga'];
  }
  
  if (lowerDest.includes('papua new guinea') || lowerDest.includes('port moresby')) {
    return ['Australia', 'Indonesia', 'Solomon Islands', 'Philippines'];
  }
  
  if (lowerDest.includes('vanuatu') || lowerDest.includes('port vila')) {
    return ['Fiji', 'New Caledonia', 'Solomon Islands', 'Australia'];
  }
  
  if (lowerDest.includes('samoa') || lowerDest.includes('apia')) {
    return ['Fiji', 'Tonga', 'American Samoa', 'Cook Islands'];
  }
  
  if (lowerDest.includes('tonga') || lowerDest.includes('nuku\'alofa')) {
    return ['Fiji', 'Samoa', 'New Zealand', 'Cook Islands'];
  }
  
  if (lowerDest.includes('cook islands') || lowerDest.includes('rarotonga')) {
    return ['New Zealand', 'Samoa', 'Tonga', 'French Polynesia'];
  }
  
  if (lowerDest.includes('french polynesia') || lowerDest.includes('tahiti') || lowerDest.includes('bora bora')) {
    return ['Cook Islands', 'Fiji', 'Hawaii', 'New Zealand'];
  }
  
  if (lowerDest.includes('hawaii') || lowerDest.includes('honolulu') || lowerDest.includes('maui')) {
    return ['California', 'Alaska', 'French Polynesia', 'Fiji'];
  }
  
  // Default fallback for unknown destinations - global popular destinations
  return ['London, UK', 'Paris, France', 'Tokyo, Japan', 'New York, USA'];
};
