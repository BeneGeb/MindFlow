import { create } from 'zustand';
import { TrackingRecord } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { today } from '../utils/dateHelpers';

// { [date]: { [habitId]: { [plannedId]: boolean } } }
type OccurrenceRecord = Record<string, Record<string, Record<string, boolean>>>;

interface TrackingStore {
  tracking: TrackingRecord;
  occurrences: OccurrenceRecord;
  hydrated: boolean;
  hydrate: () => Promise<void>;

  // Habit-level (HabitDetailScreen, streak, stats)
  toggle: (habitId: string, date?: string) => Promise<void>;
  isCompleted: (habitId: string, date?: string) => boolean;
  getCompletedIds: (date: string) => string[];

  // Occurrence-level (HomeScreen cards)
  toggleOccurrence: (plannedId: string, habitId: string, date?: string) => Promise<void>;
  isOccurrenceCompleted: (plannedId: string, habitId: string, date?: string) => boolean;
}

export const useTrackingStore = create<TrackingStore>((set, get) => ({
  tracking: {},
  occurrences: {},
  hydrated: false,

  hydrate: async () => {
    const savedTracking = await storage.get<TrackingRecord>(STORAGE_KEYS.TRACKING);
    const savedOccurrences = await storage.get<OccurrenceRecord>(STORAGE_KEYS.OCCURRENCES);
    set({
      tracking: savedTracking ?? {},
      occurrences: savedOccurrences ?? {},
      hydrated: true,
    });
  },

  toggle: async (habitId: string, date = today()) => {
    const { tracking } = get();
    const dayRecord = tracking[date] ?? {};
    const next: TrackingRecord = {
      ...tracking,
      [date]: { ...dayRecord, [habitId]: !dayRecord[habitId] },
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

  toggleOccurrence: async (plannedId: string, habitId: string, date = today()) => {
    const { occurrences, tracking } = get();
    const dayHabit = occurrences[date]?.[habitId] ?? {};
    const newState = !dayHabit[plannedId];
    const nextDayHabit = { ...dayHabit, [plannedId]: newState };

    const nextOccurrences: OccurrenceRecord = {
      ...occurrences,
      [date]: { ...(occurrences[date] ?? {}), [habitId]: nextDayHabit },
    };

    // Derive habit-level completion: true if any occurrence is done
    const habitDone = Object.values(nextDayHabit).some(Boolean);
    const nextTracking: TrackingRecord = {
      ...tracking,
      [date]: { ...(tracking[date] ?? {}), [habitId]: habitDone },
    };

    set({ occurrences: nextOccurrences, tracking: nextTracking });
    await Promise.all([
      storage.set(STORAGE_KEYS.OCCURRENCES, nextOccurrences),
      storage.set(STORAGE_KEYS.TRACKING, nextTracking),
    ]);
  },

  isOccurrenceCompleted: (plannedId: string, habitId: string, date = today()) =>
    !!get().occurrences[date]?.[habitId]?.[plannedId],
}));
