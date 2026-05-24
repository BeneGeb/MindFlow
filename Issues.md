# MindFlow – Issue Backlog

Dieses Dokument enthält alle GitHub Issues mit überarbeiteten Titeln, klaren Beschreibungen und konkreten Implementierungshinweisen.  
Neue Issues werden **unten angehängt**. Bereits dokumentierte Issues werden **nicht verändert**.

---

## Issue #7 – Infoseiten (Library-Artikel) funktionieren nicht im Production-Build

**Original-Titel:** Infoseiten funktionieren nicht im Build  
**GitHub-Issue:** #7

### Problem
Im Expo Development-Client funktionieren die Library-Artikel und Habit-Infoseiten korrekt. Im Production-Build (APK/IPA via `eas build`) sind die Seiten leer oder zeigen eine Fehlermeldung.

### Ursache
In `src/utils/contentLoader.ts` wird nach `asset.downloadAsync()` ein `fetch(asset.uri)` aufgerufen, um den Markdown-Inhalt zu lesen. Im Production-Build liefert `asset.uri` eine gebündelte URI (z. B. `asset://`-Schema oder eine lokale Bundle-Referenz), die von `fetch()` nicht aufgelöst werden kann. Im Dev-Client wird ein HTTP-Dev-Server verwendet, weshalb `fetch()` dort funktioniert.

### Lösung
`expo-file-system` ist bereits als Abhängigkeit vorhanden. Nach `asset.downloadAsync()` ist `asset.localUri` garantiert gesetzt. Statt `fetch(asset.uri)` soll `FileSystem.readAsStringAsync(asset.localUri!)` verwendet werden.

**Datei:** `src/utils/contentLoader.ts`

```ts
import * as FileSystem from 'expo-file-system';

export async function loadContent(key: string): Promise<string> {
  if (cache[key]) return cache[key];
  const module = CONTENT_MAP[key];
  if (!module) return `# Not found\n\nContent for "${key}" is not available.`;
  try {
    const asset = Asset.fromModule(module);
    await asset.downloadAsync();
    // Vorher: const response = await fetch(asset.uri);
    // Nachher:
    const text = await FileSystem.readAsStringAsync(asset.localUri!);
    cache[key] = text;
    return text;
  } catch {
    return `# Error\n\nFailed to load content for "${key}".`;
  }
}
```

### Akzeptanzkriterien
- [ ] Library-Artikel und Habit-Infoseiten laden korrekt in einem APK-Build (eas build --platform android --profile preview)
- [ ] Kein Fehlerfall bei `fetch` auf gebündelten Assets
- [ ] Dev-Client-Verhalten bleibt unverändert

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

## Issue #9 – Stressbarometer: Tägliches Stresslevel erfassen und visualisieren

**Original-Titel:** Stressbarometer  
**GitHub-Issue:** #9

### Beschreibung
Nutzer sollen täglich ihr aktuelles Stresslevel eingeben können und dieses über die Zeit verfolgen. Das Feature ergänzt den Habit-Tracking-Ansatz um einen subjektiven Wohlbefindens-Indikator.

### User Flow
1. Auf dem **Home-Screen** erscheint täglich (einmal pro Tag) ein kleines Banner/Card: *„Wie gestresst bist du heute?"*
2. Der Nutzer wählt einen Wert auf einer **Skala von 1 bis 5** (Emojis: 😌 😐 😕 😟 😰)
3. Das Banner verschwindet nach der Eingabe für den Rest des Tages
4. Im **Stats-Screen** ist ein neuer Abschnitt „Stressverlauf" mit einem Liniendiagramm der letzten 14 Tage sichtbar

### Technische Umsetzung
1. **Neuer Store:** `src/store/stressStore.ts`
   - State: `entries: { date: string; level: 1|2|3|4|5 }[]`
   - Aktionen: `logStress(level)`, `getStressForDate(date)`, `getLast14Days()`
   - Persistenz: AsyncStorage Key `mindflow:stress`
2. **Home-Screen (`HomeScreen.tsx`):**
   - Zeigt `StressBanner`-Komponente, wenn für `today()` noch kein Eintrag vorhanden
   - Nach Eingabe: Banner ausblenden, kein Re-Prompt am selben Tag
3. **Neue Komponente:** `src/components/StressBanner.tsx`
   - 5 Emoji-Buttons in einer Row, tippbar
   - Dezentes Design passend zum bestehenden Design-System (`theme.ts`)
4. **Stats-Screen (`StatsScreen.tsx`):** Neuer Abschnitt mit `StressChart`-Komponente
   - Einfaches Liniendiagramm via `react-native`-basierter SVG-Lösung oder simplem Custom-Component mit `View`-Bars (kein extra Chart-Package nötig für MVP)
5. **App.tsx:** `stressStore` beim Start hydrieren (gleich wie die anderen Stores)

### Akzeptanzkriterien
- [ ] Nutzer kann täglich genau einmal sein Stresslevel eingeben
- [ ] Kein erneutes Banner am gleichen Tag nach Eingabe
- [ ] Stressverlauf der letzten 14 Tage im Stats-Screen sichtbar
- [ ] Daten überleben App-Neustart (AsyncStorage-Persistenz)

---

## Issue #10 – Integrierter Wecker

**Original-Titel:** Wecker  
**GitHub-Issue:** #10

### Beschreibung
Die App soll einen eigenen Wecker bieten, mit dem Nutzer Alarmzeiten direkt in MindFlow einrichten können. Anders als die Habit-Benachrichtigungen (Issue #13) ist dies ein eigenständiger Wecker, der **unabhängig von einem Habit** geplant wird – z. B. als Morgenroutine-Starter.

### User Flow
1. Nutzer öffnet den **Planner-Tab**
2. Neuer Abschnitt „Wecker" unterhalb der Habit-Timeline
3. Nutzer kann per **+**-Button eine Alarmzeit einstellen (Zeitpicker, Tage auswählen)
4. Alarm erscheint als Karte in der Liste mit Toggle (aktiv/inaktiv)
5. Zum eingestellten Zeitpunkt ertönt eine lokale Benachrichtigung / systemischer Alarm

### Technische Umsetzung
1. **Package:** `expo-notifications` (für lokale Benachrichtigungen) – muss installiert werden:
   ```bash
   npx expo install expo-notifications
   ```
   > Hinweis: Push Notifications benötigen einen Development Build. Im Expo Go Client sind lokale Notifications eingeschränkt.
2. **Neuer Store:** `src/store/alarmStore.ts`
   - State: `alarms: Alarm[]`
   - Typ: `{ id: string; time: string; days: number[]; enabled: boolean; notificationIds: string[] }`
   - Aktionen: `addAlarm`, `toggleAlarm`, `deleteAlarm`
   - Persistenz: AsyncStorage Key `mindflow:alarms`
3. **Notification-Helper:** `src/utils/notificationService.ts`
   - `scheduleAlarm(alarm: Alarm): Promise<string[]>` – plant Benachrichtigungen für jeden aktiven Tag
   - `cancelAlarm(notificationIds: string[])` – entfernt alle geplanten Notifications
4. **UI:** Erweiterung von `PlannerScreen.tsx` oder neuer separater Screen
   - Liste der Alarme mit Icon 🔔, Uhrzeit, Wochentagen und Switch
5. **`app.json`:** Notification-Permissions für iOS/Android konfigurieren

### Einschränkungen
- Echter systemischer Alarm (Ertönen bei gesperrtem Gerät) erfordert ggf. einen Custom Expo Dev Build
- Im Expo Go Client nur eingeschränkt testbar

### Akzeptanzkriterien
- [ ] Nutzer kann Alarmzeit und Wochentage einstellen
- [ ] Alarm lässt sich aktivieren/deaktivieren
- [ ] Alarm kann gelöscht werden (zugehörige Notifications werden gecancelled)
- [ ] Bei aktivem Alarm: lokale Notification zum geplanten Zeitpunkt

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

## Issue #13 – Lokale Habit-Benachrichtigungen mit konfigurierbarem Vorlauf

**Original-Titel:** Benachrichtigung einbauen  
**GitHub-Issue:** #13

### Beschreibung
Für jeden geplanten Habit soll der Nutzer eine lokale Erinnerungsbenachrichtigung einrichten können. Die Benachrichtigung soll eine konfigurierbare Zeitspanne **vor** der geplanten Habit-Zeit ausgelöst werden (z. B. 5, 10, 15 oder 30 Minuten vorher). Habits ohne feste Zeit erhalten keine Benachrichtigung.

### User Flow
1. In der **`AddPlanModal`** (`PlannerScreen.tsx`) erscheint, wenn eine Zeit gesetzt ist, ein neuer Abschnitt „Erinnerung"
2. Nutzer kann wählen: Keine Erinnerung / 5 Min vorher / 10 Min / 15 Min / 30 Min
3. Nach dem Speichern wird die Benachrichtigung automatisch geplant
4. Beim Bearbeiten oder Löschen eines Plans werden die zugehörigen Benachrichtigungen aktualisiert/entfernt

### Technische Umsetzung
1. **Package installieren:**
   ```bash
   npx expo install expo-notifications
   ```

2. **`src/types/index.ts`:** `PlannedHabit`-Typ um `reminderMinutes: number | null` und `notificationId: string | null` erweitern

3. **`src/utils/notificationService.ts`** (neu):
   ```ts
   export async function requestPermissions(): Promise<boolean>
   export async function scheduleHabitReminder(entry: PlannedHabit, habitName: string): Promise<string | null>
   export async function cancelReminder(notificationId: string): Promise<void>
   ```

4. **`src/store/plannerStore.ts`:** Bei `addPlanned` und `updatePlanned` die Notification-Logik aufrufen; `notificationId` im Store speichern. Bei `removePlanned` die Notification cancellen.

5. **`PlannerScreen.tsx` – `AddPlanModal`:** Neuer UI-Abschnitt „ERINNERUNG" (nur sichtbar, wenn `hasTime === true`):
   ```
   [ Keine ] [ 5 Min ] [ 10 Min ] [ 15 Min ] [ 30 Min ]
   ```

6. **`App.tsx`:** `requestPermissions()` beim App-Start aufrufen (einmalig, mit Expo-Standard-Permission-Flow)

7. **`app.json`:** Notification-Plugin konfigurieren:
   ```json
   "plugins": [["expo-notifications", { "icon": "./assets/icon.png" }]]
   ```

### Einschränkungen
- Notifications funktionieren nur im **Development Build** (nicht im Expo Go Client)
- Für iOS ist eine explizite Nutzer-Erlaubnis erforderlich
- Wiederkehrende Habits (daily/weekly) erfordern mehrere scheduled Notifications (eine pro Occurrence in den nächsten ~4 Wochen) oder einen periodischen Reschedule

### Akzeptanzkriterien
- [ ] Nutzer kann pro Habit-Plan eine Erinnerungszeit auswählen
- [ ] Benachrichtigung erscheint zum konfigurierten Zeitpunkt (auch wenn App geschlossen ist)
- [ ] Löschen eines Plans entfernt die zugehörige Benachrichtigung
- [ ] Bearbeiten eines Plans aktualisiert Zeitpunkt/Vorlauf der Benachrichtigung
- [ ] Bei Habits ohne Zeit ist das Erinnerungs-UI ausgeblendet

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
