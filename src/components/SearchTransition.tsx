
import React, { useEffect, useState } from 'react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  const [typedText, setTypedText] = useState('');
  const fullText = '"A mind stretched by new experiences can never go back to its old dimensions."';

  useEffect(() => {
    // Complete the transition after the quote is fully typed
    const timer = setTimeout(() => {
      if (typedText === fullText) {
        onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [typedText, fullText, onComplete]);

  // Typewriter effect for the quote
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (typedText.length < fullText.length) {
      timeoutId = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 50 + Math.random() * 50); // Variable typing speed for more natural feel
    }

    return () => clearTimeout(timeoutId);
  }, [typedText, fullText]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4 tracking-tight">
            {destination}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-8"></div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <blockquote className="text-xl md:text-2xl text-white/90 font-light italic leading-relaxed max-w-3xl mx-auto min-h-[3.5rem] flex items-center justify-center">
            {typedText}
            {typedText.length < fullText.length && (
              <span className="ml-1 animate-pulse text-white/70">|</span>
            )}
          </blockquote>
          
          <p className="text-white/70 text-lg">— Oliver Wendell Holmes Sr.</p>
        </div>
      </div>
    </div>
  );
};

export default SearchTransition;
