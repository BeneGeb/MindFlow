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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LIBRARY_ARTICLES } from '../data/library';
import { PRESET_HABITS } from '../data/habits';
import { useHabitStore } from '../store/habitStore';
import { LibraryArticle } from '../types';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function ArticleCard({
  article,
  onPress,
  colors,
}: {
  article: LibraryArticle;
  onPress: () => void;
  colors: ColorTheme;
}) {
  const styles = makeStyles(colors);
  return (
    <TouchableOpacity style={styles.articleCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleDesc}>{article.description}</Text>
      </View>
      <Text style={styles.articleArrow}>›</Text>
    </TouchableOpacity>
  );
}

function HabitArticleCard({
  habitId,
  onPress,
  colors,
}: {
  habitId: string;
  onPress: () => void;
  colors: ColorTheme;
}) {
  const styles = makeStyles(colors);
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  if (!habit) return null;
  return (
    <TouchableOpacity style={styles.habitCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.habitCardIcon, { backgroundColor: habit.color + '22' }]}>
        <Text style={styles.habitCardIconText}>{habit.icon}</Text>
      </View>
      <View style={styles.habitCardContent}>
        <Text style={styles.habitCardName}>{habit.name}</Text>
        <Text style={styles.habitCardSub}>Science, tips & guide</Text>
      </View>
      <Text style={styles.articleArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const customHabits = useHabitStore((s) => s.customHabits);

  const habitScienceArticles = LIBRARY_ARTICLES.filter(
    (a) => a.section === 'habit-science',
  );
  const mentalHealthArticles = LIBRARY_ARTICLES.filter(
    (a) => a.section === 'mental-health',
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Library</Text>

        {/* Mental Health Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🧠</Text>
          <View>
            <Text style={styles.sectionTitle}>Mental Health</Text>
            <Text style={styles.sectionSubtitle}>Why these habits work</Text>
          </View>
        </View>
        {mentalHealthArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            colors={colors}
            onPress={() =>
              navigation.navigate('LibraryArticle', { articleId: article.id })
            }
          />
        ))}

        {/* Habit Science Section */}
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={styles.sectionEmoji}>🧬</Text>
          <View>
            <Text style={styles.sectionTitle}>Habit Science</Text>
            <Text style={styles.sectionSubtitle}>How habits really work</Text>
          </View>
        </View>
        {habitScienceArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            colors={colors}
            onPress={() =>
              navigation.navigate('LibraryArticle', { articleId: article.id })
            }
          />
        ))}

        {/* Habits Section */}
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={styles.sectionEmoji}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Your Habits</Text>
            <Text style={styles.sectionSubtitle}>Deep dives into each practice</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateHabit', {})}
            style={styles.createBtn}
          >
            <Text style={styles.createBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
        {PRESET_HABITS.map((habit) => (
          <HabitArticleCard
            key={habit.id}
            habitId={habit.id}
            colors={colors}
            onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
          />
        ))}
        {customHabits.map((habit) => (
          <HabitArticleCard
            key={habit.id}
            habitId={habit.id}
            colors={colors}
            onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
          />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionEmoji: { fontSize: 28 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionSubtitle: { ...typography.bodySmall, color: colors.textSecondary },
  articleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.sm,
  },
  articleContent: { flex: 1 },
  articleTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
  articleDesc: { ...typography.bodySmall, color: colors.textSecondary },
  articleArrow: {
    fontSize: 22,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
  },
  habitCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.sm,
  },
  habitCardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  habitCardIconText: { fontSize: 20 },
  habitCardContent: { flex: 1 },
  habitCardName: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
  habitCardSub: { ...typography.bodySmall, color: colors.textSecondary },
  createBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  createBtnText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
