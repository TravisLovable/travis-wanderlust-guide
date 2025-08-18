import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Gift } from 'lucide-react';

interface HolidayData {
    holidays: Array<{
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
    totalHolidays: number;
    country: string;
    isLoading: boolean;
    hasData: boolean;
    userContext?: {
        homeCountry: string;
        homeRegion: string;
        homeCurrency: string;
        insights: {
            isHomeCountry: boolean;
            regionSimilarity: boolean;
            travelAdvice: string;
        };
    } | null;
}

interface HolidayPresenterProps {
    data: HolidayData;
    destination: string;
    dates: {
        checkin: string;
        checkout: string;
    };
}

const HolidayPresenter: React.FC<HolidayPresenterProps> = ({
    data,
    destination,
    dates
}) => {
    const { holidays, totalHolidays, country, isLoading, hasData, userContext } = data;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mr-2">
                            <Gift className="w-4 h-4 text-white" />
                        </div>
                        Holidays
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mr-2">
                        <Gift className="w-4 h-4 text-white" />
                    </div>
                    Holidays
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
                {hasData ? (
                    <>
                        <div className="text-center p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <div className="text-lg font-bold text-yellow-400">{totalHolidays}</div>
                            <div className="text-xs text-muted-foreground">Holidays during your stay</div>
                        </div>

                        {/* User Context Information */}
                        {userContext && (
                            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="text-xs text-blue-400 font-medium mb-1">
                                    🌍 Your Context: {userContext.homeCountry} → {country}
                                </div>
                                <div className="text-xs text-muted-foreground mb-1">
                                    {userContext.homeRegion} • {userContext.homeCurrency}
                                </div>
                                <div className="text-xs text-blue-300">
                                    💡 {userContext.insights.travelAdvice}
                                </div>
                            </div>
                        )}

                        {holidays.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Upcoming Holidays</h4>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {holidays.slice(0, 5).map((holiday, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg text-xs">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-3 h-3 text-yellow-400" />
                                                <span className="font-medium">{holiday.name}</span>
                                            </div>
                                            <span className="text-muted-foreground">{formatDate(holiday.date)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-6">
                        <Gift className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No holidays found during your stay</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default HolidayPresenter;
