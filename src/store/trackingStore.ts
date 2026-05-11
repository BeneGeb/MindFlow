import { create } from 'zustand';
import { TrackingRecord } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { today } from '../utils/dateHelpers';

interface TrackingStore {
  tracking: TrackingRecord;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (habitId: string, date?: string) => Promise<void>;
  isCompleted: (habitId: string, date?: string) => boolean;
  getCompletedIds: (date: string) => string[];
}

export const useTrackingStore = create<TrackingStore>((set, get) => ({
  tracking: {},
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<TrackingRecord>(STORAGE_KEYS.TRACKING);
    set({ tracking: saved ?? {}, hydrated: true });
  },

  toggle: async (habitId: string, date = today()) => {
    const { tracking } = get();
    const dayRecord = tracking[date] ?? {};
    const next: TrackingRecord = {
      ...tracking,
      [date]: {
        ...dayRecord,
        [habitId]: !dayRecord[habitId],
      },
    };
    set({ tracking: next });
    await storage.set(STORAGE_KEYS.TRACKING, next);
  },

  isCompleted: (habitId: string, date = today()) =>
    !!get().tracking[date]?.[habitId],

  getCompletedIds: (date: string) =>
    Object.entries(get().tracking[date] ?? {})
      .filter(([, done]) => done)
      .map(([id]) => id),
}));
