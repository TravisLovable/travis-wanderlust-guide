import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Car } from 'lucide-react';

interface TransportData {
    primary: string;
    secondary: string;
    metroPass: string;
    busFare: string;
    card: string;
}

interface TransportWidgetProps {
    transportData: TransportData;
}

const TransportWidget: React.FC<TransportWidgetProps> = ({ transportData }) => {
    return (
        <Card className="travis-card travis-interactive group h-full flex flex-col">
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-indigo-500/10 text-indigo-500">
                        <Car className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Transport</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 p-0 pt-0">
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                        <div className="font-medium text-indigo-700 text-sm">{transportData.primary}</div>
                        <div className="text-xs text-muted-foreground">Network</div>
                    </div>
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                        <div className="font-medium text-indigo-700 text-sm">{transportData.secondary}</div>
                        <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                </div>
                <div className="text-xs space-y-1">
                    <p><span className="font-medium">Transit pass:</span> {transportData.metroPass}</p>
                    <p><span className="font-medium">Bus fare:</span> {transportData.busFare}</p>
                    <p><span className="font-medium">Card:</span> {transportData.card}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default TransportWidget;
