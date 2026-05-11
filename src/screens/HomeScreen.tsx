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
import { today, getGreeting } from '../utils/dateHelpers';
import { colors, spacing, typography } from '../utils/theme';
import HabitCard from '../components/HabitCard';
import ProgressBar from '../components/ProgressBar';

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

function NowDivider({ time }: { time: string }) {
  return (
    <View style={styles.nowDivider}>
      <Text style={styles.nowLabel}>Now</Text>
      <View style={styles.nowRule} />
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const todayHabits = useTodayHabits();
  const toggle = useTrackingStore((s) => s.toggle);
  const isCompleted = useTrackingStore((s) => s.isCompleted);
  useTrackingStore((s) => s.tracking);
  const todayStr = today();

  const [nowTime, setNowTime] = useState(getNowTime);
  useEffect(() => {
    const timer = setInterval(() => setNowTime(getNowTime()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const completedCount = todayHabits.filter(({ habit }) =>
    isCompleted(habit.id, todayStr),
  ).length;

  const buildList = () => {
    const items: React.ReactNode[] = [];
    let dividerInserted = false;

    for (const { habit, planned } of todayHabits) {
      const habitTime = planned?.time ?? null;
      const isPast = habitTime !== null && habitTime <= nowTime;
      const isOverdue = habitTime !== null &&
        minutesSince(habitTime, nowTime) > 60 &&
        !isCompleted(habit.id, todayStr);

      if (!dividerInserted && habitTime !== null && habitTime > nowTime) {
        items.push(<NowDivider key="__now__" time={nowTime} />);
        dividerInserted = true;
      }

      items.push(
        <HabitCard
          key={habit.id}
          habit={habit}
          planned={planned}
          completed={isCompleted(habit.id, todayStr)}
          overdue={isOverdue}
          onToggle={() => toggle(habit.id, todayStr)}
          onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
        />,
      );
    }

    if (!dividerInserted && todayHabits.length > 0) {
      items.push(<NowDivider key="__now__" time={nowTime} />);
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
        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
        <Text style={styles.subtitle}>Here are your habits for today.</Text>

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

const styles = StyleSheet.create({
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
  greeting: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
