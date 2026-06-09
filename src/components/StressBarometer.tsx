import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { StressLevel } from '../types';
import { ColorTheme, spacing, radius, shadow, typography } from '../utils/theme';
import { useStressStore } from '../store/stressStore';
import { today } from '../utils/dateHelpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const STRESS_LEVELS: {
  level: StressLevel;
  emoji: string;
  label: string;
  color: string;
}[] = [
  { level: 1, emoji: '😌', label: 'Very calm', color: '#1D9E75' },
  { level: 2, emoji: '🙂', label: 'Relaxed', color: '#5BC48A' },
  { level: 3, emoji: '😐', label: 'Neutral', color: '#E8A838' },
  { level: 4, emoji: '😟', label: 'Stressed', color: '#E07830' },
  { level: 5, emoji: '😤', label: 'Very stressed', color: '#E05C5C' },
];

interface Props {
  colors: ColorTheme;
}

export default function StressBarometer({ colors }: Props) {
  const styles = makeStyles(colors);
  const setLevel = useStressStore((s) => s.setLevel);
  const clearLevel = useStressStore((s) => s.clearLevel);
  const getLevel = useStressStore((s) => s.getLevel);
  const hydrated = useStressStore((s) => s.hydrated);
  useStressStore((s) => s.log);

  const current = getLevel(today());
  const [isExpanded, setIsExpanded] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (hydrated && !initializedRef.current) {
      initializedRef.current = true;
      setIsExpanded(getLevel(today()) == null);
    }
  }, [hydrated]);

  const handleSelect = (level: StressLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (current === level) {
      clearLevel();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(true);
    } else {
      setLevel(level);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(false);
    }
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((v) => !v);
  };

  const activeEntry = current != null ? STRESS_LEVELS[current - 1] : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.headerRow, isExpanded && styles.headerRowExpanded]}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>How stressed are you?</Text>
        <View style={styles.headerRight}>
          {activeEntry && (
            <Text style={[styles.selectedLabel, { color: activeEntry.color }]}>
              {activeEntry.emoji} {activeEntry.label}
            </Text>
          )}
          <Text style={[styles.chevron, { color: colors.textMuted }]}>
            {isExpanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.buttonRow}>
          {STRESS_LEVELS.map(({ level, emoji, color }) => {
            const isSelected = current === level;
            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.emojiBtn,
                  isSelected && { backgroundColor: color + '22', borderColor: color },
                ]}
                onPress={() => handleSelect(level)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={[styles.levelNum, isSelected && { color }]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadow.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerRowExpanded: {
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    selectedLabel: {
      ...typography.bodySmall,
      fontWeight: '600',
    },
    chevron: {
      fontSize: 10,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    emojiBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    emoji: {
      fontSize: 22,
    },
    levelNum: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
      fontWeight: '600',
    },
  });
