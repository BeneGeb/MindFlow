export type HabitCategory =
  | 'meditation'
  | 'journaling'
  | 'walking'
  | 'exercise'
  | 'yoga'
  | 'breathing'
  | 'sleep'
  | 'digital-detox'
  | 'custom';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: HabitCategory;
  createdAt: string;
  isCustom: boolean;
  description?: string;
}

export type RepeatMode = 'daily' | 'weekly' | 'once';

export interface PlannedHabit {
  id: string;
  habitId: string;
  time: string | null; // "HH:MM", or null if no fixed time
  repeatMode: RepeatMode;
  repeatDays: number[]; // 0=Sun … 6=Sat, used when repeatMode === 'weekly'
  date: string | null; // ISO date string, used when repeatMode === 'once'
  notificationEnabled: boolean;
  notificationTime: string | null; // "HH:MM", independent of habit time
}

// date string "YYYY-MM-DD" → habitId → completed
export type TrackingRecord = Record<string, Record<string, boolean>>;

export interface LibraryArticle {
  id: string;
  title: string;
  description: string;
  section: 'atomic-habits' | 'mental-health' | 'habit-science';
  assetKey: string; // key into CONTENT_MAP
}
