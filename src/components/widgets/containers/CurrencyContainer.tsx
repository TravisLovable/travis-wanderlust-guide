import React, { useEffect, useState } from 'react';
import CurrencyPresenter from '../presenters/CurrencyPresenter';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyContainerProps {
    destination: string;
}

const CurrencyContainer: React.FC<CurrencyContainerProps> = ({ destination }) => {
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


            console.log('👤 User country data:', userCountry);

            if (userCountry && userCountry[0]?.country_data?.currency) {
                console.log('✅ Setting base currency to:', userCountry[0].country_data.currency);
                setBaseCurrency(userCountry[0].country_data.currency);
            } else {
                console.log("❌ No user country data found, falling back to USD");
                setBaseCurrency('USD'); // Fallback to USD
            }
        }

        fetchUserCountry();
    }, [])

    // Monitor destination changes and log currency extraction
    useEffect(() => {
        if (destination) {
            import('@/utils/currencyMapping').then(({ extractCountryFromDestination, getCurrencyFromDestination }) => {
                const extractedCountry = extractCountryFromDestination(destination);
                const currencyInfo = getCurrencyFromDestination(destination);
                console.log('🌍 Destination analysis:', {
                    original: destination,
                    extractedCountry,
                    currencyInfo,
                    baseCurrency
                });
            });
        }
    }, [destination, baseCurrency]);



    // Use real currency exchange data with destination-based currency
    const { currencyData, multiCurrencyData, isLoading, error } = useCurrencyExchange(baseCurrency, destination);

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
