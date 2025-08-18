import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2">
                        <Car className="w-4 h-4 text-white" />
                    </div>
                    Transport
                    <Car className="w-3 h-3 ml-auto text-indigo-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
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
