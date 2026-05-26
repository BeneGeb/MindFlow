import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { PlannedHabit } from '../types';

/**
 * True when the app is running inside Expo Go (storeClient).
 * expo-notifications Android push support was removed from Expo Go in SDK 53+,
 * so all notification calls must be guarded by this flag.
 */
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Configure how notifications appear when the app is in the foreground.
// Guarded against Expo Go crash (push notifications removed from Expo Go SDK 53+).
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} else {
  console.warn('[MindFlow] Notifications not available in Expo Go. Use a development build.');
}

/**
 * Request notification permissions from the user (iOS shows a dialog, Android grants automatically on API <33).
 * Returns true if granted.
 */
export async function requestPermissions(): Promise<boolean> {
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
}

/**
 * Schedules local notifications for the next ~28 days for a planned habit.
 * Returns the list of notification IDs that were scheduled.
 */
export async function scheduleHabitReminder(
  entry: PlannedHabit,
  habitName: string,
  habitIcon: string,
): Promise<string[]> {
  if (!entry.time || entry.reminderMinutes === null) return [];

  const [hours, minutes] = entry.time.split(':').map(Number);
  const reminderOffset = entry.reminderMinutes;

  // Calculate the actual trigger time (habit time - offset)
  const totalMinutes = hours * 60 + minutes - reminderOffset;
  const triggerHours = Math.floor(((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
  const triggerMinutes = ((totalMinutes % 60) + 60) % 60;

  const ids: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For 'once' mode, schedule a single notification
  if (entry.repeatMode === 'once' && entry.date) {
    const targetDate = new Date(entry.date + 'T00:00:00');
    targetDate.setHours(triggerHours, triggerMinutes, 0, 0);
    if (targetDate > new Date()) {
      try {
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
      } catch (_) {
        // Silently ignore scheduling errors (e.g. in Expo Go)
      }
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

  // Schedule for each active day of the week for the next 7 days.
  // Expo allows max 64 notifications; 8 habits × 7 days = up to 56 < 64 limit.
  // rescheduleAll() in plannerStore is called on each app start to refill the window.
  const MAX_DAYS = 7;
  for (let dayOffset = 0; dayOffset < MAX_DAYS; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dow = date.getDay(); // 0=Sun ... 6=Sat

    if (!activeDays.includes(dow)) continue;

    date.setHours(triggerHours, triggerMinutes, 0, 0);

    // Skip past times
    if (date <= new Date()) continue;

    try {
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
    } catch (_) {
      // Silently ignore scheduling errors (e.g. in Expo Go)
    }
  }

  return ids;
}

/**
 * Cancels all notifications with the given IDs.
 */
export async function cancelReminders(notificationIds: string[]): Promise<void> {
  await Promise.all(
    notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}
