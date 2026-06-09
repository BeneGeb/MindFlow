import React from 'react';
import { View, StyleSheet } from 'react-native';
import { radius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface Props {
  data: boolean[];  // oldest first
  color: string;
  columns?: number;
  cellColors?: (string | null)[];  // per-cell color; overrides data+color when provided
}

export default function HeatmapGrid({ data, color, columns = 7, cellColors }: Props) {
  const { colors } = useTheme();

  const source = cellColors ?? data.map((done) => (done ? color : null));

  return (
    <View style={[styles.grid, { gap: 4 }]}>
      {source.map((cellColor, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            { backgroundColor: cellColor ?? colors.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: radius.sm - 4,
  },
});
