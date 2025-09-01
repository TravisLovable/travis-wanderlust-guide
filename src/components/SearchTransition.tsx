
import React, { useEffect, useState } from 'react';
import { Loader, Sparkles, Plane, Globe } from 'lucide-react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  const fullText = '"A mind stretched by new experiences can never go back to its old dimensions."';
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Show sparkles after 1 second
    const sparkleTimer = setTimeout(() => {
      setShowSparkles(true);
    }, 1000);

    // Complete the transition after 4 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds delay

    return () => {
      clearTimeout(timer);
      clearTimeout(sparkleTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image - Uploaded Brazil Christ the Redeemer with moon */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/f5b79e39-5a50-4bbe-967b-6217be330912.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-green-300/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
        {/* Floating travel icons */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`travel-${i}`}
            className="absolute text-white/10 floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          >
            {i % 3 === 0 ? <Plane className="w-5 h-5 rotate-45" /> :
              i % 3 === 1 ? <Globe className="w-4 h-4" /> :
                <Sparkles className="w-4 h-4" />}
          </div>
        ))}
      </div>

      {/* Celebration sparkles */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute w-4 h-4 text-yellow-400 animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-12">
          {/* Enhanced Destination with animations */}
          <div className="relative mb-6 animate-slide-in-up">
            <h1 className="text-6xl md:text-7xl font-light text-white mb-2 tracking-wide relative">
              <span className="relative inline-block">
                {destination}
                <div className="absolute -top-2 -right-2 w-8 h-8 border-2 border-green-500 rounded-full opacity-60 animate-bounce-gentle"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500/30 rounded-full animate-wiggle"></div>
                {showSparkles && (
                  <>
                    <Sparkles className="absolute -top-4 -left-4 w-5 h-5 text-cyan-400 animate-sparkle" />
                    <Sparkles className="absolute -bottom-4 -right-4 w-4 h-4 text-purple-400 animate-sparkle" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
              </span>
            </h1>
          </div>

          {/* Enhanced Decorative line with Brazilian styling */}
          <div className="flex items-center justify-center mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-px bg-green-400/60 animate-shimmer"></div>
            <div className="w-3 h-3 border-2 border-yellow-400/60 rounded-full mx-4 bg-blue-400/20 animate-bounce-gentle"></div>
            <div className="w-16 h-px bg-blue-400/60 animate-shimmer"></div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Enhanced quote with animation */}
          <div className="relative animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <blockquote className="text-xl md:text-2xl text-white/90 font-light italic leading-relaxed max-w-3xl mx-auto min-h-[4rem] flex items-center justify-center">
              <span
                className="relative font-serif transition-all duration-300 ease-out"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {fullText}
                <span className="ml-2 text-white/60 animate-pulse">✨</span>
              </span>
            </blockquote>
            {showSparkles && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-sparkle" />
              </div>
            )}
          </div>

          <p className="text-white/70 text-lg font-light animate-slide-in-up" style={{ animationDelay: '0.6s' }}>— Oliver Wendell Holmes Sr.</p>

          {/* Enhanced Loading Icon */}
          <div className="flex items-center justify-center mt-8 animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="relative">
              <Loader className="w-8 h-8 text-white/80 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border border-white/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchTransition;
