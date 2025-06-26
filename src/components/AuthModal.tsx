
import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, User, Plane, Globe, Mail, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  preferredAirline: string;
  frequentFlyerNumber: string;
  travelType: string;
  nationality: string;
  country: string;
  email: string;
  password: string;
  profilePhoto: File | null;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    preferredAirline: '',
    frequentFlyerNumber: '',
    travelType: '',
    nationality: '',
    country: '',
    email: '',
    password: '',
    profilePhoto: null,
  });

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const airlines = [
    'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
    'JetBlue Airways', 'Alaska Airlines', 'British Airways', 'Lufthansa',
    'Air France', 'KLM', 'Emirates', 'Qatar Airways', 'Singapore Airlines',
    'Cathay Pacific', 'Turkish Airlines', 'Ethiopian Airlines'
  ];

  const travelTypes = [
    { value: 'business', label: 'Business Travel' },
    { value: 'leisure', label: 'Leisure Travel' },
    { value: 'mixed', label: 'Mixed (Business & Leisure)' },
    { value: 'adventure', label: 'Adventure Travel' },
    { value: 'luxury', label: 'Luxury Travel' }
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Italy', 'Spain', 'Netherlands', 'Australia', 'Japan', 'South Korea',
    'Singapore', 'Brazil', 'Mexico', 'Argentina', 'South Africa'
  ];

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // This will be connected to Supabase in the next step
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return formData.preferredAirline.length > 0;
      case 3:
        return formData.travelType.length > 0;
      case 4:
        return formData.nationality.length > 0 && formData.country.length > 0;
      case 5:
        return formData.email.length > 0 && formData.password.length >= 6;
      case 6:
        return true; // Profile photo is optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">What's your name?</h3>
              <p className="text-white/70 text-sm">Let's start with your full name</p>
            </div>
            <div>
              <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Plane className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Your preferred airline</h3>
              <p className="text-white/70 text-sm">This helps us personalize your experience</p>
            </div>
            <div>
              <Label htmlFor="airline" className="text-white/90">Preferred Airline</Label>
              <select
                id="airline"
                value={formData.preferredAirline}
                onChange={(e) => handleInputChange('preferredAirline', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
              >
                <option value="" className="bg-gray-800">Select an airline</option>
                {airlines.map((airline) => (
                  <option key={airline} value={airline} className="bg-gray-800">
                    {airline}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="frequentFlyer" className="text-white/90">Frequent Flyer Number (Optional)</Label>
              <Input
                id="frequentFlyer"
                type="text"
                value={formData.frequentFlyerNumber}
                onChange={(e) => handleInputChange('frequentFlyerNumber', e.target.value)}
                placeholder="Enter your frequent flyer number"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Globe className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Travel preferences</h3>
              <p className="text-white/70 text-sm">What type of traveler are you?</p>
            </div>
            <div>
              <Label className="text-white/90">Travel Type</Label>
              <RadioGroup
                value={formData.travelType}
                onValueChange={(value) => handleInputChange('travelType', value)}
                className="mt-2"
              >
                {travelTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="border-white/30 text-blue-400"
                    />
                    <Label htmlFor={type.value} className="text-white/90 cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Globe className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Where are you from?</h3>
              <p className="text-white/70 text-sm">Help us understand your background</p>
            </div>
            <div>
              <Label htmlFor="nationality" className="text-white/90">Nationality</Label>
              <select
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
              >
                <option value="" className="bg-gray-800">Select your nationality</option>
                {countries.map((country) => (
                  <option key={country} value={country} className="bg-gray-800">
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="country" className="text-white/90">Country of Residence</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
              >
                <option value="" className="bg-gray-800">Select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country} className="bg-gray-800">
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Create your account</h3>
              <p className="text-white/70 text-sm">We'll use this to sign you in</p>
            </div>
            <div>
              <Label htmlFor="email" className="text-white/90">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <p className="text-xs text-white/50 mt-1">Password must be at least 6 characters long</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Camera className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Add a profile photo</h3>
              <p className="text-white/70 text-sm">Optional - you can skip this step</p>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                {formData.profilePhoto ? (
                  <div className="space-y-2">
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full mx-auto object-cover"
                    />
                    <p className="text-white/90 text-sm">{formData.profilePhoto.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('profilePhoto', null)}
                      className="text-white/70 hover:text-white"
                    >
                      Remove photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-white/50" />
                    <p className="text-white/70">Click to upload or drag and drop</p>
                    <p className="text-white/50 text-xs">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleInputChange('profilePhoto', file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
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
      <DialogContent className="max-w-md mx-auto bg-black/40 backdrop-blur-xl border-white/20 text-white p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-white/70">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/10" />
          </div>

          {/* Form content */}
          <div className="p-6">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="p-6 pt-0 flex justify-between">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Create Account
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
