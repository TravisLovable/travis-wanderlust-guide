import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Destination } from '@/types/destination';

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
    return (
        <Card className="travis-card travis-interactive group">
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-purple-500/10 text-purple-500">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Holidays</h3>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 p-0 pt-0">
                {isLoadingHolidays ? (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    </div>
                ) : (
                    <>
                        {holidayData && holidayData.upcomingHolidays.length > 0 ? (
                            <>
                                <div className="text-xs text-purple-300 mb-2 font-medium">
                                    During your trip to {destination.displayName}:
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
                                <div className="text-muted-foreground text-sm">No holidays during your travel dates</div>
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
