import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import WaterSafetyWidget from '@/components/WaterSafetyWidget';
import PowerAdaptorWidget from '@/components/PowerAdaptorWidget';
import UVIndexCard from '@/components/UVIndexCard';
import HealthEntryCard from '@/components/HealthEntryCard';
import PharmacyIntelCard from '@/components/PharmacyIntelCard';
import EmergencyContactsCard from '@/components/EmergencyContactsCard';
import {
  CulturalContainer,
  TimeZoneContainer,
  CurrencyContainer,
  VisaContainer,
  HolidayContainer,
  UberAvailabilityWidget,
} from '@/components/widgets';
import { InsightLine } from '@/components/InsightLine';
import { InsightsProvider } from '@/contexts/InsightsContext';
import { useTravisInsights } from '@/hooks/useTravisInsights';
import WeatherIntelWidget from '@/components/WeatherIntelWidget';
import WhatMattersCard from '@/components/WhatMattersCard';
import { useTravelContext } from '@/contexts/TravelContext';
import { Topbar } from '@/components/travis/Topbar';
import { ContextPicker } from '@/components/travis/ContextPicker';
import { ResultsHeader } from '@/components/travis/results/ResultsHeader';
import { BriefBlock } from '@/components/travis/results/BriefBlock';

interface ResultsPageProps {
  placeDetails: SelectedPlace | null;
  dates: {
    checkin: string;
    checkout: string;
  };
  onBack: () => void;
  onNewSearch: (placeDetails: SelectedPlace | null, dates: { checkin: string; checkout: string }, skipTransition?: boolean) => void;
}

const ResultsPage = ({ placeDetails, dates, onBack }: ResultsPageProps) => {
  const { passport, origin, setPassport, setOrigin } = useTravelContext();
  const [contextOpen, setContextOpen] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const destination = placeDetails?.formatted_address || placeDetails?.name || 'Unknown Destination';
  const destinationParts = destination.split(',').map((s: string) => s.trim());
  const destinationName = destinationParts[0];
  const countryName = destinationParts.length > 1 ? destinationParts[destinationParts.length - 1] : null;
  const countryCode = placeDetails?.country_code?.toUpperCase() || null;

  const passportShort =
    !passport || passport === 'United States'
      ? 'US'
      : passport.toUpperCase().slice(0, 3);
  const originLabel = origin || 'NYC';

  const destCode = (countryCode ?? destinationName ?? 'DEST').toUpperCase().slice(0, 3);

  // Travis AI insights — still calls @/lib/claude (client-side Anthropic).
  // Moves to a Supabase Edge Function in step 6.5 so the key isn't bundled.
  const { insights, loading: insightsLoading, error: insightsError } = useTravisInsights({
    destination: {
      city: destinationName,
      country: countryName || '',
      lat: placeDetails?.latitude || 0,
      lng: placeDetails?.longitude || 0,
    },
    dates: { start: dates.checkin, end: dates.checkout },
    widgetData: {},
    enabled: !!destinationName,
  });

  // Scroll-top button — kept from legacy implementation.
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Context changes refresh the widget grid by remounting via key bump.
  const handleSetPassport = (next: string) => {
    setPassport(next);
    setWidgetKey((k) => k + 1);
  };
  const handleSetOrigin = (next: string) => {
    setOrigin(next);
    setWidgetKey((k) => k + 1);
  };

  return (
    <InsightsProvider value={{ insights, loading: insightsLoading, error: insightsError }}>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Topbar
          context={{ clockLocal: localClock(), passport: passportShort, home: originLabel }}
          onContextClick={() => setContextOpen(true)}
        />

        <ResultsHeader
          city={destinationName}
          country={countryName}
          checkin={dates.checkin}
          checkout={dates.checkout}
          originCode={originLabel.toUpperCase().slice(0, 3)}
          destCode={destCode}
          countryCode={countryCode}
          onNewQuery={onBack}
        />

        <BriefBlock insights={insights} loading={insightsLoading} />

        {/* Legacy widget grid — redesigned in step 6 into Must Know / Logistics / Context sections. */}
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div key={widgetKey} className="grid grid-cols-1 md:grid-cols-2 gap-3">

            <WhatMattersCard destination={destination} animationDelay="0s" />

            <div style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.25)', borderRadius: 'var(--radius)' }}>
              <WeatherIntelWidget
                destination={destination}
                dates={dates}
                latitude={placeDetails?.latitude}
                longitude={placeDetails?.longitude}
                insight={insights?.weather}
                insightLoading={insightsLoading}
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.04s', boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.25)', borderRadius: 'var(--radius)' }}>
              <TimeZoneContainer placeDetails={placeDetails} destination={destination} />
              <InsightLine insight={insights?.localTime} loading={insightsLoading} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.08s', boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.25)', borderRadius: 'var(--radius)' }}>
              <VisaContainer placeDetails={placeDetails} passport={passport} />
              <InsightLine insight={insights?.visa} loading={insightsLoading} />
            </div>

            <div style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.25)', borderRadius: 'var(--radius)' }}>
              <HealthEntryCard destination={destination} passport={passport} animationDelay="0.1s" />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.12s' }}>
              <UberAvailabilityWidget placeDetails={placeDetails} />
              <InsightLine insight={insights?.transportation} loading={insightsLoading} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.14s' }}>
              <CurrencyContainer placeDetails={placeDetails} />
              <InsightLine insight={insights?.currency} loading={insightsLoading} />
            </div>

            <CulturalContainer destination={destination} animationDelay="0.16s" />

            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-[1fr_1fr_2fr] gap-3">
              <WaterSafetyWidget placeDetails={placeDetails} animationDelay="0.18s" />
              <UVIndexCard placeDetails={placeDetails} animationDelay="0.2s" />
              <EmergencyContactsCard placeDetails={placeDetails} animationDelay="0.26s" />
              <PharmacyIntelCard placeDetails={placeDetails} animationDelay="0.22s" />
              <PowerAdaptorWidget placeDetails={placeDetails} animationDelay="0.24s" />
              <div className="animate-slide-up" style={{ animationDelay: '0.28s' }}>
                <HolidayContainer placeDetails={placeDetails} dates={dates} />
                <InsightLine insight={insights?.localHolidays} loading={insightsLoading} />
              </div>
            </div>

          </div>
        </main>

        <ContextPicker
          open={contextOpen}
          onOpenChange={setContextOpen}
          passport={passport}
          setPassport={handleSetPassport}
          origin={origin}
          setOrigin={handleSetOrigin}
        />

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-foreground/80 text-background flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-foreground ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Return to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </InsightsProvider>
  );
};

function localClock(): string {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop() ?? '';
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return tz ? `${hh}:${mm} ${tz}` : `${hh}:${mm}`;
}

export default ResultsPage;
