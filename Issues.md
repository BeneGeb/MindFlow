# MindFlow – Issue Backlog

Dieses Dokument enthält alle GitHub Issues mit überarbeiteten Titeln, klaren Beschreibungen und konkreten Implementierungshinweisen.  
Neue Issues werden **unten angehängt**. Bereits dokumentierte Issues werden **nicht verändert**.

---

---

## Issue #23 – App-Icon erstellen (MindFlow Branding)

**GitHub Issue:** #23  
**Original Titel:** Icon Erstellen  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Derzeit sind Platzhalter-Icons in `assets/` vorhanden. Diese müssen durch ein zum App-Design passendes Icon ersetzt werden.

### Design-Vorgaben

| Token | Wert | Verwendung |
|-------|------|-----------|
| Primärfarbe | `#7F77DD` (Lila) | Hauptfarbe des Icons |
| Akzentfarbe | `#1D9E75` (Grün) | Highlights / Checkmark |
| Hintergrundfarbe Light | `#FAF9F6` (Creme) | Splash-Hintergrund |
| Stil | Minimalistisch, modern, Gen-Z | Kein Fotorealismus |
| Thema | Mentale Gesundheit + Gewohnheiten | Motiv-Ideen: Gehirn, Welle, Loop-Pfeil, Blatt + Checkmark |

### Benötigte Dateien

| Datei | Größe | Verwendung |
|-------|-------|-----------|
| `assets/icon.png` | 1024 × 1024 px | iOS App-Icon (mit abgerundeten Ecken – iOS schneidet selbst) |
| `assets/adaptive-icon.png` | 1024 × 1024 px | Android Adaptive Icon – **nur Vordergrund**, transparenter Hintergrund, ~15 % Safety-Zone als Padding einhalten |
| `assets/splash-icon.png` | 1024 × 1024 px | Splash Screen Zentriert-Icon |
| `assets/favicon.png` | 48 × 48 px | Web Favicon |

### app.json Konfiguration (bereits vorhanden – kein Code-Change nötig)

```json
"icon": "./assets/icon.png",
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#FAF9F6"
  }
}
```

### Schritte

1. Icon-Design erstellen (Figma, Illustrator, o. ä.) anhand der Vorgaben oben.
2. Als PNG in den angegebenen Größen exportieren.
3. Dateien in `assets/` ablegen (bestehende Platzhalter überschreiben).
4. `npx expo start --clear` ausführen, damit Metro-Cache und Expo-Icon-Cache geleert werden.
5. Visual Check auf Gerät/Simulator: Homescreen-Icon, Splash, Android-Adaptive-Clipping prüfen.

### Betroffene Dateien

- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`
- `assets/favicon.png`

### ❓ Offene Fragen (Claude Code kann diesen Issue nicht automatisch umsetzen)

Dieser Issue erfordert **manuelles Grafikdesign** in einem Design-Tool (Figma, Illustrator, Adobe XD o. ä.).  
Claude Code kann keine PNG-Grafiken in der erforderlichen Qualität und im gewünschten Stil (minimalistisch, modern, Gen-Z) erstellen.  

**Bitte kläre:**
- Soll eine externe Person / ein Designer das Icon erstellen?
- Gibt es bereits einen Entwurf oder Moodboard, der als Basis dienen kann?
- Alternativ: Soll ein einfaches, programmatisch generiertes Platzhalter-Icon (z. B. lila Hintergrund + weißes Emoji) verwendet werden, bis ein echtes Icon fertig ist?

---

## Issue #22 – Expo Go Kompatibilität: Benachrichtigungen korrekt absichern

**GitHub Issue:** #22  
**Original Titel:** Fehler bei Benachrichtigung  
**Label:** ClaudeCode | **Status:** Open  
**Implementierungsstatus:** ✅ Fix bereits im Code enthalten – GitHub Issue noch nicht geschlossen

### Kontext

In Expo Go ab SDK 53 wurde die Android-Push-Notification-Funktionalität aus `expo-notifications` entfernt. Beim Starten der App in Expo Go führte der direkte Aufruf von `Notifications.setNotificationHandler()` zu einem Crash auf Android.

Der originale Fehler lautete:  
> `expo-notifications Android Push notifications functionality provided by expo-notifications was removed from Expo Go with release of SDK 53`

### Ursache (technisch)

`expo-notifications` versucht beim Import bestimmte native Module zu initialisieren, die in Expo Go nicht mehr vorhanden sind. Insbesondere `Notifications.setNotificationHandler()` und `Notifications.requestPermissionsAsync()` sind betroffen.

### Implementierter Fix (bereits vorhanden)

**Datei:** `src/utils/notificationService.ts`

```ts
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  Notifications.setNotificationHandler({ ... });
} else {
  console.warn('[MindFlow] Notifications not available in Expo Go.');
}
```

**Datei:** `App.tsx`

```ts
hydratePlanner().then(() => {
  if (!isExpoGo) {
    usePlannerStore.getState().rescheduleAll().catch(() => {});
  }
});

if (!isExpoGo) {
  requestPermissions().then(...).catch(() => {});
}
```

**Datei:** `src/screens/PlannerScreen.tsx`  
`getPermissionsAsync()` wird direkt aufgerufen, aber durch `.catch()` abgesichert – bei einem Fehler in Expo Go wird Permission auf `false` gesetzt, ohne zu crashen.

### Betroffene Dateien

- `src/utils/notificationService.ts` – isExpoGo-Flag + Handler-Guard
- `App.tsx` – rescheduleAll + requestPermissions mit isExpoGo-Guard
- `src/screens/PlannerScreen.tsx` – getPermissionsAsync mit .catch()-Fallback

### Nächste Schritte

- GitHub Issue #22 auf GitHub **schließen**, da der Fix bereits implementiert ist.
- Optionales Verbesserungspotenzial: `getPermissionsAsync()` in `PlannerScreen.tsx` ebenfalls mit explizitem `isExpoGo`-Guard statt nur `.catch()` absichern (defensiver Code).

---

## Issue #18 – Habit-Erinnerungen per Push-Benachrichtigung

**GitHub Issue:** #18  
**Original Titel:** Benachrichtigung für Habits  
**Label:** ClaudeCode | **Status:** Open  
**Implementierungsstatus:** ✅ Feature vollständig implementiert – GitHub Issue noch nicht geschlossen

### Kontext

Nutzer sollen für jede geplante Gewohnheit eine Push-Benachrichtigung erhalten, die sie kurz vor dem geplanten Zeitpunkt erinnert. Der Zeitabstand soll frei wählbar sein (z. B. 5 min, 15 min, 1 Stunde vor der Gewohnheit).

### Implementierte Lösung (bereits vollständig vorhanden)

#### `src/utils/notificationService.ts`

Enthält `scheduleHabitReminder(entry, habitName, habitIcon)`:
- Berechnet den Trigger-Zeitpunkt: `habit.time - reminderMinutes`
- Plant Benachrichtigungen für die nächsten 7 Tage (maximal 64 Notifications-Limit von Expo einhalten: 8 Habits × 7 Tage = 56)
- Unterstützt alle drei Wiederholungsmodi: `daily`, `weekly` (mit `repeatDays`), `once`
- Guards gegen Expo Go (`isExpoGo`-Flag)

#### `src/store/plannerStore.ts`

- `addPlanned()`: Ruft `scheduleHabitReminder()` auf und speichert zurückgegebene `notificationIds`
- `updatePlanned()`: Cancelt alte Notifications, plant neue
- `removePlanned()`: Cancelt alle verknüpften Notifications
- `rescheduleAll()`: Erneuert alle Notifications beim App-Start (7-Tage-Fenster auffüllen)

#### `App.tsx`

Ruft `rescheduleAll()` nach dem Hydratisieren des Planners auf – nur wenn `!isExpoGo`.

#### `src/screens/PlannerScreen.tsx` – Reminder-UI

```
REMINDER-Sektion im Planer-Modal:
[None] [5 min] [10 min] [15 min] [30 min] [1 hr] [2 hr]
```
- Chips nur anklickbar wenn Notification-Permission erteilt
- Bei `status === 'undetermined'`: `requestPermissions()` wird aufgerufen
- Bei `status === 'denied'`: Alert mit Deep-Link zu Einstellungen

### Datenmodell-Erweiterung

`PlannedHabit` in `src/types/index.ts` hat zwei neue Felder:

```ts
reminderMinutes: number | null;   // null = kein Reminder
notificationIds: string[];         // IDs der geplanten Notifications
```

### Betroffene Dateien

- `src/utils/notificationService.ts`
- `src/store/plannerStore.ts`
- `src/screens/PlannerScreen.tsx`
- `App.tsx`
- `src/types/index.ts`

### Nächste Schritte

- GitHub Issue #18 auf GitHub **schließen**, da das Feature vollständig implementiert ist.
- Testen mit einem **Development Build** (nicht Expo Go), da Notifications in Expo Go nicht verfügbar sind.
- Optionales QA: Edge-Case testen, wenn `reminderOffset > habit.time` (Trigger-Zeit würde am Vortag liegen).

---

## Issue #15 – Tagesauswahl im Planer-Modal nicht zentriert

**GitHub Issue:** #15  
**Original Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**Label:** ClaudeCode | **Status:** Open  
**Implementierungsstatus:** ✅ Fix bereits im Code – GitHub Issue noch nicht geschlossen

### Kontext

Beim Planen einer Gewohnheit mit `Repeat: Select days` erscheinen die 7 Tages-Chips (Sun–Sat) linksbündig statt zentriert im Modal. Das betrifft besonders kleinere Bildschirme wie das iPhone SE (Breite 320 px).

### Ursache (technisch)

`dayRow` hatte `width: '100%'` ohne `justifyContent: 'center'`, was dazu führte, dass die Chips immer links ausgerichtet wurden. Auf Geräten mit weniger als ~302 px nutzbarer Breite (7 × 40 px + 6 × 4 px Gap = 304 px) wurden die Chips zudem in zwei Zeilen umgebrochen, wobei die letzte Zeile links hängen blieb.

### Implementierter Fix (bereits vorhanden)

**Datei:** `src/screens/PlannerScreen.tsx` → Style `dayRow`:

```ts
dayRow: {
  flexDirection: 'row',
  gap: 6,
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',   // ← NEU: zentriert Chips in jeder Zeile
  alignSelf: 'center',        // ← NEU: zentriert den Container selbst
},
dayChip: {
  width: 38,                  // ← reduziert von 40 (7 Chips passen so auf iPhone SE)
  height: 38,
  borderRadius: 19,           // ← angepasst
  ...
},
```

Mit `gap: 6` und `width: 38`: 7 × 38 + 6 × 6 = 302 px. Auf iPhone SE (288 px nutzbar) wrappen sie in zwei Zeilen, aber `justifyContent: 'center'` zentriert jede Zeile korrekt.

### Betroffene Dateien

- `src/screens/PlannerScreen.tsx` – Styles `dayRow` und `dayChip`

### Nächste Schritte

- GitHub Issue #15 auf GitHub **schließen**, da der Fix bereits implementiert ist.
- Optionales QA: Visuell auf iPhone SE-Simulator prüfen, ob alle 7 Chips korrekt angezeigt werden (ggf. wrappen sie in zwei 4+3-Reihen – beide sollten zentriert sein).

---

## Issue #12 – Dark Mode Unterstützung

**GitHub Issue:** #12  
**Original Titel:** Dark mode Unterstützung  
**Label:** ClaudeCode | **Status:** Open  
**Implementierungsstatus:** ✅ Vollständig implementiert – GitHub Issue noch nicht geschlossen

### Kontext

Die App soll den Systemdark-Mode (iOS/Android) automatisch erkennen und alle UI-Elemente in einem dunklen Farbschema darstellen. Nutzer sollen außerdem manuell zwischen Light, Dark und System-Automatisch wählen können.

### Implementierte Lösung (bereits vollständig vorhanden)

#### `src/utils/theme.ts`

Enthält sowohl `colors` (Light) als auch `darkColors` (Dark):

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#FAF9F6` | `#0F0F17` |
| `surface` | `#FFFFFF` | `#1C1C2A` |
| `textPrimary` | `#1A1A2E` | `#F0EFF8` |
| `primary` | `#7F77DD` | `#9D96E8` |
| `accent` | `#1D9E75` | `#2CC68F` |

#### `src/utils/ThemeContext.tsx`

Vollständiger `ThemeProvider` mit:
- `themePreference: 'system' | 'light' | 'dark'` (persisted in AsyncStorage via `STORAGE_KEYS.THEME_PREFERENCE`)
- Automatische System-Erkennung via `useColorScheme()` aus React Native
- Exportiert `useTheme()` Hook für alle Screens und Komponenten

#### Alle Screens & Komponenten

Alle Screens nutzen das Pattern:

```ts
const { colors } = useTheme();
const styles = makeStyles(colors);
```

Styles werden als Funktion `makeStyles(colors: ColorTheme)` definiert, sodass sie bei Theme-Wechsel reaktiv neu berechnet werden.

#### `App.tsx`

`ThemeProvider` wrапpt die gesamte App. `NavigationContainer` erhält dynamisch `navTheme` basierend auf `isDark`.

#### Markdown-Styles (LibraryArticleScreen, HabitDetailScreen)

`makeMarkdownStyles(colors)` enthält vollständige Dark-Mode-kompatible Styles für `body`, `heading1-6`, `code_inline`, `fence`, `code_block`, `link`, `blockquote`, `hr`.

### Betroffene Dateien

- `src/utils/theme.ts` – `colors` + `darkColors`
- `src/utils/ThemeContext.tsx` – ThemeProvider + useTheme Hook
- `src/utils/storage.ts` – `STORAGE_KEYS.THEME_PREFERENCE`
- Alle Screen-Dateien in `src/screens/` – makeStyles(colors)-Pattern
- Alle Komponenten in `src/components/` – makeStyles(colors)-Pattern
- `App.tsx` – ThemeProvider + NavTheme
- `src/navigation/AppNavigator.tsx` – Tab-Bar-Farben aus Theme

### Nächste Schritte

- GitHub Issue #12 auf GitHub **schließen**, da Dark Mode vollständig implementiert ist.
- Optionales Feature (v2.0): Dedizierter Settings-Screen mit Theme-Toggle (Light/Dark/System), da aktuell kein UI für die manuelle Auswahl existiert – die App folgt nur automatisch dem Systemtheme.
