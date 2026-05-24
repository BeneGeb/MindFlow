# MindFlow – Issue Backlog

Dieses Dokument enthält alle GitHub Issues mit überarbeiteten Titeln, klaren Beschreibungen und konkreten Implementierungshinweisen.  
Neue Issues werden **unten angehängt**. Bereits dokumentierte Issues werden **nicht verändert**.

---

## Issue #8 – Aktivitäts-Timer für zeitbasierte Habits (Sport, Meditation, Joggen)

**Original-Titel:** tracker  
**GitHub-Issue:** #8

### Beschreibung
Für Habits wie **Sport**, **Meditation** und **Joggen** soll ein eingebauter Aktivitäts-Tracker mit Timer-Funktion implementiert werden. Statt nur eine Checkbox abzuhaken, können Nutzer eine Session starten, tracken und speichern. So entstehen auswertbare Daten (Dauer, Häufigkeit).

### Scope
Folgende Habits aus `src/data/habits.ts` sollen einen Tracker-Modus bekommen:
- `meditation` – Countdown-Timer (Standarddauer einstellbar, z. B. 10 Min)
- `exercise` – Stoppuhr (aufwärts zählend)
- `walking` – Stoppuhr
- `yoga` – Countdown-Timer
- `breathing` – Countdown-Timer mit vordefinierten Atemübungs-Intervallen (optional)

### Technische Umsetzung
1. **Neuer Screen / Modal:** `TrackerScreen.tsx` (via NativeStack navigierbar aus `HabitDetailScreen` oder `HabitCard`)
2. **UI-Elemente:**
   - Große digitale Zeitanzeige (MM:SS)
   - Start / Pause / Stop-Buttons
   - Für Countdown: einstellbare Zieldauer per Slider oder Picker
   - "Session abschließen"-Button mit Haptic-Feedback (`expo-haptics`)
3. **Datenpersistenz:**
   - Neuer Store `src/store/sessionStore.ts` (Zustand + AsyncStorage unter Key `mindflow:sessions`)
   - Session-Eintrag: `{ id, habitId, date, durationSeconds, completedAt }`
4. **Integration in Stats:** `StatsScreen.tsx` und `StatsDetailScreen.tsx` zeigen Gesamtdauer der Woche/Monat
5. **Navigation:** In `AppNavigator.tsx` einen neuen Route-Eintrag `Tracker: { habitId: string }` in `RootStackParamList` hinzufügen
6. **Keine `react-native-reanimated`** – Timer-Animation mit dem nativen `Animated`-API oder `setInterval`

### Akzeptanzkriterien
- [ ] Timer startet, pausiert und stoppt korrekt
- [ ] Abgeschlossene Session wird gespeichert und im Stats-Screen angezeigt
- [ ] Bei Meditation: Countdown endet mit Haptic-Feedback und optionalem Ton (falls `expo-av` installiert wird)
- [ ] Habit gilt nach Abschluss als erledigt (trackingStore wird aktualisiert)

---

## Issue #12 – Dark-Mode-Unterstützung

**Original-Titel:** Dark mode unterstützung  
**GitHub-Issue:** #12

### Beschreibung
Die App soll dem Systemthema des Geräts (hell/dunkel) folgen und einen Dark Mode unterstützen. Aktuell sind alle Farben als statische Konstanten in `src/utils/theme.ts` hinterlegt – es gibt kein dynamisches Farbsystem.

### Technische Umsetzung
1. **`src/utils/theme.ts` erweitern:**
   ```ts
   export const darkColors = {
     primary: '#9D96E8',
     primaryLight: '#2A2747',
     accent: '#2CC68F',
     accentLight: '#1A3D30',
     background: '#0F0F17',
     surface: '#1C1C2A',
     border: '#2A2A3A',
     textPrimary: '#F0EFF8',
     textSecondary: '#9B9BB0',
     textMuted: '#5C5C7A',
     success: '#2CC68F',
     warning: '#F0B84A',
     error: '#F07070',
     tabBar: '#1C1C2A',
     tabBarBorder: '#2A2A3A',
   };
   ```

2. **Theme-Context:** Neuen `ThemeContext` erstellen (`src/utils/ThemeContext.tsx`):
   ```ts
   import { useColorScheme } from 'react-native';
   // Stellt `colors`, `isDark` für alle Komponenten bereit
   ```

3. **Alle Screens und Komponenten** müssen `colors` aus dem Context statt aus dem statischen Import beziehen:
   - `HomeScreen.tsx`, `PlannerScreen.tsx`, `StatsScreen.tsx`, `LibraryScreen.tsx`
   - `HabitDetailScreen.tsx`, `LibraryArticleScreen.tsx`
   - Alle Komponenten in `src/components/`

4. **`AppNavigator.tsx`:** Navigation-Theme anpassen (`DarkTheme` / `DefaultTheme` aus `@react-navigation/native`)

5. **`app.json`:** `"userInterfaceStyle": "automatic"` setzen (unterstützt automatisches System-Theme)

### Reihenfolge
Da dies viele Dateien betrifft, empfiehlt sich folgende Reihenfolge:
1. `theme.ts` um `darkColors` ergänzen
2. `ThemeContext.tsx` erstellen
3. `App.tsx` mit ThemeProvider wrappen
4. Schrittweise Screens/Komponenten migrieren (je Screen ein Commit)

### Akzeptanzkriterien
- [ ] App wechselt automatisch bei Systemthema-Änderung (kein App-Neustart nötig)
- [ ] Alle Screens sind im Dark Mode lesbar (kein weißer Text auf weißem Hintergrund etc.)
- [ ] Navigation-Bar und Tab-Bar folgen dem Dark Mode
- [ ] Kein Hard-Coded `#FFFFFF` oder `#1A1A2E` mehr in Screens/Components

---

## Issue #14 – Home-Screen-Widget als Premium-Feature

**Original-Titel:** Widget als Premium Feature  
**GitHub-Issue:** #14

### Beschreibung
Premium-Nutzer sollen ein iOS/Android-Home-Screen-Widget nutzen können, das die heutigen Habits anzeigt und das direkte Abhaken ermöglicht – ohne die App zu öffnen.

### Voraussetzungen (Blocking Issues)
Dieses Feature setzt folgende v2.0-Features voraus, die zuerst implementiert sein müssen:
- **Premium-System** (RevenueCat, monatlich 4,99 € / jährlich 29,99 €)
- **Push Notifications** (expo-notifications, Issue #13) – Widget-Updates laufen über denselben Notification-Kanal

### Technische Umsetzung
Da Expo Managed Workflow keine nativen Widget-Extensions out-of-the-box unterstützt, ist ein **Expo Development Build** zwingend erforderlich.

**iOS (WidgetKit):**
- Package: `react-native-widget-extension` oder Custom Native Module via Expo Config Plugin
- Widget-Typ: Static Widget (kein dynamischer Reload ohne App-Öffnung bei Managed Workflow)
- Shared Data via App Groups (AsyncStorage ist nicht direkt aus dem Widget zugreifbar)

**Android:**
- Package: `react-native-android-widget`
- Shared Data via `SharedPreferences` oder einem Content-Provider

**Datenfluss:**
1. App schreibt heutige Habits + Completion-Status in einen shared Container (App Group / SharedPreferences)
2. Widget liest diesen Container und rendert die Habit-Liste
3. Tap auf Checkbox → App öffnet sich und updated den TrackingStore

### Widget-Inhalt (UI)
```
┌─────────────────────────┐
│  MindFlow · Heute       │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│  🧘 Meditieren    ☑    │
│  📓 Journaling    ☐    │
│  🏃 Sport         ☐    │
│  3 / 5 erledigt         │
└─────────────────────────┘
```

### Einschränkungen
- Vollständige Widget-Entwicklung erfordert macOS + Xcode (iOS) bzw. Android Studio (Android)
- Managed Workflow-Kompatibilität ist begrenzt – ein Bare-Workflow-Migration könnte nötig sein
- Dieses Feature ist komplex und sollte erst nach Stabilisierung aller v1.0-Features angegangen werden

### Akzeptanzkriterien
- [ ] Widget zeigt heutige Habits mit Completion-Status an
- [ ] Widget ist nur für Premium-Nutzer aktivierbar
- [ ] Tap auf Widget öffnet die App (Deep Link zu HomeScreen)
- [ ] Widget-Daten werden nach jedem App-Öffnen/Schließen synchronisiert

---

## Issue #15 – Wochentagsauswahl im Planer-Modal nicht zentriert

**Original-Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**GitHub-Issue:** #15

### Problem
Wenn im Planer-Modal (PlannerScreen → „Plan a Habit") der Wiederholungsmodus „Select days" gewählt wird, erscheinen die 7 Wochentagsbuttons (Sun–Sat) **linksbündig** statt zentriert.

### Ursache
In `src/screens/PlannerScreen.tsx` fehlt dem `dayRow`-Style das Property `justifyContent: 'center'`. Die 7 Chips (je 40×40 px) mit `gap: spacing.xs (4 px)` belegen zusammen ca. 300 px, auf kleineren Bildschirmen bleibt rechts ein Leerraum.

**Betroffene Zeile (ca. Z. 566):**
```ts
dayRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
```

### Fix
```ts
dayRow: {
  flexDirection: 'row',
  gap: spacing.xs,
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',   // ← hinzufügen
},
```

**Datei:** `src/screens/PlannerScreen.tsx`, StyleSheet-Objekt, Key `dayRow`

### Akzeptanzkriterien
- [ ] Die 7 Wochentagsbuttons sind horizontal zentriert im Modal
- [ ] Auf kleinen Bildschirmen (320 px Breite) kein Abschneiden der Buttons
- [ ] Visuell konsistent mit den anderen Chip-Rows im Modal (`repeatRow` etc.)

---

## Issue #18 – Konfigurierbare Habit-Erinnerungsbenachrichtigungen

**Original-Titel:** Benachrichtigung für Habits  
**GitHub-Issue:** #18

### Beschreibung
Für jeden geplanten Habit soll der Nutzer eine lokale Push-Benachrichtigung einrichten können, die ihn rechtzeitig an das Erledigen seiner Gewohnheit erinnert. Der Zeitraum, wie viel Zeit vor der geplanten Habit-Zeit die Benachrichtigung erscheinen soll, ist vom Nutzer frei konfigurierbar (z. B. 5, 10, 15 oder 30 Minuten vorher). Habits ohne feste Uhrzeit erhalten keine Erinnerung.

### Kontext
Issue #13 (Benachrichtigung einbauen) wurde ohne Implementierung geschlossen. Issue #18 ist die Neuaufnahme derselben Anforderung und soll nun vollständig umgesetzt werden.

### User Flow
1. Beim Anlegen oder Bearbeiten eines Habit-Plans im **Planner-Modal** (`PlannerScreen.tsx`) erscheint — sofern eine Uhrzeit gesetzt ist — ein neuer Abschnitt „Erinnerung"
2. Der Nutzer wählt den gewünschten Vorlauf: **Keine** / **5 Min** / **10 Min** / **15 Min** / **30 Min**
3. Nach dem Speichern wird die lokale Benachrichtigung automatisch geplant
4. Beim Bearbeiten oder Löschen eines Plans werden die zugehörigen Benachrichtigungen aktualisiert bzw. entfernt

### Technische Umsetzung

#### 1. Paket installieren
```bash
npx expo install expo-notifications
```
> **Hinweis:** Lokale Notifications funktionieren nur im **Expo Development Build**, nicht im Expo Go Client.

#### 2. `app.json` – Plugin konfigurieren
```json
"plugins": [
  ["expo-notifications", { "icon": "./assets/icon.png", "color": "#7F77DD" }]
]
```

#### 3. `src/types/index.ts` – `PlannedHabit` erweitern
```ts
export interface PlannedHabit {
  // ... bestehende Felder ...
  reminderMinutes: number | null;   // Vorlauf in Minuten; null = keine Erinnerung
  notificationIds: string[];        // IDs der geplanten Notifications (eine pro Occurrence)
}
```

#### 4. `src/utils/notificationService.ts` (neue Datei)
```ts
import * as Notifications from 'expo-notifications';

export async function requestPermissions(): Promise<boolean>

export async function scheduleHabitReminder(
  entry: PlannedHabit,
  habitName: string
): Promise<string[]>
// Berechnet alle Trigger-Zeitpunkte (Habit-Zeit minus reminderMinutes)
// für die nächsten ~4 Wochen (für daily/weekly Habits).
// Gibt die Notification-IDs zurück, die im Store gespeichert werden.

export async function cancelReminders(notificationIds: string[]): Promise<void>
```

#### 5. `src/store/plannerStore.ts` – Notification-Logik integrieren
- **`addPlanned`:** Nach dem Speichern `scheduleHabitReminder` aufrufen, zurückgegebene `notificationIds` im Store-Eintrag ablegen
- **`updatePlanned`:** Alte Notifications via `cancelReminders` entfernen, neue planen
- **`removePlanned`:** `cancelReminders` für die gespeicherten IDs des gelöschten Eintrags aufrufen

#### 6. `src/screens/PlannerScreen.tsx` – UI-Erweiterung im Modal
Neuer Abschnitt „ERINNERUNG" direkt unterhalb des Zeitpickers (nur sichtbar, wenn `hasTime === true`):

```
[ Keine ] [ 5 Min ] [ 10 Min ] [ 15 Min ] [ 30 Min ]
```

Als Chip-Row analog zur bestehenden `repeatRow`-Implementierung. State-Variable: `reminderMinutes: number | null`, Initial `null`.

#### 7. `App.tsx` – Permissions beim Start anfragen
```ts
import { requestPermissions } from '@/utils/notificationService';

// In useEffect beim App-Start (einmalig):
await requestPermissions();
```

### Einschränkungen
- Funktioniert nur im **Expo Development Build** (nicht im Expo Go Client)
- **iOS** erfordert explizite Nutzererlaubnis (Permission-Dialog erscheint einmalig beim ersten Start)
- Expo erlaubt max. **64 geplante Notifications** pro App → bei vielen Habits mit daily-Repeat ggf. Begrenzung auf die nächsten 2–3 Wochen pro Habit
- Wiederkehrende Habits (daily/weekly) erfordern mehrere separate `scheduleNotificationAsync`-Aufrufe (eine pro Occurrence)

### Betroffene Dateien
| Datei | Änderung |
|-------|----------|
| `app.json` | Plugin-Eintrag für `expo-notifications` |
| `src/types/index.ts` | `PlannedHabit` um `reminderMinutes` + `notificationIds` erweitern |
| `src/utils/notificationService.ts` | Neue Datei: Permission-Request, Schedule, Cancel |
| `src/store/plannerStore.ts` | Notification-Aufrufe in add/update/remove integrieren |
| `src/screens/PlannerScreen.tsx` | Erinnerungs-Chip-Row im AddPlanModal |
| `App.tsx` | `requestPermissions()` beim Start |

### Akzeptanzkriterien
- [ ] Nutzer kann pro Habit-Plan einen Erinnerungsvorlauf auswählen (Keine / 5 / 10 / 15 / 30 Min)
- [ ] Benachrichtigung erscheint zum konfigurierten Zeitpunkt, auch wenn die App geschlossen ist
- [ ] Löschen eines Plans entfernt alle zugehörigen Benachrichtigungen
- [ ] Bearbeiten eines Plans aktualisiert Zeitpunkt und Vorlauf der Benachrichtigung
- [ ] Bei Habits ohne Uhrzeit ist der Erinnerungs-Abschnitt im Modal ausgeblendet
- [ ] iOS: Permission-Dialog erscheint beim ersten App-Start
