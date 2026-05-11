# MindFlow – Agent Handoff Document

This file is the authoritative source of truth for the current state of the MindFlow app.
It is read automatically by Claude Code at the start of every session. Keep it up to date after every significant change.

---

## Project Overview

**MindFlow** is a React Native (Expo) habit tracking app focused on mental health habits for Gen Z (16–28).
It combines habit tracking with the science of habit building (based on *Atomic Habits* by James Clear).

- **Platform:** iOS & Android (Expo Managed Workflow)
- **Language:** English (UI), German (internal docs/concept)
- **Current version:** v1.0 (complete, running)
- **Concept file:** [`mindflow_konzept.md`](mindflow_konzept.md) — full product spec including v2.0 plans

---

## How to Run

```bash
# Install dependencies
npm install

# Start development server (always use --clear after package changes)
npx expo start --clear

# Android
npx expo start --android

# iOS (requires macOS)
npx expo start --ios
```

> **Important:** Always run `npx expo start --clear` after any package install/update to avoid stale Metro cache errors.

---

## Tech Stack (v1.0)

| Area | Package | Version |
|------|---------|---------|
| Framework | expo | ~54.0.33 |
| Language | TypeScript | ~5.9.2 |
| Navigation | @react-navigation/native + bottom-tabs + native-stack | ^7.x |
| State | zustand | ^5.0.13 |
| Persistence | @react-native-async-storage/async-storage | 2.2.0 |
| Content loading | expo-asset + expo-file-system | SDK 54 compatible |
| Markdown rendering | react-native-markdown-display | ^7.0.2 |
| Haptics | expo-haptics | ~15.0.8 |
| Animations | React Native built-in `Animated` API | (built-in) |

### Deliberately excluded
- `react-native-reanimated` — removed due to JSI/HostObject incompatibility with RN 0.81.5 + old arch. Use built-in `Animated` instead.
- `react-native-gesture-handler` — removed; replaced `@react-navigation/stack` with `@react-navigation/native-stack` which has no gesture-handler dependency.
- Push notifications — moved to v2.0 as a Premium feature.
- RevenueCat / Supabase / any backend — v2.0 only.

### Architecture flags
- `newArchEnabled: false` in `app.json` — new arch disabled for SDK 54 compatibility.
- `babel-preset-expo` in devDependencies (was missing from template, caused initial crash).

---

## Project Structure

```
/
├── App.tsx                    # Entry point; hydrates all three Zustand stores on mount
├── app.json                   # Expo config (newArchEnabled: false, no predictiveBackGestureEnabled)
├── babel.config.js            # Only babel-preset-expo; NO reanimated plugin
├── metro.config.js            # Adds .md to assetExts for content loading
├── tsconfig.json              # strict: true, baseUrl: ".", paths: @/* → src/*
│
├── src/
│   ├── types/index.ts         # All shared TypeScript types (Habit, PlannedHabit, etc.)
│   ├── data/
│   │   ├── habits.ts          # PRESET_HABITS array (8 pre-built habits with id, icon, color)
│   │   └── library.ts         # LIBRARY_ARTICLES array (5 articles with assetKey references)
│   ├── store/
│   │   ├── habitStore.ts      # Active habit IDs; all habits active by default
│   │   ├── trackingStore.ts   # Daily completion: { [date]: { [habitId]: boolean } }
│   │   └── plannerStore.ts    # PlannedHabit entries; isActiveOnDate() handles repeat logic
│   ├── hooks/
│   │   ├── useStreak.ts       # Calculates current streak for a habitId
│   │   ├── useCompletionRate.ts # Completion %, overall rate, 7/28-day heatmap data
│   │   └── useTodayHabits.ts  # Returns sorted list: timed habits first, then untimed
│   ├── utils/
│   │   ├── theme.ts           # colors, typography, spacing, radius, shadow — single source of truth
│   │   ├── storage.ts         # AsyncStorage wrapper + STORAGE_KEYS constants
│   │   ├── dateHelpers.ts     # toDateString, today(), getGreeting(), getWeekDates(), etc.
│   │   └── contentLoader.ts   # Loads .md files via expo-asset + expo-file-system; in-memory cache
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Bottom tabs (4) + NativeStack for detail screens
│   ├── components/
│   │   ├── HabitCard.tsx      # Habit row: icon, name, time, streak badge, animated checkbox
│   │   ├── ProgressBar.tsx    # Animated progress bar using built-in Animated API
│   │   └── HeatmapGrid.tsx    # Grid of colored squares; props: data: boolean[], color: string
│   └── screens/
│       ├── HomeScreen.tsx         # Today's habits sorted by planned time; progress bar
│       ├── PlannerScreen.tsx      # Week selector + Add modal (time, repeat: daily/weekly/once)
│       ├── StatsScreen.tsx        # Overall % + per-habit streak, completion rate, 7-day heatmap
│       ├── LibraryScreen.tsx      # 3 sections: Atomic Habits, Mental Health, habit deep dives
│       ├── HabitDetailScreen.tsx  # Markdown content + 28-day heatmap + mark-done + plan button
│       └── LibraryArticleScreen.tsx # Full Markdown reader for library articles
│
└── assets/
    ├── content/               # ALL editable Markdown content lives here
    │   ├── habits/            # One .md file per habit (8 files)
    │   │   ├── meditation.md
    │   │   ├── journaling.md
    │   │   ├── walking.md
    │   │   ├── exercise.md
    │   │   ├── yoga.md
    │   │   ├── breathing.md
    │   │   ├── sleep.md
    │   │   └── digital-detox.md
    │   └── library/
    │       ├── atomic-habits/ # 4 articles (4-laws, 2-minute-rule, habit-stacking, identity-habits)
    │       └── mental-health/ # 1 article (overview)
    └── icon.png / splash-icon.png / ...
```

---

## Content System

All article and habit content is stored as `.md` files in `assets/content/`.

**To add or edit content:** Edit the `.md` file directly. No code changes needed.

**To add a new article:**
1. Create the `.md` file in the appropriate folder
2. Add an entry to `CONTENT_MAP` in [`src/utils/contentLoader.ts`](src/utils/contentLoader.ts)
3. Add the article metadata to [`src/data/library.ts`](src/data/library.ts)

**How it works:** `contentLoader.ts` uses `expo-asset` + `expo-file-system` to load `.md` files at runtime. Results are cached in memory. Metro is configured to bundle `.md` files as assets via `metro.config.js`.

---

## Data Model

### Habits (static)
Pre-built habits are defined in `src/data/habits.ts`. IDs are stable strings (e.g. `"meditation"`, `"digital-detox"`).

### Tracking (AsyncStorage key: `mindflow:tracking`)
```json
{
  "2024-01-15": {
    "meditation": true,
    "journaling": false
  }
}
```

### Planner (AsyncStorage key: `mindflow:planner`)
```json
[
  {
    "id": "abc123",
    "habitId": "meditation",
    "time": "07:30",
    "repeatMode": "weekly",
    "repeatDays": [1, 2, 3, 4, 5],
    "date": null
  }
]
```
`repeatMode` can be `"daily"` | `"weekly"` | `"once"`. For `"once"`, `date` holds the ISO date string and `repeatDays` is `[]`.

### Active Habits (AsyncStorage key: `mindflow:active_habits`)
Array of active habit IDs. All 8 habits are active by default on first launch.

---

## Design System

Defined in [`src/utils/theme.ts`](src/utils/theme.ts):

| Token | Value |
|-------|-------|
| Primary (purple) | `#7F77DD` |
| Accent (green) | `#1D9E75` |
| Background (cream) | `#FAF9F6` |
| Surface (white) | `#FFFFFF` |
| Text primary | `#1A1A2E` |
| Text secondary | `#6B7280` |

---

## v1.0 Feature Status

| Feature | Status |
|---------|--------|
| 4-tab navigation (Home, Planner, Stats, Library) | ✅ Complete |
| 8 pre-built mental health habits | ✅ Complete |
| Daily habit check-in with animation + haptics | ✅ Complete |
| Streak calculation | ✅ Complete |
| Planner (time, daily/weekly/once repeat) | ✅ Complete |
| Stats screen (completion rate, heatmap) | ✅ Complete |
| Library with Markdown content | ✅ Complete |
| Habit detail screen | ✅ Complete |
| Local persistence (AsyncStorage + Zustand) | ✅ Complete |
| Push notifications | ❌ v2.0 / Premium |
| Onboarding flow | ❌ v2.0 |
| Custom habits | ❌ v2.0 |
| Premium / paywall (RevenueCat) | ❌ v2.0 |
| Cloud sync (Supabase) | ❌ v2.0 |
| Audio (guided meditations, music) | ❌ v2.0 |
| Drag & drop in Planner | ❌ v2.0 |

---

## v2.0 Roadmap (from mindflow_konzept.md)

- **Onboarding flow** — 4-screen intro (concept fully designed, see konzept)
- **Custom habits** — Emoji picker + free name input
- **Push notifications** — Expo Notifications, local, Premium feature
- **Premium & paywall** — RevenueCat, monthly (4.99€) + yearly (29.99€) with 7-day trial
- **Audio** — Guided meditations, relaxation music, breathing timer (expo-av, Managed Workflow compatible)
- **Cloud sync** — Supabase (Postgres + Auth + Storage)
- **Habit Stacking UI** — Dedicated flow for linking habits
- **Drag & Drop in Planner** — Full timeline drag interface
- **Mood tracking** — Daily mood input
- **Apple Health / Google Fit integration**

---

## Known Decisions & Quirks

- **No `react-native-reanimated`** — Use `Animated` from `react-native` for all animations. Reanimated v3/v4 caused JSI HostObject crashes with RN 0.81.5 + old arch.
- **`@react-navigation/native-stack` not `@react-navigation/stack`** — Stack was replaced because it requires `react-native-gesture-handler` which causes issues. Native-stack uses native platform navigation.
- **`newArchEnabled: false`** — New architecture disabled for SDK 54 compatibility with all current packages.
- **`predictiveBackGestureEnabled` removed** — Caused `java.lang.String cannot be cast to java.lang.boolean` crash on Android.
- **Package versions pinned to SDK 54** — Run `npx expo install --fix` if version mismatch warnings appear after any `npm install`.
- **All habits active by default** — On first launch, all 8 habits appear on Home. The user can deactivate habits via `toggleActiveHabit()` in `habitStore` (no UI for this yet in v1.0).
- **Home screen sort order** — Habits with a planned time for today appear first (sorted by time), unplanned habits appear below.
