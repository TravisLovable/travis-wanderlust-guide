import React, { useEffect, useState } from 'react';
import CurrencyPresenter from '../presenters/CurrencyPresenter';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { supabase } from '@/integrations/supabase/client';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface CurrencyContainerProps {
    placeDetails: SelectedPlace | null;
}

const CurrencyContainer: React.FC<CurrencyContainerProps> = ({ placeDetails }) => {
    const [currencyAmount, setCurrencyAmount] = useState(100);
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const fetchUserCountry = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserLoading(false);
            }
            let { data: userCountry, error } = await supabase
                .from('users')
                .select('country_data')
                .eq('auth_id', user.id);


            if (userCountry && userCountry[0]?.country_data?.currency) {
                setBaseCurrency(userCountry[0].country_data.currency);
            } else {
                setBaseCurrency('USD'); // Fallback to USD
            }
        }

        fetchUserCountry();
    }, [])

    // Monitor placeDetails changes and log currency extraction
    useEffect(() => {
        if (placeDetails) {
            const destinationName = placeDetails.formatted_address || placeDetails.name;
            // Extract currency info for destination
            import('@/utils/currencyMapping').then(({ extractCountryFromDestination, getCurrencyFromDestination }) => {
                extractCountryFromDestination(destinationName);
                getCurrencyFromDestination(destinationName);
            });
        }
    }, [placeDetails, baseCurrency]);



    // Use real currency exchange data with destination-based currency
    const destinationName = placeDetails?.formatted_address || placeDetails?.name || '';
    const { currencyData, multiCurrencyData, isLoading, error } = useCurrencyExchange(baseCurrency, destinationName);

    // Data transformation logic
    const transformedData = {
        currencyAmount,
        onCurrencyAmountChange: (value: number) => setCurrencyAmount(value),
        baseCurrency,
        onBaseCurrencyChange: setBaseCurrency,
        currencyData,
        multiCurrencyData,
        isLoading,
        error
    };

    return (
        <CurrencyPresenter data={transformedData} userLoading={userLoading} />
    );
};

export default CurrencyContainer;
