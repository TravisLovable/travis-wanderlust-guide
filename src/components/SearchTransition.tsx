
import React, { useEffect, useState } from 'react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = '"A mind stretched by new experiences can never go back to its old dimensions."';

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    // Complete the transition after the quote is fully typed
    const timer = setTimeout(() => {
      if (typedText === fullText) {
        onComplete();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [typedText, fullText, onComplete]);

  // Live typewriter effect for the quote
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (typedText.length < fullText.length) {
      timeoutId = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 80 + Math.random() * 40); // More realistic typing speed
    }

    return () => clearTimeout(timeoutId);
  }, [typedText, fullText]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image - Japan themed */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Floating cherry blossom petals */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-pink-300/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-12">
          {/* Japan-styled destination */}
          <div className="relative mb-6">
            <h1 className="text-6xl md:text-7xl font-light text-white mb-2 tracking-wide relative">
              <span className="relative inline-block">
                {destination}
                <div className="absolute -top-2 -right-2 w-8 h-8 border-2 border-red-500 rounded-full opacity-60"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-500/30 rounded-full"></div>
              </span>
            </h1>
            
            {/* Japanese characters overlay effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
              <span className="text-red-400/60 text-2xl font-light">日本</span>
            </div>
          </div>
          
          {/* Decorative line with traditional Japanese styling */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-px bg-red-400/60"></div>
            <div className="w-3 h-3 border-2 border-red-400/60 rounded-full mx-4 bg-red-400/20"></div>
            <div className="w-16 h-px bg-red-400/60"></div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Live typing quote */}
          <div className="relative">
            <blockquote className="text-xl md:text-2xl text-white/90 font-light italic leading-relaxed max-w-3xl mx-auto min-h-[4rem] flex items-center justify-center">
              <span className="relative">
                {typedText}
                {typedText.length < fullText.length && showCursor && (
                  <span className="ml-1 text-white/70 animate-none">|</span>
                )}
                {typedText.length === fullText.length && showCursor && (
                  <span className="ml-1 text-white/50">|</span>
                )}
              </span>
            </blockquote>
          </div>
          
          <p className="text-white/70 text-lg font-light">— Oliver Wendell Holmes Sr.</p>
        </div>
      </div>
    </div>
  );
};

export default SearchTransition;
