
import React, { useState, useEffect } from 'react';
import { User, LogOut, Plane, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  full_name: string;
  preferred_airline: string;
  travel_type: string;
  profile_photo_url?: string;
}

interface UserAvatarProps {
  user: SupabaseUser;
}

const UserAvatar = ({ user }: UserAvatarProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, preferred_airline, travel_type, profile_photo_url')
          .eq('auth_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
    );
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.profile_photo_url} alt={displayName} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 border-white/20" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.profile_photo_url} alt={displayName} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-white/70">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/20" />
        {profile && (
          <>
            <DropdownMenuItem className="text-white/80 focus:bg-white/10">
              <Plane className="mr-2 h-4 w-4" />
              <span>{profile.preferred_airline}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white/80 focus:bg-white/10">
              <Globe className="mr-2 h-4 w-4" />
              <span>{profile.travel_type}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/20" />
          </>
        )}
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-white/80 focus:bg-white/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
