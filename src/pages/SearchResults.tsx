import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import LoadingIntelligence from '@/components/LoadingIntelligence';
import ResultsPage from '@/components/ResultsPage';
import { SelectedPlace } from '@/hooks/useGooglePlaces';

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showLoading, setShowLoading] = useState(false);
    const [placeDetails, setPlaceDetails] = useState<SelectedPlace | null>(null);
    const [dates, setDates] = useState({ checkin: '', checkout: '' });
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState('en');

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
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLoadingComplete = () => {
        setShowLoading(false);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('loading');
        navigate(`/search?${newSearchParams.toString()}`, { replace: true });
    };

    const handleBack = () => {
        navigate('/', { replace: false });
    };

    const handleNewSearch = (newPlaceDetails: SelectedPlace | null, newDates: { checkin: string; checkout: string }, skipTransition = false) => {
        if (!newPlaceDetails) return;

        const params = new URLSearchParams({
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

        navigate(`/search?${params.toString()}`, { replace: false });
    };

    // Show loading state if we don't have the required data yet
    if (!placeDetails || !dates.checkin || !dates.checkout) {
        return (
            <div className="min-h-screen w-full bg-background" />
        );
    }

    let content: React.ReactNode;
    if (showLoading) {
        content = (
            <LoadingIntelligence />
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
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                setCurrentLanguage={setCurrentLanguage}
                currentLanguage={currentLanguage}
            />
            {content}
        </div>
    );
};

export default SearchResults;
