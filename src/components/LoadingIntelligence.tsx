import { useEffect, useRef, useState } from 'react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

function toTitleCase(str: string): string {
  return str.replace(/\b\w+/g, word => {
    const lower = word.toLowerCase();
    const minor = ['a','an','the','and','but','or','for','nor','in','on','at','to','by','of','up','as'];
    if (minor.includes(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

interface LoadingIntelligenceProps {
  placeDetails: SelectedPlace | null;
  onComplete: () => void;
}

const LoadingIntelligence = ({ placeDetails, onComplete }: LoadingIntelligenceProps) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [progress, setProgress] = useState(0);

  const displayName = toTitleCase(
    placeDetails?.name || placeDetails?.formatted_address || 'Destination'
  );

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    const transitionTimer = setTimeout(() => onCompleteRef.current(), 5200);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center px-6 w-full max-w-md">
        <h1
          className="text-4xl tracking-tight text-[#1A1A1A]"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }}
        >
          {displayName}
        </h1>

        <p
          className="mt-3 text-lg text-[#9CA3AF]"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}
        >
          Preparing your intelligence brief
        </p>

        <div className="mt-10 mx-auto w-full max-w-[280px] h-[2px] bg-black/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-75 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6B87C8, #8E7CF3)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingIntelligence;
