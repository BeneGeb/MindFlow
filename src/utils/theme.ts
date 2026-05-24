export const colors = {
  primary: '#7F77DD',      // Lila
  primaryLight: '#EAE8F9',
  accent: '#1D9E75',       // Grün
  accentLight: '#E0F4EE',
  background: '#FAF9F6',   // Creme
  surface: '#FFFFFF',
  border: '#EBEBEB',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#1D9E75',
  warning: '#E8A838',
  error: '#E05C5C',
  tabBar: '#FFFFFF',
  tabBarBorder: '#F0F0F0',
};

export const darkColors = {
  primary: '#9D96E8',
  primaryLight: '#2A2747',
  accent: '#2CC68F',
  accentLight: '#1A3D30',
  background: '#0F0F17',
  surface: '#1C1C2A',
  border: '#2A2A3A',
  textPrimary: '#F0EFF8',
  textSecondary: '#9B9BB0',
  textMuted: '#5C5C7A',
  success: '#2CC68F',
  warning: '#F0B84A',
  error: '#F07070',
  tabBar: '#1C1C2A',
  tabBarBorder: '#2A2A3A',
};

export type ColorTheme = typeof colors;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '500' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
