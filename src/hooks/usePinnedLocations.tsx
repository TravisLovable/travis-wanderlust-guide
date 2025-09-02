import { useState, useEffect, useCallback } from 'react';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

export interface PinnedLocation {
  id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  region?: string;
  place_id?: string;
  pinnedAt: number; // timestamp
}

const STORAGE_KEY = 'travis_pinned_locations';
const MAX_PINNED_LOCATIONS = 10;

export function usePinnedLocations() {
  const [pinnedLocations, setPinnedLocations] = useState<PinnedLocation[]>([]);

  // Load pinned locations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPinnedLocations(parsed);
      }
    } catch (error) {
      console.error('Failed to load pinned locations:', error);
    }
  }, []);

  // Save to localStorage whenever pinnedLocations changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedLocations));
    } catch (error) {
      console.error('Failed to save pinned locations:', error);
    }
  }, [pinnedLocations]);

  const pinLocation = useCallback((place: SelectedPlace) => {
    const newPinned: PinnedLocation = {
      id: place.place_id || `pin_${Date.now()}`,
      name: place.name,
      formatted_address: place.formatted_address,
      latitude: place.latitude,
      longitude: place.longitude,
      country_code: place.country_code,
      region: place.region,
      place_id: place.place_id,
      pinnedAt: Date.now()
    };

    setPinnedLocations(prev => {
      // Check if already pinned
      const exists = prev.some(p => 
        p.formatted_address === newPinned.formatted_address ||
        (p.place_id && p.place_id === newPinned.place_id)
      );
      
      if (exists) {
        return prev;
      }

      // Add to beginning and limit total count
      const updated = [newPinned, ...prev].slice(0, MAX_PINNED_LOCATIONS);
      return updated;
    });
  }, []);

  const unpinLocation = useCallback((locationId: string) => {
    setPinnedLocations(prev => prev.filter(p => p.id !== locationId));
  }, []);

  const isPinned = useCallback((place: SelectedPlace) => {
    return pinnedLocations.some(p => 
      p.formatted_address === place.formatted_address ||
      (p.place_id && place.place_id && p.place_id === place.place_id)
    );
  }, [pinnedLocations]);

  const clearAllPinned = useCallback(() => {
    setPinnedLocations([]);
  }, []);

  const getPinnedLocation = useCallback((locationId: string): PinnedLocation | undefined => {
    return pinnedLocations.find(p => p.id === locationId);
  }, [pinnedLocations]);

  // Convert PinnedLocation back to SelectedPlace format
  const toSelectedPlace = useCallback((pinned: PinnedLocation): SelectedPlace => {
    return {
      name: pinned.name,
      formatted_address: pinned.formatted_address,
      latitude: pinned.latitude,
      longitude: pinned.longitude,
      country_code: pinned.country_code,
      region: pinned.region,
      place_id: pinned.place_id
    };
  }, []);

  return {
    pinnedLocations,
    pinLocation,
    unpinLocation,
    isPinned,
    clearAllPinned,
    getPinnedLocation,
    toSelectedPlace,
    count: pinnedLocations.length,
    isEmpty: pinnedLocations.length === 0
  };
}