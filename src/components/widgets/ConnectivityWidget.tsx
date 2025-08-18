import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi } from 'lucide-react';

const ConnectivityWidget: React.FC = () => {
    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-2">
                        <Wifi className="w-4 h-4 text-white" />
                    </div>
                    Connectivity
                    <Wifi className="w-3 h-3 ml-auto text-teal-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
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
