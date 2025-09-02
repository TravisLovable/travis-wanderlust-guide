import { Sun, Moon, Globe, Sparkles, Pin, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import UserProfileDropdown from './UserProfileDropdown';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import WordCraftComponent from './WordCraftComponent';
import { usePinnedLocations, PinnedLocation } from '@/hooks/usePinnedLocations';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface HeaderProps {
    user: User;
    userProfile: any;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setIsAuthModalOpen: (open: boolean) => void;
    setCurrentLanguage: (language: string) => void;
    currentLanguage: string;
    onProfileUpdate: (profile: any) => void;
}
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


export default function Header({
    user,
    userProfile,
    isDarkMode,
    toggleTheme,
    setIsAuthModalOpen,
    setCurrentLanguage,
    currentLanguage,
    onProfileUpdate
}: HeaderProps) {
    const navigate = useNavigate();
    const { pinnedLocations, toSelectedPlace } = usePinnedLocations();

    const handlePinnedLocationClick = (locationId: string) => {
        const location = pinnedLocations.find(p => p.id === locationId);
        if (location) {
            const selectedPlace = toSelectedPlace(location);
            // Navigate to search results with the pinned location
            const searchParams = new URLSearchParams({
                destination: selectedPlace.formatted_address,
                name: selectedPlace.name,
                lat: selectedPlace.latitude.toString(),
                lng: selectedPlace.longitude.toString(),
                checkin: new Date().toISOString().split('T')[0], // Default to today
                checkout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week later
                ...(selectedPlace.country_code && { country: selectedPlace.country_code }),
                ...(selectedPlace.region && { region: selectedPlace.region }),
                ...(selectedPlace.place_id && { placeId: selectedPlace.place_id }),
            });
            navigate(`/search?${searchParams.toString()}`);
        }
    };

    const getCountryFlag = (location: PinnedLocation) => {
        const dest = location.formatted_address.toLowerCase();
        
        if (dest.includes('south africa') || dest.includes('cape town') || dest.includes('johannesburg')) {
            return '🇿🇦';
        }
        if (dest.includes('united states') || dest.includes('usa') || dest.includes('new york') || dest.includes('los angeles')) {
            return '🇺🇸';
        }
        if (dest.includes('united kingdom') || dest.includes('london') || dest.includes('england')) {
            return '🇬🇧';
        }
        if (dest.includes('france') || dest.includes('paris')) {
            return '🇫🇷';
        }
        if (dest.includes('japan') || dest.includes('tokyo')) {
            return '🇯🇵';
        }
        if (dest.includes('italy') || dest.includes('rome') || dest.includes('milan')) {
            return '🇮🇹';
        }
        if (dest.includes('spain') || dest.includes('madrid') || dest.includes('barcelona')) {
            return '🇪🇸';
        }
        if (dest.includes('germany') || dest.includes('berlin') || dest.includes('munich')) {
            return '🇩🇪';
        }
        if (dest.includes('australia') || dest.includes('sydney') || dest.includes('melbourne')) {
            return '🇦🇺';
        }
        if (dest.includes('canada') || dest.includes('toronto') || dest.includes('vancouver')) {
            return '🇨🇦';
        }
        
        return null;
    };

    return (
        <header className="px-3 py-3 border-b border-border/30 backdrop-blur-sm relative z-10 animate-slide-in-up">
            <div className="max-w-none mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="text-3xl text-foreground tracking-tight font-unbounded hover:text-foreground/80 transition-all duration-300 cursor-pointer interactive-scale group relative"
                >
                    {/* <WordCraftComponent /> */}
                    Travis.
                    <div className="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="w-4 h-4 text-blue-400 animate-sparkle" />
                    </div>
                </button>
                <div className="flex items-center space-x-2">
                    {user ? (
                        <>
                            {/* Pinned Locations Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="rounded-full interactive-scale relative"
                                        title="Pinned Locations"
                                    >
                                        <Pin className="w-5 h-5 hover:animate-wiggle transition-all duration-300" strokeWidth={1.5} />
                                        {pinnedLocations.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {pinnedLocations.length}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto animate-slide-in-up">
                                    {pinnedLocations.length === 0 ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            <Pin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No pinned locations yet</p>
                                            <p className="text-xs mt-1">Pin locations from search results</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                                                Pinned Locations ({pinnedLocations.length})
                                            </div>
                                            {pinnedLocations.slice(0, 8).map((location) => (
                                                <DropdownMenuItem
                                                    key={location.id}
                                                    onClick={() => handlePinnedLocationClick(location.id)}
                                                    className="flex items-center space-x-3 p-3 cursor-pointer hover:animate-slide-in-left transition-all duration-200"
                                                >
                                                    {getCountryFlag(location) ? (
                                                        <span className="text-lg hover:animate-wiggle transition-all duration-300 flex-shrink-0">
                                                            {getCountryFlag(location)}
                                                        </span>
                                                    ) : (
                                                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{location.name}</div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {location.formatted_address}
                                                        </div>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                            {pinnedLocations.length > 8 && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border">
                                                    Showing 8 of {pinnedLocations.length} pinned locations
                                                </div>
                                            )}
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full interactive-scale">
                                        <Globe className="w-5 h-5 hover:animate-bounce-gentle transition-all duration-300" strokeWidth={1.5} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 animate-slide-in-up">
                                    {languages.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => setCurrentLanguage(lang.code)}
                                            className="flex items-center space-x-3 hover:animate-slide-in-left transition-all duration-200"
                                        >
                                            <span className="text-lg hover:animate-wiggle transition-all duration-300">{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
                            </Button>

                            <UserProfileDropdown
                                user={user}
                                userProfile={userProfile}
                                isDarkMode={isDarkMode}
                                toggleTheme={toggleTheme}
                                currentLanguage={currentLanguage}
                                setCurrentLanguage={setCurrentLanguage}
                                onProfileUpdate={onProfileUpdate}
                            />
                        </>
                    ) : (
                        <>
                            {/* Pinned Locations Dropdown for non-authenticated users */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="rounded-full interactive-scale relative"
                                        title="Pinned Locations"
                                    >
                                        <Pin className="w-5 h-5 hover:animate-wiggle transition-all duration-300" strokeWidth={1.5} />
                                        {pinnedLocations.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {pinnedLocations.length}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto animate-slide-in-up">
                                    {pinnedLocations.length === 0 ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            <Pin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No pinned locations yet</p>
                                            <p className="text-xs mt-1">Pin locations from search results</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                                                Pinned Locations ({pinnedLocations.length})
                                            </div>
                                            {pinnedLocations.slice(0, 8).map((location) => (
                                                <DropdownMenuItem
                                                    key={location.id}
                                                    onClick={() => handlePinnedLocationClick(location.id)}
                                                    className="flex items-center space-x-3 p-3 cursor-pointer hover:animate-slide-in-left transition-all duration-200"
                                                >
                                                    {getCountryFlag(location) ? (
                                                        <span className="text-lg hover:animate-wiggle transition-all duration-300 flex-shrink-0">
                                                            {getCountryFlag(location)}
                                                        </span>
                                                    ) : (
                                                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{location.name}</div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {location.formatted_address}
                                                        </div>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                            {pinnedLocations.length > 8 && (
                                                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border">
                                                    Showing 8 of {pinnedLocations.length} pinned locations
                                                </div>
                                            )}
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Language Selector */}
                           

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full interactive-scale"
                            >
                                {isDarkMode ?
                                    <Sun className="w-5 h-5 hover:animate-wiggle transition-all duration-300 text-yellow-400" strokeWidth={1.5} /> :
                                    <Moon className="w-5 h-5 hover:animate-wiggle transition-all duration-300 text-blue-400" strokeWidth={1.5} />
                                }
                            </Button>

                            <Button
                                onClick={() => setIsAuthModalOpen(true)}
                                variant="outline"
                                className="interactive-scale hover:animate-glow-pulse"
                            >
                                Log In / Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
