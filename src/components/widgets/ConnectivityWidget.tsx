import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Wifi } from 'lucide-react';

const ConnectivityWidget: React.FC = () => {
    return (
        <Card className="travis-card travis-interactive group h-full flex flex-col">
            <CardHeader className="p-5 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-teal-500/10 text-teal-500">
                        <Wifi className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Connectivity</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 p-5 pt-0">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <h4 className="font-medium text-cyan-700 mb-1 text-sm">Free Wi-Fi Spots</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Shopping malls</li>
                        <li>• Starbucks, McDonald's</li>
                        <li>• Metro stations (WiFi Livre SP)</li>
                    </ul>
                </div>
                <div className="text-xs">
                    <p><span className="font-medium">Mobile coverage:</span> Excellent in urban areas</p>
                    <p><span className="font-medium">SIM cards:</span> Available at airports and shops</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ConnectivityWidget;
