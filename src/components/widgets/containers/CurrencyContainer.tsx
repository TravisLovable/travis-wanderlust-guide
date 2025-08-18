import React, { useEffect, useState } from 'react';
import CurrencyPresenter from '../presenters/CurrencyPresenter';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyContainerProps {
    destination: string;
}

const CurrencyContainer: React.FC<CurrencyContainerProps> = ({ destination }) => {
    const [currencyAmount, setCurrencyAmount] = useState(100);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [userLoading, setUserLoading] = useState(true);
    useEffect(() => {

        

        const fetchUserCountry = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            console.log(user);
            if (user) {
                setUserLoading(false);
            }
            let { data: userCountry, error } = await supabase
                .from('users')
                .select('country')
                .eq('id', user.id);
            setUserCountry(userCountry[0].country);
            console.log("userCountry", userCountry);
        }

        fetchUserCountry();

    }, [userCountry, userLoading])


    // Use real currency exchange data with destination-based currency
    const { currencyData, isLoading, error } = useCurrencyExchange('', destination);

    // Data transformation logic
    const transformedData = {
        currencyAmount,
        onCurrencyAmountChange: (value: number) => setCurrencyAmount(value),
        currencyData,
        isLoading,
        error
    };

    return (
        <CurrencyPresenter data={transformedData} userLoading={userLoading} />
    );
};

export default CurrencyContainer;
