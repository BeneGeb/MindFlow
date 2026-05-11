import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useHabitStore } from './src/store/habitStore';
import { useTrackingStore } from './src/store/trackingStore';
import { usePlannerStore } from './src/store/plannerStore';
import { colors } from './src/utils/theme';

export default function App() {
  const hydrateHabits = useHabitStore((s) => s.hydrate);
  const hydrateTracking = useTrackingStore((s) => s.hydrate);
  const hydratePlanner = usePlannerStore((s) => s.hydrate);

  useEffect(() => {
    hydrateHabits();
    hydrateTracking();
    hydratePlanner();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
