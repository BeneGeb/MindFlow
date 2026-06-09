import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { radius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface Props {
  data: boolean[];  // oldest first
  color: string;
  columns?: number;
  cellColors?: (string | null)[];  // per-cell color; overrides data+color when provided
  onCellPress?: (index: number) => void;
}

export default function HeatmapGrid({ data, color, columns = 7, cellColors, onCellPress }: Props) {
  const { colors } = useTheme();

  const source = cellColors ?? data.map((done) => (done ? color : null));
  const emptyColor = onCellPress ? color + '28' : colors.border;

  return (
    <View style={[styles.grid, { gap: 4 }]}>
      {source.map((cellColor, i) => {
        const cellStyle = [styles.cell, { backgroundColor: cellColor ?? emptyColor }];
        if (onCellPress) {
          return (
            <TouchableOpacity
              key={i}
              style={cellStyle}
              onPress={() => onCellPress(i)}
              activeOpacity={0.6}
            />
          );
        }
        return <View key={i} style={cellStyle} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: 20,
    height: 20,
    borderRadius: radius.sm - 2,
  },
});
