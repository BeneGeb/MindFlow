import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useTodayHabits } from '../hooks/useTodayHabits';
import { useTrackingStore } from '../store/trackingStore';
import { today, getGreeting } from '../utils/dateHelpers';
import { colors, spacing, typography } from '../utils/theme';
import HabitCard from '../components/HabitCard';
import ProgressBar from '../components/ProgressBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const todayHabits = useTodayHabits();
  const toggle = useTrackingStore((s) => s.toggle);
  const isCompleted = useTrackingStore((s) => s.isCompleted);
  const todayStr = today();

  const completedCount = todayHabits.filter(({ habit }) =>
    isCompleted(habit.id, todayStr),
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
        <Text style={styles.subtitle}>Here are your habits for today.</Text>

        <ProgressBar completed={completedCount} total={todayHabits.length} />

        {todayHabits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              All 8 mental health habits are ready to track. Head to the Library
              to learn about each one, or go to the Planner to schedule them.
            </Text>
          </View>
        ) : (
          todayHabits.map(({ habit, planned }) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              planned={planned}
              completed={isCompleted(habit.id, todayStr)}
              onToggle={() => toggle(habit.id, todayStr)}
              onPress={() =>
                navigation.navigate('HabitDetail', { habitId: habit.id })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
