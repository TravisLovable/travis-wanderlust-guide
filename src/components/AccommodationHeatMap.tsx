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
    { id: 1, name: 'Shibuya Luxury Hotel', price: '¥45,000', x: 45, y: 25, type: 'hotel', rating: 4.8 },
    { id: 2, name: 'Shinjuku Business Tower', price: '¥38,000', x: 60, y: 35, type: 'apartment', rating: 4.6 },
    { id: 3, name: 'Ginza Boutique Stay', price: '¥35,000', x: 50, y: 45, type: 'boutique', rating: 4.7 },
    { id: 4, name: 'Harajuku Youth Hostel', price: '¥8,500', x: 35, y: 55, type: 'hostel', rating: 4.4 },
    { id: 5, name: 'Sumida River Apartment', price: '¥22,000', x: 70, y: 60, type: 'apartment', rating: 4.3 },
    { id: 6, name: 'University District Share', price: '¥12,000', x: 25, y: 70, type: 'shared', rating: 4.1 },
    { id: 7, name: 'Suburban Tokyo Stay', price: '¥15,000', x: 80, y: 80, type: 'apartment', rating: 4.0 },
    { id: 8, name: 'Imperial Palace Hotel', price: '¥42,000', x: 55, y: 30, type: 'boutique', rating: 4.5 },
    { id: 9, name: 'Odaiba Bay Resort', price: '¥48,000', x: 75, y: 40, type: 'hotel', rating: 4.6 },
    { id: 10, name: 'Ueno Cultural Stay', price: '¥18,000', x: 40, y: 65, type: 'hostel', rating: 4.2 }
  ];

  const districts = [
    { name: 'Shibuya', x: 40, y: 20, width: 15, height: 15 },
    { name: 'Shinjuku', x: 55, y: 30, width: 18, height: 12 },
    { name: 'Ginza', x: 45, y: 40, width: 12, height: 10 },
    { name: 'Harajuku', x: 30, y: 50, width: 15, height: 12 },
    { name: 'Sumida', x: 65, y: 55, width: 20, height: 15 },
    { name: 'Ueno', x: 35, y: 60, width: 16, height: 14 },
    { name: 'Odaiba', x: 70, y: 35, width: 18, height: 12 }
  ];

  const streets = [
    { name: 'Yamanote Line', path: 'M 20,30 Q 50,20 80,30 Q 90,50 80,70 Q 50,80 20,70 Q 10,50 20,30 Z' },
    { name: 'Chuo Line', path: 'M 0,45 L 100,55' },
    { name: 'Odakyu Line', path: 'M 30,20 L 70,80' },
    { name: 'Ginza Line', path: 'M 40,10 L 60,90' }
  ];

  const getPriceColor = (price: string) => {
    const numPrice = parseInt(price.replace('¥', '').replace(',', ''));
    if (numPrice >= 35000) return 'bg-red-500 border-red-600 text-white';
    if (numPrice >= 20000) return 'bg-orange-500 border-orange-600 text-white';
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
          Tokyo Accommodation Map
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

        {/* Interactive Tokyo Map */}
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

            {/* Tokyo Bay */}
            <div 
              className="absolute bg-blue-200/60 rounded-lg"
              style={{
                left: '70%', top: '60%', width: '25%', height: '30%'
              }}
            />

            {/* Imperial Palace */}
            <div 
              className="absolute bg-green-300/40 rounded-lg border-2 border-green-500/30"
              style={{
                left: '50%', top: '35%', width: '8%', height: '10%'
              }}
            />

            {/* Major Railway Lines */}
            <div className="absolute inset-0">
              <div 
                className="absolute bg-purple-500/30 rounded-full"
                style={{
                  left: '20%', top: '25%', width: '60%', height: '4px'
                }}
              />
              <div 
                className="absolute bg-green-500/30 rounded-full"
                style={{
                  left: '45%', top: '15%', width: '4px', height: '70%'
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
                <span className="text-sm">¥ Budget (Under ¥20k)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm">¥¥ Mid-range</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">¥¥¥ Premium</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-secondary/20 rounded-xl">
            <div className="text-sm">
              <p><span className="font-medium text-emerald-400">Average:</span> ¥26,500/night</p>
              <p><span className="font-medium text-emerald-400">Range:</span> ¥8,500 - ¥48,000</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><span className="font-medium">Interactive Map:</span> Detailed Tokyo districts with real street layout</p>
          <p><span className="font-medium">Updated:</span> 8 minutes ago</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationHeatMap;
