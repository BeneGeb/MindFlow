import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors, darkColors, ColorTheme } from './theme';
import { storage, STORAGE_KEYS } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: ColorTheme;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors,
  isDark: false,
  themePreference: 'system',
  setThemePreference: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [themePreference, setPreferenceState] = useState<ThemePreference>('system');

  // Load stored preference on mount
  useEffect(() => {
    storage.get<ThemePreference>(STORAGE_KEYS.THEME_PREFERENCE).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreferenceState(saved);
      }
    });
  }, []);

  const setThemePreference = (p: ThemePreference) => {
    setPreferenceState(p);
    storage.set(STORAGE_KEYS.THEME_PREFERENCE, p);
  };

  // Derive isDark from preference (fall back to system when 'system')
  const isDark =
    themePreference === 'dark'
      ? true
      : themePreference === 'light'
      ? false
      : scheme === 'dark';

  const activeColors = isDark ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{ colors: activeColors, isDark, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
