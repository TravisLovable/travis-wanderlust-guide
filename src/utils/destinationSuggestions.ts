
interface PinnedLocation {
  name: string;
  type: string;
}

export const getDestinationSuggestions = (destination: string): PinnedLocation[] => {
  const normalizedDestination = destination.toLowerCase();
  
  // Lima, Peru suggestions
  if (normalizedDestination.includes('lima')) {
    return [
      { name: 'Miraflores', type: 'neighborhood' },
      { name: 'San Isidro', type: 'neighborhood' },
      { name: 'Barranco', type: 'neighborhood' },
      { name: 'Cusco', type: 'city' },
      { name: 'Machu Picchu', type: 'landmark' },
      { name: 'Sacred Valley', type: 'region' }
    ];
  }

  // São Paulo, Brazil suggestions
  if (normalizedDestination.includes('são paulo') || normalizedDestination.includes('sao paulo')) {
    return [
      { name: 'Vila Madalena', type: 'neighborhood' },
      { name: 'Jardins', type: 'neighborhood' },
      { name: 'Liberdade', type: 'neighborhood' },
      { name: 'Centro Histórico', type: 'area' },
      { name: 'Ibirapuera Park', type: 'landmark' },
      { name: 'Paulista Avenue', type: 'landmark' }
    ];
  }

  // Rio de Janeiro, Brazil suggestions
  if (normalizedDestination.includes('rio de janeiro') || normalizedDestination.includes('rio')) {
    return [
      { name: 'Copacabana', type: 'neighborhood' },
      { name: 'Ipanema', type: 'neighborhood' },
      { name: 'Santa Teresa', type: 'neighborhood' },
      { name: 'Christ the Redeemer', type: 'landmark' },
      { name: 'Sugarloaf Mountain', type: 'landmark' },
      { name: 'Lapa', type: 'neighborhood' }
    ];
  }

  // Buenos Aires, Argentina suggestions
  if (normalizedDestination.includes('buenos aires')) {
    return [
      { name: 'Palermo', type: 'neighborhood' },
      { name: 'San Telmo', type: 'neighborhood' },
      { name: 'Recoleta', type: 'neighborhood' },
      { name: 'Puerto Madero', type: 'area' },
      { name: 'La Boca', type: 'neighborhood' },
      { name: 'Belgrano', type: 'neighborhood' }
    ];
  }

  // Mexico City, Mexico suggestions
  if (normalizedDestination.includes('mexico city') || normalizedDestination.includes('ciudad de mexico')) {
    return [
      { name: 'Roma Norte', type: 'neighborhood' },
      { name: 'Condesa', type: 'neighborhood' },
      { name: 'Centro Histórico', type: 'area' },
      { name: 'Polanco', type: 'neighborhood' },
      { name: 'Coyoacán', type: 'neighborhood' },
      { name: 'Xochimilco', type: 'area' }
    ];
  }

  // Paris, France suggestions
  if (normalizedDestination.includes('paris')) {
    return [
      { name: 'Marais', type: 'neighborhood' },
      { name: 'Saint-Germain', type: 'neighborhood' },
      { name: 'Montmartre', type: 'neighborhood' },
      { name: 'Champs-Élysées', type: 'area' },
      { name: 'Latin Quarter', type: 'neighborhood' },
      { name: 'Louvre', type: 'landmark' }
    ];
  }

  // London, UK suggestions
  if (normalizedDestination.includes('london')) {
    return [
      { name: 'Covent Garden', type: 'neighborhood' },
      { name: 'Shoreditch', type: 'neighborhood' },
      { name: 'Camden', type: 'neighborhood' },
      { name: 'Westminster', type: 'area' },
      { name: 'Notting Hill', type: 'neighborhood' },
      { name: 'Tower Bridge', type: 'landmark' }
    ];
  }

  // New York, USA suggestions
  if (normalizedDestination.includes('new york') || normalizedDestination.includes('nyc')) {
    return [
      { name: 'Manhattan', type: 'borough' },
      { name: 'Brooklyn', type: 'borough' },
      { name: 'Times Square', type: 'landmark' },
      { name: 'Central Park', type: 'landmark' },
      { name: 'SoHo', type: 'neighborhood' },
      { name: 'Greenwich Village', type: 'neighborhood' }
    ];
  }

  // Tokyo, Japan suggestions
  if (normalizedDestination.includes('tokyo')) {
    return [
      { name: 'Shibuya', type: 'neighborhood' },
      { name: 'Shinjuku', type: 'neighborhood' },
      { name: 'Harajuku', type: 'neighborhood' },
      { name: 'Ginza', type: 'neighborhood' },
      { name: 'Asakusa', type: 'neighborhood' },
      { name: 'Roppongi', type: 'neighborhood' }
    ];
  }

  // Default generic suggestions
  return [
    { name: 'City Center', type: 'area' },
    { name: 'Old Town', type: 'area' },
    { name: 'Downtown', type: 'area' },
    { name: 'Historic District', type: 'area' },
    { name: 'Main Square', type: 'landmark' },
    { name: 'Popular Markets', type: 'area' }
  ];
};
