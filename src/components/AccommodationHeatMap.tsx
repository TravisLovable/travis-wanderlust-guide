
import React from 'react';
import { MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AccommodationHeatMap = () => {
  const heatMapData = [
    { name: 'City Center', price: '$$$', avgCost: '$280/night', x: 45, y: 30, color: 'bg-red-500' },
    { name: 'Business District', price: '$$$', avgCost: '$320/night', x: 55, y: 40, color: 'bg-red-500' },
    { name: 'Arts Quarter', price: '$$', avgCost: '$180/night', x: 30, y: 50, color: 'bg-orange-500' },
    { name: 'Riverside', price: '$$', avgCost: '$160/night', x: 70, y: 60, color: 'bg-orange-500' },
    { name: 'University Area', price: '$', avgCost: '$95/night', x: 25, y: 70, color: 'bg-green-500' },
    { name: 'Suburbs', price: '$', avgCost: '$75/night', x: 80, y: 80, color: 'bg-green-500' },
  ];

  return (
    <Card className="travis-card travis-interactive group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          Accommodation Heat Map
          <DollarSign className="w-4 h-4 ml-auto text-emerald-400 group-hover:scale-110 transition-transform" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl h-64 overflow-hidden border border-border/20">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          {/* Heat map points */}
          {heatMapData.map((point, index) => (
            <div
              key={index}
              className={`absolute w-4 h-4 ${point.color} rounded-full border-2 border-white/80 shadow-lg cursor-pointer hover:scale-125 transition-transform group/point`}
              style={{ 
                left: `${point.x}%`, 
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/point:opacity-100 transition-opacity bg-card border border-border/50 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl z-10">
                <div className="font-semibold">{point.name}</div>
                <div className="text-muted-foreground">{point.avgCost}</div>
                <div className="flex items-center">
                  <span className="text-emerald-400">{point.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">$ Budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm">$$ Mid-range</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">$$$ Premium</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Hover for details
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><span className="font-medium">Average nightly rates:</span> Based on 4-star accommodations</p>
          <p><span className="font-medium">Updated:</span> 15 minutes ago</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationHeatMap;
