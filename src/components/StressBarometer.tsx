import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStressStore } from '../store/stressStore';
import { today } from '../utils/dateHelpers';
import { colors, spacing, radius, shadow, typography } from '../utils/theme';

// Gradient from green (1) to red (10)
const STRESS_COLORS = [
  '',
  '#1D9E75', // 1
  '#52B56A', // 2
  '#87CB5E', // 3
  '#B4D952', // 4
  '#D9E847', // 5
  '#F0C040', // 6
  '#F09030', // 7
  '#E86020', // 8
  '#E03020', // 9
  '#CC0000', // 10
];

export const stressColor = (level: number): string => STRESS_COLORS[Math.round(level)] ?? '#CC0000';

export const stressLabel = (level: number): string => {
  if (level <= 2) return 'Very low';
  if (level <= 4) return 'Low';
  if (level <= 6) return 'Moderate';
  if (level <= 8) return 'High';
  return 'Very high';
};

export default function StressBarometer() {
  const todayStr = today();
  const levels = useStressStore((s) => s.levels);
  const setLevel = useStressStore((s) => s.setLevel);
  const current = levels[todayStr] ?? null;

  const handlePress = useCallback(
    (n: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLevel(todayStr, n);
    },
    [todayStr, setLevel],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🌡️ Stress Level</Text>
        {current !== null && (
          <View style={[styles.badge, { backgroundColor: stressColor(current) + '25' }]}>
            <Text style={[styles.badgeText, { color: stressColor(current) }]}>
              {current}/10 · {stressLabel(current)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = current === n;
          const col = stressColor(n);
          return (
            <TouchableOpacity
              key={n}
              style={[
                styles.btn,
                { backgroundColor: selected ? col : col + '30' },
              ]}
              onPress={() => handlePress(n)}
              activeOpacity={0.75}
            >
              <Text style={[styles.btnText, selected && styles.btnTextSelected]}>
                {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {current === null && (
        <Text style={styles.hint}>Wie gestresst bist du heute?</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  btn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  btnTextSelected: {
    color: '#fff',
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
