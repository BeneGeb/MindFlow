import { Habit, PlannedHabit } from '../types';
import { useActiveHabits } from '../store/habitStore';
import { usePlannerStore } from '../store/plannerStore';
import { today } from '../utils/dateHelpers';

export interface TodayHabitEntry {
  key: string;
  habit: Habit;
  planned: PlannedHabit;
}

export const useTodayHabits = (): TodayHabitEntry[] => {
  const activeHabits = useActiveHabits();
  const getForDate = usePlannerStore((s) => s.getForDate);
  usePlannerStore((s) => s.planned); // subscribe so changes trigger a re-render
  const todayPlanned = getForDate(today());

  const habitMap = new Map<string, Habit>();
  for (const habit of activeHabits) {
    habitMap.set(habit.id, habit);
  }

  const entries: TodayHabitEntry[] = todayPlanned
    .filter((p) => habitMap.has(p.habitId))
    .map((p) => ({ key: p.id, habit: habitMap.get(p.habitId)!, planned: p }));

  entries.sort((a, b) => {
    const ta = a.planned.time;
    const tb = b.planned.time;
    if (!ta && !tb) return 0;
    if (!ta) return 1;
    if (!tb) return -1;
    return ta.localeCompare(tb);
  });

  return entries;
};
