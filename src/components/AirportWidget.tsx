
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface AirportWidgetProps {
  destination: string;
}

const AirportWidget = ({ destination }: AirportWidgetProps) => {
  // Mock data for demo purposes
  const getAirportInfo = (dest: string) => {
    if (dest.toLowerCase().includes('são paulo') || dest.toLowerCase().includes('brazil')) {
      return { code: 'GRU', name: 'Guarulhos Intl', distance: '25 km' };
    }
    if (dest.toLowerCase().includes('tokyo') || dest.toLowerCase().includes('japan')) {
      return { code: 'NRT', name: 'Narita Intl', distance: '60 km' };
    }
    return { code: 'JFK', name: 'Kennedy Intl', distance: '20 km' };
  };

  const airportInfo = getAirportInfo(destination);

  return (
    <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mr-2 shadow-md">
            <Plane className="w-4 h-4 text-white" />
          </div>
          Airport
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-center">
          <div className="text-lg font-bold text-sky-400">{airportInfo.code}</div>
          <div className="text-xs text-muted-foreground">{airportInfo.name}</div>
          <div className="text-xs text-muted-foreground/70">{airportInfo.distance}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirportWidget;
