/**
 * notificationService.ts
 *
 * Thin wrapper around expo-notifications.
 * All calls are wrapped in try/catch so the app keeps working in Expo Go
 * (where expo-notifications is not available on Android since SDK 53).
 */

import { Platform } from 'react-native';
import { PlannedHabit } from '../types';

// Lazy-load expo-notifications so a missing/broken module doesn't crash the app at import time.
function getNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }
}

/**
 * Request notification permissions from the user.
 * Returns true if granted, false if denied or unavailable (e.g. Expo Go on Android).
 */
export async function requestPermissions(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;

  try {
    // Configure foreground behaviour
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if ((existing as any).granted ?? (existing as any).status === 'granted') return true;

    const result = await Notifications.requestPermissionsAsync();
    return (result as any).granted ?? (result as any).status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedules local notifications for the next ~28 days for a planned habit.
 * Returns the list of notification IDs that were scheduled.
 * Returns [] if notifications are unavailable (e.g. Expo Go on Android).
 */
export async function scheduleHabitReminder(
  entry: PlannedHabit,
  habitName: string,
  habitIcon: string,
): Promise<string[]> {
  const Notifications = getNotifications();
  if (!Notifications) return [];
  if (!entry.time || entry.reminderMinutes === null) return [];

  try {
    const [hours, minutes] = entry.time.split(':').map(Number);
    const reminderOffset = entry.reminderMinutes;

    // Calculate the actual trigger time (habit time - offset)
    const totalMinutes = hours * 60 + minutes - reminderOffset;
    const triggerHours = Math.floor(((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
    const triggerMinutes = ((totalMinutes % 60) + 60) % 60;

    const ids: string[] = [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // For 'once' mode, schedule a single notification
    if (entry.repeatMode === 'once' && entry.date) {
      const targetDate = new Date(entry.date + 'T00:00:00');
      targetDate.setHours(triggerHours, triggerMinutes, 0, 0);
      if (targetDate > new Date()) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${habitIcon} Time for ${habitName}`,
            body: `Your habit starts in ${reminderOffset} minute${reminderOffset === 1 ? '' : 's'}.`,
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: targetDate,
          },
        });
        ids.push(id);
      }
      return ids;
    }

    // Determine which days of the week this habit is active
    const activeDays: number[] = [];
    if (entry.repeatMode === 'daily') {
      activeDays.push(0, 1, 2, 3, 4, 5, 6);
    } else if (entry.repeatMode === 'weekly') {
      activeDays.push(...entry.repeatDays);
    }

    // Schedule for each active day for the next 28 days (Expo max: 64 notifications)
    for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
      const date = new Date(todayStart);
      date.setDate(todayStart.getDate() + dayOffset);
      const dow = date.getDay(); // 0=Sun ... 6=Sat

      if (!activeDays.includes(dow)) continue;

      date.setHours(triggerHours, triggerMinutes, 0, 0);
      if (date <= new Date()) continue; // skip past times

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${habitIcon} Time for ${habitName}`,
          body: `Your habit starts in ${reminderOffset} minute${reminderOffset === 1 ? '' : 's'}.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
      ids.push(id);
    }

    return ids;
  } catch {
    return [];
  }
}

/**
 * Cancels all notifications with the given IDs.
 * Silently ignores errors (e.g. when running in Expo Go).
 */
export async function cancelReminders(notificationIds: string[]): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications || !notificationIds.length) return;
  try {
    await Promise.all(
      notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
    );
  } catch {
    // ignore
  }
}
