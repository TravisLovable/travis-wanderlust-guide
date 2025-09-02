import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Plane, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCountryData, CountryData } from '@/hooks/useCountryData';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userProfile: any;
  onProfileUpdate: (profile: any) => void;
}

const airlines = [
  'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
  'JetBlue Airways', 'Alaska Airlines', 'British Airways', 'Lufthansa',
  'Air France', 'KLM', 'Emirates', 'Qatar Airways', 'Singapore Airlines',
  'Cathay Pacific', 'Japan Airlines', 'All Nippon Airways', 'Turkish Airlines',
  'Air Canada', 'Qantas', 'Virgin Atlantic', 'Other'
];

const travelTypes = [
  'Business', 'Leisure', 'Mixed', 'Adventure', 'Cultural', 'Luxury', 'Budget'
];

// Countries are now fetched dynamically from the REST Countries API via useCountryData hook

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  userProfile,
  onProfileUpdate
}) => {
  const [fullName, setFullName] = useState('');
  const [preferredAirline, setPreferredAirline] = useState('');
  const [travelType, setTravelType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { countries, isLoading: countriesLoading, error: countriesError } = useCountryData();

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPreferredAirline(userProfile.preferred_airline || '');
      setTravelType(userProfile.travel_type || '');
      // Set the selected country from country_data
      setSelectedCountry(userProfile.country_data || null);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profileData = {
        full_name: fullName,
        preferred_airline: preferredAirline,
        travel_type: travelType,
        country_data: selectedCountry,
        onboarding_completed: true
      };

      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('auth_id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Preferred Airline */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <span>Preferred Airline</span>
            </Label>
            <Select value={preferredAirline} onValueChange={setPreferredAirline}>
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred airline" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {airlines.map((airline) => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Travel Type */}
          <div className="space-y-2">
            <Label>Travel Type</Label>
            <Select value={travelType} onValueChange={setTravelType}>
              <SelectTrigger>
                <SelectValue placeholder="Select your travel type" />
              </SelectTrigger>
              <SelectContent>
                {travelTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passport Country */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Passport Country</span>
            </Label>
            <Select
              value={selectedCountry?.code || ''}
              onValueChange={(value) => {
                const country = countries.find(c => c.code === value);
                setSelectedCountry(country || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your passport country" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {countriesLoading ? (
                  <SelectItem value="" disabled>Loading countries...</SelectItem>
                ) : countriesError ? (
                  <SelectItem value="" disabled>Error loading countries</SelectItem>
                ) : (
                  countries.map((country) => (
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
        </div>

        <div className="flex space-x-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsModal;
