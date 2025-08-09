import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface EmergencyData {
    police: string;
    medical: string;
    fire: string;
}

interface EmergencyWidgetProps {
    emergencyData: EmergencyData;
}

const EmergencyWidget: React.FC<EmergencyWidgetProps> = ({ emergencyData }) => {
    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    Emergency
                    <Shield className="w-3 h-3 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="font-bold text-red-700 text-sm">{emergencyData.police}</div>
                        <div className="text-xs text-muted-foreground">Police</div>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="font-bold text-red-700 text-sm">{emergencyData.medical}</div>
                        <div className="text-xs text-muted-foreground">Medical</div>
                    </div>
                </div>
                <div className="text-xs space-y-1">
                    <p><span className="font-medium">Fire:</span> {emergencyData.fire}</p>
                    <p><span className="font-medium">Tourist Info:</span> Check locally</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default EmergencyWidget;
