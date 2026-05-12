import { useTrackingStore } from '../store/trackingStore';
import { toDateString } from '../utils/dateHelpers';
import { PlannedHabit } from '../types';
import { isActiveOnDate } from '../store/plannerStore';

export const useStreak = (habitId: string): number => {
  const tracking = useTrackingStore((s) => s.tracking);

  let streak = 0;
  const cursor = new Date();

  // Check today first; if not done, start from yesterday
  const todayStr = toDateString(cursor);
  const todayDone = !!tracking[todayStr]?.[habitId];
  if (!todayDone) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = toDateString(cursor);
    if (tracking[dateStr]?.[habitId]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const useLongestStreak = (habitId: string): number => {
  const tracking = useTrackingStore((s) => s.tracking);
  const dates = Object.keys(tracking).sort();

  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    if (!tracking[dateStr]?.[habitId]) {
      current = 0;
      prevDate = null;
      continue;
    }
    const d = new Date(dateStr + 'T12:00:00');
    if (prevDate) {
      const diff = (d.getTime() - prevDate.getTime()) / 86400000;
      current = diff === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    prevDate = d;
    if (current > longest) longest = current;
  }

  return longest;
};

export const useOccurrenceStreak = (entry: PlannedHabit): number => {
  const occurrences = useTrackingStore((s) => s.occurrences);

  let streak = 0;
  let streakStarted = false;
  const cursor = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = toDateString(cursor);

    if (isActiveOnDate(entry, dateStr)) {
      const done = !!occurrences[dateStr]?.[entry.habitId]?.[entry.id];
      if (done) {
        streak++;
        streakStarted = true;
      } else {
        // First active day not done yet (today) → keep looking back
        if (streakStarted || i > 0) break;
      }
    }
    // Non-active days are skipped without breaking the streak

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};
