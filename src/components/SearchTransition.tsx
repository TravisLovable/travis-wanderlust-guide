
import React, { useEffect, useRef, useState } from 'react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const LINES = [
  'Reviewing entry requirements',
  'Mapping your weather window',
  'Aligning local time context',
  'Understanding city mobility',
];

const LINE_VISIBLE = 1200;
const POST_DELAY = 300;

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  const [lineIndex, setLineIndex] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let currentLine = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runLine = () => {
      setLineIndex(currentLine);

      timers.push(setTimeout(() => {
        currentLine++;
        if (currentLine < LINES.length) {
          runLine();
        } else {
          timers.push(setTimeout(() => {
            onComplete();
          }, POST_DELAY));
        }
      }, LINE_VISIBLE));
    };

    runLine();

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Extract city name only (before first comma)
  const cityName = destination.split(',')[0].trim();

  return (
    <div className="min-h-screen bg-background flex items-start justify-center" style={{ paddingTop: '38vh' }}>
      <div className="text-center px-6">
        {/* Headline */}
        <h1
          className="font-light tracking-tight text-foreground"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
            letterSpacing: '-0.02em',
          }}
        >
          Preparing your intelligence brief for {cityName}
        </h1>

        {/* Rotating intelligence line — instant swap, no animation */}
        <p
          className="text-foreground/75 font-light"
          style={{
            marginTop: '18px',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
            minHeight: '1.6em',
          }}
        >
          {LINES[lineIndex]}
        </p>
      </div>
    </div>
  );
};

export default SearchTransition;
