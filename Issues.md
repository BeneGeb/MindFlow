# MindFlow – Issue Backlog

Dieses Dokument enthält alle GitHub Issues mit überarbeiteten Titeln, klaren Beschreibungen und konkreten Implementierungshinweisen.  
Neue Issues werden **unten angehängt**. Bereits dokumentierte Issues werden **nicht verändert**.

---

---

## Issue #12 – Dark Mode Unterstützung

**GitHub Issue:** #12  
**Original Titel:** Dark mode unterstützung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die App soll Dark Mode unterstützen – sowohl automatisch via System-Einstellung als auch manuell schaltbar durch den Nutzer.

### Aktueller Stand im Code

Die Implementierung ist **weitgehend vollständig**:

| Datei | Status |
|-------|--------|
| `src/utils/theme.ts` | ✅ `darkColors`-Objekt vollständig definiert |
| `src/utils/ThemeContext.tsx` | ✅ `ThemeProvider` mit `system`/`light`/`dark` Präferenz + AsyncStorage-Persistenz |
| Alle 8 Screens (`src/screens/`) | ✅ Nutzen `useTheme()` und `makeStyles(colors)` |
| `src/navigation/AppNavigator.tsx` | ✅ Tab-Bar nutzt `colors.tabBar` / `colors.tabBarBorder` |
| `App.tsx` | ✅ `StatusBar` wechselt mit `isDark ? 'light' : 'dark'` |
| `HomeScreen.tsx` | ✅ Toggle-UI (System / Light / Dark) mit `setThemePreference()` |

### Verbleibende Aufgaben

- [ ] **Visuelle Verifikation** auf echtem Gerät / Simulator in Light- und Dark-Modus  
  – Alle Screens durchklicken, Modal-Overlays, Markdown-Renderer (`LibraryArticleScreen`, `HabitDetailScreen`)  
  – `HeatmapGrid`, `ProgressBar`, `HabitCard` auf korrekte Farbgebung prüfen
- [ ] **Markdown-Renderer** (`react-native-markdown-display`) gibt aktuell ggf. hart kodierte Farben aus – `markdownStyles` in `HabitDetailScreen.tsx` und `LibraryArticleScreen.tsx` auf `colors.*` umstellen
- [ ] **Navigation-Header** (NativeStack) bei Detail-Screens auf dark background prüfen (`headerStyle`, `headerTintColor`)
- [ ] Issue schließen, sobald visuell verifiziert

### Betroffene Dateien

- `src/utils/theme.ts` — `darkColors` (ggf. Werte anpassen)
- `src/utils/ThemeContext.tsx` — Provider (bereits vollständig)
- `src/navigation/AppNavigator.tsx` — Header-Styles bei Stack-Screens
- `src/screens/HabitDetailScreen.tsx` — Markdown-Styles
- `src/screens/LibraryArticleScreen.tsx` — Markdown-Styles

---

## Issue #15 – Tagesauswahl beim Habit planen nicht zentriert

**GitHub Issue:** #15  
**Original Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Im **Add/Edit-Modal** des Planners (`PlannerScreen.tsx`) kann der Nutzer bei `repeatMode === 'weekly'` einzelne Wochentage auswählen (7 runde Chips: Sun–Sat). Diese Chip-Reihe war auf schmalen Bildschirmen (z. B. iPhone SE, 375 pt Breite) linksbündig statt zentriert.

### Aktueller Stand im Code

In `PlannerScreen.tsx` (Zeilen 689–696, `makeStyles`) ist der Fix **bereits hinterlegt**:

```ts
dayRow: {
  flexDirection: 'row',
  gap: 6,
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignSelf: 'center',  // fixes left-alignment on narrow screens (e.g. iPhone SE)
},
dayChip: {
  width: 38,  // reduced from 40 so 7 chips fit on iPhone SE (288 px usable)
  height: 38,
  ...
},
```

`justifyContent: 'center'` und `alignSelf: 'center'` wurden bereits ergänzt, außerdem wurde `dayChip.width` von 40 auf 38 reduziert.

### Verbleibende Aufgaben

- [ ] **Verifikation** auf iPhone SE (375 pt) und Standard-iPhone (390 pt+): Sind die 7 Chips zentriert?
- [ ] **Verifikation Android** (verschiedene Bildschirmbreiten): korrekte Zentrierung?
- [ ] Wenn das Problem nicht mehr reproduzierbar ist → **Issue schließen**
- [ ] Falls weiterhin Probleme: `flexWrap: 'nowrap'` + `overflow: 'scroll'` horizontal als Alternative erwägen

### Betroffene Datei

- `src/screens/PlannerScreen.tsx` — `makeStyles` → `dayRow` + `dayChip` (Zeilen ~689–707)

---

## Issue #18 – Erinnerungen für Habits (Push Notifications)

**GitHub Issue:** #18  
**Original Titel:** Benachrichtigung für Habits  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Für jeden geplanten Habit soll eine lokale Push-Notification verschickt werden, die den Nutzer an das Erledigen erinnert. Der Zeitpunkt der Benachrichtigung soll variabel konfigurierbar sein (X Minuten vor dem geplanten Habit).

### Aktueller Stand im Code

Die Implementierung ist **vollständig vorhanden**:

| Datei | Inhalt |
|-------|--------|
| `src/utils/notificationService.ts` | `scheduleHabitReminder()`, `cancelReminders()`, `requestPermissions()`, Expo-Go-Guard |
| `src/store/plannerStore.ts` | `addPlanned()`, `updatePlanned()`, `removePlanned()` schedulen/canceln Notifications automatisch; `rescheduleAll()` wird beim App-Start aufgerufen |
| `src/screens/PlannerScreen.tsx` | `REMINDER_OPTIONS`: None / 5 min / 10 min / 15 min / 30 min / 1 hr / 2 hr; Permission-Flow mit Weiterleitung zu Einstellungen |
| `src/types/index.ts` | `PlannedHabit` hat `reminderMinutes: number \| null` und `notificationIds: string[]` |

**Scheduling-Logik:** Für `daily`/`weekly` werden die nächsten 7 Tage vorausgeplant (max. 56 Notifications < Expo-Limit von 64). Beim App-Start werden alle Notifications über `rescheduleAll()` erneuert.

### Einschränkung: Expo Go

Push Notifications sind in **Expo Go nicht verfügbar** (ab SDK 53, siehe Issue #22). Sie funktionieren ausschließlich in einem **Development Build**. Der Code ist bereits korrekt mit `isExpoGo`-Guard abgesichert.

### Verbleibende Aufgaben

- [ ] **Development Build** erstellen und Notifications auf echtem Gerät (Android + iOS) testen
- [ ] `rescheduleAll()` in `App.tsx` auf korrekten Aufruf beim App-Start prüfen
- [ ] Notification-Text prüfen (`${habitIcon} Time for ${habitName}`) – ggf. deutsche Texte gewünscht?
- [ ] Edge Case: Habit-Zeit in der Vergangenheit (heute) → Notification korrekt übersprungen?
- [ ] Edge Case: Offset > Habit-Zeit (z. B. Habit um 00:10, Reminder 30 min → Trigger um 23:40 Vortag) – `triggerHours/triggerMinutes`-Berechnung in `notificationService.ts` Zeile 64–66 verifizieren

### Betroffene Dateien

- `src/utils/notificationService.ts` — Kern-Scheduling-Logik
- `src/store/plannerStore.ts` — Integration in CRUD-Operationen
- `src/screens/PlannerScreen.tsx` — UI: REMINDER_OPTIONS-Selector
- `App.tsx` — `rescheduleAll()` Aufruf beim Start
- `eas.json` — Development Build Profile

---

## Issue #22 – Benachrichtigungen in Expo Go nicht verfügbar (SDK 53+)

**GitHub Issue:** #22  
**Original Titel:** Fehler bei Benachrichtitung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Seit Expo SDK 53 wurden Android-Push-Notifications aus der **Expo Go** App entfernt. Der Fehler beim Start in Expo Go lautet:

> `"expo-notifications Android Push notifications functionality provided by expo-notifications was removed from Expo Go with release of SDK 53"`

### Aktueller Stand im Code

Der Fehler ist bereits **abgefangen**. In `src/utils/notificationService.ts` (Zeilen 11–27):

```ts
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  Notifications.setNotificationHandler({ ... });
} else {
  console.warn('[MindFlow] Notifications not available in Expo Go. Use a development build.');
}
```

Alle Notification-Calls in `plannerStore.ts` sind in `try/catch` gekapselt → kein Crash in Expo Go.

### Lösung: Development Build

Für vollständige Notification-Funktionalität muss ein **Development Build** erstellt werden.

```bash
# EAS CLI installieren (falls nicht vorhanden)
npm install -g eas-cli

# Einloggen
eas login

# Development Build erstellen
eas build --profile development --platform android
# oder
eas build --profile development --platform ios
```

Anschließend den Build auf dem Gerät/Emulator installieren – die App verhält sich dann wie eine Production-Build, Notifications funktionieren.

### Voraussetzungen prüfen

- [ ] `eas.json` enthält ein `development`-Profil mit `"developmentClient": true`
- [ ] `app.json`: `android.package` und `ios.bundleIdentifier` sind korrekt gesetzt
- [ ] `expo-dev-client` ist als Dependency installiert (für `npx expo start` mit Dev Build)

### Verbleibende Aufgaben

- [ ] Development Build erstellen und Notifications testen (verknüpft mit Issue #18)
- [ ] Prüfen ob `eas.json` vollständig konfiguriert ist
- [ ] Nach erfolgreichem Test Issues #18 und #22 schließen

### Betroffene Dateien

- `src/utils/notificationService.ts` — Guard bereits vorhanden
- `eas.json` — Build-Konfiguration
- `app.json` — Bundle-IDs

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
