export type HabitCategory =
  | 'meditation'
  | 'journaling'
  | 'walking'
  | 'exercise'
  | 'yoga'
  | 'breathing'
  | 'sleep'
  | 'digital-detox';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: HabitCategory;
  createdAt: string;
  isCustom: false;
}

export type RepeatMode = 'daily' | 'weekly' | 'once';

export interface PlannedHabit {
  id: string;
  habitId: string;
  time: string; // "HH:MM"
  repeatMode: RepeatMode;
  repeatDays: number[]; // 0=Sun … 6=Sat, used when repeatMode === 'weekly'
  date: string | null; // ISO date string, used when repeatMode === 'once'
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
