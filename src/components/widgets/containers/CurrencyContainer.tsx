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
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        const fetchUserCountry = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setUserLoading(false);
                    return;
                }
                const { data: userCountry } = await supabase
                    .from('users')
                    .select('country_data')
                    .eq('auth_id', user.id);

                if (userCountry?.[0]?.country_data?.currency) {
                    setBaseCurrency(userCountry[0].country_data.currency);
                }
            } catch {
                // Keep defaults
            } finally {
                setUserLoading(false);
            }
        };
        fetchUserCountry();
    }, []);

    // Use real currency exchange data with place details (includes country_code)
    const { currencyData, multiCurrencyData, isLoading, error } = useCurrencyExchange(baseCurrency, placeDetails);

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
