import { Sun, Moon, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserProfileDropdown from './UserProfileDropdown';
import { User } from '@supabase/supabase-js';

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

    return (
        <header className="px-3 py-3 border-b border-border/30 backdrop-blur-sm relative z-10">
            <div className="max-w-none mx-auto flex items-center justify-between">
                <button 
                    onClick={() => navigate('/')}
                    className="text-3xl text-foreground tracking-tight font-unbounded hover:text-foreground/80 transition-colors cursor-pointer"
                >
                    Travis
                </button>
                <div className="flex items-center space-x-2">
                    {user ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Globe className="w-5 h-5" strokeWidth={1.5} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {languages.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => setCurrentLanguage(lang.code)}
                                            className="flex items-center space-x-3"
                                        >
                                            <span className="text-lg">{lang.flag}</span>
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
                            {/* Language Selector */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Globe className="w-5 h-5" strokeWidth={1.5} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {languages.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => setCurrentLanguage(lang.code)}
                                            className="flex items-center space-x-3"
                                        >
                                            <span className="text-lg">{lang.flag}</span>
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

                            <Button onClick={() => setIsAuthModalOpen(true)} variant="outline">
                                Log In / Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
