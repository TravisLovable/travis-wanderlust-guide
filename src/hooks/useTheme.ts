import { useState, useLayoutEffect, useCallback } from 'react';

const STORAGE_KEY = 'travis-theme';
const DEFAULT_THEME = 'light';

function getStoredIsDark(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
  return stored === 'dark';
}

function applyDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const isDark = getStoredIsDark();
    applyDarkClass(isDark);
    return isDark;
  });

  useLayoutEffect(() => {
    applyDarkClass(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { isDarkMode, toggleTheme };
}
