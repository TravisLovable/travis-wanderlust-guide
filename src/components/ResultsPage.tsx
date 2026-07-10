import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { SelectedPlace } from '@/types/place';
import { InsightsProvider } from '@/contexts/InsightsContext';
import { useTravisInsights } from '@/hooks/useTravisInsights';
import { useTravelContext } from '@/contexts/TravelContext';
import { Topbar } from '@/components/travis/Topbar';
import { ContextPicker } from '@/components/travis/ContextPicker';
import { ResultsHeader } from '@/components/travis/results/ResultsHeader';
import { BriefBlock } from '@/components/travis/results/BriefBlock';
import { MustKnowSection } from '@/components/travis/results/MustKnowSection';
import { LogisticsSection } from '@/components/travis/results/LogisticsSection';
import { ContextSection } from '@/components/travis/results/ContextSection';
import { DetailsSection } from '@/components/travis/results/DetailsSection';

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

        <main key={widgetKey} className="px-5 md:px-8 pb-16">
          <MustKnowSection
            placeDetails={placeDetails}
            dates={dates}
            destination={destination}
            passport={passport}
            insights={insights}
            insightsLoading={insightsLoading}
          />

          <LogisticsSection
            placeDetails={placeDetails}
            insights={insights}
            insightsLoading={insightsLoading}
          />

          <ContextSection
            placeDetails={placeDetails}
            dates={dates}
            destination={destination}
            insights={insights}
            insightsLoading={insightsLoading}
          />

          <DetailsSection placeDetails={placeDetails} />

          <footer
            className="max-w-[1180px] mx-auto w-full mt-16 md:mt-20 pt-5 border-t flex flex-col md:flex-row md:justify-between gap-2 font-travis-mono uppercase"
            style={{
              borderColor: 'var(--hair)',
              fontSize: 10.5,
              letterSpacing: '0.12em',
              color: 'var(--ink-4)',
            }}
          >
            <span>Travis will re-verify before departure</span>
            <span>Not a booking tool</span>
          </footer>
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
          className={`fixed bottom-[calc(1.5rem+var(--sab))] right-6 z-50 h-10 w-10 rounded-full bg-foreground/80 text-background flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-foreground ${
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
