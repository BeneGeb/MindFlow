import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { usePlannerStore } from '../store/plannerStore';
import { useHabitStore } from '../store/habitStore';
import { useOccurrenceStreak, useOccurrenceLongestStreak } from '../hooks/useStreak';
import {
  useOccurrenceCompletionRate,
  useOccurrenceTotalCompletions,
  useOccurrenceHeatmapData,
} from '../hooks/useCompletionRate';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import HeatmapGrid from '../components/HeatmapGrid';
import { SHORT_DAY_NAMES } from '../utils/dateHelpers';
import { PlannedHabit } from '../types';

type Route = RouteProp<RootStackParamList, 'StatsDetail'>;

function formatRepeat(entry: PlannedHabit): string {
  if (entry.repeatMode === 'daily') return 'Every day';
  if (entry.repeatMode === 'once') return `Once · ${entry.date ?? ''}`;
  const names = [...entry.repeatDays].sort().map((d) => SHORT_DAY_NAMES[d]);
  return names.join(', ');
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatsContent({ entry, habitColor }: { entry: PlannedHabit; habitColor: string }) {
  const streak = useOccurrenceStreak(entry);
  const longest = useOccurrenceLongestStreak(entry);
  const rate7 = useOccurrenceCompletionRate(entry, 7);
  const rate30 = useOccurrenceCompletionRate(entry, 30);
  const total = useOccurrenceTotalCompletions(entry);
  const heatmap = useOccurrenceHeatmapData(entry, 28);

  return (
    <>
      <View style={styles.statRow}>
        <StatBox value={`${streak} 🔥`} label="Current streak" />
        <StatBox value={`${longest} 🏆`} label="Best streak" />
      </View>

      <View style={styles.statRow}>
        <StatBox value={`${rate7}%`} label="Last 7 days" />
        <StatBox value={`${rate30}%`} label="Last 30 days" />
      </View>

      <View style={[styles.statBox, styles.totalBox]}>
        <Text style={styles.statValue}>{total}</Text>
        <Text style={styles.statLabel}>Total completions</Text>
      </View>

      <Text style={styles.heatmapTitle}>Last 28 days</Text>
      <View style={styles.heatmapCard}>
        <HeatmapGrid data={heatmap} color={habitColor} />
      </View>
    </>
  );
}

export default function StatsDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { plannedId } = route.params;

  const planned = usePlannerStore((s) => s.planned);
  const allHabits = useHabitStore((s) => s.habits);

  const entry = planned.find((p) => p.id === plannedId);
  const habit = entry ? allHabits.find((h) => h.id === entry.habitId) : null;

  if (!entry || !habit) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Habit not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={[styles.habitHeader, { backgroundColor: habit.color + '18' }]}>
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitMeta}>
            {entry.time}{'  ·  '}{formatRepeat(entry)}
          </Text>
        </View>

        <StatsContent entry={entry} habitColor={habit.color} />
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
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  habitHeader: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  habitIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  habitName: {
    ...typography.h2,
    marginBottom: 4,
  },
  habitMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.sm,
  },
  totalBox: {
    marginBottom: spacing.lg,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  heatmapTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  heatmapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.xl,
  },
});
