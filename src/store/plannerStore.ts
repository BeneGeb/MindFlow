import { create } from 'zustand';
import { PlannedHabit, RepeatMode } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { today, getDayOfWeek, toDateString } from '../utils/dateHelpers';
import { PRESET_HABITS } from '../data/habits';
import { scheduleHabitReminder, cancelReminders } from '../utils/notificationService';

interface PlannerStore {
  planned: PlannedHabit[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPlanned: (entry: Omit<PlannedHabit, 'id' | 'notificationIds'>) => Promise<void>;
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

/** Looks up a habit's name and icon from PRESET_HABITS (or falls back to defaults). */
function getHabitMeta(habitId: string): { name: string; icon: string } {
  const habit = PRESET_HABITS.find((h) => h.id === habitId);
  return { name: habit?.name ?? 'Habit', icon: habit?.icon ?? '✅' };
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  planned: [],
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<PlannedHabit[]>(STORAGE_KEYS.PLANNER);
    // Migrate old entries that may not have the new fields
    const migrated = (saved ?? []).map((e) => ({
      ...e,
      reminderMinutes: e.reminderMinutes ?? null,
      notificationIds: e.notificationIds ?? [],
    }));
    set({ planned: migrated, hydrated: true });
  },

  addPlanned: async (entry) => {
    const newEntry: PlannedHabit = {
      ...entry,
      id: generateId(),
      reminderMinutes: entry.reminderMinutes ?? null,
      notificationIds: [],
    };

    // Schedule notifications if a reminder is configured
    if (newEntry.time && newEntry.reminderMinutes !== null) {
      const { name, icon } = getHabitMeta(newEntry.habitId);
      try {
        const ids = await scheduleHabitReminder(newEntry, name, icon);
        newEntry.notificationIds = ids;
      } catch (_) { /* ignore */ }
    }

    const next = [...get().planned, newEntry];
    set({ planned: next });
    await storage.set(STORAGE_KEYS.PLANNER, next);
  },

  updatePlanned: async (id, changes) => {
    const existing = get().planned.find((e) => e.id === id);
    if (!existing) return;

    // Cancel old notifications
    if (existing.notificationIds?.length) {
      try { await cancelReminders(existing.notificationIds); } catch (_) { /* ignore */ }
    }

    const updated: PlannedHabit = {
      ...existing,
      ...changes,
      reminderMinutes: changes.reminderMinutes !== undefined ? changes.reminderMinutes : existing.reminderMinutes,
      notificationIds: [],
    };

    // Schedule new notifications
    if (updated.time && updated.reminderMinutes !== null) {
      const { name, icon } = getHabitMeta(updated.habitId);
      try {
        updated.notificationIds = await scheduleHabitReminder(updated, name, icon);
      } catch (_) { /* ignore */ }
    }

    const next = get().planned.map((e) => (e.id === id ? updated : e));
    set({ planned: next });
    await storage.set(STORAGE_KEYS.PLANNER, next);
  },

  removePlanned: async (id) => {
    const existing = get().planned.find((e) => e.id === id);

    // Cancel associated notifications
    if (existing?.notificationIds?.length) {
      try { await cancelReminders(existing.notificationIds); } catch (_) { /* ignore */ }
    }

    const next = get().planned.filter((e) => e.id !== id);
    set({ planned: next });
    await storage.set(STORAGE_KEYS.PLANNER, next);
  },

  getForDate: (date: string) =>
    get().planned.filter((e) => isActiveOnDate(e, date)),
}));
