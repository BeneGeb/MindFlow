import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useHabitStore } from './src/store/habitStore';
import { useTrackingStore } from './src/store/trackingStore';
import { usePlannerStore } from './src/store/plannerStore';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import { requestPermissions } from './src/utils/notificationService';

function AppContent() {
  const hydrateHabits = useHabitStore((s) => s.hydrate);
  const hydrateTracking = useTrackingStore((s) => s.hydrate);
  const hydratePlanner = usePlannerStore((s) => s.hydrate);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    hydrateHabits();
    hydrateTracking();
    hydratePlanner();
    // Request notification permissions once on startup
    requestPermissions().catch(() => {/* ignore */});
  }, []);

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, border: colors.border, primary: colors.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, border: colors.border, primary: colors.primary } };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
