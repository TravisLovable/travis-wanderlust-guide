import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TravelContextType {
  passport: string;
  origin: string;
  setPassport: (v: string) => void;
  setOrigin: (v: string) => void;
  ready: boolean;
}

const TravelContext = createContext<TravelContextType>({
  passport: 'United States',
  origin: '',
  setPassport: () => {},
  setOrigin: () => {},
  ready: false,
});

export const useTravelContext = () => useContext(TravelContext);

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'South Korea', 'Brazil', 'Mexico', 'India', 'China', 'South Africa',
  'Nigeria', 'United Arab Emirates', 'Singapore', 'New Zealand', 'Ireland',
  'Italy', 'Spain', 'Netherlands', 'Sweden', 'Switzerland', 'Norway', 'Denmark',
  'Portugal', 'Poland', 'Argentina', 'Chile', 'Colombia', 'Philippines', 'Thailand',
  'Israel', 'Egypt', 'Kenya', 'Ghana',
];

export { COUNTRIES };

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [passport, setPassport] = useState('United States');
  const [origin, setOrigin] = useState('');
  const [ready, setReady] = useState(false);

  // Auto-detect origin via IP geolocation
  useEffect(() => {
    if (origin) return; // Don't override if already set
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.country_name) {
          setOrigin(data.city ? `${data.city}, ${data.country_name}` : data.country_name);
        }
      })
      .catch(() => {
        setOrigin('United States'); // fallback
      });
  }, []);

  // Load passport from user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('users')
            .select('country_data')
            .eq('auth_id', user.id);
          if (data?.[0]?.country_data) {
            const name = data[0].country_data.name || data[0].country_data.code;
            if (name) setPassport(name);
          }
        }
      } catch {
        // Keep defaults
      } finally {
        setReady(true);
      }
    };
    loadProfile();
  }, []);

  return (
    <TravelContext.Provider value={{ passport, origin, setPassport, setOrigin, ready }}>
      {children}
    </TravelContext.Provider>
  );
};
