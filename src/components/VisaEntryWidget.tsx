
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface VisaEntryWidgetProps {
  destination: string;
}

const VisaEntryWidget = ({ destination }: VisaEntryWidgetProps) => {
  // Mock data for demo purposes
  const getVisaInfo = (dest: string) => {
    if (dest.toLowerCase().includes('brazil')) {
      return { required: 'Visa Free', duration: '90 days', status: 'allowed' };
    }
    if (dest.toLowerCase().includes('japan')) {
      return { required: 'Visa Free', duration: '90 days', status: 'allowed' };
    }
    return { required: 'Check Requirements', duration: 'Varies', status: 'check' };
  };

  const visaInfo = getVisaInfo(destination);
  const statusColor = visaInfo.status === 'allowed' ? 'text-green-400' : 'text-yellow-400';

  return (
    <Card className="travis-card bg-gradient-to-br from-black via-gray-900 to-black border-gray-600 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-semibold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-2 shadow-md">
            <FileText className="w-4 h-4 text-white" />
          </div>
          Visa & Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-center">
          <div className={`text-sm font-bold ${statusColor}`}>{visaInfo.required}</div>
          <div className="text-xs text-muted-foreground">{visaInfo.duration}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisaEntryWidget;
