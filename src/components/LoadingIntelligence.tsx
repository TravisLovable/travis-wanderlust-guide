
import React, { useEffect, useState } from 'react';
import { Brain, Zap, Sparkles, Globe, Plane, MapPin, Target } from 'lucide-react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface LoadingIntelligenceProps {
  placeDetails: SelectedPlace | null;
  onComplete: () => void;
}

const LoadingIntelligence = ({ placeDetails, onComplete }: LoadingIntelligenceProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
  const [celebrationMode, setCelebrationMode] = useState(false);

  const steps = [
    'Analyzing destination data...',
    'Processing market intelligence...',
    'Compiling travel brief...',
    'Finalizing recommendations...'
  ];

  const stepIcons = [Target, Globe, Brain, Sparkles];

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90 && !celebrationMode) {
          setCelebrationMode(true);
        }
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 800);

    const pulseTimer = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      clearInterval(pulseTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(40)].map((_, i) => (
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
        {/* Floating travel elements */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`travel-${i}`}
            className="absolute text-blue-400/20 floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          >
            {i % 4 === 0 ? <Plane className="w-4 h-4 rotate-45" /> : 
             i % 4 === 1 ? <Globe className="w-3 h-3" /> : 
             i % 4 === 2 ? <MapPin className="w-3 h-3" /> :
             <Sparkles className="w-3 h-3" />}
          </div>
        ))}
      </div>

      {/* Celebration confetti when near completion */}
      {celebrationMode && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto px-6 relative z-10">
        {/* Enhanced Logo with multiple animations */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <Brain className={`w-16 h-16 text-blue-400 transition-all duration-500 ${celebrationMode ? 'animate-bounce-gentle text-green-400' : 'animate-pulse-slow'}`} />
            <div className="absolute inset-0 w-16 h-16 border-2 border-blue-400/30 rounded-full animate-ping"></div>
            {showPulse && (
              <div className="absolute inset-0 w-20 h-20 border border-purple-400/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            )}
            {/* Orbiting sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-cyan-400 animate-sparkle" />
            <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-purple-400 animate-sparkle" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>

        {/* Destination with enhanced styling */}
        <h1 className={`text-4xl font-light text-foreground mb-2 tracking-wide transition-all duration-500 ${celebrationMode ? 'gradient-text animate-bounce-gentle' : ''}`}>
          {placeDetails?.formatted_address || placeDetails?.name || 'Unknown Destination'}
        </h1>
        
        {/* Current step with icon */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          {React.createElement(stepIcons[currentStep], { 
            className: `w-5 h-5 text-blue-400 animate-bounce-gentle` 
          })}
          <p className="text-lg text-muted-foreground animate-fade-in-out">
            {steps[currentStep]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out animate-shimmer-progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Enhanced Loading percentage with celebration */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Zap className={`w-4 h-4 text-blue-400 transition-all duration-300 ${celebrationMode ? 'animate-wiggle text-green-400' : ''}`} />
          <span className={celebrationMode ? 'text-green-400 font-medium' : ''}>
            {celebrationMode ? '🎉 Almost ready!' : 'Generating Intelligence Brief...'} {progress}%
          </span>
          {celebrationMode && <Sparkles className="w-4 h-4 text-yellow-400 animate-sparkle" />}
        </div>
      </div>
    </div>
  );
};

export default LoadingIntelligence;
