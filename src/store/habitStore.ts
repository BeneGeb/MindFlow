import { create } from 'zustand';
import { Habit } from '../types';
import { PRESET_HABITS } from '../data/habits';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface HabitStore {
  habits: Habit[];
  activeHabitIds: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleActiveHabit: (id: string) => Promise<void>;
  isActive: (id: string) => boolean;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: PRESET_HABITS,
  activeHabitIds: PRESET_HABITS.map((h) => h.id), // all habits active by default
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<string[]>(STORAGE_KEYS.ACTIVE_HABITS);
    if (saved) {
      set({ activeHabitIds: saved, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  toggleActiveHabit: async (id: string) => {
    const { activeHabitIds } = get();
    const next = activeHabitIds.includes(id)
      ? activeHabitIds.filter((i) => i !== id)
      : [...activeHabitIds, id];
    set({ activeHabitIds: next });
    await storage.set(STORAGE_KEYS.ACTIVE_HABITS, next);
  },

  isActive: (id: string) => get().activeHabitIds.includes(id),
}));

export const useActiveHabits = (): Habit[] => {
  const { habits, activeHabitIds } = useHabitStore();
  return habits.filter((h) => activeHabitIds.includes(h.id));
};
