import React, { useMemo, useState, useEffect } from 'react';
import { Clock, Sunrise, Sunset, Camera, Moon } from 'lucide-react';

interface SunData {
    sunrise: string;
    sunset: string;
    currentHour: number;
    sunriseHour: number;
    sunsetHour: number;
    moonPhase?: string | null;
    moonIllumination?: number | null;
    isLive?: boolean;
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
    destinationCountryCode?: string;
    tzAbbreviation?: string;
    destinationTimeZone?: string | null;
    sunData?: SunData;
}

interface TimeZonePresenterProps {
    data: TimeZoneData;
}

/**
 * Compute "You are X hours behind/ahead" from the actual IANA timezone,
 * bypassing the edge function label entirely.
 *
 * Rule:
 *   diffHours = destUtcOffset - userUtcOffset
 *   diffHours > 0  → destination clock is later  → "You are X hours behind"
 *   diffHours < 0  → destination clock is earlier → "You are X hours ahead"
 */
const computeTimeDiffLabel = (destinationTimeZone: string | null | undefined): string => {
    if (!destinationTimeZone) return '';
    try {
        const now = new Date();

        const getOffsetHours = (tz: string): number => {
            const fmt = new Intl.DateTimeFormat('en-CA', {
                timeZone: tz,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false,
            });
            const p = fmt.formatToParts(now);
            const v = (type: string) => p.find(x => x.type === type)?.value ?? '00';
            const tzStr = `${v('year')}-${v('month')}-${v('day')}T${v('hour')}:${v('minute')}:${v('second')}`;
            return (new Date(tzStr).getTime() - now.getTime()) / 3_600_000;
        };

        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userOffset = getOffsetHours(userTz);
        const destOffset = getOffsetHours(destinationTimeZone);
        const diffHours = Math.round(destOffset - userOffset);

        console.log('🕐 TIME DIFF DEBUG:', {
            userTz,
            userOffset: userOffset.toFixed(2),
            destTz: destinationTimeZone,
            destOffset: destOffset.toFixed(2),
            diffHours,
        });

        if (diffHours === 0) return 'Same local time';
        const abs = Math.abs(diffHours);
        const unit = abs === 1 ? 'hour' : 'hours';
        // dest is later → user is behind
        return diffHours > 0
            ? `You are ${abs} ${unit} behind`
            : `You are ${abs} ${unit} ahead`;
    } catch (e) {
        console.error('Time diff calculation failed:', e);
        return '';
    }
};

const TimeZonePresenter: React.FC<TimeZonePresenterProps> = ({ data }) => {
    const { origin, destination, timeDifferenceText, isLoading, destinationName, destinationCountryCode, tzAbbreviation, destinationTimeZone, sunData } = data;

    // Live clock — ticks every second using the destination IANA timezone
    const [liveTime, setLiveTime] = useState<string | null>(null);
    useEffect(() => {
        if (!destinationTimeZone) return;
        const tick = () => {
            try {
                const now = new Date();
                const formatted = now.toLocaleTimeString('en-US', {
                    timeZone: destinationTimeZone,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
                setLiveTime(formatted);
            } catch {
                // Invalid timezone — fall back to API time
            }
        };
        tick();
        const interval = setInterval(tick, 10000);
        return () => clearInterval(interval);
    }, [destinationTimeZone]);

    const isDaytime = sunData
        ? sunData.currentHour >= sunData.sunriseHour && sunData.currentHour <= sunData.sunsetHour
        : true;

    // Day progress: 0 at sunrise, 1 at sunset
    const dayProgress = sunData
        ? Math.max(0, Math.min(1, (sunData.currentHour - sunData.sunriseHour) / (sunData.sunsetHour - sunData.sunriseHour || 1)))
        : 0.5;

    // Night progress: 0 at sunset, 1 at next sunrise
    // Night spans from sunset to next day's sunrise (crossing midnight)
    const nightProgress = useMemo(() => {
        if (!sunData || isDaytime) return 0;
        const { currentHour, sunsetHour, sunriseHour } = sunData;
        // Night duration: sunset to next sunrise (e.g., 18.5 to 30.2 = 6.2 + 24)
        const nightDuration = (24 - sunsetHour) + sunriseHour;
        let elapsed: number;
        if (currentHour >= sunsetHour) {
            // After sunset, same day
            elapsed = currentHour - sunsetHour;
        } else {
            // After midnight, before sunrise
            elapsed = (24 - sunsetHour) + currentHour;
        }
        return Math.max(0, Math.min(1, elapsed / (nightDuration || 1)));
    }, [sunData, isDaytime]);

    // Time until sunset (day) or sunrise (night)
    const timeRemaining = useMemo(() => {
        if (!sunData) return null;
        if (isDaytime) {
            const remaining = sunData.sunsetHour - sunData.currentHour;
            if (remaining <= 0) return null;
            const hours = Math.floor(remaining);
            const minutes = Math.round((remaining - hours) * 60);
            if (hours === 0) return `${minutes}m until sunset`;
            return `${hours}h ${minutes}m until sunset`;
        } else {
            const { currentHour, sunriseHour, sunsetHour } = sunData;
            let remaining: number;
            if (currentHour >= sunsetHour) {
                remaining = (24 - currentHour) + sunriseHour;
            } else {
                remaining = sunriseHour - currentHour;
            }
            const hours = Math.floor(remaining);
            const minutes = Math.round((remaining - hours) * 60);
            if (hours === 0) return `${minutes}m until sunrise`;
            return `${hours}h ${minutes}m until sunrise`;
        }
    }, [sunData, isDaytime]);

    // Dawn anticipation: within 30 min of sunrise at night
    const dawnApproaching = useMemo(() => {
        if (!sunData || isDaytime) return false;
        const { currentHour, sunriseHour, sunsetHour } = sunData;
        let remaining: number;
        if (currentHour >= sunsetHour) {
            remaining = (24 - currentHour) + sunriseHour;
        } else {
            remaining = sunriseHour - currentHour;
        }
        return remaining <= 0.5; // 30 minutes
    }, [sunData, isDaytime]);

    // Golden hour detection
    const goldenHourStatus = useMemo(() => {
        if (!sunData || !isDaytime) return null;
        const { currentHour, sunriseHour, sunsetHour } = sunData;
        if (currentHour >= sunriseHour && currentHour <= sunriseHour + 1) {
            const remaining = Math.round((sunriseHour + 1 - currentHour) * 60);
            return { label: 'Golden hour', remaining: `${remaining}m left` };
        }
        if (currentHour >= sunsetHour - 1 && currentHour <= sunsetHour) {
            const remaining = Math.round((sunsetHour - currentHour) * 60);
            return { label: 'Golden hour', remaining: `${remaining}m left` };
        }
        if (currentHour >= sunsetHour - 2 && currentHour < sunsetHour - 1) {
            const until = Math.round((sunsetHour - 1 - currentHour) * 60);
            return { label: 'Golden hour', remaining: `in ${until}m` };
        }
        return null;
    }, [sunData]);

    // Moon info string
    const moonInfo = useMemo(() => {
        if (!sunData || isDaytime) return null;
        const phase = sunData.moonPhase;
        const illum = sunData.moonIllumination;
        if (!phase && illum == null) return null;
        const parts: string[] = [];
        if (phase) parts.push(phase);
        if (illum != null) parts.push(`${illum}% illuminated`);
        return parts.join(' · ');
    }, [sunData, isDaytime]);

    // --- No hooks below this line ---

    // DEBUG — remove after verification
    if (sunData) {
        const _dbg_progress = isDaytime ? dayProgress : nightProgress;
        const _dbg_pct = Math.round(_dbg_progress * 100);
        console.log('🕐 LOCAL TIME DEBUG:', {
            currentHour: sunData.currentHour,
            sunriseHour: sunData.sunriseHour,
            sunsetHour: sunData.sunsetHour,
            isDaytime,
            dayProgress,
            nightProgress,
            activeProgress: _dbg_progress,
            markerPercent: _dbg_pct + '%',
        });
    }

    if (isLoading) {
        return (
            <div className="widget-card">
                <div className="widget-header">
                    <div className="widget-icon bg-blue-500/10 text-blue-500">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="widget-title">Local Time</h3>
                    </div>
                </div>
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </div>
            </div>
        );
    }

    const progress = isDaytime ? dayProgress : nightProgress;
    const progressPercent = Math.round(progress * 100);

    // Gradients
    const dayGradient = 'linear-gradient(90deg, rgba(251,191,36,0.5) 0%, rgba(253,224,71,0.6) 25%, rgba(56,189,248,0.4) 50%, rgba(251,146,60,0.5) 85%, rgba(249,115,22,0.4) 100%)';
    const nightGradient = dawnApproaching
        ? 'linear-gradient(90deg, rgba(67,56,202,0.5) 0%, rgba(109,40,217,0.4) 40%, rgba(139,92,246,0.35) 70%, rgba(253,224,71,0.3) 100%)'
        : 'linear-gradient(90deg, rgba(67,56,202,0.5) 0%, rgba(109,40,217,0.4) 50%, rgba(139,92,246,0.3) 100%)';

    // Dimmed future overlay
    const dayDimOverlay = 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.5) 100%)';
    const nightDimOverlay = 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.45) 100%)';

    return (
        <div className="widget-card animate-slide-up">
            {/* Header */}
            <div className="widget-header">
                <div className={`widget-icon ${isDaytime ? 'bg-blue-500/10 text-blue-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h3 className="widget-title">Local Time</h3>
                </div>
            </div>

            {/* Hero time */}
            <div className="mt-3">
                <p className="text-3xl font-bold tracking-tight text-foreground leading-none">
                    {liveTime || destination.time12.replace(/^0/, '')}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1" style={{ whiteSpace: 'nowrap' }}>
                    {(() => {
                        const name = destinationName || '';
                        const city = name.split(',')[0].trim();
                        const cc = (destinationCountryCode || '').toUpperCase();
                        const abbr = tzAbbreviation || destination.abbreviation || '';
                        // Dynamic UTC offset from IANA timezone
                        let utcOffset = '';
                        if (destinationTimeZone) {
                            try {
                                const formatter = new Intl.DateTimeFormat('en-US', {
                                    timeZone: destinationTimeZone,
                                    timeZoneName: 'shortOffset',
                                });
                                const fmtParts = formatter.formatToParts(new Date());
                                const offsetPart = fmtParts.find(p => p.type === 'timeZoneName');
                                utcOffset = offsetPart?.value?.replace('GMT', 'UTC') || '';
                            } catch {}
                        }
                        const offsetStr = utcOffset ? ` (${utcOffset})` : '';
                        return `${city}${cc ? `, ${cc}` : ''}${abbr ? ` · ${abbr}` : ''}${offsetStr}`;
                    })()}
                </p>
            </div>

            {/* Time difference — computed client-side from IANA timezones */}
            <p className={`text-xs font-medium mt-2 ${isDaytime ? 'text-blue-400/90' : 'text-indigo-400/90'}`}>
                {computeTimeDiffLabel(destinationTimeZone)}
            </p>

            {/* Timeline */}
            {sunData && (
                <div className="mt-6">
                    {/* Timeline bar */}
                    <div className="relative h-[3px] w-full rounded-full overflow-visible">
                        {/* Background track */}
                        <div className={`absolute inset-0 rounded-full ${isDaytime ? 'bg-muted-foreground/10' : 'bg-indigo-950/30'}`} />

                        {/* Active gradient */}
                        <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                            style={{ width: '100%', background: isDaytime ? dayGradient : nightGradient }}
                        />

                        {/* Future dim overlay */}
                        <div
                            className="absolute inset-y-0 right-0 rounded-r-full transition-all duration-1000"
                            style={{
                                width: `${100 - progressPercent}%`,
                                background: isDaytime ? dayDimOverlay : nightDimOverlay,
                            }}
                        />

                        {/* Marker */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                            style={{ left: `${progressPercent}%` }}
                        >
                            {isDaytime ? (
                                <>
                                    <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-[3px]" />
                                    <div className="relative w-3 h-3 -ml-1.5 rounded-full bg-amber-300 border-2 border-amber-200/80 shadow-sm shadow-amber-400/30" />
                                </>
                            ) : (
                                <>
                                    <div className={`absolute -inset-2 rounded-full blur-[3px] transition-all duration-500 ${dawnApproaching ? 'bg-amber-300/15' : 'bg-indigo-300/15'}`} />
                                    <div className={`relative w-3 h-3 -ml-1.5 rounded-full transition-all duration-500 ${dawnApproaching ? 'bg-indigo-200 border-2 border-amber-200/40' : 'bg-indigo-300 border-2 border-indigo-200/50'}`} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex items-start justify-between mt-2">
                        <div className="flex items-center gap-1">
                            {isDaytime ? (
                                <Sunrise className="w-3 h-3 text-amber-400/60" strokeWidth={1.5} />
                            ) : (
                                <Sunset className="w-3 h-3 text-indigo-400/60" strokeWidth={1.5} />
                            )}
                            <span className="text-[11px] text-muted-foreground/70">
                                {isDaytime ? sunData.sunrise.replace(/^0/, '') : sunData.sunset.replace(/^0/, '')}
                            </span>
                        </div>

                        <div className="text-center">
                            {timeRemaining && (
                                <p className={`text-[11px] ${isDaytime ? 'text-muted-foreground/50' : 'text-indigo-300/50'}`}>
                                    {timeRemaining}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground/70">
                                {isDaytime ? sunData.sunset.replace(/^0/, '') : sunData.sunrise.replace(/^0/, '')}
                            </span>
                            {isDaytime ? (
                                <Sunset className="w-3 h-3 text-orange-400/60" strokeWidth={1.5} />
                            ) : (
                                <Sunrise className="w-3 h-3 text-amber-400/60" strokeWidth={1.5} />
                            )}
                        </div>
                    </div>

                    {/* Moon info (night only) */}
                    {!isDaytime && moonInfo && (
                        <div className="flex items-center gap-1.5 mt-5">
                            <Moon className="w-3 h-3 text-indigo-300/50" strokeWidth={1.5} />
                            <span className="text-[10px] text-indigo-300/40">{moonInfo}</span>
                        </div>
                    )}

                    {/* Golden hour (day only) */}
                    {isDaytime && goldenHourStatus && (
                        <div className="flex items-center gap-1.5 mt-3 px-2 py-1 rounded-lg bg-amber-500/[0.06] border border-amber-500/[0.08]">
                            <Camera className="w-3 h-3 text-amber-400/60" strokeWidth={1.5} />
                            <span className="text-[10px] font-medium text-amber-400/70">{goldenHourStatus.label}</span>
                            <span className="text-[10px] text-amber-400/40 ml-auto">{goldenHourStatus.remaining}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimeZonePresenter;
