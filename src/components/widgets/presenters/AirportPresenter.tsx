import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                        <Plane className="w-4 h-4 text-white" />
                    </div>
                    Airport
                    <Plane className="w-3 h-3 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
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
