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

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy',
  'Spain', 'Japan', 'South Korea', 'China', 'Australia', 'New Zealand',
  'Brazil', 'Argentina', 'Mexico', 'India', 'Singapore', 'Thailand',
  'South Africa', 'Other'
];

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
  const [nationality, setNationality] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPreferredAirline(userProfile.preferred_airline || '');
      setTravelType(userProfile.travel_type || '');
      setNationality(userProfile.nationality || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profileData = {
        auth_id: user.id,
        full_name: fullName,
        preferred_airline: preferredAirline,
        travel_type: travelType,
        nationality: nationality,
        onboarding_completed: true
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(profileData)
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

          {/* Nationality */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Nationality</span>
            </Label>
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger>
                <SelectValue placeholder="Select your nationality" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
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
