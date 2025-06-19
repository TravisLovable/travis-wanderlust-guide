
import React, { useEffect, useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

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

        <blockquote className="text-xl md:text-2xl text-white/90 font-light italic leading-relaxed mb-8 max-w-3xl mx-auto">
          "A mind stretched by new experiences can never go back to its old dimensions."
        </blockquote>
        
        <p className="text-white/70 text-lg mb-8">— Oliver Wendell Holmes Sr.</p>

        {/* Interactive Progress */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <Globe className="w-12 h-12 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
            <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-white/80 text-lg font-light">
            Gathering intelligence... {progress}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchTransition;
