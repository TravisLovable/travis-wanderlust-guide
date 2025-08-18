
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCountryData, CountryData } from '@/hooks/useCountryData';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const OnboardingModal = ({ isOpen, onClose, user }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    preferredAirline: '',
    frequentFlyerNumber: '',
    travelType: '',
    countryData: null as CountryData | null, // New comprehensive country data
    profilePhotoUrl: ''
  });
  const { toast } = useToast();
  const { countries, isLoading: countriesLoading, error: countriesError } = useCountryData();

  const airlines = [
    'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
    'British Airways', 'Lufthansa', 'Air France', 'Emirates', 'Qatar Airways',
    'Singapore Airlines', 'Cathay Pacific', 'Japan Airlines', 'Other'
  ];

  const travelTypes = [
    'Business', 'Leisure', 'Mixed (Business & Leisure)', 'Adventure', 'Luxury'
  ];

  // Countries are now fetched dynamically from the REST Countries API

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          auth_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          preferred_airline: onboardingData.preferredAirline,
          frequent_flyer_number: onboardingData.frequentFlyerNumber,
          travel_type: onboardingData.travelType,
          country_data: onboardingData.countryData, // New comprehensive field
          profile_photo_url: onboardingData.profilePhotoUrl,
          onboarding_completed: true
        });

      if (error) throw error;

      toast({
        title: "Welcome to Travis!",
        description: "Your profile has been set up successfully.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we'll just create a preview URL
      // In a real implementation, you'd upload to Supabase Storage
      const url = URL.createObjectURL(file);
      setOnboardingData(prev => ({ ...prev, profilePhotoUrl: url }));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return onboardingData.preferredAirline !== '';
      case 2:
        return true; // Optional field
      case 3:
        return onboardingData.travelType !== '';
      case 4:
        return onboardingData.countryData !== null && !countriesLoading;
      case 5:
        return true; // Optional field
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <Label>Preferred Airline</Label>
            <Select value={onboardingData.preferredAirline} onValueChange={(value) =>
              setOnboardingData(prev => ({ ...prev, preferredAirline: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred airline" />
              </SelectTrigger>
              <SelectContent>
                {airlines.map(airline => (
                  <SelectItem key={airline} value={airline}>{airline}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 2:
        return (
          <div>
            <Label htmlFor="loyalty">Loyalty Number (Optional)</Label>
            <Input
              id="loyalty"
              value={onboardingData.frequentFlyerNumber}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, frequentFlyerNumber: e.target.value }))}
              placeholder="Enter your frequent flyer number"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <Label>Travel Type</Label>
            <Select value={onboardingData.travelType} onValueChange={(value) =>
              setOnboardingData(prev => ({ ...prev, travelType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select your travel type" />
              </SelectTrigger>
              <SelectContent>
                {travelTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 4:
        return (
          <div>
            <Label>Passport Country</Label>
            <Select value={onboardingData.countryData?.code || ''} onValueChange={(value) => {
              // Find the full country data for the selected code
              const selectedCountry = countries.find(country => country.code === value);
              setOnboardingData(prev => ({
                ...prev,
                countryData: selectedCountry || null // Store full country data
              }));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select your passport country" />
              </SelectTrigger>
              <SelectContent>
                {countriesLoading ? (
                  <SelectItem value="" disabled>Loading countries...</SelectItem>
                ) : countriesError ? (
                  <SelectItem value="" disabled>Error loading countries</SelectItem>
                ) : (
                  countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center space-x-2">
                        <img src={country.flag} alt={country.name} className="w-4 h-4" />
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        );
      case 5:
        return (
          <div className="text-center space-y-4">
            <Label>Profile Photo (Optional)</Label>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={onboardingData.profilePhotoUrl} />
                <AvatarFallback>
                  {user?.user_metadata?.first_name?.[0]}{user?.user_metadata?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Step {step} of 5
          </div>

          {renderStep()}

          <div className="flex space-x-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Completing..." : "Complete"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
