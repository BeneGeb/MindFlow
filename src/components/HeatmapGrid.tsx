import React from 'react';
import { View, StyleSheet } from 'react-native';
import { radius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface Props {
  data: boolean[];  // oldest first
  color: string;
  columns?: number;
}

export default function HeatmapGrid({ data, color, columns = 7 }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.grid, { gap: 4 }]}>
      {data.map((done, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            { backgroundColor: done ? color : colors.border },
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
