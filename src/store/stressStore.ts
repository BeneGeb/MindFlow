import { create } from 'zustand';
import { StressLevel, StressLog } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { today } from '../utils/dateHelpers';

interface StressStore {
  log: StressLog;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLevel: (level: StressLevel, date?: string) => Promise<void>;
  clearLevel: (date?: string) => Promise<void>;
  getLevel: (date?: string) => StressLevel | null;
  getHistory: (days: number) => { date: string; level: StressLevel | null }[];
}

export const useStressStore = create<StressStore>((set, get) => ({
  log: {},
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<StressLog>(STORAGE_KEYS.STRESS_LOG);
    set({ log: saved ?? {}, hydrated: true });
  },

  setLevel: async (level: StressLevel, date = today()) => {
    const { log } = get();
    const next: StressLog = { ...log, [date]: level };
    set({ log: next });
    await storage.set(STORAGE_KEYS.STRESS_LOG, next);
  },

  clearLevel: async (date = today()) => {
    const { log } = get();
    const next: StressLog = { ...log };
    delete next[date];
    set({ log: next });
    await storage.set(STORAGE_KEYS.STRESS_LOG, next);
  },

  getLevel: (date = today()) => get().log[date] ?? null,

  getHistory: (days: number) => {
    const { log } = get();
    const result: { date: string; level: StressLevel | null }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({ date: dateStr, level: log[dateStr] ?? null });
    }
    return result;
  },
}));
