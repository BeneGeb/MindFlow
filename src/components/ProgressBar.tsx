import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography } from '../utils/theme';

interface Props {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: Props) {
  const progress = useSharedValue(0);
  const ratio = total > 0 ? completed / total : 0;

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {completed} of {total} habits done today
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
