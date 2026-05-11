import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const LINES = [
  "Entry requirements, simplified",
  "Weather patterns across your exact dates",
  "Local time, adjusted to you",
  "How the city moves",
];

const FADE_IN = 250;
const VISIBLE = 1700;
const FADE_OUT = 250;
const LINE_DURATION = FADE_IN + VISIBLE + FADE_OUT; // 2200ms
const POST_DELAY = 700;
// Total: 4 × 2200 + 700 = 9500ms

export default function LoadingIntelligence() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lineIndex, setLineIndex] = useState(0);
  const [lineOpacity, setLineOpacity] = useState(0);
  const started = useRef(false);

  const destination = searchParams.get("name") || searchParams.get("destination") || "your destination";
  const cityName = destination.split(",")[0].trim();

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let currentLine = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runLine = () => {
      setLineIndex(currentLine);
      setLineOpacity(0);

      // Fade in on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLineOpacity(1);
        });
      });

      // Fade out after fade-in + visible hold
      timers.push(
        setTimeout(() => {
          setLineOpacity(0);
        }, FADE_IN + VISIBLE)
      );

      // Advance after full line duration
      timers.push(
        setTimeout(() => {
          currentLine++;
          if (currentLine < LINES.length) {
            runLine();
          } else {
            timers.push(
              setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("loading");
                navigate(`/search?${params.toString()}`, { replace: true });
              }, POST_DELAY)
            );
          }
        }, LINE_DURATION)
      );
    };

    runLine();

    return () => timers.forEach(clearTimeout);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen w-full bg-background flex items-start justify-center" style={{ paddingTop: "38vh" }}>
      <div className="text-center px-6">
        <h1
          className="font-light tracking-tight text-foreground"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 3.5rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Preparing your intelligence brief for {cityName}
        </h1>

        <p
          className="text-foreground/75 font-light"
          style={{
            marginTop: "18px",
            fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
            minHeight: "1.6em",
            opacity: lineOpacity,
            transition: `opacity ${lineOpacity === 1 ? FADE_IN : FADE_OUT}ms ease`,
          }}
        >
          {LINES[lineIndex]}
        </p>
      </div>
    </div>
  );
}
