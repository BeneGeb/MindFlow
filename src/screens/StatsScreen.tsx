import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useHabitStore } from '../store/habitStore';
import { usePlannerStore } from '../store/plannerStore';
import { useStressStore } from '../store/stressStore';
import { useStreak, useOccurrenceStreak } from '../hooks/useStreak';
import { useOccurrenceCompletionRate, useOverallCompletionRate, useOccurrenceHeatmapData } from '../hooks/useCompletionRate';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getLastNDays, SHORT_DAY_NAMES } from '../utils/dateHelpers';
import { stressColor, stressLabel } from '../components/StressBarometer';
import HeatmapGrid from '../components/HeatmapGrid';
import { Habit, PlannedHabit } from '../types';

const PERIODS: { label: string; days: 7 | 30 | 90 }[] = [
  { label: '7 Tage', days: 7 },
  { label: '30 Tage', days: 30 },
  { label: '90 Tage', days: 90 },
];

const CHART_H = 80;
const CHART_PAD_X = 8;
const CHART_PAD_Y = 10;

function StressLineChart({
  days,
  levels,
  showLabels,
}: {
  days: string[];
  levels: Record<string, number>;
  showLabels: boolean;
}) {
  const [chartWidth, setChartWidth] = useState(0);

  const n = days.length;
  const dotR = n <= 7 ? 5 : n <= 30 ? 3 : 2;
  const strokeW = n <= 30 ? 2.5 : 1.5;

  const getX = (i: number) =>
    n <= 1
      ? CHART_PAD_X + (chartWidth - 2 * CHART_PAD_X) / 2
      : CHART_PAD_X + (i / (n - 1)) * (chartWidth - 2 * CHART_PAD_X);

  const getY = (level: number) =>
    CHART_PAD_Y + (1 - level / 10) * (CHART_H - 2 * CHART_PAD_Y);

  const points = days.map((date, i) => {
    const level = levels[date] ?? null;
    return level !== null ? { x: getX(i), y: getY(level), level, date } : null;
  });

  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a && b) segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  const dots = points.filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
      {chartWidth > 0 && (
        <View style={{ height: CHART_H }}>
          {/* Gridlines at low / mid / high */}
          {[2, 5, 8].map((gl) => (
            <View
              key={gl}
              style={{
                position: 'absolute',
                left: CHART_PAD_X,
                right: CHART_PAD_X,
                top: getY(gl),
                height: 1,
                backgroundColor: colors.border,
              }}
            />
          ))}

          {/* Line segments — rotated thin Views */}
          {segments.map(({ x1, y1, x2, y2 }, i) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: len,
                  height: strokeW,
                  backgroundColor: colors.primary,
                  left: (x1 + x2) / 2 - len / 2,
                  top: (y1 + y2) / 2 - strokeW / 2,
                  borderRadius: strokeW / 2,
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })}

          {/* Colored dots per data point */}
          {dots.map(({ x, y, level, date }) => (
            <View
              key={date}
              style={{
                position: 'absolute',
                width: dotR * 2,
                height: dotR * 2,
                borderRadius: dotR,
                backgroundColor: stressColor(level),
                left: x - dotR,
                top: y - dotR,
                borderWidth: 1.5,
                borderColor: colors.surface,
              }}
            />
          ))}
        </View>
      )}

      {/* Day labels — 7-day view only */}
      {showLabels && chartWidth > 0 && (
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {days.map((date, i) => (
            <View
              key={date}
              style={{
                flex: 1,
                alignItems: i === 0 ? 'flex-start' : i === n - 1 ? 'flex-end' : 'center',
              }}
            >
              <Text style={styles.dayLabel}>
                {SHORT_DAY_NAMES[new Date(date + 'T12:00:00').getDay()]}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function StressSection() {
  const [period, setPeriod] = useState<7 | 30 | 90>(7);
  const levels = useStressStore((s) => s.levels);
  const days = getLastNDays(period);

  const recorded = days.filter((d) => levels[d] !== undefined);
  const avg =
    recorded.length > 0
      ? Math.round((recorded.reduce((sum, d) => sum + levels[d], 0) / recorded.length) * 10) / 10
      : null;

  return (
    <View style={styles.stressCard}>
      <View style={styles.stressHeader}>
        <Text style={styles.stressTitle}>🌡️ Stress</Text>
        {avg !== null && (
          <Text style={[styles.stressAvg, { color: stressColor(avg) }]}>
            Ø {avg}/10 · {stressLabel(avg)}
          </Text>
        )}
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map(({ label, days: d }) => (
          <TouchableOpacity
            key={d}
            style={[styles.periodChip, period === d && styles.periodChipActive]}
            onPress={() => setPeriod(d)}
          >
            <Text style={[styles.periodChipText, period === d && styles.periodChipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <StressLineChart days={days} levels={levels} showLabels={period === 7} />

      {recorded.length === 0 && (
        <Text style={styles.stressEmpty}>
          Noch keine Daten — log deinen Stress auf dem Homescreen.
        </Text>
      )}
    </View>
  );
}

function HabitStatCard({ entry, habit }: { entry: PlannedHabit; habit: Habit }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

function OverallStats({ habitIds }: { habitIds: string[] }) {
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

        <StressSection />

        {plannedEntries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No planned habits</Text>
            <Text style={styles.emptyText}>
              Add habits in the Planner to track your stats here.
            </Text>
          </View>
        ) : (
          <>
            <OverallStats habitIds={uniqueHabitIds} />

            <Text style={styles.sectionTitle}>Your Habits</Text>
            {plannedEntries.map(({ entry, habit }) => (
              <HabitStatCard key={entry.id} entry={entry} habit={habit} />
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
  // Stress section
  stressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  stressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stressTitle: {
    ...typography.h3,
  },
  stressAvg: {
    fontSize: 13,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodChip: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  periodChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  periodChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dayLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  stressEmpty: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
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
