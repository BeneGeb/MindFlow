import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useStressStore } from '../store/stressStore';
import { STRESS_LEVELS } from '../components/StressBarometer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useHabitStore } from '../store/habitStore';
import { usePlannerStore } from '../store/plannerStore';
import { useStreak, useOccurrenceStreak } from '../hooks/useStreak';
import { useOccurrenceCompletionRate, useOverallCompletionRate, useOccurrenceHeatmapData } from '../hooks/useCompletionRate';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import HeatmapGrid from '../components/HeatmapGrid';
import { Habit, PlannedHabit } from '../types';

function HabitStatCard({ entry, habit }: { entry: PlannedHabit; habit: Habit }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const streak = useOccurrenceStreak(entry);
  const rate = useOccurrenceCompletionRate(entry, 7);
  const heatmap = useOccurrenceHeatmapData(entry, 7);

  return (
    <TouchableOpacity
      style={styles.habitCard}
      onPress={() => navigation.navigate('StatsDetail', { plannedId: entry.id })}
      activeOpacity={0.7}
    >
      <View style={styles.habitCardHeader}>
        <View style={[styles.habitIcon, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.habitIconText}>{habit.icon}</Text>
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitRate}>
            {entry.time ?? 'Any time'}{'  ·  '}{rate}% this week
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakFire}>🔥</Text>
        </View>
      </View>
      <View style={styles.heatmapRow}>
        <HeatmapGrid data={heatmap} color={habit.color} />
      </View>
    </TouchableOpacity>
  );
}

function StressStats() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const getHistory = useStressStore((s) => s.getHistory);
  useStressStore((s) => s.log);

  const history = getHistory(28);

  const levels = history.map((d) => d.level).filter((l): l is 1|2|3|4|5 => l != null);
  const avg = levels.length > 0
    ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length * 10) / 10
    : null;
  const avgEntry = avg != null ? STRESS_LEVELS[Math.round(avg) - 1] : null;

  const cellColors = history.map(({ level }) =>
    level != null ? STRESS_LEVELS[level - 1].color : null
  );

  return (
    <TouchableOpacity
      style={styles.habitCard}
      onPress={() => navigation.navigate('StressDetail')}
      activeOpacity={0.7}
    >
      <View style={styles.habitCardHeader}>
        <View style={[styles.habitIcon, { backgroundColor: '#E05C5C22' }]}>
          <Text style={styles.habitIconText}>🧠</Text>
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>Stress Level</Text>
          <Text style={styles.habitRate}>
            {avgEntry && avg != null ? `${avgEntry.emoji} avg. ${avg} / 5 last 28 days` : 'No entries yet'}
          </Text>
        </View>
        {avgEntry && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakNum}>{avgEntry.emoji}</Text>
          </View>
        )}
      </View>
      <View style={styles.heatmapRow}>
        <HeatmapGrid data={[]} color="" cellColors={cellColors} />
      </View>
    </TouchableOpacity>
  );
}

function OverallStats({ habitIds }: { habitIds: string[] }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const rate = useOverallCompletionRate(habitIds, 7);
  const s0 = useStreak(habitIds[0] ?? '');
  const s1 = useStreak(habitIds[1] ?? '');
  const s2 = useStreak(habitIds[2] ?? '');
  const s3 = useStreak(habitIds[3] ?? '');
  const s4 = useStreak(habitIds[4] ?? '');
  const s5 = useStreak(habitIds[5] ?? '');
  const s6 = useStreak(habitIds[6] ?? '');
  const s7 = useStreak(habitIds[7] ?? '');
  const longest = Math.max(0, s0, s1, s2, s3, s4, s5, s6, s7);

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
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const allHabits = useHabitStore((s) => s.habits);
  const planned = usePlannerStore((s) => s.planned);

  const plannedEntries = planned
    .map((entry) => ({ entry, habit: allHabits.find((h) => h.id === entry.habitId) }))
    .filter((item): item is { entry: PlannedHabit; habit: Habit } => item.habit != null)
    .sort((a, b) => (a.entry.time ?? '99:99').localeCompare(b.entry.time ?? '99:99'));

  const uniqueHabitIds = [...new Set(planned.map((p) => p.habitId))];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Stats</Text>

        <OverallStats habitIds={uniqueHabitIds} />

        <StressStats />

        <Text style={styles.sectionTitle}>Your Habits</Text>
        {plannedEntries.map(({ entry, habit }) => (
          <HabitStatCard key={entry.id} entry={entry} habit={habit} />
        ))}
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
  title: {
    ...typography.h1,
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
  habitName: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
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
});
