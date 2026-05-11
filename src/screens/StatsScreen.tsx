import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useActiveHabits } from '../store/habitStore';
import { useStreak } from '../hooks/useStreak';
import { useCompletionRate, useOverallCompletionRate, useHeatmapData } from '../hooks/useCompletionRate';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import HeatmapGrid from '../components/HeatmapGrid';
import { Habit } from '../types';

function HabitStatCard({ habit }: { habit: Habit }) {
  const streak = useStreak(habit.id);
  const rate = useCompletionRate(habit.id, 7);
  const heatmap = useHeatmapData(habit.id, 7);

  return (
    <View style={styles.habitCard}>
      <View style={styles.habitCardHeader}>
        <View style={[styles.habitIcon, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.habitIconText}>{habit.icon}</Text>
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitRate}>{rate}% this week</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakFire}>🔥</Text>
        </View>
      </View>
      <View style={styles.heatmapRow}>
        <HeatmapGrid data={heatmap} color={habit.color} />
      </View>
    </View>
  );
}

function OverallStats({ habitIds }: { habitIds: string[] }) {
  const rate = useOverallCompletionRate(habitIds, 7);
  const streaks = habitIds.map((id) => useStreak(id));
  const longest = Math.max(0, ...streaks);

  return (
    <View style={styles.overallCard}>
      <View style={styles.overallItem}>
        <Text style={styles.overallValue}>{rate}%</Text>
        <Text style={styles.overallLabel}>completion this week</Text>
      </View>
      <View style={styles.overallDivider} />
      <View style={styles.overallItem}>
        <Text style={styles.overallValue}>{longest}</Text>
        <Text style={styles.overallLabel}>🔥 longest streak</Text>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const habits = useActiveHabits();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Stats</Text>

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>
              Start completing habits to see your progress here.
            </Text>
          </View>
        ) : (
          <>
            <OverallStats habitIds={habits.map((h) => h.id)} />

            <Text style={styles.sectionTitle}>Your Habits</Text>
            {habits.map((habit) => (
              <HabitStatCard key={habit.id} habit={habit} />
            ))}
          </>
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
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  overallCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    ...shadow.md,
  },
  overallItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  overallLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  overallDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  habitCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  habitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  habitIconText: { fontSize: 20 },
  habitInfo: { flex: 1 },
  habitName: { ...typography.body, fontWeight: '600', marginBottom: 2 },
  habitRate: { ...typography.bodySmall, color: colors.textSecondary },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakFire: { fontSize: 18 },
  heatmapRow: {
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, marginBottom: spacing.sm },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
