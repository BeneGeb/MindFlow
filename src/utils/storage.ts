import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};

export const STORAGE_KEYS = {
  ACTIVE_HABITS: 'mindflow:active_habits',
  TRACKING: 'mindflow:tracking',
  PLANNER: 'mindflow:planner',
  OCCURRENCES: 'mindflow:occurrences',
  CUSTOM_HABITS: 'mindflow:custom_habits',
  THEME_PREFERENCE: 'mindflow:theme_preference',
} as const;
