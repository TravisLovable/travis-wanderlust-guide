
import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  const fullText = '"A mind stretched by new experiences can never go back to its old dimensions."';

  useEffect(() => {
    // Complete the transition after 4 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds delay

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image - Brazil at night with city lights */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Floating Brazilian elements */}
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
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-12">
          {/* Destination without Brazilian flag */}
          <div className="relative mb-6">
            <h1 className="text-6xl md:text-7xl font-light text-white mb-2 tracking-wide relative">
              <span className="relative inline-block">
                {destination}
                <div className="absolute -top-2 -right-2 w-8 h-8 border-2 border-green-500 rounded-full opacity-60"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500/30 rounded-full"></div>
              </span>
            </h1>
          </div>
          
          {/* Decorative line with Brazilian styling */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-px bg-green-400/60"></div>
            <div className="w-3 h-3 border-2 border-yellow-400/60 rounded-full mx-4 bg-blue-400/20"></div>
            <div className="w-16 h-px bg-blue-400/60"></div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Full quote displayed immediately */}
          <div className="relative">
            <blockquote className="text-xl md:text-2xl text-white/90 font-light italic leading-relaxed max-w-3xl mx-auto min-h-[4rem] flex items-center justify-center">
              <span 
                className="relative font-serif transition-all duration-300 ease-out" 
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {fullText}
                <span className="ml-2 text-white/60 animate-pulse">✨</span>
              </span>
            </blockquote>
          </div>
          
          <p className="text-white/70 text-lg font-light">— Oliver Wendell Holmes Sr.</p>
          
          {/* Loading Icon Only */}
          <div className="flex items-center justify-center mt-8">
            <Loader className="w-8 h-8 text-white/80 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchTransition;
