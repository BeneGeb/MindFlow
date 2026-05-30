import { create } from 'zustand';
import { PlannedHabit } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { getDayOfWeek } from '../utils/dateHelpers';

interface PlannerStore {
  planned: PlannedHabit[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPlanned: (entry: Omit<PlannedHabit, 'id'>) => Promise<void>;
  updatePlanned: (id: string, changes: Partial<Omit<PlannedHabit, 'id'>>) => Promise<void>;
  removePlanned: (id: string) => Promise<void>;
  getForDate: (date: string) => PlannedHabit[];
}

const generateId = () => Math.random().toString(36).slice(2, 10);

export const isActiveOnDate = (entry: PlannedHabit, dateStr: string): boolean => {
  if (entry.repeatMode === 'once') return entry.date === dateStr;
  if (entry.repeatMode === 'daily') return true;
  const dow = getDayOfWeek(dateStr);
  return entry.repeatDays.includes(dow);
};

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  planned: [],
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<PlannedHabit[]>(STORAGE_KEYS.PLANNER);
    set({ planned: saved ?? [], hydrated: true });
  },

  addPlanned: async (entry) => {
    const newEntry: PlannedHabit = { ...entry, id: generateId() };
    const next = [...get().planned, newEntry];
    set({ planned: next });
    await storage.set(STORAGE_KEYS.PLANNER, next);
  },

  updatePlanned: async (id, changes) => {
    const next = get().planned.map((e) => (e.id === id ? { ...e, ...changes } : e));
    set({ planned: next });
    await storage.set(STORAGE_KEYS.PLANNER, next);
  },

  removePlanned: async (id) => {
    const next = get().planned.filter((e) => e.id !== id);
    set({ planned: next });
    await storage.set(STORAGE_KEYS.PLANNER, next);
  },

  getForDate: (date: string) =>
    get().planned.filter((e) => isActiveOnDate(e, date)),
}));
