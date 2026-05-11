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
  usePlannerStore((s) => s.planned); // subscribe so changes trigger a re-render
  const todayPlanned = getForDate(today());

  const plannedMap = new Map<string, PlannedHabit>();
  for (const p of todayPlanned) {
    plannedMap.set(p.habitId, p);
  }

  const withTime: TodayHabitEntry[] = [];

  for (const habit of activeHabits) {
    const planned = plannedMap.get(habit.id) ?? null;
    if (planned) {
      withTime.push({ habit, planned });
    }
  }

  withTime.sort((a, b) => a.planned!.time.localeCompare(b.planned!.time));

  return withTime;
};
