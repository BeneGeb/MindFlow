import { Asset } from 'expo-asset';

// Registry maps content keys to their require() module references.
// Add new .md files here to make them available in the app.
const CONTENT_MAP: Record<string, number> = {
  // Habits
  'habit/meditation': require('../../assets/content/habits/meditation.md'),
  'habit/journaling': require('../../assets/content/habits/journaling.md'),
  'habit/walking': require('../../assets/content/habits/walking.md'),
  'habit/exercise': require('../../assets/content/habits/exercise.md'),
  'habit/yoga': require('../../assets/content/habits/yoga.md'),
  'habit/breathing': require('../../assets/content/habits/breathing.md'),
  // Library – Atomic Habits (kept for reference, not shown in UI)
  'library/4-laws': require('../../assets/content/library/atomic-habits/4-laws.md'),
  'library/2-minute-rule': require('../../assets/content/library/atomic-habits/2-minute-rule.md'),
  'library/habit-stacking': require('../../assets/content/library/atomic-habits/habit-stacking.md'),
  'library/identity-habits': require('../../assets/content/library/atomic-habits/identity-habits.md'),
  // Library – Habit Science
  'library/how-habits-form': require('../../assets/content/library/habit-science/how-habits-form.md'),
  'library/start-small': require('../../assets/content/library/habit-science/start-small.md'),
  'library/habit-chaining': require('../../assets/content/library/habit-science/habit-chaining.md'),
  'library/identity-and-habits': require('../../assets/content/library/habit-science/identity-and-habits.md'),
  // Library – Mental Health
  'library/mental-health-overview': require('../../assets/content/library/mental-health/overview.md'),
};

const cache: Record<string, string> = {};

export async function loadContent(key: string): Promise<string> {
  if (cache[key]) return cache[key];

  const module = CONTENT_MAP[key];
  if (!module) return `# Not found\n\nContent for "${key}" is not available.`;

  try {
    const asset = Asset.fromModule(module);
    await asset.downloadAsync();
    const response = await fetch(asset.uri);
    const text = await response.text();
    cache[key] = text;
    return text;
  } catch {
    return `# Error\n\nFailed to load content for "${key}".`;
  }
}

export const HABIT_CONTENT_KEY: Record<string, string> = {
  meditation: 'habit/meditation',
  journaling: 'habit/journaling',
  walking: 'habit/walking',
  exercise: 'habit/exercise',
  yoga: 'habit/yoga',
  breathing: 'habit/breathing',
};
