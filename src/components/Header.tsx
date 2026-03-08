import { Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
];

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    currentLanguage?: string;
    setCurrentLanguage?: (lang: string) => void;
}

export default function Header({
    isDarkMode,
    toggleTheme,
    currentLanguage = 'en',
    setCurrentLanguage
}: HeaderProps) {
    const navigate = useNavigate();
    const { user, openAuthModal } = useAuth();

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
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full text-foreground/70 hover:text-foreground"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
                    </Button>

                    {/* Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-foreground/70 hover:text-foreground"
                                title="Language"
                            >
                                <Globe className="w-5 h-5" strokeWidth={1.5} />
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

                    {user ? (
                        <UserProfileDropdown
                            isDarkMode={isDarkMode}
                            toggleTheme={toggleTheme}
                        />
                    ) : (
                        <button
                            onClick={openAuthModal}
                            className="ml-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}
