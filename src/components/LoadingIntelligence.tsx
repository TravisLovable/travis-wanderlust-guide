
import React, { useEffect, useState } from 'react';
import { Brain, Zap, Sparkles, Globe, Plane, MapPin } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface LoadingIntelligenceProps {
  placeDetails: SelectedPlace | null;
  onComplete: () => void;
}

const LoadingIntelligence = ({ placeDetails, onComplete }: LoadingIntelligenceProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExtraEffects, setShowExtraEffects] = useState(false);

  const steps = [
    'Analyzing destination data...',
    'Processing market intelligence...',
    'Compiling travel brief...',
    'Finalizing recommendations...'
  ];

  const funnyLoadingMessages = [
    'Teaching our AI about local coffee shops...',
    'Calculating optimal selfie spots...',
    'Negotiating with weather gods...',
    'Finding the best hidden gems...',
    'Consulting travel wizards...',
    'Decoding local customs...',
    'Mapping adventure possibilities...'
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

    const effectsTimer = setInterval(() => {
      setShowExtraEffects(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      clearInterval(effectsTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Enhanced animated background elements */}
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
        {/* Floating travel icons */}
        {[...Array(8)].map((_, i) => {
          const icons = [Globe, Plane, MapPin, Sparkles];
          const Icon = icons[i % icons.length];
          return (
            <Icon
              key={`icon-${i}`}
              className="absolute w-4 h-4 text-blue-400/30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          );
        })}
      </div>

      <div className="text-center max-w-2xl mx-auto px-6 relative z-10">
        {/* Enhanced logo with multiple animations */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-blue-400 animate-pulse-slow playful-hover" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-blue-400/30 rounded-full animate-ping"></div>
            {showExtraEffects && (
              <>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce-gentle" />
                <Zap className="absolute -bottom-2 -left-2 w-5 h-5 text-purple-400 animate-wiggle" />
              </>
            )}
            {/* Orbiting elements */}
            <div className="absolute inset-0 w-16 h-16">
              <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-spin" style={{ 
                top: '10%', 
                left: '50%', 
                transformOrigin: '0 24px',
                animationDuration: '3s'
              }} />
              <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-spin" style={{ 
                top: '50%', 
                right: '10%', 
                transformOrigin: '-24px 0',
                animationDuration: '4s',
                animationDirection: 'reverse'
              }} />
            </div>
          </div>
        </div>

        {/* Destination */}
        <h1 className="text-4xl font-light text-foreground mb-2 tracking-wide animate-slide-in-up playful-hover">
          {placeDetails?.formatted_address || placeDetails?.name || 'Unknown Destination'}
        </h1>
        
        {/* Current step with playful messages */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <p className="text-lg text-muted-foreground animate-fade-in-out">
            {progress < 80 ? steps[currentStep] : funnyLoadingMessages[currentStep % funnyLoadingMessages.length]}
          </p>
        </div>

        {/* Enhanced progress bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="h-2 bg-border rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out animate-shimmer-progress relative"
              style={{ width: `${progress}%` }}
            >
              {/* Progress sparkle effect */}
              {progress > 10 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-bounce-gentle" />
                </div>
              )}
            </div>
          </div>
          {/* Progress milestones */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={progress >= 25 ? 'text-blue-400' : ''}>🌍</span>
            <span className={progress >= 50 ? 'text-blue-400' : ''}>🧠</span>
            <span className={progress >= 75 ? 'text-blue-400' : ''}>📊</span>
            <span className={progress >= 100 ? 'text-green-400' : ''}>✨</span>
          </div>
        </div>

        {/* Loading percentage with playful elements */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Zap className={`w-4 h-4 text-blue-400 transition-all duration-300 ${progress > 50 ? 'animate-bounce-gentle' : ''}`} />
          <span className="animate-slide-in-left">
            Generating Intelligence Brief... 
            <span className="text-blue-400 font-medium ml-1">{progress}%</span>
          </span>
          {progress > 80 && (
            <Sparkles className="w-4 h-4 text-yellow-400 animate-wiggle" />
          )}
        </div>
        
        {/* Fun completion message */}
        {progress >= 100 && (
          <div className="mt-4 animate-slide-in-up">
            <p className="text-green-400 font-medium">🎉 Ready for takeoff!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingIntelligence;
