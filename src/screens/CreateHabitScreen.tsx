import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useHabitStore } from '../store/habitStore';
import { ColorTheme, spacing, radius, typography, shadow } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

type Route = RouteProp<RootStackParamList, 'CreateHabit'>;

const COLOR_OPTIONS = [
  '#7F77DD', '#1D9E75', '#E8A838', '#E05C5C',
  '#3AAFA9', '#9B59B6', '#3498DB', '#E67E22',
  '#27AE60', '#F06292',
];

export default function CreateHabitScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { habitId } = route.params ?? {};
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const { habits, addCustomHabit, updateCustomHabit, removeCustomHabit } = useHabitStore();
  const existing = habitId ? habits.find((h) => h.id === habitId) : null;
  const isEditing = !!existing;

  const [emoji, setEmoji] = useState(existing?.icon ?? '✨');
  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? COLOR_OPTIONS[0]);
  const [description, setDescription] = useState(existing?.description ?? '');

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    const data = {
      name: name.trim(),
      icon: emoji || '✨',
      color,
      description: description.trim() || undefined,
    };
    if (isEditing && habitId) {
      await updateCustomHabit(habitId, data);
    } else {
      await addCustomHabit(data);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete habit',
      `Are you sure you want to delete "${existing?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (habitId) await removeCustomHabit(habitId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Edit Habit' : 'New Habit'}</Text>

          {/* Emoji preview */}
          <View style={[styles.emojiPreview, { backgroundColor: color + '22' }]}>
            <Text style={styles.emojiDisplay}>{emoji || '✨'}</Text>
          </View>

          {/* Emoji input */}
          <Text style={styles.label}>Emoji</Text>
          <TextInput
            style={styles.emojiInput}
            value={emoji}
            onChangeText={(t) => setEmoji(t.slice(0, 4))}
            placeholder="Tap and pick an emoji"
            placeholderTextColor={colors.textMuted}
            maxLength={4}
          />

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cold Shower, Reading, ..."
            placeholderTextColor={colors.textMuted}
            maxLength={40}
          />

          {/* Color picker */}
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  color === c && styles.colorDotSelected,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          {/* Description */}
          <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what this habit is, why it helps, and how to do it..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>{isEditing ? 'Save changes' : 'Create habit'}</Text>
          </TouchableOpacity>

          {/* Delete (edit mode only) */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>Delete habit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 320 },
  backBtn: { marginBottom: spacing.md },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  emojiPreview: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emojiDisplay: { fontSize: 52 },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  optional: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '400' },
  emojiInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 28,
    textAlign: 'center',
    color: colors.textPrimary,
    ...shadow.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    ...shadow.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 140,
    ...shadow.sm,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { ...typography.body, fontWeight: '700', color: '#fff' },
  deleteBtn: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteBtnText: { ...typography.body, color: '#E05C5C', fontWeight: '600' },
});
