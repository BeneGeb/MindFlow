import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlannerStore } from '../store/plannerStore';
import { useHabitStore } from '../store/habitStore';
import { RepeatMode, PlannedHabit } from '../types';
import { PRESET_HABITS } from '../data/habits';
import {
  today,
  getWeekDates,
  SHORT_DAY_NAMES,
  formatTime,
} from '../utils/dateHelpers';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { requestPermissions } from '../utils/notificationService';

const WEEK_DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

function AddPlanModal({
  visible,
  selectedDate,
  editEntry,
  onClose,
}: {
  visible: boolean;
  selectedDate: string;
  editEntry?: PlannedHabit;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const addPlanned = usePlannerStore((s) => s.addPlanned);
  const updatePlanned = usePlannerStore((s) => s.updatePlanned);
  const allHabits = useHabitStore((s) => s.habits);
  const [selectedHabitId, setSelectedHabitId] = useState(PRESET_HABITS[0].id);
  const [hasTime, setHasTime] = useState(false);
  const [timeDate, setTimeDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('daily');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [notifPermission, setNotifPermission] = useState<boolean>(true);
  const [notifStatus, setNotifStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // Check notification permission status whenever the modal opens
  useEffect(() => {
    if (visible) {
      Notifications.getPermissionsAsync()
        .then((result) => {
          const status = ((result as any).status ?? 'undetermined') as 'granted' | 'denied' | 'undetermined';
          const granted = status === 'granted' || !!(result as any).granted;
          setNotifPermission(granted);
          setNotifStatus(granted ? 'granted' : status);
        })
        .catch(() => { setNotifPermission(false); setNotifStatus('denied'); });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setShowPicker(false);
      if (editEntry) {
        setSelectedHabitId(editEntry.habitId);
        if (editEntry.time) {
          const [h, m] = editEntry.time.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          setTimeDate(d);
          setHasTime(true);
        } else {
          setHasTime(false);
        }
        setRepeatMode(editEntry.repeatMode);
        setRepeatDays(editEntry.repeatDays);
        setReminderMinutes(editEntry.reminderMinutes ?? null);
      } else {
        setSelectedHabitId(PRESET_HABITS[0].id);
        setHasTime(false);
        setTimeDate(new Date());
        setRepeatMode('daily');
        setRepeatDays([1, 2, 3, 4, 5]);
        setReminderMinutes(null);
      }
    }
  }, [visible, editEntry]);

  const timeString = `${String(timeDate.getHours()).padStart(2, '0')}:${String(timeDate.getMinutes()).padStart(2, '0')}`;

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && date) setTimeDate(date);
  };

  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = () => {
    const savedTime = hasTime ? timeString : null;
    if (editEntry) {
      updatePlanned(editEntry.id, {
        time: savedTime,
        repeatMode,
        repeatDays: repeatMode === 'weekly' ? repeatDays : [],
        reminderMinutes: hasTime ? reminderMinutes : null,
      });
    } else {
      addPlanned({
        habitId: selectedHabitId,
        time: savedTime,
        repeatMode,
        repeatDays: repeatMode === 'weekly' ? repeatDays : [],
        date: null,
        reminderMinutes: hasTime ? reminderMinutes : null,
      });
    }
    onClose();
  };

  const REMINDER_OPTIONS: { label: string; value: number | null }[] = [
    { label: 'None', value: null },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hr', value: 60 },
    { label: '2 hr', value: 120 },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{editEntry ? 'Edit Habit' : 'Plan a Habit'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Habit Picker — hidden in edit mode */}
          {!editEntry && (
            <>
              <Text style={styles.sectionLabel}>HABIT</Text>
              <View style={styles.habitGrid}>
                {allHabits.map((habit) => (
                  <TouchableOpacity
                    key={habit.id}
                    style={[
                      styles.habitChip,
                      selectedHabitId === habit.id && {
                        backgroundColor: habit.color + '22',
                        borderColor: habit.color,
                      },
                    ]}
                    onPress={() => setSelectedHabitId(habit.id)}
                  >
                    <Text style={styles.habitChipIcon}>{habit.icon}</Text>
                    <Text style={styles.habitChipName} numberOfLines={1}>
                      {habit.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Time */}
          <Text style={styles.sectionLabel}>TIME</Text>
          <View style={styles.repeatRow}>
            <TouchableOpacity
              style={[styles.repeatChip, !hasTime && styles.repeatChipActive]}
              onPress={() => { setHasTime(false); setShowPicker(false); setReminderMinutes(null); }}
            >
              <Text style={[styles.repeatChipText, !hasTime && styles.repeatChipTextActive]}>
                Any time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.repeatChip, hasTime && styles.repeatChipActive]}
              onPress={() => setHasTime(true)}
            >
              <Text style={[styles.repeatChipText, hasTime && styles.repeatChipTextActive]}>
                Set time
              </Text>
            </TouchableOpacity>
          </View>
          {hasTime && (
            <>
              <TouchableOpacity
                style={[styles.timeDisplay, { marginTop: spacing.sm }]}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.timeDisplayText}>{formatTime(timeString)}</Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={timeDate}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
              {Platform.OS === 'ios' && showPicker && (
                <TouchableOpacity
                  style={styles.pickerDoneBtn}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Reminder — only visible when a time is set */}
          {hasTime && (
            <>
              <Text style={styles.sectionLabel}>REMINDER</Text>
              <View style={[styles.reminderRow, !notifPermission && { opacity: 0.4 }]}>
                {REMINDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[
                      styles.reminderChip,
                      reminderMinutes === opt.value && styles.reminderChipActive,
                    ]}
                    onPress={() => {
                      if (!notifPermission) {
                        if (notifStatus === 'undetermined') {
                          // Permissions not yet requested – ask the user now
                          requestPermissions().then((granted) => {
                            setNotifPermission(granted);
                            setNotifStatus(granted ? 'granted' : 'denied');
                            if (granted) setReminderMinutes(opt.value);
                          }).catch(() => {});
                        } else {
                          // Permissions were explicitly denied – guide to Settings
                          Alert.alert(
                            'Notifications disabled',
                            'Enable notifications in your device settings to use reminders.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Open Settings', onPress: () => Linking.openSettings() },
                            ],
                          );
                        }
                        return;
                      }
                      setReminderMinutes(opt.value);
                    }}
                  >
                    <Text
                      style={[
                        styles.reminderChipText,
                        reminderMinutes === opt.value && styles.reminderChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!notifPermission && (
                <Text style={styles.reminderHint}>
                  🔕 Notifications are disabled. Enable them in Settings to use reminders.
                </Text>
              )}
            </>
          )}

          {/* Repeat Mode */}
          <Text style={styles.sectionLabel}>REPEAT</Text>
          <View style={styles.repeatRow}>
            {(['daily', 'weekly'] as RepeatMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.repeatChip,
                  repeatMode === mode && styles.repeatChipActive,
                ]}
                onPress={() => setRepeatMode(mode)}
              >
                <Text
                  style={[
                    styles.repeatChipText,
                    repeatMode === mode && styles.repeatChipTextActive,
                  ]}
                >
                  {mode === 'daily' ? 'Every day' : mode === 'weekly' ? 'Select days' : 'Once'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {repeatMode === 'weekly' && (
            <View style={styles.dayRow}>
              {WEEK_DAYS.map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.dayChip,
                    repeatDays.includes(value) && styles.dayChipActive,
                  ]}
                  onPress={() => toggleDay(value)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      repeatDays.includes(value) && styles.dayChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PlannerEntry({
  entry,
  isLast,
  onEdit,
  onDelete,
}: {
  entry: PlannedHabit;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === entry.habitId));
  if (!habit) return null;

  const repeatLabel =
    entry.repeatMode === 'daily'
      ? 'Every day'
      : entry.repeatDays.map((d) => SHORT_DAY_NAMES[d]).join(', ');

  return (
    <View style={styles.timelineRow}>
      {/* Left: time label + dot + connector */}
      <View style={[styles.timelineGutter, isLast && styles.timelineGutterLast]}>
        <Text style={styles.timelineTime}>{entry.time ? formatTime(entry.time) : '–'}</Text>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineConnector} />}
      </View>

      {/* Right: card */}
      <TouchableOpacity style={styles.entryCard} onPress={onEdit} activeOpacity={0.7}>
        <View style={[styles.entryIconWrap, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.entryIcon}>{habit.icon}</Text>
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.entryName}>{habit.name}</Text>
          <Text style={styles.entryMeta}>{repeatLabel}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

export default function PlannerScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const weekDates = getWeekDates(new Date());
  const [selectedDate, setSelectedDate] = useState(today());
  const [modalVisible, setModalVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<PlannedHabit | undefined>(undefined);
  const getForDate = usePlannerStore((s) => s.getForDate);
  const removePlanned = usePlannerStore((s) => s.removePlanned);
  usePlannerStore((s) => s.planned); // subscribe so deletions trigger a re-render

  const entries = getForDate(selectedDate);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Week Selector */}
      <View style={styles.weekRow}>
        {weekDates.map((date) => {
          const dow = new Date(date + 'T12:00:00').getDay();
          const isSelected = date === selectedDate;
          const isToday = date === today();
          return (
            <TouchableOpacity
              key={date}
              style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayBtnLabel, isSelected && styles.dayBtnLabelActive]}>
                {SHORT_DAY_NAMES[dow]}
              </Text>
              <Text style={[styles.dayBtnDate, isSelected && styles.dayBtnDateActive]}>
                {new Date(date + 'T12:00:00').getDate()}
              </Text>
              {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Nothing planned</Text>
            <Text style={styles.emptyText}>
              Tap + to schedule a habit for this day.
            </Text>
          </View>
        ) : (
          entries
            .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
            .map((entry, index) => (
              <PlannerEntry
                key={entry.id}
                entry={entry}
                isLast={index === entries.length - 1}
                onEdit={() => { setEditEntry(entry); setModalVisible(true); }}
                onDelete={() => removePlanned(entry.id)}
              />
            ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setEditEntry(undefined); setModalVisible(true); }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddPlanModal
        visible={modalVisible}
        selectedDate={selectedDate}
        editEntry={editEntry}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  dayBtnActive: { backgroundColor: colors.primary },
  dayBtnLabel: { ...typography.label, color: colors.textSecondary, marginBottom: 2 },
  dayBtnLabelActive: { color: '#fff' },
  dayBtnDate: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  dayBtnDateActive: { color: '#fff' },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  todayDotActive: { backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timelineGutter: {
    width: 54,
    alignItems: 'center',
  },
  timelineGutterLast: {
    alignSelf: 'flex-start',
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginBottom: 4,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
    opacity: 0.25,
    minHeight: 16,
  },
  entryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  entryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  entryIcon: { fontSize: 20 },
  entryInfo: { flex: 1 },
  entryName: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
  entryMeta: { ...typography.bodySmall, color: colors.textSecondary },
  deleteBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  deleteIcon: { fontSize: 16, color: colors.textMuted },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  modalCancel: { ...typography.body, color: colors.textSecondary },
  modalSave: { ...typography.body, color: colors.primary, fontWeight: '700' },
  modalContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    letterSpacing: 0.8,
  },
  habitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  habitChipIcon: { fontSize: 16 },
  habitChipName: { ...typography.bodySmall, color: colors.textPrimary, maxWidth: 80 },
  timeDisplay: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  timeDisplayText: {
    ...typography.h2,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  pickerDoneBtn: {
    alignItems: 'flex-end',
    paddingVertical: spacing.sm,
  },
  pickerDoneText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  // Reminder
  reminderRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  reminderChip: {
    flex: 1,
    minWidth: 56,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  reminderChipActive: { borderColor: colors.accent, backgroundColor: colors.accentLight },
  reminderChipText: { ...typography.bodySmall, color: colors.textSecondary },
  reminderChipTextActive: { color: colors.accent, fontWeight: '600' },
  reminderHint: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  // Repeat
  repeatRow: { flexDirection: 'row', gap: spacing.sm },
  repeatChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  repeatChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  repeatChipText: { ...typography.bodySmall, color: colors.textSecondary },
  repeatChipTextActive: { color: colors.primary, fontWeight: '600' },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',  // fixes left-alignment on narrow screens (e.g. iPhone SE)
  },
  dayChip: {
    width: 38,            // reduced from 40 so 7 chips fit on iPhone SE (288 px usable)
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dayChipText: { ...typography.label, color: colors.textSecondary },
  dayChipTextActive: { color: '#fff' },
});
