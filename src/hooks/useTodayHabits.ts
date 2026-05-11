import { Habit, PlannedHabit } from '../types';
import { useActiveHabits } from '../store/habitStore';
import { usePlannerStore } from '../store/plannerStore';
import { today } from '../utils/dateHelpers';

export interface TodayHabitEntry {
  habit: Habit;
  planned: PlannedHabit | null;
}

export const useTodayHabits = (): TodayHabitEntry[] => {
  const activeHabits = useActiveHabits();
  const getForDate = usePlannerStore((s) => s.getForDate);
  const todayPlanned = getForDate(today());

  const plannedMap = new Map<string, PlannedHabit>();
  for (const p of todayPlanned) {
    plannedMap.set(p.habitId, p);
  }

  const withTime: TodayHabitEntry[] = [];
  const withoutTime: TodayHabitEntry[] = [];

  for (const habit of activeHabits) {
    const planned = plannedMap.get(habit.id) ?? null;
    if (planned) {
      withTime.push({ habit, planned });
    } else {
      withoutTime.push({ habit, planned: null });
    }
  }

  withTime.sort((a, b) => a.planned!.time.localeCompare(b.planned!.time));

  return [...withTime, ...withoutTime];
};
