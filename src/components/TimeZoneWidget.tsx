
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeZoneWidgetProps {
  destination: string;
}

const TimeZoneWidget = ({ destination }: TimeZoneWidgetProps) => {
  // Mock data for now - this would be replaced with actual API call
  const getTimeZoneInfo = (dest: string) => {
    // Simple mapping for demo purposes
    if (dest.toLowerCase().includes('brazil')) {
      return { timezone: 'BRT', offset: 'UTC-3', localTime: new Date().toLocaleTimeString() };
    }
    if (dest.toLowerCase().includes('japan')) {
      return { timezone: 'JST', offset: 'UTC+9', localTime: new Date().toLocaleTimeString() };
    }
    return { timezone: 'UTC', offset: 'UTC+0', localTime: new Date().toLocaleTimeString() };
  };

  const timeInfo = getTimeZoneInfo(destination);

  return (
    <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 shadow-md">
            <Clock className="w-4 h-4 text-white" />
          </div>
          Time Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{timeInfo.localTime}</div>
          <div className="text-xs text-muted-foreground">{timeInfo.timezone} ({timeInfo.offset})</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeZoneWidget;
