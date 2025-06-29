
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Globe, Sun, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfileDropdownProps {
  user: any;
  userProfile: any;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
}

const UserProfileDropdown = ({ 
  user, 
  userProfile, 
  isDarkMode, 
  toggleTheme, 
  currentLanguage, 
  setCurrentLanguage 
}: UserProfileDropdownProps) => {
  const { toast } = useToast();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Mandarin', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' }
  ];

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
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center space-x-2 p-3">
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
        
        {/* Accessibility Controls */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">ACCESSIBILITY</span>
          </div>
          
          {/* Language Selector */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center w-full px-2 py-2 text-sm">
              <Globe className="mr-2 h-4 w-4" />
              <span>Language</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {languages.find(lang => lang.code === currentLanguage)?.flag}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setCurrentLanguage(lang.code)}
                  className="flex items-center space-x-3"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          {/* Theme Toggle */}
          <DropdownMenuItem onClick={toggleTheme} className="flex items-center px-2 py-2">
            {isDarkMode ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Profile Information */}
        {userProfile && (
          <>
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <div className="mb-1">Airline: {userProfile.preferred_airline || 'Not set'}</div>
              <div className="mb-1">Travel: {userProfile.travel_type || 'Not set'}</div>
              <div>Country: {userProfile.nationality || 'Not set'}</div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Menu Items */}
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
