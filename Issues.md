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

## Issue #22 – Expo Go Crash bei Benachrichtigungen (SDK 53+)

**GitHub Issue:** #22  
**Original Titel:** Fehler bei Benachrichtigung  
**Label:** ClaudeCode | **Status:** Open

### Problem

Beim Starten der App in **Expo Go auf Android** tritt folgender Fehler auf:

```
expo-notifications Android Push notifications functionality provided by
expo-notifications was removed from Expo Go with release of SDK 53
```

### Root Cause

Ab SDK 53 wurde die Android-Push-Notification-Unterstützung aus Expo Go entfernt. Die App ruft zwei kritische Notification-APIs ohne Expo-Go-Guard auf:

| Datei | Stelle | Problem |
|-------|--------|---------|
| `src/utils/notificationService.ts` | Zeilen 6–14 | `Notifications.setNotificationHandler()` wird **auf Modul-Level** ausgeführt (beim Import) |
| `App.tsx` | Zeile 24 | `requestPermissions()` wird beim App-Start ohne Guard aufgerufen |

Die übrigen `scheduleNotificationAsync`-Aufrufe in `notificationService.ts` sind mit `catch (_) {}` abgesichert, aber die beiden oben genannten Stellen sind es nicht – sie crashen in Expo Go.

### Fix

**Schritt 1:** Expo Go Detection Helper in `notificationService.ts` hinzufügen:
```ts
import Constants from 'expo-constants';
// true wenn App in Expo Go läuft (storeClient = Expo Go)
const isExpoGo = Constants.executionEnvironment === 'storeClient';
```

**Schritt 2:** `setNotificationHandler`-Aufruf in `notificationService.ts` absichern:
```ts
// Vorher (Zeile 6):
Notifications.setNotificationHandler({ ... });

// Nachher:
if (!isExpoGo) {
  Notifications.setNotificationHandler({ ... });
}
```

**Schritt 3:** `requestPermissions()` in `App.tsx` absichern:
```ts
// Vorher (Zeile 24):
requestPermissions().then(...).catch(...);

// Nachher:
if (!isExpoGo) {
  requestPermissions().then(...).catch(...);
}
```

**Schritt 4 (optional):** In Expo Go einen Hinweis anzeigen:
```ts
if (isExpoGo) {
  console.warn('Notifications are not available in Expo Go. Use a development build.');
}
```

### Betroffene Dateien

- `src/utils/notificationService.ts` (Zeilen 1–14: Import + `setNotificationHandler`)
- `App.tsx` (Zeilen 11, 24–37: Import + `requestPermissions`-Aufruf)

### Hinweis

Lokale Scheduled Notifications funktionieren weiterhin vollständig in **Development Builds** (`npx expo run:android`) und EAS Builds. Nur **Expo Go** auf Android ist betroffen. Für produktiven Einsatz ist ein Development Build oder EAS Build erforderlich.

---

## Issue #18 – Habit-Erinnerungen: Fehlende Teile fertigstellen

**GitHub Issue:** #18  
**Original Titel:** Benachrichtigung für Habits  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die Benachrichtigungs-Infrastruktur ist bereits weitgehend implementiert:

| Komponente | Status | Beschreibung |
|------------|--------|--------------|
| `src/utils/notificationService.ts` | ✅ | Scheduling für 28 Tage, Cancel-Funktion |
| `src/store/plannerStore.ts` | ✅ | Ruft Schedule/Cancel bei add/update/remove auf |
| `src/screens/PlannerScreen.tsx` | ✅ | Reminder-UI (None, 5 min, 10 min, 15 min, 30 min, 1 h, 2 h) |
| `App.tsx` | ✅ | `requestPermissions()` beim App-Start |
| `src/types/index.ts` | ✅ | `notificationIds: string[]` im `PlannedHabit`-Typ |

### Offene Probleme

#### 1. Expo Go blockiert Tests (Blocker → zuerst Issue #22 lösen)
In Expo Go crasht die Notification-Initialisierung. Das Feature kann erst nach Beheben von Issue #22 in einem **Development Build** getestet werden (`npx expo run:android / run:ios`).

#### 2. Re-Scheduling nach 28 Tagen (Funktionslücke)
`notificationService.ts` plant Erinnerungen nur für die **nächsten 28 Tage** (`MAX_DAYS = 28`). Nach Ablauf dieser Zeit kommen keine Benachrichtigungen mehr. Es fehlt ein Mechanismus zum automatischen Nachplanen.

**Empfohlene Lösung (Option A – einfach):** Re-Scheduling beim App-Start in `App.tsx`:
```ts
// In App.tsx useEffect, nach dem Hydrate:
// Alle PlannedHabits mit Reminder neu einplanen (cancel + reschedule)
usePlannerStore.getState().rescheduleAll();
```
Dafür eine `rescheduleAll()`-Aktion in `plannerStore.ts` ergänzen, die für jeden Entry mit `reminderMinutes !== null` die alten Notification-IDs cancelt und neu plant.

#### 3. 64-Notifications-Limit (Skalierungsproblem)
`expo-notifications` erlaubt maximal **64 gleichzeitig geplante Notifications**. Bei 8 Habits × 28 Tage = bis zu 224 geplante Notifications – das überschreitet das Limit.

**Fix:** `MAX_DAYS` in `notificationService.ts` von `28` auf `7` reduzieren und das Re-Scheduling (siehe Punkt 2) dafür sorgen lassen, dass bei jedem App-Start die nächsten 7 Tage nachgeplant werden. 7 Habits × 7 Tage = 49 Notifications < 64 Limit.

#### 4. Permission-Request-UX in PlannerScreen (UX-Verbesserung)
In `PlannerScreen.tsx` (Zeilen 253–263) wird bei fehlenden Permissions sofort "Open Settings" gezeigt, auch wenn die App noch nie um Erlaubnis gefragt hat. Der korrektere Flow:

```
Aktuell:  !notifPermission → Alert "Open Settings"
Korrekt:  !notifPermission && status === 'undetermined' → requestPermissions()
          !notifPermission && status === 'denied' → Alert "Open Settings"
```

Dafür `Notifications.getPermissionsAsync()` nutzen um den `status` zu lesen, und bei `'undetermined'` zuerst `requestPermissions()` aufrufen.

### Implementierungsreihenfolge

1. **Issue #22 lösen** (Expo Go Guard)
2. **`MAX_DAYS` auf 7 reduzieren** in `notificationService.ts`
3. **`rescheduleAll()`** in `plannerStore.ts` ergänzen + in `App.tsx` aufrufen
4. **Permission-UX** in `PlannerScreen.tsx` verbessern
5. **Testen** auf Development Build (iOS + Android)

### Betroffene Dateien

- `src/utils/notificationService.ts` – `MAX_DAYS` auf 7 ändern (Zeile 94)
- `src/store/plannerStore.ts` – `rescheduleAll()`-Aktion hinzufügen
- `App.tsx` – `rescheduleAll()` im startup-`useEffect` aufrufen (nach Hydrate)
- `src/screens/PlannerScreen.tsx` – Permission-Status-Check verbessern (Zeilen 65–74, 253–263)

---

## Issue #15 – Tagesauswahl im Planer-Modal nicht zentriert

**GitHub Issue:** #15  
**Original Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**Label:** ClaudeCode | **Status:** Open

### Problem

Im "Plan a Habit"-Modal erscheinen die 7 Wochentag-Buttons (Sun–Sat) beim Wiederholungsmodus **"Select days"** nicht zentriert, sondern linksbündig oder abgeschnitten.

### Betroffener Code

**Datei:** `src/screens/PlannerScreen.tsx`

Relevanter JSX-Block (Zeilen 309–331):
```jsx
{repeatMode === 'weekly' && (
  <View style={styles.dayRow}>
    {WEEK_DAYS.map(({ label, value }) => (
      <TouchableOpacity key={value} style={[styles.dayChip, ...]}>
        <Text>{label}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}
```

Aktueller `dayRow`-Stil (Zeile 675):
```js
dayRow: {
  flexDirection: 'row',
  gap: spacing.xs,        // 4 px
  marginTop: spacing.sm,  // 8 px
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
},
dayChip: {
  width: 40,
  height: 40,
  borderRadius: 20,
  ...
},
```

### Ursache

7 Chips × 40 px + 6 Gaps × 4 px = **304 px** Gesamtbreite.  
Auf einem **iPhone SE** (320 px Breite − 32 px Padding = **288 px** nutzbarer Raum):  
304 > 288 → Chips umbrechen auf zwei Zeilen.  
Die zweite Zeile ist zwar mit `justifyContent: 'center'` deklariert, aber `width: '100%'` innerhalb eines ScrollView-Modals löst sich nicht immer korrekt auf, was dazu führt, dass die Chips linksbündig erscheinen.

### Fix

**Option A – Empfohlen:** Chip-Größe leicht reduzieren + `alignSelf: 'center'` statt `width: '100%'`:

```js
// PlannerScreen.tsx, makeStyles()
dayRow: {
  flexDirection: 'row',
  gap: 6,                 // von 4 px auf 6 px erhöhen für optisches Gleichgewicht
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignSelf: 'center',    // statt width: '100%'
},
dayChip: {
  width: 38,              // von 40 auf 38 px reduzieren
  height: 38,             // von 40 auf 38 px reduzieren
  borderRadius: 19,
  ...
},
```

Rechnung nach Fix: 7 × 38 px + 6 × 6 px = 266 + 36 = **302 px** – passt auch auf iPhone SE (288 px) fast genau, und `justifyContent: 'center'` zentriert korrekt.

**Option B – Robuster:** Chips mit `flex: 1` und `minWidth` statt fixem `width`, sodass sie sich der Containerbreite anpassen:
```js
dayChip: {
  flex: 1,
  minWidth: 36,
  maxWidth: 44,
  height: 40,
  ...
},
```

### Betroffene Dateien

- `src/screens/PlannerScreen.tsx`
  - Zeile 675: `dayRow`-Stil (`width: '100%'` → `alignSelf: 'center'`, Gap anpassen)
  - Zeile 676–684: `dayChip`-Stil (Breite/Höhe ggf. anpassen)

---

## Issue #12 – Dark Mode: Vollständigkeit prüfen und fehlende Teile ergänzen

**GitHub Issue:** #12  
**Original Titel:** Dark mode unterstützung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die Dark-Mode-Infrastruktur ist bereits implementiert:

| Komponente | Status | Details |
|------------|--------|---------|
| `src/utils/theme.ts` | ✅ | `darkColors`-Objekt mit vollständigem Token-Set |
| `src/utils/ThemeContext.tsx` | ✅ | `ThemeProvider`, `useTheme`-Hook, Persistenz via AsyncStorage |
| Alle Screens | ✅ | Verwenden `const { colors } = useTheme()` |
| `App.tsx` | ✅ | `StatusBar` + `NavigationContainer`-Theme Dark-Mode-aware |
| `HomeScreen.tsx` | ✅ | Theme-Toggle-UI vorhanden (System / ☀️ Light / 🌙 Dark) |

### Offene / zu prüfende Punkte

#### 1. Markdown-Rendering in Dark Mode (hohes Risiko)
`LibraryArticleScreen.tsx` und `HabitDetailScreen.tsx` nutzen `react-native-markdown-display` mit Custom Styles via `makeMarkdownStyles(colors)`. Prüfen ob alle Markdown-Elemente korrekt auf Dark-Farben umschalten:
- Fließtext → `colors.textPrimary`
- Code-Blöcke → `colors.surface` als Hintergrund
- Horizontale Linien (`<hr>`) → `colors.border`
- Links → `colors.primary`

Sicherstellen dass `makeMarkdownStyles(colors)` **alle** Markdown-Elemente mit Theme-Farben abdeckt und keine hardcodierten Werte (`'#000'`, `'#fff'`, `'#333'` etc.) enthält.

#### 2. Tab Bar Dark Mode (AppNavigator)
In `src/navigation/AppNavigator.tsx` muss die Bottom-Tab-Bar die Theme-Farben `colors.tabBar` und `colors.tabBarBorder` verwenden. Prüfen:
```ts
tabBarStyle: {
  backgroundColor: colors.tabBar,   // '#1C1C2A' im Dark Mode
  borderTopColor: colors.tabBarBorder,
}
```
Sicherstellen, dass der `useTheme()`-Hook im Navigator aufgerufen und die Tab-Bar-Styles dynamisch generiert werden (nicht statisch in `StyleSheet.create()`).

#### 3. HeatmapGrid – Leere Felder
`src/components/HeatmapGrid.tsx` prüfen: Leere (nicht erledigte) Felder sollten in Dark Mode sichtbar sein. Hardcodierte helle Farben (z.B. `'#F0F0F0'`) durch `colors.border` oder `colors.surface` ersetzen.

#### 4. Visuelle QA-Checkliste (auf Gerät testen)

| Screen / Komponente | Light ✓ | Dark ✓ |
|---------------------|---------|---------|
| HomeScreen (Habits, Fortschrittsbalken) | | |
| HomeScreen (Theme-Toggle sichtbar) | | |
| PlannerScreen + "Plan a Habit"-Modal | | |
| StatsScreen (Heatmap, Balken) | | |
| LibraryScreen | | |
| LibraryArticleScreen (Markdown) | | |
| HabitDetailScreen (Markdown + Heatmap) | | |
| Tab Bar | | |
| System Dark Mode Auto-Detection | | |

### Implementierungsreihenfolge

1. `AppNavigator.tsx` prüfen und Tab-Bar-Farben auf `useTheme()` umstellen (falls nicht bereits)
2. `HeatmapGrid.tsx` auf hardcodierte Farben untersuchen und durch Theme-Tokens ersetzen
3. Markdown-Styles in `LibraryArticleScreen.tsx` und `HabitDetailScreen.tsx` vollständig auf Theme-Farben umstellen
4. Visuelle QA auf Simulator/Gerät mit System-Dark-Mode

### Betroffene Dateien

- `src/navigation/AppNavigator.tsx` – Tab-Bar-Hintergrund + Border prüfen
- `src/components/HeatmapGrid.tsx` – Leere-Feld-Farbe auf `colors.border` umstellen
- `src/screens/LibraryArticleScreen.tsx` – `makeMarkdownStyles()` auf Vollständigkeit prüfen
- `src/screens/HabitDetailScreen.tsx` – `makeMarkdownStyles()` auf Vollständigkeit prüfen
