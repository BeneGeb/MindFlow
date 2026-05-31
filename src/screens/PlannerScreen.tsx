import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
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
import { syncReminder, removeReminder } from '../utils/notificationService';

const WEEK_DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const COLOR_OPTIONS = [
  '#7F77DD', '#1D9E75', '#E8A838', '#E05C5C',
  '#3AAFA9', '#9B59B6', '#3498DB', '#E67E22',
  '#27AE60', '#F06292',
];

// ── Add / Edit Plan Modal ──────────────────────────────────────────────────

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

  // Plan state
  const addPlanned = usePlannerStore((s) => s.addPlanned);
  const updatePlanned = usePlannerStore((s) => s.updatePlanned);
  const allHabits = useHabitStore((s) => s.habits);
  const { addCustomHabit, updateCustomHabit, removeCustomHabit } = useHabitStore();

  const [selectedHabitId, setSelectedHabitId] = useState(PRESET_HABITS[0].id);
  const [hasTime, setHasTime] = useState(false);
  const [timeDate, setTimeDate] = useState(() => new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('daily');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Notification state
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTimeDate, setNotifTimeDate] = useState(() => new Date());
  const [showNotifPicker, setShowNotifPicker] = useState(false);

  // Inline habit form state
  const [inlineMode, setInlineMode] = useState<'none' | 'create' | 'edit'>('none');
  const [inlineHabitId, setInlineHabitId] = useState<string | null>(null);
  const [inlineEmoji, setInlineEmoji] = useState('✨');
  const [inlineName, setInlineName] = useState('');
  const [inlineColor, setInlineColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (visible) {
      setShowPicker(false);
      setShowNotifPicker(false);
      setInlineMode('none');
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
        setNotifEnabled(editEntry.notificationEnabled ?? false);
        if (editEntry.notificationTime) {
          const [h, m] = editEntry.notificationTime.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          setNotifTimeDate(d);
        } else {
          setNotifTimeDate(new Date());
        }
      } else {
        setSelectedHabitId(PRESET_HABITS[0].id);
        setHasTime(false);
        setTimeDate(new Date());
        setRepeatMode('daily');
        setRepeatDays([1, 2, 3, 4, 5]);
        setNotifEnabled(false);
        setNotifTimeDate(new Date());
      }
    }
  }, [visible, editEntry]);

  const timeString = `${String(timeDate.getHours()).padStart(2, '0')}:${String(timeDate.getMinutes()).padStart(2, '0')}`;
  const notifTimeString = `${String(notifTimeDate.getHours()).padStart(2, '0')}:${String(notifTimeDate.getMinutes()).padStart(2, '0')}`;

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && date) {
      setTimeDate(date);
      if (notifEnabled) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - 15);
        setNotifTimeDate(d);
      }
    }
  };

  const handleNotifTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowNotifPicker(false);
    if (event.type === 'set' && date) setNotifTimeDate(date);
  };

  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSavePlan = async () => {
    const savedTime = hasTime ? timeString : null;
    const savedNotifTime = notifEnabled ? notifTimeString : null;
    const habit = allHabits.find((h) => h.id === selectedHabitId);

    if (editEntry) {
      const updatedRepeatDays = repeatMode === 'weekly' ? repeatDays : [];
      const changes = {
        time: savedTime,
        repeatMode,
        repeatDays: updatedRepeatDays,
        notificationEnabled: notifEnabled,
        notificationTime: savedNotifTime,
      };
      await updatePlanned(editEntry.id, changes);
      const updatedEntry = { ...editEntry, ...changes };
      if (notifEnabled && habit) {
        await syncReminder(updatedEntry, habit.name, habit.icon);
      } else {
        await removeReminder(editEntry.id);
      }
    } else {
      const newEntry = await addPlanned({
        habitId: selectedHabitId,
        time: savedTime,
        repeatMode,
        repeatDays: repeatMode === 'weekly' ? repeatDays : [],
        date: null,
        notificationEnabled: notifEnabled,
        notificationTime: savedNotifTime,
      });
      if (notifEnabled && habit) await syncReminder(newEntry, habit.name, habit.icon);
    }
    onClose();
  };

  const openCreateMode = () => {
    setInlineEmoji('✨');
    setInlineName('');
    setInlineColor(COLOR_OPTIONS[0]);
    setInlineHabitId(null);
    setInlineMode('create');
  };

  const openEditMode = (habitId: string) => {
    const habit = allHabits.find((h) => h.id === habitId);
    if (!habit) return;
    setInlineEmoji(habit.icon);
    setInlineName(habit.name);
    setInlineColor(habit.color);
    setInlineHabitId(habitId);
    setInlineMode('edit');
  };

  const saveInlineHabit = async () => {
    if (!inlineName.trim()) return;
    if (inlineMode === 'create') {
      const newHabit = await addCustomHabit({
        name: inlineName.trim(),
        icon: inlineEmoji || '✨',
        color: inlineColor,
        description: undefined,
      });
      setSelectedHabitId(newHabit.id);
    } else if (inlineMode === 'edit' && inlineHabitId) {
      await updateCustomHabit(inlineHabitId, {
        name: inlineName.trim(),
        icon: inlineEmoji || '✨',
        color: inlineColor,
        description: undefined,
      });
      setSelectedHabitId(inlineHabitId);
    }
    setInlineMode('none');
  };

  const deleteInlineHabit = () => {
    Alert.alert(
      'Delete habit',
      `Delete "${inlineName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (inlineHabitId) await removeCustomHabit(inlineHabitId);
            setSelectedHabitId(PRESET_HABITS[0].id);
            setInlineMode('none');
          },
        },
      ],
    );
  };

  const isInline = inlineMode !== 'none';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>

        {/* Header */}
        <View style={styles.modalHeader}>
          {isInline ? (
            <TouchableOpacity onPress={() => setInlineMode('none')}>
              <Text style={styles.modalCancel}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.modalTitle}>
            {isInline
              ? inlineMode === 'create' ? 'New Habit' : 'Edit Habit'
              : editEntry ? 'Edit Plan' : 'Plan a Habit'}
          </Text>
          {isInline ? (
            <TouchableOpacity onPress={saveInlineHabit} disabled={!inlineName.trim()}>
              <Text style={[styles.modalSave, !inlineName.trim() && { opacity: 0.35 }]}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSavePlan}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isInline ? (
            /* ── Inline habit form ── */
            <>
              <View style={[styles.emojiPreview, { backgroundColor: inlineColor + '22' }]}>
                <Text style={styles.emojiDisplay}>{inlineEmoji || '✨'}</Text>
              </View>

              <Text style={styles.sectionLabel}>EMOJI</Text>
              <TextInput
                style={styles.emojiInput}
                value={inlineEmoji}
                onChangeText={(t) => setInlineEmoji(t.slice(0, 4))}
                placeholder="Pick an emoji"
                placeholderTextColor={colors.textMuted}
                maxLength={4}
              />

              <Text style={styles.sectionLabel}>NAME</Text>
              <TextInput
                style={styles.nameInput}
                value={inlineName}
                onChangeText={setInlineName}
                placeholder="e.g. Cold Shower, Reading, ..."
                placeholderTextColor={colors.textMuted}
                maxLength={40}
                autoFocus
              />

              <Text style={styles.sectionLabel}>COLOR</Text>
              <View style={styles.colorRow}>
                {COLOR_OPTIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      inlineColor === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setInlineColor(c)}
                  />
                ))}
              </View>

              {inlineMode === 'edit' && (
                <TouchableOpacity style={styles.deleteHabitBtn} onPress={deleteInlineHabit}>
                  <Text style={styles.deleteHabitText}>Delete habit</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            /* ── Normal plan mode ── */
            <>
              {/* Habit Picker — hidden when editing a plan entry */}
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
                        {habit.isCustom && (
                          <TouchableOpacity
                            onPress={() => openEditMode(habit.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 6 }}
                            style={styles.habitChipEditBtn}
                          >
                            <Text style={styles.habitChipEditIcon}>✎</Text>
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.newHabitChip} onPress={openCreateMode}>
                      <Text style={styles.newHabitChipIcon}>＋</Text>
                      <Text style={styles.newHabitChipName}>New habit</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Time */}
              <Text style={styles.sectionLabel}>TIME</Text>
              <View style={styles.repeatRow}>
                <TouchableOpacity
                  style={[styles.repeatChip, !hasTime && styles.repeatChipActive]}
                  onPress={() => {
                    setHasTime(false);
                    setShowPicker(false);
                    setNotifEnabled(false);
                  }}
                >
                  <Text style={[styles.repeatChipText, !hasTime && styles.repeatChipTextActive]}>
                    Any time
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.repeatChip, hasTime && styles.repeatChipActive]}
                  onPress={() => {
                    setHasTime(true);
                    if (!notifEnabled) {
                      const d = new Date(timeDate);
                      d.setMinutes(d.getMinutes() - 15);
                      setNotifTimeDate(d);
                      setNotifEnabled(true);
                    }
                  }}
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

              {/* Repeat */}
              <Text style={styles.sectionLabel}>REPEAT</Text>
              <View style={styles.repeatRow}>
                {(['daily', 'weekly'] as RepeatMode[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.repeatChip, repeatMode === mode && styles.repeatChipActive]}
                    onPress={() => setRepeatMode(mode)}
                  >
                    <Text style={[styles.repeatChipText, repeatMode === mode && styles.repeatChipTextActive]}>
                      {mode === 'daily' ? 'Every day' : 'Select days'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {repeatMode === 'weekly' && (
                <View style={styles.dayRow}>
                  {WEEK_DAYS.map(({ label, value }) => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.dayChip, repeatDays.includes(value) && styles.dayChipActive]}
                      onPress={() => toggleDay(value)}
                    >
                      <Text style={[styles.dayChipText, repeatDays.includes(value) && styles.dayChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Notification */}
              <Text style={styles.sectionLabel}>NOTIFICATION</Text>
              <View style={styles.repeatRow}>
                <TouchableOpacity
                  style={[styles.repeatChip, !notifEnabled && styles.repeatChipActive]}
                  onPress={() => { setNotifEnabled(false); setShowNotifPicker(false); }}
                >
                  <Text style={[styles.repeatChipText, !notifEnabled && styles.repeatChipTextActive]}>
                    Off
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.repeatChip, notifEnabled && styles.repeatChipActive]}
                  onPress={() => {
                    if (!notifEnabled) {
                      const d = new Date(timeDate);
                      d.setMinutes(d.getMinutes() - 15);
                      setNotifTimeDate(d);
                    }
                    setNotifEnabled(true);
                  }}
                >
                  <Text style={[styles.repeatChipText, notifEnabled && styles.repeatChipTextActive]}>
                    On
                  </Text>
                </TouchableOpacity>
              </View>
              {notifEnabled && (
                <>
                  <TouchableOpacity
                    style={[styles.timeDisplay, { marginTop: spacing.sm }]}
                    onPress={() => setShowNotifPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeDisplayText}>{formatTime(notifTimeString)}</Text>
                  </TouchableOpacity>
                  {showNotifPicker && (
                    <DateTimePicker
                      value={notifTimeDate}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleNotifTimeChange}
                    />
                  )}
                  {Platform.OS === 'ios' && showNotifPicker && (
                    <TouchableOpacity
                      style={styles.pickerDoneBtn}
                      onPress={() => setShowNotifPicker(false)}
                    >
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ── Planner Entry Row ──────────────────────────────────────────────────────

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
      <View style={[styles.timelineGutter, isLast && styles.timelineGutterLast]}>
        <Text style={styles.timelineTime}>{entry.time ? formatTime(entry.time) : '–'}</Text>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineConnector} />}
      </View>
      <TouchableOpacity style={styles.entryCard} onPress={onEdit} activeOpacity={0.7}>
        <View style={[styles.entryIconWrap, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.entryIcon}>{habit.icon}</Text>
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.entryName}>{habit.name}</Text>
          <Text style={styles.entryMeta}>{repeatLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => { removeReminder(entry.id); onDelete(); }}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

// ── Planner Screen ─────────────────────────────────────────────────────────

export default function PlannerScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const weekDates = getWeekDates(new Date());
  const [selectedDate, setSelectedDate] = useState(today());
  const [modalVisible, setModalVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<PlannedHabit | undefined>(undefined);
  const getForDate = usePlannerStore((s) => s.getForDate);
  const removePlanned = usePlannerStore((s) => s.removePlanned);
  usePlannerStore((s) => s.planned);

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
            <Text style={styles.emptyText}>Tap + to schedule a habit for this day.</Text>
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

// ── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 2 },
  todayDotActive: { backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  timelineRow: { flexDirection: 'row', marginBottom: spacing.sm },
  timelineGutter: { width: 54, alignItems: 'center' },
  timelineGutterLast: { alignSelf: 'flex-start' },
  timelineTime: {
    fontSize: 11, fontWeight: '600', color: colors.textSecondary,
    marginBottom: 4, letterSpacing: 0.2,
  },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary, marginBottom: 4,
  },
  timelineConnector: {
    flex: 1, width: 2, borderRadius: 1,
    backgroundColor: colors.primary, opacity: 0.25, minHeight: 16,
  },
  entryCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, ...shadow.sm,
  },
  entryIconWrap: {
    width: 42, height: 42, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
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
    position: 'absolute', bottom: spacing.xl, right: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center',
    justifyContent: 'center', ...shadow.md,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  modalCancel: { ...typography.body, color: colors.textSecondary },
  modalSave: { ...typography.body, color: colors.primary, fontWeight: '700' },
  modalContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.label, color: colors.textSecondary,
    marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: 0.8,
  },
  // Habit grid
  habitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  habitChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.surface, gap: spacing.xs,
  },
  habitChipIcon: { fontSize: 16 },
  habitChipName: { ...typography.bodySmall, color: colors.textPrimary, maxWidth: 72 },
  habitChipEditBtn: { marginLeft: 2 },
  habitChipEditIcon: { fontSize: 13, color: colors.textMuted },
  newHabitChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1.5,
    borderColor: colors.primary, backgroundColor: colors.primaryLight, gap: spacing.xs,
  },
  newHabitChipIcon: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  newHabitChipName: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  // Inline habit form
  emojiPreview: {
    width: 80, height: 80, borderRadius: radius.lg,
    alignSelf: 'center', alignItems: 'center',
    justifyContent: 'center', marginTop: spacing.md, marginBottom: spacing.sm,
  },
  emojiDisplay: { fontSize: 44 },
  emojiInput: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, fontSize: 26, textAlign: 'center',
    color: colors.textPrimary, ...shadow.sm,
  },
  nameInput: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, ...typography.body,
    color: colors.textPrimary, ...shadow.sm,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: { borderWidth: 3, borderColor: colors.textPrimary },
  deleteHabitBtn: {
    borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.xl,
  },
  deleteHabitText: { ...typography.body, color: '#E05C5C', fontWeight: '600' },
  // Time picker
  timeDisplay: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center',
  },
  timeDisplayText: { ...typography.h2, letterSpacing: 2, color: colors.textPrimary },
  pickerDoneBtn: { alignItems: 'flex-end', paddingVertical: spacing.sm },
  pickerDoneText: { ...typography.body, color: colors.primary, fontWeight: '700' },
  // Repeat
  repeatRow: { flexDirection: 'row', gap: spacing.sm },
  repeatChip: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  repeatChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  repeatChipText: { ...typography.bodySmall, color: colors.textSecondary },
  repeatChipTextActive: { color: colors.primary, fontWeight: '600' },
  dayRow: {
    flexDirection: 'row', gap: 6, marginTop: spacing.sm,
    flexWrap: 'wrap', justifyContent: 'center', alignSelf: 'center',
  },
  dayChip: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dayChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dayChipText: { ...typography.label, color: colors.textSecondary },
  dayChipTextActive: { color: '#fff' },
});
