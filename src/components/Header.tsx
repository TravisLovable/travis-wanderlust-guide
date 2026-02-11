import { Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserProfileDropdown from './UserProfileDropdown';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
];

interface HeaderProps {
    user: User;
    userProfile: any;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setIsAuthModalOpen: (open: boolean) => void;
    onProfileUpdate: (profile: any) => void;
    currentLanguage?: string;
    setCurrentLanguage?: (lang: string) => void;
}



export default function Header({
    user,
    userProfile,
    isDarkMode,
    toggleTheme,
    setIsAuthModalOpen,
    onProfileUpdate,
    currentLanguage = 'en',
    setCurrentLanguage
}: HeaderProps) {
    const navigate = useNavigate();

    const currentLang = languages.find(l => l.code === currentLanguage);
    const currentLangLabel = currentLang?.label || 'English';

    return (
        <header className="px-4 py-3 border-b border-border/30 backdrop-blur-sm relative z-10">
            <div className="max-w-none mx-auto flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="text-3xl text-foreground hover:text-foreground/80 transition-colors duration-200 cursor-pointer"
                    style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600, letterSpacing: '-0.02em' }}
                >
                    Travis
                </button>
                <div className="flex items-center space-x-1 mr-1">
                    {/* Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full px-2.5 gap-1.5 hover:opacity-70 transition-opacity duration-150"
                                style={{ color: '#2B2B2B' }}
                                title="Language"
                            >
                                <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                                <span className="text-xs">Language</span>
                                <ChevronDown className="w-3 h-3 opacity-70" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[120px]">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => setCurrentLanguage?.(lang.code)}
                                    className={currentLanguage === lang.code ? 'bg-secondary' : ''}
                                >
                                    {lang.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
                    </Button>

                    {user ? (
                        <UserProfileDropdown
                            user={user}
                            userProfile={userProfile}
                            isDarkMode={isDarkMode}
                            toggleTheme={toggleTheme}
                            onProfileUpdate={onProfileUpdate}
                        />
                    ) : (
                        <Button
                            onClick={() => setIsAuthModalOpen(true)}
                            variant="outline"
                            className="ml-1"
                        >
                            Log In / Sign Up
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
