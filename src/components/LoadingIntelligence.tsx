import { useEffect, useRef, useState } from 'react';
import { SelectedPlace } from '@/hooks/useGooglePlaces';

function toTitleCase(str: string): string {
  return str.replace(/\b\w+/g, (word) => {
    const lower = word.toLowerCase();
    const minor = ['a','an','the','and','but','or','for','nor','in','on','at','to','by','of','up','as'];
    if (minor.includes(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

function deriveCityCountry(formattedAddress: string): { city: string; country: string } {
  const parts = formattedAddress.split(',').map((s) => s.trim());
  if (parts.length >= 2) {
    return {
      city: toTitleCase(parts[0]),
      country: toTitleCase(parts[parts.length - 1]),
    };
  }
  return { city: toTitleCase(formattedAddress), country: '' };
}

interface LoadingIntelligenceProps {
  placeDetails: SelectedPlace | null;
  onComplete: () => void;
}

const LoadingIntelligence = ({ placeDetails, onComplete }: LoadingIntelligenceProps) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  const { city, country } = deriveCityCountry(
    placeDetails?.formatted_address || placeDetails?.name || 'Destination'
  );
  const displayLabel = country ? `${city}, ${country}` : city;

  useEffect(() => {
    completedRef.current = false;
    console.log('[transition] mounted');

    // Trigger fade-in on next frame
    requestAnimationFrame(() => setVisible(true));

    const complete = () => {
      if (!completedRef.current) {
        completedRef.current = true;
        console.log('[transition] navigating to results');
        onCompleteRef.current();
      }
    };

    // Navigate after 2500ms
    const navTimer = setTimeout(() => {
      console.log('[transition] fade-in complete');
      complete();
    }, 2500);

    // Safety fallback
    const safetyTimer = setTimeout(() => {
      console.warn('[transition] safety timeout');
      complete();
    }, 3000);

    return () => {
      clearTimeout(navTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div
        className="text-center px-8"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 400ms ease-out',
        }}
      >
        <h1
          className="text-3xl md:text-4xl font-medium tracking-tight"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#2B2F33',
          }}
        >
          {displayLabel}
        </h1>
        <p
          className="mt-2 text-sm"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#5A626B',
          }}
        >
          Preparing your intelligence brief
        </p>
      </div>
    </div>
  );
};

export default LoadingIntelligence;
