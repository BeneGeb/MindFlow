import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { View, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useHabitStore } from './src/store/habitStore';
import { useTrackingStore } from './src/store/trackingStore';
import { usePlannerStore } from './src/store/plannerStore';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import { requestPermissions, isExpoGo } from './src/utils/notificationService';

function AppContent() {
  const hydrateHabits = useHabitStore((s) => s.hydrate);
  const hydrateTracking = useTrackingStore((s) => s.hydrate);
  const hydratePlanner = usePlannerStore((s) => s.hydrate);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    hydrateHabits();
    hydrateTracking();
    // After planner data is loaded, refill the 7-day notification window
    hydratePlanner().then(() => {
      if (!isExpoGo) {
        usePlannerStore.getState().rescheduleAll().catch(() => {/* ignore */});
      }
    });

    // Request notification permissions once on startup (not in Expo Go – crashes SDK 53+)
    if (!isExpoGo) {
      requestPermissions()
        .then((granted) => {
          if (!granted) {
            Alert.alert(
              'Notifications disabled',
              'MindFlow can send you reminders for your habits. Enable notifications in your device settings.',
              [
                { text: 'Not now', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ],
            );
          }
        })
        .catch(() => {/* ignore */});
    }
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
