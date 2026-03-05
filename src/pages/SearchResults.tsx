import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';
import LoadingIntelligence from '@/components/LoadingIntelligence';
import ResultsPage from '@/components/ResultsPage';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showLoading, setShowLoading] = useState(false);
    const [placeDetails, setPlaceDetails] = useState<SelectedPlace | null>(null);
    const [dates, setDates] = useState({ checkin: '', checkout: '' });
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

    // Parse URL parameters on component mount
    useEffect(() => {
        const destination = searchParams.get('destination');
        const name = searchParams.get('name');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const country = searchParams.get('country');
        const region = searchParams.get('region');
        const placeId = searchParams.get('placeId');
        const checkin = searchParams.get('checkin');
        const checkout = searchParams.get('checkout');
        const loading = searchParams.get('loading');

        if (destination && lat && lng && checkin && checkout) {
            console.log('SearchResults URL params:', { destination, name, lat, lng, country, region, placeId });
            console.log('Parsing coordinates:', {
                latString: lat,
                lngString: lng,
                parsedLat: parseFloat(lat),
                parsedLng: parseFloat(lng)
            });

            const reconstructedPlace: SelectedPlace = {
                name: name || destination,
                formatted_address: destination,
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                country_code: country || undefined,
                region: region || undefined,
                place_id: placeId || `place_${Date.now()}`
            };

            setPlaceDetails(reconstructedPlace);
            setDates({ checkin, checkout });
            setShowLoading(loading === 'true');
        } else {
            // Invalid URL parameters, redirect to home
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate]);

    // Authentication setup
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    setTimeout(async () => {
                        const { data: profile } = await supabase
                            .from('users')
                            .select('*')
                            .eq('auth_id', session.user.id)
                            .single();

                        setUserProfile(profile);

                        if (!profile || !profile.onboarding_completed) {
                            setIsOnboardingModalOpen(true);
                        }
                    }, 0);
                } else {
                    setUserProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleProfileUpdate = (profile: any) => {
        setUserProfile(profile);
    };

    const handleLoadingComplete = () => {
        setShowLoading(false);
        // Update URL to remove loading parameter
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('loading');
        navigate(`/search?${newSearchParams.toString()}`, { replace: true });
    };

    const handleBack = () => {
        navigate('/', { replace: false });
    };

    const handleNewSearch = (newPlaceDetails: SelectedPlace | null, newDates: { checkin: string; checkout: string }, skipTransition = false) => {
        if (!newPlaceDetails) return;

        // Create URL parameters for the new search
        const searchParams = new URLSearchParams({
            destination: newPlaceDetails.formatted_address,
            name: newPlaceDetails.name,
            lat: newPlaceDetails.latitude.toString(),
            lng: newPlaceDetails.longitude.toString(),
            checkin: newDates.checkin,
            checkout: newDates.checkout,
            ...(newPlaceDetails.country_code && { country: newPlaceDetails.country_code }),
            ...(newPlaceDetails.region && { region: newPlaceDetails.region }),
            ...(newPlaceDetails.place_id && { placeId: newPlaceDetails.place_id }),
            ...(!skipTransition && { loading: 'true' })
        });

        // Navigate to new search with updated parameters
        navigate(`/search?${searchParams.toString()}`, { replace: false });
    };

    // Show loading state if we don't have the required data yet
    if (!placeDetails || !dates.checkin || !dates.checkout) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <div className="rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    let content: React.ReactNode;
    if (showLoading) {
        content = (
            <LoadingIntelligence
                placeDetails={placeDetails}
                onComplete={handleLoadingComplete}
            />
        );
    } else {
        content = (
            <ResultsPage
                placeDetails={placeDetails}
                dates={dates}
                onBack={handleBack}
                onNewSearch={handleNewSearch}
            />
        );
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <Header
                user={user}
                userProfile={userProfile}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                setIsAuthModalOpen={setIsAuthModalOpen}
                setCurrentLanguage={setCurrentLanguage}
                currentLanguage={currentLanguage}
                onProfileUpdate={handleProfileUpdate}
            />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSignInSuccess={() => { }}
            />
            <OnboardingModal
                isOpen={isOnboardingModalOpen}
                onClose={() => setIsOnboardingModalOpen(false)}
                user={user}
            />
            {content}
        </div>
    );
};

export default SearchResults;
