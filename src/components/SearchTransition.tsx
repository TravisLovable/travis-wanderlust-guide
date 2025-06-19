
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SearchTransitionProps {
  destination: string;
  onComplete: () => void;
}

const SearchTransition = ({ destination, onComplete }: SearchTransitionProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
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

        <div className="flex items-center justify-center space-x-3 text-white/80">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-light">Gathering intelligence...</span>
        </div>
      </div>
    </div>
  );
};

export default SearchTransition;
