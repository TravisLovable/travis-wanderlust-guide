
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Sparkles, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileSettingsModal from './ProfileSettingsModal';
import SettingsModal from './SettingsModal';

interface UserProfileDropdownProps {
  user: any;
  userProfile: any;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  onProfileUpdate: (profile: any) => void;
}

const UserProfileDropdown = ({
  user,
  userProfile,
  isDarkMode,
  toggleTheme,
  currentLanguage,
  setCurrentLanguage,
  onProfileUpdate
}: UserProfileDropdownProps) => {
  const { toast } = useToast();
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getInitials = () => {
    const firstName = user?.user_metadata?.first_name || userProfile?.full_name?.split(' ')[0] || '';
    const lastName = user?.user_metadata?.last_name || userProfile?.full_name?.split(' ')[1] || '';
    return (firstName[0] || '') + (lastName[0] || '');
  };

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || userProfile?.full_name || 'User';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full interactive-scale"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className="h-10 w-10 transition-all duration-300 hover:animate-bounce-gentle">
            <AvatarImage src={userProfile?.profile_photo_url} alt="Profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          {isHovered && (
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-blue-400 animate-sparkle" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 animate-slide-in-up" align="end" forceMount>
        <div className="flex items-center space-x-2 p-3 relative">
          <Avatar className="h-8 w-8 hover:animate-bounce-gentle transition-all duration-300">
            <AvatarImage src={userProfile?.profile_photo_url} alt="Profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{getDisplayName()}</p>
          </div>
          <div className="absolute top-2 right-2">
            <Star className="w-3 h-3 text-yellow-400 animate-sparkle" />
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Profile Information */}
        {userProfile && (
          <>
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <div className="mb-1">Airline: {userProfile.preferred_airline || 'Not set'}</div>
              <div className="mb-1">Travel: {userProfile.travel_type || 'Not set'}</div>
              <div>Country: {userProfile.country_data?.name || 'Not set'}</div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Enhanced Menu Items */}
        <DropdownMenuItem 
          onClick={() => setIsProfileSettingsOpen(true)}
          className="transition-all duration-200 hover:animate-slide-in-left"
        >
          <User className="mr-2 h-4 w-4 transition-all duration-300 hover:animate-bounce-gentle" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setIsSettingsOpen(true)}
          className="transition-all duration-200 hover:animate-slide-in-left"
        >
          <Settings className="mr-2 h-4 w-4 transition-all duration-300 hover:animate-wiggle" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="transition-all duration-200 hover:animate-slide-in-left text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4 transition-all duration-300 hover:animate-wiggle" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        user={user}
        userProfile={userProfile}
        onProfileUpdate={onProfileUpdate}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
      />
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
