
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface LocalEventsWidgetProps {
  destination: string;
  dates: {
    checkin: string;
    checkout: string;
  };
}

const LocalEventsWidget = ({ destination, dates }: LocalEventsWidgetProps) => {
  // Mock data for demo purposes
  const getLocalEvents = (dest: string) => {
    if (dest.toLowerCase().includes('brazil')) {
      return [
        { name: 'Carnival Celebration', date: 'Feb 2025', type: 'Festival' },
        { name: 'São Paulo Fashion Week', date: 'Mar 2025', type: 'Fashion' }
      ];
    }
    return [
      { name: 'Local Music Festival', date: 'Coming Soon', type: 'Music' },
      { name: 'Art Exhibition', date: 'This Month', type: 'Art' }
    ];
  };

  const events = getLocalEvents(destination);

  return (
    <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 shadow-md">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Local Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="border-l-2 border-indigo-500 pl-3">
              <div className="text-sm font-medium text-indigo-400">{event.name}</div>
              <div className="text-xs text-muted-foreground">{event.date} • {event.type}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalEventsWidget;
