import React from 'react';
import { useCountryData } from '@/hooks/useCountryData';

const CountryTest = () => {
    const { countries, isLoading, error } = useCountryData();

    if (isLoading) {
        return <div className="p-4">Loading countries...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Country Data Test ({countries.length} countries)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.slice(0, 12).map((country) => (
                    <div key={country.code} className="border rounded-lg p-3 flex items-center space-x-3">
                        <img
                            src={country.flag}
                            alt={country.name}
                            className="w-8 h-6 object-cover rounded"
                        />
                        <div>
                            <div className="font-medium">{country.name}</div>
                            <div className="text-sm text-gray-500">
                                {country.code} • {country.currency || 'N/A'} • {country.region}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountryTest;
