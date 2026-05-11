import { useTrackingStore } from '../store/trackingStore';
import { getLastNDays } from '../utils/dateHelpers';

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
