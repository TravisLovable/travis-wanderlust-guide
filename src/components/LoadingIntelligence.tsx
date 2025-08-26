
import React, { useEffect, useState } from 'react';
import { Brain, Zap } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface LoadingIntelligenceProps {
  placeDetails: SelectedPlace | null;
  onComplete: () => void;
}

const LoadingIntelligence = ({ placeDetails, onComplete }: LoadingIntelligenceProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Analyzing destination data...',
    'Processing market intelligence...',
    'Compiling travel brief...',
    'Finalizing recommendations...'
  ];

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-8 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-data-stream"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-2xl mx-auto px-6 relative z-10">
        {/* Logo with pulse animation */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-blue-400 animate-pulse-slow" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-blue-400/30 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Destination */}
        <h1 className="text-4xl font-light text-foreground mb-2 tracking-wide">
          {placeDetails?.formatted_address || placeDetails?.name || 'Unknown Destination'}
        </h1>
        
        {/* Current step */}
        <p className="text-lg text-muted-foreground mb-8 animate-fade-in-out">
          {steps[currentStep]}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out animate-shimmer-progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading percentage */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 text-blue-400" />
          <span>Generating Intelligence Brief... {progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIntelligence;
