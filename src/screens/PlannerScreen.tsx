import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlannerStore } from '../store/plannerStore';
import { RepeatMode, PlannedHabit } from '../types';
import { PRESET_HABITS } from '../data/habits';
import {
  today,
  getWeekDates,
  SHORT_DAY_NAMES,
  formatTime,
} from '../utils/dateHelpers';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';

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
  onClose,
}: {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
}) {
  const addPlanned = usePlannerStore((s) => s.addPlanned);
  const [selectedHabitId, setSelectedHabitId] = useState(PRESET_HABITS[0].id);
  const [timeDate, setTimeDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('daily');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (visible) {
      setTimeDate(new Date());
      setShowPicker(false);
    }
  }, [visible]);

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
    addPlanned({
      habitId: selectedHabitId,
      time: timeString,
      repeatMode,
      repeatDays: repeatMode === 'weekly' ? repeatDays : [],
      date: repeatMode === 'once' ? selectedDate : null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Plan a Habit</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Habit Picker */}
          <Text style={styles.sectionLabel}>HABIT</Text>
          <View style={styles.habitGrid}>
            {PRESET_HABITS.map((habit) => (
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

          {/* Time */}
          <Text style={styles.sectionLabel}>TIME</Text>
          <TouchableOpacity
            style={styles.timeDisplay}
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
  onDelete,
}: {
  entry: PlannedHabit;
  onDelete: () => void;
}) {
  const habit = PRESET_HABITS.find((h) => h.id === entry.habitId);
  if (!habit) return null;

  const repeatLabel =
    entry.repeatMode === 'daily'
      ? 'Every day'
      : entry.repeatMode === 'once'
      ? 'Once'
      : entry.repeatDays
          .map((d) => SHORT_DAY_NAMES[d])
          .join(', ');

  return (
    <View style={styles.entryCard}>
      <View style={[styles.entryIconWrap, { backgroundColor: habit.color + '22' }]}>
        <Text style={styles.entryIcon}>{habit.icon}</Text>
      </View>
      <View style={styles.entryInfo}>
        <Text style={styles.entryName}>{habit.name}</Text>
        <Text style={styles.entryMeta}>
          {formatTime(entry.time)} · {repeatLabel}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlannerScreen() {
  const weekDates = getWeekDates(new Date());
  const [selectedDate, setSelectedDate] = useState(today());
  const [modalVisible, setModalVisible] = useState(false);
  const getForDate = usePlannerStore((s) => s.getForDate);
  const removePlanned = usePlannerStore((s) => s.removePlanned);

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
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((entry) => (
              <PlannerEntry
                key={entry.id}
                entry={entry}
                onDelete={() => removePlanned(entry.id)}
              />
            ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddPlanModal
        visible={modalVisible}
        selectedDate={selectedDate}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  entryName: { ...typography.body, fontWeight: '600', marginBottom: 2 },
  entryMeta: { ...typography.bodySmall, color: colors.textSecondary },
  deleteBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  deleteIcon: { fontSize: 16, color: colors.textMuted },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, marginBottom: spacing.sm },
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
  modalTitle: { ...typography.h3 },
  modalCancel: { ...typography.body, color: colors.textSecondary },
  modalSave: { ...typography.body, color: colors.primary, fontWeight: '700' },
  modalContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.label,
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
  habitChipName: { ...typography.bodySmall, maxWidth: 80 },
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
  dayRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dayChipText: { ...typography.label, color: colors.textSecondary },
  dayChipTextActive: { color: '#fff' },
});
