import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PlannedHabit } from '../types';
import { storage, STORAGE_KEYS } from './storage';

const CHANNEL_ID = 'mindflow-habits';

// ── Android notification channel ─────────────────────────────────────────────

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Habit Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7F77DD',
    sound: 'default',
  });
}

// ── Permissions ──────────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  await ensureChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Notification ID map (planEntryId → notificationId[]) ────────────────────

type NotificationMap = Record<string, string[]>;

async function loadMap(): Promise<NotificationMap> {
  return (await storage.get<NotificationMap>(STORAGE_KEYS.NOTIFICATION_IDS)) ?? {};
}

async function saveMap(map: NotificationMap) {
  await storage.set(STORAGE_KEYS.NOTIFICATION_IDS, map);
}

// ── Internal scheduling ──────────────────────────────────────────────────────

async function scheduleForEntry(
  entry: PlannedHabit,
  habitName: string,
  habitIcon: string,
): Promise<string[]> {
  if (!entry.notificationEnabled || !entry.notificationTime) return [];
  const [hour, minute] = entry.notificationTime.split(':').map(Number);
  const ids: string[] = [];

  const content: Notifications.NotificationContentInput = {
    title: `${habitIcon} ${habitName}`,
    body: "It's time for your habit!",
    data: { habitId: entry.habitId, planId: entry.id },
    sound: true,
    ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
  };

  if (entry.repeatMode === 'daily') {
    ids.push(
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      }),
    );
  } else if (entry.repeatMode === 'weekly') {
    for (const day of entry.repeatDays) {
      // Our repeatDays: 0=Sun…6=Sat; expo-notifications weekday: 1=Sun…7=Sat
      ids.push(
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1,
            hour,
            minute,
          },
        }),
      );
    }
  } else if (entry.repeatMode === 'once' && entry.date) {
    const [y, m, d] = entry.date.split('-').map(Number);
    const fireDate = new Date(y, m - 1, d, hour, minute, 0);
    if (fireDate > new Date()) {
      ids.push(
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireDate,
          },
        }),
      );
    }
  }

  return ids;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Schedule (or reschedule) reminders for a planned habit entry.
 * Cancels any previously scheduled notifications for the same entry ID first.
 */
export async function syncReminder(
  entry: PlannedHabit,
  habitName: string,
  habitIcon: string,
): Promise<void> {
  try {
    const map = await loadMap();
    if (map[entry.id]?.length) {
      await Promise.all(
        map[entry.id].map((id) => Notifications.cancelScheduledNotificationAsync(id)),
      );
    }
    const ids = await scheduleForEntry(entry, habitName, habitIcon);
    if (ids.length > 0) {
      map[entry.id] = ids;
    } else {
      delete map[entry.id];
    }
    await saveMap(map);
  } catch {
    // Silently fail when permissions are denied or scheduling is unavailable
  }
}

/**
 * Cancel all reminders for a planned habit entry and remove from the map.
 */
export async function removeReminder(entryId: string): Promise<void> {
  try {
    const map = await loadMap();
    if (map[entryId]?.length) {
      await Promise.all(
        map[entryId].map((id) => Notifications.cancelScheduledNotificationAsync(id)),
      );
      delete map[entryId];
      await saveMap(map);
    }
  } catch {
    // Silently fail
  }
}

// Kept for backwards-compat
export async function scheduleHabitReminder(
  entry: PlannedHabit,
  habitName: string,
  habitIcon: string,
): Promise<string[]> {
  return scheduleForEntry(entry, habitName, habitIcon);
}

export async function cancelReminders(notificationIds: string[]): Promise<void> {
  await Promise.all(
    notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}
