import { create } from 'zustand';
import { Habit } from '../types';
import { PRESET_HABITS } from '../data/habits';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { today } from '../utils/dateHelpers';

const generateId = () => Math.random().toString(36).slice(2, 10);

interface HabitStore {
  habits: Habit[];
  customHabits: Habit[];
  activeHabitIds: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleActiveHabit: (id: string) => Promise<void>;
  isActive: (id: string) => boolean;
  addCustomHabit: (data: Pick<Habit, 'name' | 'icon' | 'color' | 'description'>) => Promise<Habit>;
  updateCustomHabit: (id: string, changes: Pick<Habit, 'name' | 'icon' | 'color' | 'description'>) => Promise<void>;
  removeCustomHabit: (id: string) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: PRESET_HABITS,
  customHabits: [],
  activeHabitIds: PRESET_HABITS.map((h) => h.id),
  hydrated: false,

  hydrate: async () => {
    const savedActive = await storage.get<string[]>(STORAGE_KEYS.ACTIVE_HABITS);
    const savedCustom = await storage.get<Habit[]>(STORAGE_KEYS.CUSTOM_HABITS);
    const customHabits = savedCustom ?? [];
    set({
      customHabits,
      habits: [...PRESET_HABITS, ...customHabits],
      activeHabitIds: savedActive ?? PRESET_HABITS.map((h) => h.id),
      hydrated: true,
    });
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

  addCustomHabit: async (data) => {
    const newHabit: Habit = {
      ...data,
      id: generateId(),
      category: 'custom',
      createdAt: today(),
      isCustom: true,
    };
    const customHabits = [...get().customHabits, newHabit];
    const activeHabitIds = [...get().activeHabitIds, newHabit.id];
    set({ customHabits, habits: [...PRESET_HABITS, ...customHabits], activeHabitIds });
    await Promise.all([
      storage.set(STORAGE_KEYS.CUSTOM_HABITS, customHabits),
      storage.set(STORAGE_KEYS.ACTIVE_HABITS, activeHabitIds),
    ]);
    return newHabit;
  },

  updateCustomHabit: async (id, changes) => {
    const customHabits = get().customHabits.map((h) =>
      h.id === id ? { ...h, ...changes } : h
    );
    set({ customHabits, habits: [...PRESET_HABITS, ...customHabits] });
    await storage.set(STORAGE_KEYS.CUSTOM_HABITS, customHabits);
  },

  removeCustomHabit: async (id) => {
    const customHabits = get().customHabits.filter((h) => h.id !== id);
    const activeHabitIds = get().activeHabitIds.filter((i) => i !== id);
    set({ customHabits, habits: [...PRESET_HABITS, ...customHabits], activeHabitIds });
    await Promise.all([
      storage.set(STORAGE_KEYS.CUSTOM_HABITS, customHabits),
      storage.set(STORAGE_KEYS.ACTIVE_HABITS, activeHabitIds),
    ]);
  },
}));

export const useActiveHabits = (): Habit[] => {
  const { habits, activeHabitIds } = useHabitStore();
  return habits.filter((h) => activeHabitIds.includes(h.id));
};
