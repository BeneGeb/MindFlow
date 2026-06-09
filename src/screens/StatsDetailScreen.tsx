import React, { useState } from 'react';
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
import { useTrackingStore } from '../store/trackingStore';
import { useOccurrenceStreak, useOccurrenceLongestStreak } from '../hooks/useStreak';
import {
  useOccurrenceCompletionRate,
  useOccurrenceTotalCompletions,
  useOccurrenceHeatmapDataPaged,
} from '../hooks/useCompletionRate';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import HeatmapGrid from '../components/HeatmapGrid';
import { SHORT_DAY_NAMES, getDaysWithOffset, formatDateRange } from '../utils/dateHelpers';
import { PlannedHabit } from '../types';

type Route = RouteProp<RootStackParamList, 'StatsDetail'>;

function formatRepeat(entry: PlannedHabit): string {
  if (entry.repeatMode === 'daily') return 'Every day';
  if (entry.repeatMode === 'once') return `Once · ${entry.date ?? ''}`;
  const names = [...entry.repeatDays].sort().map((d) => SHORT_DAY_NAMES[d]);
  return names.join(', ');
}

function StatBox({ value, label, colors }: { value: string | number; label: string; colors: ColorTheme }) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatsContent({ entry, habitColor }: { entry: PlannedHabit; habitColor: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [page, setPage] = useState(0);

  const streak = useOccurrenceStreak(entry);
  const longest = useOccurrenceLongestStreak(entry);
  const rate7 = useOccurrenceCompletionRate(entry, 7);
  const rate30 = useOccurrenceCompletionRate(entry, 30);
  const total = useOccurrenceTotalCompletions(entry);
  const heatmap = useOccurrenceHeatmapDataPaged(entry, 28, page);
  const occurrences = useTrackingStore((s) => s.occurrences);

  const currentDates = getDaysWithOffset(28, page);
  const nextDates = getDaysWithOffset(28, page + 1);
  const hasOlderData = nextDates.some((d) => !!occurrences[d]?.[entry.habitId]?.[entry.id]);
  const rangeLabel = page === 0 ? 'Last 28 days' : formatDateRange(currentDates);

  return (
    <>
      <View style={styles.statRow}>
        <StatBox value={`${streak} 🔥`} label="Current streak" colors={colors} />
        <StatBox value={`${longest} 🏆`} label="Best streak" colors={colors} />
      </View>

      <View style={styles.statRow}>
        <StatBox value={`${rate7}%`} label="Last 7 days" colors={colors} />
        <StatBox value={`${rate30}%`} label="Last 30 days" colors={colors} />
      </View>

      <View style={[styles.statBox, styles.totalBox]}>
        <Text style={styles.statValue}>{total}</Text>
        <Text style={styles.statLabel}>Total completions</Text>
      </View>

      <Text style={styles.heatmapTitle}>{rangeLabel}</Text>
      <View style={styles.heatmapCard}>
        <HeatmapGrid data={heatmap} color={habitColor} />
      </View>
      <View style={styles.pageNav}>
        {hasOlderData ? (
          <TouchableOpacity onPress={() => setPage((p) => p + 1)} style={styles.pageBtn}>
            <Text style={styles.pageBtnText}>← Older</Text>
          </TouchableOpacity>
        ) : <View />}
        {page > 0 && (
          <TouchableOpacity onPress={() => setPage((p) => p - 1)} style={styles.pageBtn}>
            <Text style={styles.pageBtnText}>Newer →</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

export default function StatsDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { plannedId } = route.params;
  const { colors } = useTheme();
  const styles = makeStyles(colors);

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
            {entry.time ?? 'Any time'}{'  ·  '}{formatRepeat(entry)}
          </Text>
        </View>

        <StatsContent entry={entry} habitColor={habit.color} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
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
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  heatmapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  pageNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  pageBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pageBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.xl,
  },
});
