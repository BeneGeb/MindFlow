import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Markdown from 'react-native-markdown-display';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useHabitStore } from '../store/habitStore';
import { useTrackingStore } from '../store/trackingStore';
import { useStreak } from '../hooks/useStreak';
import { useHeatmapData } from '../hooks/useCompletionRate';
import { loadContent, HABIT_CONTENT_KEY } from '../utils/contentLoader';
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

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (habit?.isCustom) {
      setContent(habit.description ?? '');
      setLoading(false);
      return;
    }
    const key = HABIT_CONTENT_KEY[habitId];
    if (key) {
      loadContent(key).then((text) => {
        setContent(text);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [habitId, habit?.isCustom, habit?.description]);

  if (!habit) return null;

  const done = isCompleted(habit.id, today());
  const mdStyles = makeMarkdownStyles(colors);

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

        {/* Content */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : content ? (
          <Markdown style={mdStyles}>{content}</Markdown>
        ) : habit.isCustom ? (
          <Text style={styles.noDescription}>
            No description yet. Tap Edit to add one.
          </Text>
        ) : null}
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
  noDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
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

const makeMarkdownStyles = (colors: ColorTheme) => ({
  body: { color: colors.textPrimary, fontSize: 15, lineHeight: 24 },
  heading1: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  heading2: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  heading3: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm },
  paragraph: { marginBottom: spacing.md, color: colors.textPrimary },
  strong: { fontWeight: '700' as const },
  em: { fontStyle: 'italic' as const, color: colors.primary },
  bullet_list: { marginBottom: spacing.md },
  list_item: { marginBottom: spacing.xs },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  th: { backgroundColor: colors.primaryLight, padding: spacing.sm },
  td: { padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  hr: { backgroundColor: colors.border, height: 1, marginVertical: spacing.md },
  code_inline: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
});
