import { useState, useCallback } from 'react';
import { normalizeDestination, formatDestination, getSearchableDestination, isSameDestination } from '@/utils/destinationHelpers';
import type { Destination, DestinationInput } from '@/types/destination';

/**
 * Hook for managing destination state with normalization and formatting
 */
export function useDestination(initialDestination?: DestinationInput) {
    const [destination, setDestinationState] = useState<Destination | null>(
        initialDestination ? normalizeDestination(initialDestination) : null
    );

    const setDestination = useCallback((input: DestinationInput | null) => {
        if (!input) {
            setDestinationState(null);
            return;
        }

        const normalized = normalizeDestination(input);
        setDestinationState(normalized);
    }, []);

    const getDisplayName = useCallback((format: 'short' | 'medium' | 'full' = 'medium') => {
        return destination ? formatDestination(destination, format) : '';
    }, [destination]);

    const getSearchableQuery = useCallback(() => {
        return destination ? getSearchableDestination(destination) : '';
    }, [destination]);

    const isSameAs = useCallback((other: DestinationInput) => {
        if (!destination) return false;
        const otherNormalized = normalizeDestination(other);
        return isSameDestination(destination, otherNormalized);
    }, [destination]);

    const getCountryFlag = useCallback(() => {
        return destination?.countryFlag;
    }, [destination]);

    const getCoordinates = useCallback(() => {
        return destination?.coordinates;
    }, [destination]);

    return {
        destination,
        setDestination,
        getDisplayName,
        getSearchableQuery,
        isSameAs,
        getCountryFlag,
        getCoordinates,
        hasDestination: !!destination,
        // Legacy string access for backward compatibility
        displayName: getDisplayName(),
        shortName: getDisplayName('short'),
        fullName: getDisplayName('full'),
    };
}

/**
 * Hook for managing a list of destinations (e.g., pinned destinations, history)
 */
export function useDestinationList(initialDestinations: DestinationInput[] = []) {
    const [destinations, setDestinationsState] = useState<Destination[]>(
        initialDestinations.map(dest => normalizeDestination(dest))
    );

    const addDestination = useCallback((input: DestinationInput) => {
        const normalized = normalizeDestination(input);
        setDestinationsState(prev => {
            // Check if already exists
            const exists = prev.some(dest => isSameDestination(dest, normalized));
            if (exists) return prev;

            return [normalized, ...prev];
        });
    }, []);

    const removeDestination = useCallback((input: DestinationInput) => {
        const normalized = normalizeDestination(input);
        setDestinationsState(prev =>
            prev.filter(dest => !isSameDestination(dest, normalized))
        );
    }, []);

    const hasDestination = useCallback((input: DestinationInput) => {
        const normalized = normalizeDestination(input);
        return destinations.some(dest => isSameDestination(dest, normalized));
    }, [destinations]);

    const clearDestinations = useCallback(() => {
        setDestinationsState([]);
    }, []);

    const moveToTop = useCallback((input: DestinationInput) => {
        const normalized = normalizeDestination(input);
        setDestinationsState(prev => {
            const filtered = prev.filter(dest => !isSameDestination(dest, normalized));
            return [normalized, ...filtered];
        });
    }, []);

    return {
        destinations,
        addDestination,
        removeDestination,
        hasDestination,
        clearDestinations,
        moveToTop,
        count: destinations.length,
        isEmpty: destinations.length === 0,
    };
}
