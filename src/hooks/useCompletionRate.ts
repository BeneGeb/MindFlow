import { useTrackingStore } from '../store/trackingStore';
import { getLastNDays, getDaysWithOffset } from '../utils/dateHelpers';
import { PlannedHabit } from '../types';
import { isActiveOnDate } from '../store/plannerStore';

export const useCompletionRate = (habitId: string, days = 7): number => {
  const tracking = useTrackingStore((s) => s.tracking);
  const dates = getLastNDays(days);
  const completed = dates.filter((d) => tracking[d]?.[habitId]).length;
  return Math.round((completed / days) * 100);
};

export const useOverallCompletionRate = (habitIds: string[], days = 7): number => {
  const tracking = useTrackingStore((s) => s.tracking);
  const dates = getLastNDays(days);
  if (!habitIds.length || !dates.length) return 0;
  let total = 0;
  let completed = 0;
  for (const date of dates) {
    for (const id of habitIds) {
      total++;
      if (tracking[date]?.[id]) completed++;
    }
  }
  return Math.round((completed / total) * 100);
};

export const useHeatmapData = (habitId: string, days = 28): boolean[] => {
  const tracking = useTrackingStore((s) => s.tracking);
  return getLastNDays(days).map((d) => !!tracking[d]?.[habitId]);
};

export const useOccurrenceCompletionRate = (entry: PlannedHabit, days = 7): number => {
  const occurrences = useTrackingStore((s) => s.occurrences);
  const dates = getLastNDays(days);
  const activeDates = dates.filter((d) => isActiveOnDate(entry, d));
  if (!activeDates.length) return 0;
  const completed = activeDates.filter(
    (d) => !!occurrences[d]?.[entry.habitId]?.[entry.id]
  ).length;
  return Math.round((completed / activeDates.length) * 100);
};

export const useOccurrenceTotalCompletions = (entry: PlannedHabit): number => {
  const occurrences = useTrackingStore((s) => s.occurrences);
  return Object.values(occurrences).reduce(
    (total, dayRecord) => total + (dayRecord[entry.habitId]?.[entry.id] ? 1 : 0),
    0
  );
};

export const useOccurrenceHeatmapData = (entry: PlannedHabit, days = 7): boolean[] => {
  const occurrences = useTrackingStore((s) => s.occurrences);
  return getLastNDays(days).map(
    (d) => isActiveOnDate(entry, d) && !!occurrences[d]?.[entry.habitId]?.[entry.id]
  );
};

export const useOccurrenceHeatmapDataPaged = (entry: PlannedHabit, days = 28, page = 0): boolean[] => {
  const occurrences = useTrackingStore((s) => s.occurrences);
  return getDaysWithOffset(days, page).map(
    (d) => isActiveOnDate(entry, d) && !!occurrences[d]?.[entry.habitId]?.[entry.id]
  );
};
