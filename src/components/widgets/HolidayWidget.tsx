import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Mountain } from 'lucide-react';
import { format } from 'date-fns';
import { Destination } from '@/types/destination';
import { getDestinationString } from '@/utils/destinationHelpers';

interface HolidayData {
    country: string;
    year: number;
    totalHolidays: number;
    upcomingHolidays: Array<{
        date: string;
        name: string;
        localName: string;
        countryCode: string;
        fixed: boolean;
        global: boolean;
        counties: string[] | null;
        type: string;
        region?: string;
    }>;
    allHolidays: Array<{
        date: string;
        name: string;
        localName: string;
        countryCode: string;
        fixed: boolean;
        global: boolean;
        counties: string[] | null;
        type: string;
        region?: string;
    }>;
    source?: string;
}

interface HolidayWidgetProps {
    holidayData: HolidayData | null;
    isLoadingHolidays: boolean;
    destination: Destination;
    dates: {
        checkin: string;
        checkout: string;
    };
}

const HolidayWidget: React.FC<HolidayWidgetProps> = ({
    holidayData,
    isLoadingHolidays,
    destination,
    dates
}) => {
    const destinationString = getDestinationString(destination);
    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    Holidays
                    <Mountain className="w-3 h-3 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoadingHolidays ? (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    </div>
                ) : (
                    <>
                        {holidayData && holidayData.upcomingHolidays.length > 0 ? (
                            <>
                                <div className="text-xs text-purple-300 mb-2 font-medium">
                                    During your trip to {destinationString}:
                                </div>
                                {holidayData.upcomingHolidays.map((holiday, idx) => (
                                    <div key={idx} className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                        <div className="font-medium text-purple-300 text-sm">{holiday.name}</div>
                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>
                                                {new Date(holiday.date).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            {holiday.region && holiday.region !== 'National' && (
                                                <span className="text-purple-400">
                                                    {holiday.region}
                                                </span>
                                            )}
                                        </div>
                                        {holiday.type && (
                                            <div className="text-xs text-purple-400 mt-1">
                                                {holiday.type === 'national' ? 'National' : holiday.type}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {holidayData.source && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Source: {holidayData.source === 'timeanddate' ? 'Time and Date API' : holidayData.source === 'multi-year-fetch' ? 'Multi-year Holiday API' : 'Public Holidays API'}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-2 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                                <div className="text-gray-400 text-sm">No holidays during your travel dates</div>
                                <div className="text-xs text-muted-foreground">
                                    {format(new Date(dates.checkin), 'MMM dd, yyyy')} - {format(new Date(dates.checkout), 'MMM dd, yyyy')}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default HolidayWidget;
