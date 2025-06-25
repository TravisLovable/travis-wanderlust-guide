
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OnboardingData {
  fullName: string;
  preferredAirline: string;
  frequentFlyerNumber: string;
  travelType: string;
  nationality: string;
  country: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refetchUserProfile } = useAuth();
  
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    preferredAirline: '',
    frequentFlyerNumber: '',
    travelType: '',
    nationality: '',
    country: ''
  });

  const steps = [
    {
      title: "Let's personalize your experience",
      content: (
        <div className="text-center py-6">
          <p className="text-gray-300 mb-6">
            We'll help you create the perfect travel experience. This will only take a minute.
          </p>
        </div>
      )
    },
    {
      title: "What's your name?",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-white">Full Name</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter your full name"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      )
    },
    {
      title: "Airline Preferences",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="preferredAirline" className="text-white">Preferred Airline</Label>
            <Input
              id="preferredAirline"
              value={data.preferredAirline}
              onChange={(e) => setData(prev => ({ ...prev, preferredAirline: e.target.value }))}
              placeholder="e.g., American Airlines, Delta, etc."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="frequentFlyerNumber" className="text-white">Frequent Flyer Number (Optional)</Label>
            <Input
              id="frequentFlyerNumber"
              value={data.frequentFlyerNumber}
              onChange={(e) => setData(prev => ({ ...prev, frequentFlyerNumber: e.target.value }))}
              placeholder="Enter your frequent flyer number"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      )
    },
    {
      title: "Travel Style",
      content: (
        <div className="space-y-4">
          <Label className="text-white">What's your travel style?</Label>
          <RadioGroup
            value={data.travelType}
            onValueChange={(value) => setData(prev => ({ ...prev, travelType: value }))}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Luxury" id="luxury" />
              <Label htmlFor="luxury" className="text-white">Luxury - Premium experiences and comfort</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Budget" id="budget" />
              <Label htmlFor="budget" className="text-white">Budget - Great value and savings</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Adventure" id="adventure" />
              <Label htmlFor="adventure" className="text-white">Adventure - Unique and exciting experiences</Label>
            </div>
          </RadioGroup>
        </div>
      )
    },
    {
      title: "Location Details",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="nationality" className="text-white">Nationality</Label>
            <Input
              id="nationality"
              value={data.nationality}
              onChange={(e) => setData(prev => ({ ...prev, nationality: e.target.value }))}
              placeholder="e.g., American, British, etc."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="country" className="text-white">Country</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => setData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="e.g., United States, United Kingdom, etc."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
      )
    },
    {
      title: "Review Your Information",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <p className="text-white"><strong>Name:</strong> {data.fullName}</p>
            <p className="text-white"><strong>Preferred Airline:</strong> {data.preferredAirline}</p>
            {data.frequentFlyerNumber && (
              <p className="text-white"><strong>Frequent Flyer #:</strong> {data.frequentFlyerNumber}</p>
            )}
            <p className="text-white"><strong>Travel Style:</strong> {data.travelType}</p>
            <p className="text-white"><strong>Nationality:</strong> {data.nationality}</p>
            <p className="text-white"><strong>Country:</strong> {data.country}</p>
          </div>
          <p className="text-gray-300 text-sm">
            You can update this information anytime in your profile settings.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.fullName,
          preferred_airline: data.preferredAirline,
          frequent_flyer_number: data.frequentFlyerNumber || null,
          travel_type: data.travelType,
          nationality: data.nationality,
          country: data.country,
          onboarding_completed: true
        })
        .eq('auth_id', user.id);

      if (error) throw error;

      await refetchUserProfile();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return data.fullName.trim() !== '';
      case 2: return data.preferredAirline.trim() !== '';
      case 3: return data.travelType !== '';
      case 4: return data.nationality.trim() !== '' && data.country.trim() !== '';
      case 5: return true;
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-black border-gray-600" hideClose>
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            {steps[currentStep].title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {steps[currentStep].content}
        </div>

        {error && (
          <div className="text-red-400 bg-red-400/10 text-sm p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <span className="text-gray-400 text-sm">
            {currentStep + 1} of {steps.length}
          </span>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
