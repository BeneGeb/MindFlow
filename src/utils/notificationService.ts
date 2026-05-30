import { PlannedHabit } from '../types';

// Notifications are a v2.0 feature. These stubs keep the codebase compiling.

export async function requestPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleHabitReminder(
  _entry: PlannedHabit,
  _habitName: string,
  _habitIcon: string,
): Promise<string[]> {
  return [];
}

export async function cancelReminders(_notificationIds: string[]): Promise<void> {}
