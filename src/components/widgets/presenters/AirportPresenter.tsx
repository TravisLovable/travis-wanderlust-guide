import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface AirportData {
    code: string;
    name: string;
    address: string;
    distance: string;
    travelTime: string;
    options: string;
}

interface AirportPresenterProps {
    data: AirportData;
}

const AirportPresenter: React.FC<AirportPresenterProps> = ({ data }) => {
    const { code, name, address, distance, travelTime, options } = data;

    return (
        <Card className="travis-card travis-interactive group lg:col-span-2 xl:col-span-2 h-full flex flex-col">
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-purple-500/10 text-purple-500">
                        <Plane className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Airport</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 p-0 pt-0">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <div className="font-bold text-lg text-purple-700">{code}</div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-muted-foreground">{address}</div>
                </div>
                <div className="text-xs space-y-1">
                    <p><span className="font-medium">Distance:</span> {distance}</p>
                    <p><span className="font-medium">Travel time:</span> {travelTime}</p>
                    <p><span className="font-medium">Options:</span> {options}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AirportPresenter;
