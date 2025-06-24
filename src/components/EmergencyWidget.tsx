
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

interface EmergencyWidgetProps {
  destination: string;
}

const EmergencyWidget = ({ destination }: EmergencyWidgetProps) => {
  // Mock data for demo purposes
  const getEmergencyInfo = (dest: string) => {
    if (dest.toLowerCase().includes('brazil')) {
      return { police: '190', medical: '192', fire: '193' };
    }
    if (dest.toLowerCase().includes('japan')) {
      return { police: '110', medical: '119', fire: '119' };
    }
    return { police: '911', medical: '911', fire: '911' };
  };

  const emergencyInfo = getEmergencyInfo(destination);

  return (
    <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mr-2 shadow-md">
            <Phone className="w-4 h-4 text-white" />
          </div>
          Emergency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Police</span>
            <span className="text-sm font-bold text-red-400">{emergencyInfo.police}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Medical</span>
            <span className="text-sm font-bold text-red-400">{emergencyInfo.medical}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Fire</span>
            <span className="text-sm font-bold text-red-400">{emergencyInfo.fire}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyWidget;
