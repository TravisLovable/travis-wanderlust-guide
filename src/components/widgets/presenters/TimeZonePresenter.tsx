import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap } from 'lucide-react';

interface TimeZoneData {
    origin: {
        time: string;
        time12: string;
        abbreviation: string;
    };
    destination: {
        time: string;
        time12: string;
        abbreviation: string;
    };
    timeDifferenceText: string;
    isLoading: boolean;
    destinationName: string;
}

interface TimeZonePresenterProps {
    data: TimeZoneData;
}

const TimeZonePresenter: React.FC<TimeZonePresenterProps> = ({ data }) => {
    const { origin, destination, timeDifferenceText, isLoading, destinationName } = data;

    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-2">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                        Time Zone
                        <Zap className="w-3 h-3 ml-auto text-blue-400 group-hover:scale-110 transition-transform" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-2">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    Time Zone
                    <Zap className="w-3 h-3 ml-auto text-blue-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1 font-medium">YOUR TIME</div>
                        <div className="text-lg font-bold text-blue-400">
                            {origin.time12}
                        </div>
                        <div className="text-xs text-muted-foreground opacity-75">
                            {origin.time}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                            {origin.abbreviation}
                        </div>
                    </div>
                    <div className="text-center p-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">
                            {destinationName}
                        </div>
                        <div className="text-lg font-bold text-blue-300">
                            {destination.time12}
                        </div>
                        <div className="text-xs text-muted-foreground opacity-75">
                            {destination.time}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                            {destination.abbreviation}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Clock className="w-3 h-3 mr-1 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">
                        {timeDifferenceText}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeZonePresenter;
