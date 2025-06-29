
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Globe, Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfileDropdownProps {
  user: any;
  userProfile: any;
  currentLanguage?: string;
  setCurrentLanguage?: (lang: string) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  languages?: Array<{ code: string; name: string; flag: string }>;
}

const UserProfileDropdown = ({ 
  user, 
  userProfile, 
  currentLanguage, 
  setCurrentLanguage, 
  isDarkMode, 
  toggleTheme, 
  languages 
}: UserProfileDropdownProps) => {
  const { toast } = useToast();

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
    return user?.user_metadata?.full_name || userProfile?.full_name || user?.email || 'User';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.profile_photo_url} alt="Profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex items-center space-x-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile?.profile_photo_url} alt="Profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {userProfile && (
          <>
            <div className="px-2 py-1 text-xs text-muted-foreground">
              <div>Airline: {userProfile.preferred_airline || 'Not set'}</div>
              <div>Travel: {userProfile.travel_type || 'Not set'}</div>
              <div>Country: {userProfile.nationality || 'Not set'}</div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Language Selection */}
        {languages && setCurrentLanguage && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Language</div>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setCurrentLanguage(lang.code)}
                className="flex items-center space-x-3"
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
                {currentLanguage === lang.code && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Theme Toggle */}
        {toggleTheme && (
          <>
            <DropdownMenuItem onClick={toggleTheme}>
              {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
