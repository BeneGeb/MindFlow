import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Habit, PlannedHabit } from '../types';
import { colors, spacing, radius, shadow, typography } from '../utils/theme';
import { formatTime } from '../utils/dateHelpers';
import { useStreak } from '../hooks/useStreak';

interface Props {
  habit: Habit;
  planned: PlannedHabit | null;
  completed: boolean;
  overdue?: boolean;
  onToggle: () => void;
  onPress: () => void;
}

function StreakBadge({ habitId }: { habitId: string }) {
  const streak = useStreak(habitId);
  if (streak === 0) return null;
  return (
    <View style={styles.streakBadge}>
      <Text style={styles.streakText}>🔥 {streak}</Text>
    </View>
  );
}

export default function HabitCard({ habit, planned, completed, overdue, onToggle, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onToggle();
  }, [onToggle, scale]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }, overdue && styles.cardOverdue, completed && styles.cardCompleted]}>
      <TouchableOpacity style={styles.inner} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, completed && styles.nameCompleted]}>{habit.name}</Text>
          <View style={styles.meta}>
            {planned && <Text style={styles.time}>{formatTime(planned.time)}</Text>}
            <StreakBadge habitId={habit.id} />
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.checkbox, completed && { backgroundColor: colors.primary, borderColor: colors.primary }]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingRight: spacing.md,
    ...shadow.sm,
  },
  cardOverdue: {
    backgroundColor: '#FEF2F2',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  name: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
