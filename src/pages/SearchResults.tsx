import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ResultsPage from '@/components/ResultsPage';
import { Resolve } from '@/components/travis/Resolve';
import { SelectedPlace } from '@/hooks/useGooglePlaces';
import { useAuth } from '@/contexts/AuthContext';

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userProfile } = useAuth();
    const [showLoading, setShowLoading] = useState(false);
    const [placeDetails, setPlaceDetails] = useState<SelectedPlace | null>(null);
    const [dates, setDates] = useState({ checkin: '', checkout: '' });

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

    if (showLoading) {
        const passportName = userProfile?.country_data?.name;
        const passportShort =
            !passportName || passportName === 'United States'
                ? 'US'
                : passportName.toUpperCase().slice(0, 3);
        const destCode = (placeDetails.country_code ?? placeDetails.name.slice(0, 3))
            .toUpperCase()
            .slice(0, 3);
        return (
            <Resolve
                destination={placeDetails.name}
                destLatLng={[placeDetails.latitude, placeDetails.longitude]}
                destCode={destCode}
                originCode="NYC"
                checkin={dates.checkin}
                checkout={dates.checkout}
                passport={passportShort}
                onDone={handleLoadingComplete}
            />
        );
    }

    return (
        <ResultsPage
            placeDetails={placeDetails}
            dates={dates}
            onBack={handleBack}
            onNewSearch={handleNewSearch}
        />
    );
};

export default SearchResults;
