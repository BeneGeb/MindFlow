import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface StressStore {
  levels: Record<string, number>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLevel: (date: string, level: number) => Promise<void>;
}

export const useStressStore = create<StressStore>((set, get) => ({
  levels: {},
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<Record<string, number>>(STORAGE_KEYS.STRESS);
    set({ levels: saved ?? {}, hydrated: true });
  },

  setLevel: async (date, level) => {
    const next = { ...get().levels, [date]: level };
    set({ levels: next });
    await storage.set(STORAGE_KEYS.STRESS, next);
  },
}));
