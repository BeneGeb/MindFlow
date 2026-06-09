import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStressStore } from '../store/stressStore';
import { STRESS_LEVELS } from '../components/StressBarometer';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import HeatmapGrid from '../components/HeatmapGrid';

function avg(days: number, getHistory: ReturnType<typeof useStressStore.getState>['getHistory']): number | null {
  const history = getHistory(days);
  const levels = history.map((d) => d.level).filter((l): l is 1|2|3|4|5 => l != null);
  if (levels.length === 0) return null;
  return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length * 10) / 10;
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

export default function StressDetailScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const getHistory = useStressStore((s) => s.getHistory);
  useStressStore((s) => s.log);

  const avg7 = avg(7, getHistory);
  const avg28 = avg(28, getHistory);
  const history28 = getHistory(28);

  const totalEntries = history28.filter((d) => d.level != null).length;

  const cellColors = history28.map(({ level }) =>
    level != null ? STRESS_LEVELS[level - 1].color : null
  );

  const avgEntry7 = avg7 != null ? STRESS_LEVELS[Math.round(avg7) - 1] : null;
  const avgEntry28 = avg28 != null ? STRESS_LEVELS[Math.round(avg28) - 1] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={[styles.header, { backgroundColor: '#E05C5C18' }]}>
          <Text style={styles.headerIcon}>🧠</Text>
          <Text style={styles.headerName}>Stress Level</Text>
        </View>

        <View style={styles.statRow}>
          <StatBox
            value={avgEntry7 && avg7 != null ? `${avgEntry7.emoji} ${avg7}` : '—'}
            label="Avg. last 7 days"
            colors={colors}
          />
          <StatBox
            value={avgEntry28 && avg28 != null ? `${avgEntry28.emoji} ${avg28}` : '—'}
            label="Avg. last 28 days"
            colors={colors}
          />
        </View>

        <View style={[styles.statBox, styles.totalBox]}>
          <Text style={styles.statValue}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Total entries (28 days)</Text>
        </View>

        <Text style={styles.heatmapTitle}>Last 28 days</Text>
        <View style={styles.heatmapCard}>
          <HeatmapGrid data={[]} color="" cellColors={cellColors} />
        </View>

        <View style={styles.legend}>
          {STRESS_LEVELS.map(({ level, emoji, label, color }) => (
            <View key={level} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{emoji} {label}</Text>
            </View>
          ))}
        </View>
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
  header: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerName: {
    ...typography.h2,
    color: colors.textPrimary,
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
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  legend: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
});
