
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  dates: { from: Date | undefined; to: Date | undefined } | null;
  setDates: (dates: { from: Date | undefined; to: Date | undefined } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [dates, setDates] = useState<{ from: Date | undefined; to: Date | undefined } | null>(null);

  return (
    <AppContext.Provider value={{ dates, setDates }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
