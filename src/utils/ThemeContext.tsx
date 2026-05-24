import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors, darkColors, ColorTheme } from './theme';

interface ThemeContextValue {
  colors: ColorTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const activeColors = isDark ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{ colors: activeColors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
