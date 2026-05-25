# MindFlow – Issue Backlog

Dieses Dokument enthält alle GitHub Issues mit überarbeiteten Titeln, klaren Beschreibungen und konkreten Implementierungshinweisen.  
Neue Issues werden **unten angehängt**. Bereits dokumentierte Issues werden **nicht verändert**.

---

---

## Issue #12 – Dark Mode: In-App Theme-Toggle (System / Hell / Dunkel)

**GitHub Issue:** #12  
**Original Titel:** Dark mode unterstützung  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die technische Dark-Mode-Infrastruktur ist bereits **vollständig vorhanden**:

| Datei | Was bereits erledigt ist |
|-------|--------------------------|
| `src/utils/theme.ts` | `colors` (Light) und `darkColors` (Dark) sind definiert |
| `src/utils/ThemeContext.tsx` | `ThemeProvider` liest Systempräferenz via `useColorScheme()` und stellt `colors` + `isDark` per Context bereit |
| Alle Screens & Components | Verwenden bereits `useTheme()` statt direkter Theme-Importe |
| `app.json` | `userInterfaceStyle: "automatic"` gesetzt |
| `App.tsx` | `StatusBar` und `NavigationContainer`-Theme wechseln korrekt mit `isDark` |

### Was fehlt

Der Nutzer kann die Theme-Präferenz **nicht manuell überschreiben** – die App folgt immer dem Systemsetting. Gewünscht ist ein **In-App-Toggle** mit drei Optionen: System / Hell / Dunkel.

### Implementierungsschritte

1. **`src/utils/ThemeContext.tsx` erweitern:**
   - `ThemeContextValue`-Interface um `themePreference: 'system' | 'light' | 'dark'` und `setThemePreference: (p: ...) => void` ergänzen.
   - Präferenz beim App-Start aus AsyncStorage laden (Key: `mindflow:theme_preference`).
   - `isDark`-Berechnung: Wenn Präferenz `'system'`, dann `useColorScheme() === 'dark'`; sonst direkt aus Präferenz ableiten.

2. **`src/utils/storage.ts`:** Neuen Key `THEME_PREFERENCE = 'mindflow:theme_preference'` zu `STORAGE_KEYS` hinzufügen.

3. **UI-Toggle:** Einen Einstellungsbereich in einem bestehenden Screen (z. B. HomeScreen-Header-Menü oder neuer SettingsScreen) hinzufügen. Drei Chips im Stil der `repeatChip`-Komponente aus dem PlannerScreen (`System` / `Hell` / `Dunkel`) anzeigen.

### Betroffene Dateien

- `src/utils/ThemeContext.tsx` – Kernlogik
- `src/utils/storage.ts` – neuer Storage-Key
- Ein Screen für das UI (z. B. `HomeScreen.tsx` oder neuer `SettingsScreen.tsx`)

---

## Issue #15 – Tagesauswahl im Planner-Modal korrekt zentrieren

**GitHub Issue:** #15  
**Original Titel:** Tagesauswahl beim Habit planen nicht zentriert  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Im Modal „Plan a Habit" (`AddPlanModal` in `src/screens/PlannerScreen.tsx`) erscheinen beim Wiederholmodus **„Select days" (weekly)** sieben Wochentags-Chips. Diese sind nicht horizontal zentriert, obwohl `justifyContent: 'center'` gesetzt ist.

### Ursache

Der `dayRow`-Style (Zeile 633) hat `justifyContent: 'center'`, aber **kein explizites `width`**. Im React Native Flex-Modell zieht sich ein `flexDirection: 'row'`-View ohne Breitenangabe nur auf den minimalen Content-Breite zusammen, wenn kein übergeordneter Stretch greift. Das `ScrollView`-`contentContainerStyle` (`modalContent`) setzt nur `padding: spacing.md` und kein `alignItems: 'stretch'`, sodass `justifyContent: 'center'` ins Leere läuft.

### Fix

In `makeStyles` → `dayRow` (Zeile 633, `src/screens/PlannerScreen.tsx`) `width: '100%'` ergänzen:

```js
dayRow: {
  flexDirection: 'row',
  gap: spacing.xs,
  marginTop: spacing.sm,
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',   // ← NEU
},
```

### Betroffene Datei

- `src/screens/PlannerScreen.tsx` – Style `dayRow` ca. Zeile 633

---

## Issue #18 – Habit-Benachrichtigungen: Permission-Feedback & Developer-Build

**GitHub Issue:** #18  
**Original Titel:** Benachrichtigung für Habits  
**Label:** ClaudeCode | **Status:** Open

### Kontext

Die Benachrichtigungs-Infrastruktur ist bereits **vollständig implementiert**:

| Datei | Was bereits vorhanden ist |
|-------|---------------------------|
| `src/utils/notificationService.ts` | `scheduleHabitReminder()` und `cancelReminders()` sind fertig |
| `src/store/plannerStore.ts` | Notifications werden beim Hinzufügen/Bearbeiten/Löschen automatisch geplant/gecancelt |
| `src/screens/PlannerScreen.tsx` | REMINDER_OPTIONS (None, 5 min, 10 min, 15 min, 30 min) im Modal vorhanden |
| `App.tsx` | `requestPermissions()` wird beim App-Start aufgerufen |
| `app.json` | `expo-notifications`-Plugin konfiguriert |

### Was noch fehlt

1. **Permission-Feedback (Prio: hoch):** Wenn der Nutzer die Benachrichtigungsberechtigung verweigert, gibt es keinerlei UI-Feedback. Eine erklärende Meldung oder ein Hinweistext im Reminder-Bereich fehlt.

2. **Reminder-Optionen erweitern (Prio: niedrig):** Aktuell: `null, 5, 10, 15, 30` Minuten. Sinnvolle Ergänzung: `{ label: '1 Std', value: 60 }` und `{ label: '2 Std', value: 120 }`.

3. **Development Build erforderlich** (→ Details in Issue #22): In Expo Go funktionieren Notifications auf Android nicht. Das Feature muss mit einem Development Build getestet werden.

### Implementierungsschritte

1. **`App.tsx`:** Ergebnis von `requestPermissions()` in einem State halten. Bei `false` einen Hinweis anzeigen (z. B. `Alert.alert(...)` mit Link-Hinweis zu den Systemeinstellungen).

2. **`src/screens/PlannerScreen.tsx`:** Im REMINDER-Abschnitt des Modals: Wenn keine Permission erteilt ist, Chips deaktiviert anzeigen (`opacity: 0.4`, nicht tappable) plus einen Inline-Hinweistext unterhalb.

3. **Optional – Reminder-Optionen ergänzen** in `REMINDER_OPTIONS` (Zeile 123):
   ```ts
   { label: '1 Std', value: 60 },
   { label: '2 Std', value: 120 },
   ```

4. **Development Build** für Android-Tests erstellen (siehe Issue #22).

### Betroffene Dateien

- `App.tsx` – Permission-State und Feedback
- `src/screens/PlannerScreen.tsx` – Reminder-UI, ggf. Optionserweiterung

---

## Issue #22 – Expo Go: expo-notifications auf Android nicht verfügbar (SDK 53+)

**GitHub Issue:** #22  
**Original Titel:** Fehler bei Benachrichtigung  
**Label:** ClaudeCode | **Status:** Open

### Fehlermeldung

```
"expo-notifications Android Push notifications" functionality provided by expo-notifications
was removed from Expo Go with release of SDK 53
```

### Ursache

Seit **Expo SDK 53** wurde das Benachrichtigungs-Backend vollständig aus Expo Go entfernt. Die App nutzt `expo-notifications` für **lokale Benachrichtigungen** (On-Device, kein Expo Push Service), aber selbst diese werden auf Android in Expo Go nicht mehr unterstützt.

> **Der Code in `notificationService.ts` ist korrekt und muss NICHT verändert werden.**  
> Das `try/catch` in `scheduleHabitReminder()` verhindert bereits App-Abstürze (silent fail).

### Lösung: Development Build verwenden

```bash
# Option A: Lokaler Development Build (benötigt installiertes Android SDK / ADB)
npx expo run:android

# Option B: EAS Cloud Build (kein lokales Android SDK nötig)
eas build --profile development --platform android
```

Für Option B muss eine `eas.json` im Projektstamm angelegt werden:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

Anschließend:

```bash
npx expo start --dev-client
```

### Hinweise

- In **Production Builds** (`eas build --profile production`) funktionieren Notifications einwandfrei.
- iOS-Simulator in Expo Go: Notifications funktionieren weiterhin (kein Breaking Change für iOS).
- `app.json` hat das Plugin bereits korrekt konfiguriert – kein Codechange nötig.

### Betroffene Datei

- Kein Codechange – nur Build-Prozess umstellen.
- Neu anzulegen: `eas.json` (Projektstamm)

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
