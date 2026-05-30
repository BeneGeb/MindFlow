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

## Issue #22 – Expo Go Absturz: expo-notifications in Expo Go (SDK 53+) nicht mehr unterstützt

**GitHub Issue:** #22  
**Original Titel:** Fehler bei Benachrichtigung  
**Label:** ClaudeCode | **Status:** Open

### Fehlerbeschreibung

```
expo-notifications Android Push notifications functionality provided by expo-notifications
was removed from Expo Go with release of SDK 53
```

Dieser Fehler tritt auf, wenn die App in **Expo Go** (nicht Development Build) auf Android gestartet wird, da `expo-notifications` seit SDK 53 keine Push-Benachrichtigungen mehr in Expo Go unterstützt.

### Root-Cause-Analyse

**Bereits korrekt abgesichert (kein Handlungsbedarf):**
- `src/utils/notificationService.ts:15-27` – `setNotificationHandler` ist hinter `if (!isExpoGo)` Guard
- `App.tsx:24-27` – `rescheduleAll()` nur wenn `!isExpoGo`
- `App.tsx:30-44` – `requestPermissions()` nur wenn `!isExpoGo`

**Problem 1 – `PlannerScreen.tsx` Zeile 67–77, kein `isExpoGo`-Guard:**

```tsx
useEffect(() => {
  if (visible) {
    // ⚠️ Kein isExpoGo-Guard! Kann in Expo Go (Android SDK 53+) native Abstürze auslösen
    Notifications.getPermissionsAsync()
      .then((result) => { ... })
      .catch(() => { setNotifPermission(false); setNotifStatus('denied'); });
  }
}, [visible]);
```

Das `.catch()` fängt JavaScript-Fehler ab, schützt aber nicht vor nativen Crashes, die Expo Go in SDK 53+ verursachen kann.

**Problem 2 – `src/utils/notificationService.ts` Zeile 33–47, `requestPermissions()` ohne Guard:**

```ts
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // ⚠️ Kein isExpoGo-Guard – Notifications.setNotificationChannelAsync kann crashen
    await Notifications.setNotificationChannelAsync('habit-reminders', { ... });
  }
  const existing = await Notifications.getPermissionsAsync(); // ⚠️ kein Guard
  ...
}
```

`requestPermissions()` wird vom `PlannerScreen` aus dem Modal heraus aufgerufen (wenn der Nutzer einen Reminder wählt, aber noch keine Permissions erteilt wurden).

### Fix

**1. `src/utils/notificationService.ts` – Guard am Anfang von `requestPermissions()` einfügen (nach Zeile 33):**

```ts
export async function requestPermissions(): Promise<boolean> {
  if (isExpoGo) return false;  // ← neue Zeile
  ...
}
```

**2. `src/screens/PlannerScreen.tsx` – `useEffect` (Zeile 67) absichern:**

```tsx
import { isExpoGo } from '../utils/notificationService';

useEffect(() => {
  if (!visible || isExpoGo) return;   // ← isExpoGo-Guard hinzufügen
  Notifications.getPermissionsAsync()
    .then(...)
    .catch(...);
}, [visible]);
```

### Betroffene Dateien

| Datei | Zeile | Änderung |
|-------|-------|---------|
| `src/utils/notificationService.ts` | 33 | `if (isExpoGo) return false;` am Anfang von `requestPermissions()` |
| `src/screens/PlannerScreen.tsx` | 67–69 | `if (!visible \|\| isExpoGo) return;` im `useEffect` |

### Hinweis

Dieser Fix betrifft ausschließlich Expo Go. In einem Development Build (`npx expo run:android / run:ios`) funktioniert `expo-notifications` vollständig. Auf die Produktions-App hat dieser Bug keinen Einfluss.

---

## Issue #18 – Habit-Benachrichtigungen (Push Reminders): Implementierungsstand & Testanweisung

**GitHub Issue:** #18  
**Original Titel:** Benachrichtigung für Habits  
**Label:** ClaudeCode | **Status:** Open

### Feature-Anforderung (Original)

Für jede Gewohnheit soll eine Benachrichtigung eingerichtet werden können, die den Nutzer vor dem geplanten Startzeitpunkt erinnert. Der Zeitraum vor der Benachrichtigung soll variabel wählbar sein.

### Aktueller Implementierungsstand

**Die Implementierung ist vollständig vorhanden**, aber nur in **Development Builds** funktional – nicht in Expo Go (SDK 53+, siehe Issue #22).

| Schicht | Status | Datei & Zeile |
|---------|--------|---------------|
| Notification-Handler-Setup | ✅ | `notificationService.ts:15-27` (mit `isExpoGo`-Guard) |
| Permissions-Anfrage | ✅ | `notificationService.ts:33-47` (Guard fehlt noch → Issue #22) |
| Scheduling-Logik (täglich/wöchentlich/einmalig) | ✅ | `notificationService.ts:52-139` |
| Android Notification-Channel | ✅ | `notificationService.ts:35-39` |
| Planner Store – Scheduling on Add | ✅ | `plannerStore.ts:60-65` |
| Planner Store – Reschedule on Update | ✅ | `plannerStore.ts:73-97` |
| Planner Store – Cancel on Delete | ✅ | `plannerStore.ts:102-113` |
| Planner Store – `rescheduleAll()` on App-Start | ✅ | `App.tsx:23-27` (mit `isExpoGo`-Guard) |
| UI – Reminder-Auswahl (None/5/10/15/30 min/1h/2h) | ✅ | `PlannerScreen.tsx:143-151` |

### Funktionsweise

1. Nutzer plant eine Gewohnheit mit Uhrzeit im Planer → wählt Reminder-Zeitraum (None / 5 / 10 / 15 / 30 min / 1 h / 2 h)
2. `plannerStore.addPlanned()` ruft `scheduleHabitReminder()` auf → plant Notifications für die nächsten **7 Tage** ein (max. 56 bei 8 Habits < Expo-Limit 64)
3. Beim nächsten App-Start wird `rescheduleAll()` aufgerufen → das 7-Tage-Fenster wird aufgefüllt

### Noch zu prüfen / testen

1. **End-to-End-Test mit Development Build erforderlich:**
   ```bash
   npx expo run:android
   npx expo run:ios     # nur macOS
   ```
   Danach: Gewohnheit mit Uhrzeit + Reminder planen → warten ob Notification erscheint.

2. **Grenzfall Mitternacht (`notificationService.ts:64-66`):** Wenn `habitTime - reminderOffset < 00:00`, wird auf 23:xx des Vortags gesprungen – Korrektheit prüfen.

3. **`once`-Modus:** `scheduleHabitReminder()` (Zeile 73-95) behandelt einmalige Einträge separat – diesen Testfall durchlaufen.

4. **Verwaiste Notifications:** `plannerStore.removePlanned()` ruft `cancelReminders()` auf – sicherstellen, dass nach dem Löschen tatsächlich keine Notifications mehr erscheinen.

5. **Permissions-Bug zuerst fixen** (Issue #22), damit Expo Go nicht crasht, bevor der End-to-End-Test in einem Development Build stattfindet.

### Betroffene Dateien (zur Orientierung)

- `src/utils/notificationService.ts`
- `src/store/plannerStore.ts`
- `src/screens/PlannerScreen.tsx`
- `App.tsx`

---

## Issue #15 – Tagesauswahl im Planer-Modal korrekt zentrieren

**GitHub Issue:** #15  
**Original Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**Label:** ClaudeCode | **Status:** Open

### Bug-Beschreibung

Im `AddPlanModal` (`src/screens/PlannerScreen.tsx`) erscheint bei `repeatMode === 'weekly'` eine Reihe mit 7 Tages-Chips (So–Sa). Diese Reihe war linksbündig ausgerichtet statt horizontal zentriert.

### Aktueller Stand im Code

In `PlannerScreen.tsx` (Zeile 689–709) wurde bereits ein Fix versucht:

```js
dayRow: {
  flexDirection: 'row',
  gap: 6,
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignSelf: 'center',   // Kommentar im Code: "fixes left-alignment on narrow screens (e.g. iPhone SE)"
},
dayChip: {
  width: 38,   // Reduziert von 40, damit 7 Chips auf iPhone SE passen (288px usable)
  height: 38,
  ...
}
```

Der Issue ist jedoch **noch offen**, was darauf hindeutet, dass das Problem auf bestimmten Geräten weiterhin besteht.

### Ursache des Restproblems

- `alignSelf: 'center'` schrumpft die `dayRow`-View auf ihre natürliche Breite (Content-Width). Zusammen mit `flexWrap: 'wrap'` kann die Row bei einzelnen Chips schmaler sein als der Bildschirm, wodurch die Zentrierung optisch nicht funktioniert.
- Bei `flexWrap: 'wrap'`: wenn ein Chip in die zweite Zeile umbricht, ist diese Zeile linksbündig.
- Die Chip-Berechnung: `7 × 38px + 6 × 6px gap = 302px`. Auf Geräten mit kleinem Viewport (z. B. schmalem Landscape-Modus) kann dieser Wert die Breite überschreiten.

### Empfohlene Lösung

Da genau **7 statische Chips** (`WEEK_DAYS` ist konstant) existieren, ist `flexWrap` nicht notwendig. Die einfachste robuste Lösung:

```js
dayRow: {
  flexDirection: 'row',
  marginTop: spacing.sm,
  justifyContent: 'center',   // zentriert die 7 Chips horizontal
  gap: 6,
  // flexWrap und alignSelf entfernen
},
dayChip: {
  width: 38,
  height: 38,
  ...
}
```

Falls auf sehr kleinen Screens (unter ~310px Breite) Platzprobleme entstehen, alternativ:

```jsx
<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
  {WEEK_DAYS.map(...)}
</ScrollView>
```

### Betroffene Dateien

| Datei | Zeile | Änderung |
|-------|-------|---------|
| `src/screens/PlannerScreen.tsx` | 689–696 (`dayRow`-Style) | `flexWrap` und `alignSelf` entfernen; `justifyContent: 'center'` behalten |

### Testanweisung

1. Planer öffnen → „+" antippen → **Repeat: „Select days"** auswählen.
2. Auf mehreren Bildschirmgrößen prüfen: iPhone SE (375pt), iPhone 15 Pro (393pt), Android-Mittelklasse.
3. Die 7 Chips (Sun–Sat) müssen **horizontal zentriert** im Modal erscheinen.
4. Antippen einzelner Chips und Re-Render prüfen – Zentrierung darf sich nicht verschieben.

---

## Issue #12 – Dark Mode: Verbleibende Komponenten und Markdown-Renderer anpassen

**GitHub Issue:** #12  
**Original Titel:** Dark mode unterstützung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die Dark-Mode-Infrastruktur ist **bereits weitgehend implementiert**:

| Baustein | Status | Datei |
|---------|--------|-------|
| Farbpaletten (Light + Dark) | ✅ | `src/utils/theme.ts` (`colors` / `darkColors`) |
| ThemeProvider mit `system/light/dark` Präferenz | ✅ | `src/utils/ThemeContext.tsx` |
| Persistierung der Präferenz (AsyncStorage) | ✅ | `ThemeContext.tsx:28-33` |
| NavigationContainer Theme (DarkTheme/DefaultTheme) | ✅ | `App.tsx:48-54` |
| StatusBar Anpassung | ✅ | `App.tsx:55` |
| Tab-Bar-Farben | ✅ | `AppNavigator.tsx:49-57` |
| Alle Screens (`HomeScreen`, `PlannerScreen`, `StatsScreen`, etc.) | ✅ | `useTheme()` überall genutzt |
| Dark-Mode-Toggle in HomeScreen | ✅ | `HomeScreen.tsx:52` (`setThemePreference`) |

### Was ggf. noch zu prüfen und zu ergänzen ist

**1. Komponenten in `src/components/` prüfen:**  
Prüfen ob `HabitCard.tsx`, `ProgressBar.tsx` und `HeatmapGrid.tsx` `useTheme()` verwenden oder noch hartcodierte Farben enthalten.

```bash
grep -rn "'#\|backgroundColor:\|color:" src/components/
```

**2. Markdown-Renderer für Dark Mode konfigurieren:**  
`HabitDetailScreen.tsx` und `LibraryArticleScreen.tsx` rendern Markdown via `react-native-markdown-display`. Dieser Renderer nutzt standardmäßig schwarzen Text auf weißem Hintergrund – er muss mit Dark-Mode-Farben versorgt werden:

```tsx
const { colors } = useTheme();

<Markdown
  style={{
    body: { color: colors.textPrimary, backgroundColor: colors.background },
    heading1: { color: colors.textPrimary },
    link: { color: colors.primary },
    // ...weitere Markdown-Elemente
  }}
>
  {content}
</Markdown>
```

**3. Hardcodierte Farbwerte suchen:**

```bash
grep -rn "'#[0-9A-Fa-f]\{3,6\}'" src/
```

Alle gefundenen Farbwerte prüfen – sofern sie nicht semantische Sonderfälle sind (z. B. `'#fff'` auf `primary`-farbigem Hintergrund), durch `colors.*`-Werte aus dem Theme ersetzen.

**4. Discoverability des Toggles:**  
Der Dark-Mode-Toggle sitzt in `HomeScreen.tsx`. Prüfen ob er für Nutzer sichtbar und erreichbar ist. Ggf. in einen dedizierteren Settings-Bereich verschieben.

### Schritte zur Umsetzung

1. Komponenten `HabitCard`, `ProgressBar`, `HeatmapGrid` auf `useTheme()` umstellen (falls nötig).
2. Markdown-Style-Props in `HabitDetailScreen` und `LibraryArticleScreen` ergänzen.
3. Visuellen Dark-Mode-Test auf iOS und Android durchführen (Gerät/Simulator auf Dark Mode stellen).
4. `grep`-Suche nach hartcodierten Farben; bei Bedarf in `colors.*` umschreiben.

### Betroffene Dateien

- `src/components/HabitCard.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/HeatmapGrid.tsx`
- `src/screens/HabitDetailScreen.tsx` (Markdown-Styles)
- `src/screens/LibraryArticleScreen.tsx` (Markdown-Styles)
