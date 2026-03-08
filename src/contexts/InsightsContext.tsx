import { createContext, useContext, ReactNode } from 'react';
import { TravisInsights } from '@/types/insights';

interface InsightsContextType {
  insights: TravisInsights | null;
  loading: boolean;
  error: Error | null;
}

const InsightsContext = createContext<InsightsContextType>({
  insights: null,
  loading: false,
  error: null,
});

interface InsightsProviderProps {
  children: ReactNode;
  value: InsightsContextType;
}

export function InsightsProvider({ children, value }: InsightsProviderProps) {
  return (
    <InsightsContext.Provider value={value}>
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  return useContext(InsightsContext);
}
