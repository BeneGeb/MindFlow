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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useHabitStore } from '../store/habitStore';
import { useTrackingStore } from '../store/trackingStore';
import { useStreak } from '../hooks/useStreak';
import { useHeatmapData } from '../hooks/useCompletionRate';
import { today } from '../utils/dateHelpers';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import HeatmapGrid from '../components/HeatmapGrid';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { habitId } = route.params;
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const isCompleted = useTrackingStore((s) => s.isCompleted);
  const toggle = useTrackingStore((s) => s.toggle);
  const streak = useStreak(habitId);
  const heatmap = useHeatmapData(habitId, 28);

  if (!habit) return null;

  const done = isCompleted(habit.id, today());

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        {habit.isCustom && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateHabit', { habitId: habit.id })}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: habit.color + '18' }]}>
          <Text style={styles.heroIcon}>{habit.icon}</Text>
          <Text style={styles.heroName}>{habit.name}</Text>
        </View>

        {/* Streak & Heatmap */}
        <View style={styles.statsCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>🔥 day streak</Text>
            </View>
          </View>
          <Text style={styles.heatmapLabel}>Last 28 days</Text>
          <HeatmapGrid data={heatmap} color={habit.color} />
        </View>

        {/* Complete today button */}
        <TouchableOpacity
          style={[styles.completeBtn, done && { backgroundColor: habit.color }]}
          onPress={() => toggle(habit.id, today())}
        >
          <Text style={[styles.completeBtnText, done && styles.completeBtnTextDone]}>
            {done ? '✓ Done today' : 'Mark as done today'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  editBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editBtnText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroIcon: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  heroName: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  streakRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  heatmapLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  completeBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completeBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  completeBtnTextDone: {
    color: '#fff',
  },
});
