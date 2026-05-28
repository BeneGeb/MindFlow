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

## Issue #22 – Benachrichtigungen nicht verfügbar in Expo Go (Expo Go Inkompatibilität)

**GitHub Issue:** #22  
**Original Titel:** Fehler bei Benachrichtitung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

In Expo Go (SDK 53+) wurden Push-Benachrichtigungen aus `expo-notifications` entfernt. Die Fehlermeldung, die ursprünglich den Issue ausgelöst hat:

> *"expo-notifications Android Push notifications functionality provided by expo-notifications was removed from Expo Go with release of SDK 53"*

### Aktueller Code-Stand

Die Ursache ist bekannt und die Lösung **bereits vollständig implementiert**:

- `src/utils/notificationService.ts` exportiert `isExpoGo = Constants.executionEnvironment === 'storeClient'`
- `Notifications.setNotificationHandler(...)` wird nur aufgerufen wenn `!isExpoGo`
- `App.tsx` schützt `requestPermissions()` und `rescheduleAll()` hinter `if (!isExpoGo)`
- Alle `scheduleNotificationAsync`-Aufrufe liegen in `try/catch`-Blöcken, die Expo-Go-Fehler schweigend ignorieren
- Im PlannerScreen-Modal werden Reminder-Chips über den `notifPermission`-State deaktiviert, wenn keine Berechtigung vorliegt

### Was noch offen ist

Die Benachrichtigungs-Funktion funktioniert **ausschließlich im Development Build** (nicht in Expo Go). Das ist technisch korrekt und gewollt. Folgende Punkte sollten noch geprüft werden:

1. **UX in Expo Go verifizieren**: In Expo Go liefert `getPermissionsAsync()` möglicherweise `status: 'undetermined'` zurück, was `notifPermission = false` setzt. Der Hinweis `"🔕 Notifications are disabled. Enable them in Settings to use reminders."` erscheint dann im Modal — prüfen, ob diese Meldung in Expo Go hilfreich oder verwirrend ist.
2. **Ggf. Expo-Go-spezifischen Hinweis ergänzen**: Statt der generischen "Notifications disabled"-Meldung könnte in Expo Go ein präziserer Text erscheinen, z. B. *"Reminders require a Development Build."* Dies lässt sich mit dem bereits vorhandenen `isExpoGo`-Export aus `notificationService.ts` umsetzen.
3. **Issue schließen**, wenn das Verhalten als akzeptabel gilt oder der Expo-Go-Hinweis angepasst wurde.

### Umsetzungshinweis (falls Expo-Go-Hinweis ergänzt wird)

In `src/screens/PlannerScreen.tsx`, im Abschnitt `{!notifPermission && (...)` (ca. Zeile 291):

```tsx
import { isExpoGo } from '../utils/notificationService';

// Im JSX:
{!notifPermission && (
  <Text style={styles.reminderHint}>
    {isExpoGo
      ? '🔕 Reminders require a Development Build — not available in Expo Go.'
      : '🔕 Notifications are disabled. Enable them in Settings to use reminders.'}
  </Text>
)}
```

### Betroffene Dateien

- `src/utils/notificationService.ts` (`isExpoGo` Guard — bereits vorhanden)
- `src/screens/PlannerScreen.tsx` (Reminder-Hinweis-Text)
- `App.tsx` (`isExpoGo` Guard — bereits vorhanden)

---

## Issue #18 – Habit-Erinnerungen: Lokale Benachrichtigungen für geplante Habits

**GitHub Issue:** #18  
**Original Titel:** Benachrichtigung für Habits  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Für jeden geplanten Habit mit einer festgelegten Uhrzeit soll eine lokale Benachrichtigung eingerichtet werden, die den Nutzer kurz vor der Habit-Zeit erinnert. Der Erinnerungszeitraum (Vorlauf) soll vom Nutzer frei gewählt werden können.

### Aktueller Code-Stand

Das Feature ist **vollständig implementiert**:

| Komponente | Datei | Status |
|-----------|-------|--------|
| Notification-Scheduling & Cancellation | `src/utils/notificationService.ts` | ✅ Fertig |
| Permissions-Anfrage (App-Start + On-Demand) | `App.tsx` + `src/screens/PlannerScreen.tsx` | ✅ Fertig |
| Expo Go Guard (kein Crash) | `src/utils/notificationService.ts` | ✅ Fertig |
| Store-Integration (add / update / remove) | `src/store/plannerStore.ts` | ✅ Fertig |
| Auto-Reschedule beim App-Start | `App.tsx` → `rescheduleAll()` | ✅ Fertig |
| Reminder-UI im Plan-Modal | `src/screens/PlannerScreen.tsx` (Abschnitt REMINDER) | ✅ Fertig |
| Datenmodell | `src/types/index.ts` – Felder `reminderMinutes`, `notificationIds` | ✅ Fertig |
| Android Notification Channel | `src/utils/notificationService.ts` | ✅ Fertig |

### Feature-Details (wie implementiert)

**Vorlauf-Optionen im Modal**: None / 5 min / 10 min / 15 min / 30 min / 1 hr / 2 hr vor der Habit-Zeit

**Scheduling-Logik** (`src/utils/notificationService.ts`):
- Notifications werden für die nächsten 7 Tage eingeplant
- Grenze: max. 8 Habits × 7 Tage = 56 Einträge < Expo-Limit von 64
- Beim App-Start ruft `App.tsx` → `rescheduleAll()` auf, um das 7-Tage-Fenster aufzufüllen

**Store-Integration** (`src/store/plannerStore.ts`):
- `addPlanned()` — plant Notifications nach dem Speichern ein
- `updatePlanned()` — cancelt alte Notifications, plant neue
- `removePlanned()` — cancelt zugehörige Notifications

**Android**: Notification Channel `'habit-reminders'` mit `HIGH` Importance und Sound wird beim Permission-Request angelegt.

**Expo Go**: Feature ist vollständig deaktiviert — kein Crash, stiller Fallback, Console-Warning.

### Was noch offen ist

1. **Testen im Development Build** erforderlich — `npx expo run:android` oder `npx expo run:ios` (Expo Go unterstützt keine Notifications ab SDK 53)
2. **Verifizieren**:
   - Notification erscheint zur korrekten Trigger-Zeit (Habit-Zeit minus Offset)
   - Cancellation funktioniert beim Löschen einer Habit aus dem Planner
   - `rescheduleAll()` füllt das 7-Tage-Fenster nach App-Neustart korrekt auf
   - Android Channel wird korrekt angelegt
3. **Issue schließen** nach erfolgreichem Test

### Betroffene Dateien

- `src/utils/notificationService.ts`
- `src/store/plannerStore.ts`
- `src/screens/PlannerScreen.tsx`
- `src/types/index.ts`
- `App.tsx`

---

## Issue #15 – Tagesauswahl beim Habit planen nicht zentriert

**GitHub Issue:** #15  
**Original Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Im "Plan a Habit"-Modal (`PlannerScreen`) sind die Wochentag-Buttons (Sun–Sat) beim Wiederholungsmodus "Select days" (`weekly`) nicht zentriert dargestellt — sie beginnen linksbündig statt mittig in der Zeile.

### Aktueller Code-Stand

Der Fehler ist **bereits behoben**. In `src/screens/PlannerScreen.tsx` (ca. Zeile 689) enthält das `dayRow`-Style:

```typescript
dayRow: {
  flexDirection: 'row',
  gap: 6,
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',     // zentriert die Chips horizontal
  alignSelf: 'center',          // behebt Links-Ausrichtung auf schmalen Screens (z. B. iPhone SE)
},
```

Zusätzlich wurde die Chip-Breite von 40 auf 38 px reduziert (`dayChip: { width: 38, height: 38 }`), damit alle 7 Chips auf schmalen Geräten (z. B. iPhone SE, ca. 288 px nutzbare Breite) ohne Umbruch in einer Zeile passen.

### Was noch offen ist

1. **Visuell verifizieren** auf einem Gerät oder Simulator — insbesondere auf schmalen Screens (iPhone SE, kleine Android-Geräte) — dass alle 7 Chips in einer Zeile erscheinen und korrekt zentriert sind.
2. **Issue schließen** nach erfolgreichem visuellen Check.

### Betroffene Dateien

- `src/screens/PlannerScreen.tsx` (Styles `dayRow` und `dayChip` — bereits gefixt, ca. Zeile 689–709)

---

## Issue #12 – Dark Mode Unterstützung

**GitHub Issue:** #12  
**Original Titel:** Dark mode unterstützung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die App soll den systemweiten Dark Mode des Geräts unterstützen. Nutzer sollen zwischen Hell-, Dunkel- und Automatik-Modus (folgt dem System) wählen können.

### Aktueller Code-Stand

Das Feature ist **vollständig implementiert**:

| Komponente | Datei | Status |
|-----------|-------|--------|
| Light- & Dark-Farbpalette | `src/utils/theme.ts` | ✅ Fertig |
| `ThemeProvider` + `useTheme()` Hook | `src/utils/ThemeContext.tsx` | ✅ Fertig |
| Theme-Präferenz in AsyncStorage | `src/utils/ThemeContext.tsx` + `storage.ts` | ✅ Fertig |
| `ThemeProvider` im App-Root | `App.tsx` | ✅ Fertig |
| `NavigationContainer` Dark/Light Theme | `App.tsx` | ✅ Fertig |
| `useTheme()` in allen Screens | Alle `src/screens/*.tsx` | ✅ Fertig |
| Theme-Toggle UI (System / Light / Dark) | `src/screens/HomeScreen.tsx` (Settings-Icon) | ✅ Fertig |

### Feature-Details (wie implementiert)

**Dark Mode Farbpalette** (`src/utils/theme.ts` → `darkColors`):

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#FAF9F6` | `#0F0F17` |
| `surface` | `#FFFFFF` | `#1C1C2A` |
| `border` | `#EBEBEB` | `#2A2A3A` |
| `textPrimary` | `#1A1A2E` | `#F0EFF8` |
| `textSecondary` | `#6B7280` | `#9B9BB0` |
| `primary` | `#7F77DD` | `#9D96E8` |
| `accent` | `#1D9E75` | `#2CC68F` |

**Theme-Präferenz-Modi** (`src/utils/ThemeContext.tsx`):
- `'system'` — folgt dem Gerätesystem via `useColorScheme()` (Standard)
- `'light'` — immer Hell
- `'dark'` — immer Dunkel

Auswahl wird in AsyncStorage persistiert (Key: `mindflow:theme_preference`).

**Theme-Toggle UI**: Im HomeScreen gibt es einen einblendbaren Toggle (System ⚙️ / Light ☀️ / Dark 🌙), der über ein Settings-Icon in der Header-Zeile erreichbar ist (`HomeScreen.tsx`, `THEME_OPTIONS`-Array + `showThemeToggle`-State).

### Was noch offen ist

1. **Visuelle Prüfung aller Screens im Dark Mode** — sicherstellen, dass keine hardcodierten Farbwerte (z. B. `'#FFFFFF'`, `'#1A1A2E'`, `'white'`, `'black'`) im JSX oder in Styles übrig geblieben sind. Alle Farben müssen aus `colors.*` (via `useTheme()`) stammen.
2. **UX-Verbesserung des Theme-Toggles** (optional / v2.0): Der Toggle ist aktuell im HomeScreen versteckt. Ein dedizierter Settings-Tab wäre für die UX sinnvoller, ist aber v2.0-Scope.
3. **Issue schließen** nach visueller Verifikation aller Screens in Hell- und Dunkel-Modus.
