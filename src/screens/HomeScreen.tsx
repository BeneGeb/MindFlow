import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useTodayHabits } from '../hooks/useTodayHabits';
import { useTrackingStore } from '../store/trackingStore';
import { today } from '../utils/dateHelpers';
import { ColorTheme, spacing, typography, radius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import HabitCard from '../components/HabitCard';
import ProgressBar from '../components/ProgressBar';
import StressBarometer from '../components/StressBarometer';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const getNowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const minutesSince = (habitTime: string, nowTime: string): number => {
  const [hH, hM] = habitTime.split(':').map(Number);
  const [nH, nM] = nowTime.split(':').map(Number);
  return nH * 60 + nM - (hH * 60 + hM);
};

function NowDivider({ colors }: { colors: ColorTheme }) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.nowDivider}>
      <Text style={styles.nowLabel}>Now</Text>
      <View style={styles.nowRule} />
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const todayHabits = useTodayHabits();
  const toggleOccurrence = useTrackingStore((s) => s.toggleOccurrence);
  const isOccurrenceCompleted = useTrackingStore((s) => s.isOccurrenceCompleted);
  useTrackingStore((s) => s.occurrences);
  const todayStr = today();

  const [nowTime, setNowTime] = useState(getNowTime);
  useEffect(() => {
    const timer = setInterval(() => setNowTime(getNowTime()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const completedCount = todayHabits.filter(({ habit, planned }) =>
    isOccurrenceCompleted(planned.id, habit.id, todayStr),
  ).length;

  const buildList = () => {
    const items: React.ReactNode[] = [];

    const untimedPending = todayHabits.filter(
      ({ habit, planned }) => !planned.time && !isOccurrenceCompleted(planned.id, habit.id, todayStr),
    );
    const timed = todayHabits.filter(({ planned }) => planned.time !== null);
    const untimedDone = todayHabits.filter(
      ({ habit, planned }) => !planned.time && isOccurrenceCompleted(planned.id, habit.id, todayStr),
    );

    // 1. Untimed, not yet done — top
    for (const { key, habit, planned } of untimedPending) {
      items.push(
        <HabitCard
          key={key}
          habit={habit}
          planned={planned}
          completed={false}
          onToggle={() => toggleOccurrence(planned.id, habit.id, todayStr)}
          onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
        />,
      );
    }

    // 2. Timed habits — sorted by time, with NowDivider
    let dividerInserted = false;
    for (const { key, habit, planned } of timed) {
      const habitTime = planned.time!;
      const done = isOccurrenceCompleted(planned.id, habit.id, todayStr);
      const isOverdue = minutesSince(habitTime, nowTime) > 60 && !done;

      if (!dividerInserted && habitTime > nowTime) {
        items.push(<NowDivider key="__now__" colors={colors} />);
        dividerInserted = true;
      }

      items.push(
        <HabitCard
          key={key}
          habit={habit}
          planned={planned}
          completed={done}
          overdue={isOverdue}
          onToggle={() => toggleOccurrence(planned.id, habit.id, todayStr)}
          onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
        />,
      );
    }

    if (!dividerInserted && timed.length > 0) {
      items.push(<NowDivider key="__now__" colors={colors} />);
    }

    // 3. Untimed, done — bottom
    for (const { key, habit, planned } of untimedDone) {
      items.push(
        <HabitCard
          key={key}
          habit={habit}
          planned={planned}
          completed={true}
          onToggle={() => toggleOccurrence(planned.id, habit.id, todayStr)}
          onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
        />,
      );
    }

    return items;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StressBarometer colors={colors} />

        <ProgressBar completed={completedCount} total={todayHabits.length} />

        {todayHabits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>
              You haven't planned any habits for today. Go to the Planner to
              schedule habits for today.
            </Text>
          </View>
        ) : (
          buildList()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  nowDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  nowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.sm,
    letterSpacing: 0.5,
  },
  nowRule: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.primary,
    opacity: 0.45,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
