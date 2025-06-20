import React, { useState, useRef, useEffect } from 'react';
import { MapPin, DollarSign, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AccommodationHeatMap = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const accommodationData = [
    { id: 1, name: 'Jardins Luxury Hotel', price: 'R$450', x: 45, y: 25, type: 'hotel', rating: 4.8 },
    { id: 2, name: 'Vila Madalena Boutique', price: 'R$380', x: 35, y: 35, type: 'boutique', rating: 4.6 },
    { id: 3, name: 'Paulista Business Tower', price: 'R$320', x: 50, y: 45, type: 'apartment', rating: 4.7 },
    { id: 4, name: 'Centro Histórico Hostel', price: 'R$85', x: 55, y: 55, type: 'hostel', rating: 4.4 },
    { id: 5, name: 'Brooklin Corporate Stay', price: 'R$280', x: 60, y: 65, type: 'apartment', rating: 4.3 },
    { id: 6, name: 'República Student House', price: 'R$120', x: 50, y: 60, type: 'shared', rating: 4.1 },
    { id: 7, name: 'Moema Residential', price: 'R$200', x: 65, y: 50, type: 'apartment', rating: 4.2 },
    { id: 8, name: 'Ibirapuera Park Hotel', price: 'R$420', x: 55, y: 40, type: 'hotel', rating: 4.5 },
    { id: 9, name: 'Vila Olímpia Executive', price: 'R$480', x: 70, y: 45, type: 'hotel', rating: 4.6 },
    { id: 10, name: 'Liberdade Cultural Stay', price: 'R$180', x: 45, y: 50, type: 'hostel', rating: 4.2 },
    { id: 11, name: 'Itaim Bibi Modern Loft', price: 'R$350', x: 65, y: 40, type: 'apartment', rating: 4.4 },
    { id: 12, name: 'Bela Vista Economy', price: 'R$95', x: 52, y: 58, type: 'hostel', rating: 3.9 }
  ];

  const districts = [
    { name: 'Jardins', x: 40, y: 20, width: 15, height: 15 },
    { name: 'Vila Madalena', x: 30, y: 30, width: 18, height: 12 },
    { name: 'Paulista', x: 45, y: 40, width: 12, height: 10 },
    { name: 'Centro', x: 50, y: 50, width: 15, height: 12 },
    { name: 'Brooklin', x: 55, y: 60, width: 20, height: 15 },
    { name: 'Vila Olímpia', x: 65, y: 40, width: 16, height: 14 },
    { name: 'Moema', x: 60, y: 45, width: 18, height: 12 }
  ];

  const streets = [
    { name: 'Marginal Tietê', path: 'M 10,20 L 90,25' },
    { name: 'Marginal Pinheiros', path: 'M 20,15 L 25,85' },
    { name: 'Av. Paulista', path: 'M 30,35 L 70,50' },
    { name: 'Av. Faria Lima', path: 'M 25,40 L 75,45' },
    { name: 'Av. 23 de Maio', path: 'M 50,20 L 55,80' }
  ];

  const getPriceColor = (price: string) => {
    const numPrice = parseInt(price.replace('R$', '').replace(',', ''));
    if (numPrice >= 350) return 'bg-red-500 border-red-600 text-white';
    if (numPrice >= 200) return 'bg-orange-500 border-orange-600 text-white';
    return 'bg-green-500 border-green-600 text-white';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      setIsSelecting(true);
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isSelecting) {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        setSelectedArea({
          x: Math.min(selectStart.x, currentX),
          y: Math.min(selectStart.y, currentY),
          width: Math.abs(currentX - selectStart.x),
          height: Math.abs(currentY - selectStart.y)
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSelecting(false);
  };

  const handleZoom = (zoomIn: boolean) => {
    setZoom(prev => {
      const newZoom = zoomIn ? Math.min(prev * 1.2, 3) : Math.max(prev / 1.2, 0.5);
      return newZoom;
    });
  };

  const clearSelection = () => {
    setSelectedArea(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsSelecting(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
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
        {/* Map Controls */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(true)}
              className="bg-secondary/50 border-border/50"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(false)}
              className="bg-secondary/50 border-border/50"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            {selectedArea && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="bg-red-500/20 border-red-500/50 text-red-300"
              >
                Clear Selection
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center space-x-2">
            <Move className="w-3 h-3" />
            <span>Drag to pan • Shift+drag to select</span>
          </div>
        </div>

        {/* Interactive São Paulo Map */}
        <div 
          ref={mapRef}
          className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl h-96 overflow-hidden border border-border/20 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Street Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-40">
              {streets.map((street, idx) => (
                <path
                  key={idx}
                  d={street.path}
                  stroke="#6B7280"
                  strokeWidth="2"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* District Labels */}
            {districts.map((district, idx) => (
              <div
                key={idx}
                className="absolute bg-slate-800/80 text-white text-xs px-2 py-1 rounded font-medium pointer-events-none"
                style={{
                  left: `${district.x}%`,
                  top: `${district.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {district.name}
              </div>
            ))}

            {/* Tietê River */}
            <div 
              className="absolute bg-blue-200/60 rounded-lg"
              style={{
                left: '10%', top: '15%', width: '80%', height: '8%'
              }}
            />

            {/* Pinheiros River */}
            <div 
              className="absolute bg-blue-200/60 rounded-lg transform rotate-90 origin-center"
              style={{
                left: '20%', top: '30%', width: '50%', height: '4%'
              }}
            />

            {/* Ibirapuera Park */}
            <div 
              className="absolute bg-green-300/40 rounded-lg border-2 border-green-500/30"
              style={{
                left: '50%', top: '35%', width: '12%', height: '15%'
              }}
            />

            {/* Major Avenues */}
            <div className="absolute inset-0">
              <div 
                className="absolute bg-yellow-500/30 rounded-full"
                style={{
                  left: '30%', top: '42%', width: '40%', height: '3px'
                }}
              />
              <div 
                className="absolute bg-purple-500/30 rounded-full"
                style={{
                  left: '48%', top: '20%', width: '4px', height: '60%'
                }}
              />
            </div>

            {/* Accommodation Points */}
            {accommodationData.map((point) => (
              <div
                key={point.id}
                className={`absolute rounded-lg border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform group/point font-medium text-sm px-2 py-1 ${getPriceColor(point.price)}`}
                style={{ 
                  left: `${point.x}%`, 
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {point.price}
                
                {/* Detailed Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/point:opacity-100 transition-opacity bg-card border border-border/50 rounded-lg p-3 text-xs whitespace-nowrap shadow-xl z-20 min-w-48">
                  <div className="font-semibold text-foreground mb-1">{point.name}</div>
                  <div className="text-muted-foreground mb-2">
                    {point.type} • ⭐ {point.rating}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-bold">{point.price}/night</span>
                    <span className="text-xs text-muted-foreground">avg rate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selection Area */}
          {selectedArea && (
            <div
              className="absolute border-2 border-blue-400 bg-blue-400/10 rounded pointer-events-none"
              style={{
                left: selectedArea.x,
                top: selectedArea.y,
                width: selectedArea.width,
                height: selectedArea.height
              }}
            />
          )}
        </div>

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
          <p><span className="font-medium">Interactive Map:</span> Detailed São Paulo districts with real street layout</p>
          <p><span className="font-medium">Updated:</span> 8 minutes ago</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationHeatMap;
