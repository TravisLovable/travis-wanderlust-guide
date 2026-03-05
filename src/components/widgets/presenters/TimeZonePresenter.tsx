import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Sunrise, Sunset } from 'lucide-react';

interface SunData {
    sunrise: string;
    sunset: string;
    currentHour: number;
    sunriseHour: number;
    sunsetHour: number;
}

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
    destinationTimeZone?: string | null;
    sunData?: SunData;
}

interface TimeZonePresenterProps {
    data: TimeZoneData;
}

const TimeZonePresenter: React.FC<TimeZonePresenterProps> = ({ data }) => {
    const { origin, destination, timeDifferenceText, isLoading, destinationName, destinationTimeZone, sunData } = data;

    // Sun position on arc: 0 = sunrise (left), 1 = sunset (right). Quadratic path M 0 20 Q 50 0 100 20.
    let sunProgress = sunData
        ? Math.max(0, Math.min(1, (sunData.currentHour - sunData.sunriseHour) / (sunData.sunsetHour - sunData.sunriseHour || 1)))
        : 0.5;

    const sunX = sunProgress * 100;
    const sunY = 20 * (1 - 2 * sunProgress + 2 * sunProgress * sunProgress);
    sunProgress = 0.5;

    if (isLoading) {
        return (
            <Card className="travis-card travis-interactive group">
                <CardHeader className="p-0 pb-2">
                    <div className="widget-header">
                        <div className="widget-icon bg-blue-500/10 text-blue-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="widget-title">Local Time</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-0 pt-0">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </CardContent>
            </Card>
        );
    }

    const locationLabel = destinationTimeZone || destinationName;

    return (
        <Card className="travis-card travis-interactive group lg:col-span-2 xl:col-span-2 h-full flex flex-col">
            <CardHeader className="p-0 pb-2">
                <div className="widget-header">
                    <div className="widget-icon bg-blue-500/10 text-blue-500">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="widget-title">Local Time</h3>
                        <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                            {locationLabel}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 pt-0 flex flex-col space-y-4">
                {/* Destination time — hero */}
                <div>
                    <div className="text-3xl font-bold tracking-tight text-foreground">
                        {destination.time12}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {destination.abbreviation}
                        {destination.time !== destination.time12 && (
                            <span className="ml-1.5 opacity-80">· {destination.time}</span>
                        )}
                    </p>
                </div>

                {/* Your time + difference — compact */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        Your time: <span className="font-medium text-foreground/90">{origin.time12}</span>
                        <span className="ml-1 font-mono opacity-90">{origin.abbreviation}</span>
                    </span>
                    <span className="text-muted-foreground/70">·</span>
                    <span className="text-blue-400/90 font-medium">{timeDifferenceText}</span>
                </div>

                {/* Daylight cycle — arc and sun in same SVG so sun stays on the path */}
                {sunData && (
                    <div className="mt-auto pt-4">
                        <div className="w-full">
                            <svg viewBox="0 0 100 24" className="w-full h-8 text-sky-400/40 dark:text-sky-500/30" preserveAspectRatio="none">
                                <path
                                    d="M 0 20 Q 50 0 100 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                                <g className="transition-all duration-500 ease-out">
                                    <circle cx={sunX} cy={sunY} r="3" fill="rgb(251 191 36 / 0.4)" />
                                    <circle cx={sunX} cy={sunY} r="1.8" fill="rgb(253 224 71)" stroke="rgb(254 243 199 / 0.8)" strokeWidth="0.5" />
                                </g>
                            </svg>
                        </div>
                        <div className="flex justify-between items-center mt-1.5 text-[10px] text-muted-foreground/80">
                            <span className="flex items-center gap-1">
                                <Sunrise className="w-3.5 h-3.5 text-sky-500/70" strokeWidth={1.5} />
                                {sunData.sunrise}
                            </span>
                            <span className="flex items-center gap-1">
                                {sunData.sunset}
                                <Sunset className="w-3.5 h-3.5 text-sky-500/70" strokeWidth={1.5} />
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TimeZonePresenter;
