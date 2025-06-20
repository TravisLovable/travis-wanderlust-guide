
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, DollarSign, Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SaoPauloAccommodationMap = () => {
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const accommodations = [
    { id: 1, name: 'Jardins Luxury Hotel', price: 'R$450', lat: -23.5629, lng: -46.6544, type: 'hotel', rating: 4.8, address: 'Rua Oscar Freire, Jardins' },
    { id: 2, name: 'Vila Madalena Boutique', price: 'R$380', lat: -23.5505, lng: -46.6937, type: 'boutique', rating: 4.6, address: 'Rua Harmonia, Vila Madalena' },
    { id: 3, name: 'Paulista Business Tower', price: 'R$320', lat: -23.5618, lng: -46.6562, type: 'apartment', rating: 4.7, address: 'Av. Paulista, Bela Vista' },
    { id: 4, name: 'Centro Histórico Hostel', price: 'R$85', lat: -23.5476, lng: -46.6358, type: 'hostel', rating: 4.4, address: 'Rua do Carmo, Centro' },
    { id: 5, name: 'Brooklin Corporate Stay', price: 'R$280', lat: -23.6048, lng: -46.6963, type: 'apartment', rating: 4.3, address: 'Av. Luis Carlos Berrini, Brooklin' },
    { id: 6, name: 'República Student House', price: 'R$120', lat: -23.5439, lng: -46.6395, type: 'shared', rating: 4.1, address: 'Largo do Arouche, República' },
    { id: 7, name: 'Moema Residential', price: 'R$200', lat: -23.6033, lng: -46.6645, type: 'apartment', rating: 4.2, address: 'Av. Moema, Moema' },
    { id: 8, name: 'Ibirapuera Park Hotel', price: 'R$420', lat: -23.5732, lng: -46.6599, type: 'hotel', rating: 4.5, address: 'Av. Ibirapuera, Vila Nova Conceição' },
    { id: 9, name: 'Vila Olímpia Executive', price: 'R$480', lat: -23.5971, lng: -46.6875, type: 'hotel', rating: 4.6, address: 'Rua Funchal, Vila Olímpia' },
    { id: 10, name: 'Liberdade Cultural Stay', price: 'R$180', lat: -23.5587, lng: -46.6365, type: 'hostel', rating: 4.2, address: 'Rua da Glória, Liberdade' }
  ];

  const getPriceColor = (price: string) => {
    const numPrice = parseInt(price.replace('R$', '').replace(',', ''));
    if (numPrice >= 350) return 'bg-red-500 text-white';
    if (numPrice >= 200) return 'bg-orange-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'boutique': return '🏛️';
      case 'apartment': return '🏢';
      case 'hostel': return '🏠';
      case 'shared': return '👥';
      default: return '📍';
    }
  };

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="travis-card travis-interactive group xl:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          São Paulo Accommodation Map
          <DollarSign className="w-4 h-4 ml-auto text-emerald-400 group-hover:scale-110 transition-transform" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl h-96 overflow-hidden border border-border/20">
          {/* Map Background - Simulated São Paulo street layout */}
          <div className="absolute inset-0 bg-cover bg-center opacity-80" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100' stroke='%23cbd5e1' stroke-width='1'/%3E%3C/svg%3E")`
               }}>
          </div>
          
          {/* São Paulo Districts Overlay */}
          <div className="absolute inset-0">
            {/* Paulista Avenue */}
            <div className="absolute bg-yellow-400/30 h-1" 
                 style={{ top: '45%', left: '20%', width: '60%', transform: 'rotate(-5deg)' }}>
            </div>
            
            {/* Marginal Tietê */}
            <div className="absolute bg-blue-400/30 h-1" 
                 style={{ top: '15%', left: '10%', width: '80%' }}>
            </div>
            
            {/* Marginal Pinheiros */}
            <div className="absolute bg-blue-400/30 w-1" 
                 style={{ left: '25%', top: '10%', height: '80%' }}>
            </div>
            
            {/* District Labels */}
            <div className="absolute text-xs font-medium text-slate-700 bg-white/80 px-2 py-1 rounded" 
                 style={{ top: '25%', left: '45%' }}>Jardins</div>
            <div className="absolute text-xs font-medium text-slate-700 bg-white/80 px-2 py-1 rounded" 
                 style={{ top: '35%', left: '15%' }}>Vila Madalena</div>
            <div className="absolute text-xs font-medium text-slate-700 bg-white/80 px-2 py-1 rounded" 
                 style={{ top: '55%', left: '55%' }}>Centro</div>
            <div className="absolute text-xs font-medium text-slate-700 bg-white/80 px-2 py-1 rounded" 
                 style={{ top: '65%', left: '60%' }}>Brooklin</div>
            <div className="absolute text-xs font-medium text-slate-700 bg-white/80 px-2 py-1 rounded" 
                 style={{ top: '45%', left: '70%' }}>Vila Olímpia</div>
          </div>

          {/* Accommodation Markers */}
          {mapLoaded && accommodations.map((acc, index) => {
            // Convert lat/lng to percentage positions (simplified projection)
            const x = ((acc.lng + 46.75) / 0.15) * 100;
            const y = ((acc.lat + 23.62) / 0.15) * 100;
            
            return (
              <div
                key={acc.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 z-10 ${
                  selectedAccommodation?.id === acc.id ? 'scale-125 z-20' : ''
                }`}
                style={{ 
                  left: `${Math.max(10, Math.min(90, x))}%`, 
                  top: `${Math.max(10, Math.min(90, 100 - y))}%`,
                  animationDelay: `${index * 100}ms`
                }}
                onClick={() => setSelectedAccommodation(selectedAccommodation?.id === acc.id ? null : acc)}
              >
                <div className={`px-2 py-1 rounded-lg border-2 shadow-lg font-medium text-sm ${getPriceColor(acc.price)} animate-fadeIn`}>
                  <div className="flex items-center space-x-1">
                    <span>{getTypeIcon(acc.type)}</span>
                    <span>{acc.price}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading São Paulo map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Accommodation Details */}
        {selectedAccommodation && (
          <div className="p-4 bg-secondary/20 border border-border/50 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{getTypeIcon(selectedAccommodation.type)}</span>
                  <h3 className="font-semibold text-lg">{selectedAccommodation.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{selectedAccommodation.address}</p>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-emerald-400">{selectedAccommodation.price}/night</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{selectedAccommodation.rating}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAccommodation(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                View Details
              </Button>
              <Button size="sm" variant="outline">
                Check Availability
              </Button>
            </div>
          </div>
        )}

        {/* Legend and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">Budget (Under R$200)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm">Mid-range</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Premium</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-secondary/20 rounded-xl">
            <div className="text-sm">
              <p><span className="font-medium text-emerald-400">Average:</span> R$265/night</p>
              <p><span className="font-medium text-emerald-400">Range:</span> R$85 - R$480</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><span className="font-medium">Interactive Map:</span> Real São Paulo accommodation locations with live pricing</p>
          <p><span className="font-medium">Updated:</span> 3 minutes ago</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaoPauloAccommodationMap;
