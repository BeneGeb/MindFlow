# MindFlow 🌿 – App Konzept

## Projektübersicht

**App-Name:** MindFlow  
**Plattformen:** iOS & Android  
**Technologie:** React Native  
**Sprache:** Englisch (international)  
**Zielgruppe:** Gen Z (16–28 Jahre), die ihre mentale Gesundheit verbessern möchten  

---

## Vision

MindFlow ist eine mobile Habit-Tracking-App, die sich auf Gewohnheiten spezialisiert, die nachweislich die mentale Gesundheit fördern und Stress regulieren. Sie richtet sich an Gen Z (16–28 Jahre) – eine Generation, die mit Leistungsdruck durch Schule und Studium, Unsicherheit beim Berufseinstieg und dem ständigen Vergleichsdruck durch Social Media konfrontiert ist.

Die App spricht bewusst Einsteiger und Interessierte an – Menschen, die wissen, dass Gewohnheiten wie Meditation oder Journaling gut für sie wären, aber noch keinen einfachen Einstieg gefunden haben. MindFlow senkt diese Hürde: mit klaren Anleitungen, niedrigschwelligen Aktivitäten und einem motivierenden, nicht überfordernden Design.

Die App begleitet Nutzer dabei, positive Routinen aufzubauen, bietet fundiertes Wissen zu den einzelnen Aktivitäten und soll langfristig durch ein Premium-Abo-Modell erweitert werden.

---

## Funktionen (Kostenlos)

### Habit Tracking
- Vorgefertigte Habits aus dem Bereich mentale Gesundheit
- Täglich abhaken erledigter Gewohnheiten
- Streak-Anzeige (wie viele Tage in Folge)
- Wochenübersicht als visuelle Fortschritts-Heatmap
- Eigene Habits hinzufügen

### Vorgefertigte Habits
| Icon | Habit | Nutzen |
|------|-------|--------|
| 🧘 | Meditieren | Cortisol senken, Fokus & Schlaf verbessern |
| 📓 | Tagebuch schreiben | Emotionale Verarbeitung, Selbstbewusstsein |
| 🚶 | Spazieren | Stimmungsaufhellend, stressabbauend |
| 🏃 | Sport / Bewegung | Endorphine, besserer Schlaf |
| 🧘‍♀️ | Yoga | Flexibilität, innere Ruhe, Körperbewusstsein |
| 🌬️ | Atemübungen | Sofortige Stressreduktion |
| 😴 | Schlafhygiene | Emotionale Stabilität, Konzentration |
| 📵 | Digitale Auszeit | Weniger Reizüberflutung, mehr Präsenz |

### Infoseiten zu jeder Aktivität
Jede Habit enthält eine eigene Informationsseite mit:
- Kurzbeschreibung & wissenschaftlichem Hintergrund
- Praktischen Tipps & Anleitungen
- Konkretem Nutzen für die mentale Gesundheit

#### Beispiel: Meditieren
- Beginne mit nur 5 Minuten täglich
- Fokussiere dich auf deinen Atem
- Gedanken kommen und gehen lassen – nicht bewerten
- Morgens meditieren hilft, den Tag ruhig zu beginnen

#### Beispiel: Atemübungen
- 4-7-8 Technik: 4s einatmen, 7s halten, 8s ausatmen
- Box Breathing: 4s ein, 4s halten, 4s aus, 4s halten
- Bauch- statt Brustatmung üben
- Bei Stress sofort 3 tiefe Atemzüge nehmen

---

## Premium-Abo (Geplant)

**Preis:** 4,99 € / Monat (mit kostenloser Testphase)

### Premium-Funktionen
- **Geführte Meditationen** – 20+ Audio-Meditationen (5–30 Minuten)
- **Vorgefertigte Wellness-Pläne** – z. B. „7 Tage gegen Stress", „Besser schlafen in 2 Wochen"
- **Erweiterte Statistiken** – Stimmungstracking & Fortschrittsanalyse
- **Premium-Design** – Exklusive Themes und Icons

---

## Design & UI

- **Farbschema:** Ruhige, warme Töne – Lila (`#7F77DD`), Grün (`#1D9E75`), Creme/Weiß
- **Stil:** Flaches, modernes Design – keine überladenen Elemente
- **Typografie:** Klar und lesbar, optimiert für kleine Bildschirme
- **Navigation:** Bottom Navigation Bar mit 3 Tabs (Home, Stats, Premium)
- **Animationen:** Sanfte Übergänge, motivierende Fortschrittsanzeigen

---

## App-Struktur & Screens

### Navigation
Bottom Navigation Bar mit 4 Tabs:

| Tab | Icon | Funktion |
|-----|------|----------|
| **Home** | 🏠 | Heutige Habits abhaken |
| **Planner** | 📅 | Gewohnheiten im Tagesplan planen |
| **Stats** | 📊 | Fortschritt & Statistiken |
| **Library** | 📚 | Atomic Habits Wissen & Infos |

---

### Screen 1 – Home (Today)
Die tägliche Übersicht – der Screen, den Nutzer am häufigsten sehen.

**Inhalt:**
- Begrüßung mit Tageszeit (*„Good morning"*, *„Good evening"*, etc.)
- Fortschrittsbalken: *„3 of 6 habits done today"*
- Liste aller für heute geplanten Habits (aus dem Planner)
- Jeder Habit zeigt: Icon, Name, geplante Uhrzeit, Streak
- Abhaken per Tap → Animation + kurzes positives Feedback
- Habits ohne geplante Zeit erscheinen am Ende der Liste

**Navigation zu:**
- Habit-Detail-Screen (Tap auf Habit-Name → Infoseite)
- Habit abhaken (Tap auf Checkbox)

---

### Screen 2 – Planner
Tagesansicht im Kalender-Stil (angelehnt an Google Calendar) – hier plant der Nutzer, wann er welche Gewohnheit ausführt.

**Inhalt:**
- Zeitstrahl des Tages (z. B. 06:00 – 23:00) mit stündlichen Slots
- Habits können per Drag & Drop oder Tap in einen Zeitslot eingetragen werden
- Jeder Habit-Block zeigt: Icon, Name, Dauer
- Datum-Auswahl oben (vor/zurück navigieren)
- Wiederholungen einstellbar: täglich, bestimmte Wochentage

**Push-Benachrichtigung:**
- Zur geplanten Uhrzeit erhält der Nutzer eine Notification
- Beispiel: *„🧘 Time to meditate – 5 minutes for your mind."*

**Verbindung zu Atomic Habits:**
- Kurzer Hinweis beim ersten Öffnen: *„Habits done at the same time every day stick 3x longer."*

---

### Screen 3 – Stats
Fortschritt und Motivation auf einen Blick.

**Inhalt:**

**Übersicht oben:**
- Gesamte Completion Rate der aktuellen Woche (z. B. *„74% this week"*)
- Längster aktiver Streak (über alle Habits)

**Pro Habit:**
- Streak-Anzeige (Tage in Folge) mit Flammen-Icon
- Completion Rate der letzten 7 Tage (Prozentzahl)
- Wochenübersicht als Heatmap (7 Felder, eingefärbt je nach Abschluss)

**Design:**
- Klare Karten pro Habit
- Farben der Heatmap entsprechen der Habit-Farbe

---

### Screen 4 – Library
Wissensbibliothek rund um Gewohnheitsbildung und mentale Gesundheit.

**Inhalt:**

**Atomic Habits Sektion:**
- Artikel & Erklärungen zu den 4 Gesetzen
- 2-Minuten-Regel, Habit Stacking, Identity-based Habits
- Kurze, leicht lesbare Formate (kein Fließtext-Overload)

**Mental Health Sektion:**
- Tiefergehende Infoseiten zu jeder Habit-Kategorie
- Wissenschaftlicher Hintergrund (einfach erklärt)
- Praktische Anleitungen (z. B. geführte Atemübungen als Text)

**Premium-Inhalte (gesperrt):**
- Geführte Meditationen (Audio)
- Vorgefertigte Wellness-Pläne

---

### Sub-Screen – Habit Detail
Erreichbar durch Tap auf einen Habit (von Home oder Planner).

**Inhalt:**
- Habit-Name, Icon, Farbe
- Beschreibung & Nutzen
- Tipps & Anleitungen
- Atomic Habits Tipp (inline): z. B. *„Start with just 2 minutes."*
- Aktueller Streak + Heatmap der letzten 4 Wochen
- Button: *„Plan this habit"* → direkt in den Planner

---

### Sub-Screen – Premium
Erreichbar über einen CTA in der Library oder beim Zugriff auf gesperrte Inhalte.

**Inhalt:**
- Übersicht aller Premium-Features
- Preis & Testphase
- Registrierung via Apple, Google oder E-Mail

---

## Premium-Strategie

### Kernidee
Premium bedeutet bei MindFlow nicht einfach „mehr Features" – sondern ein **begleitetes Erlebnis**. Der Nutzer wird beim tatsächlichen Durchführen seiner Habits aktiv unterstützt. Der Upgrade-Moment entsteht ganz natürlich: Der Nutzer startet einen Habit und merkt, dass er dabei Begleitung möchte.

---

### Preismodell

| Plan | Preis | Besonderheit |
|------|-------|--------------|
| **Monthly** | 4,99 € / Monat | Flexibel, jederzeit kündbar |
| **Yearly** | 29,99 € / Jahr (~2,50 € / Monat) | ~50% Rabatt gegenüber Monatsabo |

- Beide Pläne beinhalten eine **7-tägige kostenlose Testphase**
- Registrierung (Apple, Google oder E-Mail) erst beim Start der Testphase erforderlich
- Umsetzung via **RevenueCat** (In-App Purchases für iOS & Android)

---

### Was ist kostenlos?

| Feature | Kostenlos |
|---------|-----------|
| Alle Habits tracken & abhaken | ✓ |
| Streaks & Wochenübersicht | ✓ |
| Planner (Tagesplanung & Notifications) | ✓ |
| Habit-Infoseiten & Tipps | ✓ |
| Atomic Habits Bibliothek (Artikel) | ✓ |
| Stats (Streak, Completion Rate, Heatmap) | ✓ |

---

### Was ist Premium?

Alle Premium-Inhalte sind direkt in den Habit-Flow integriert – der Nutzer öffnet einen Habit und kann von dort auf die begleitenden Inhalte zugreifen.

#### 1. Guided Breathing – Timer & Anleitung
- Visueller Atemtimer (Kreis expandiert & kontrahiert)
- Verschiedene Techniken: 4-7-8, Box Breathing, Kohärenzatmung
- Gesprochene Anleitung (Audio) optional zuschaltbar
- Einsatz bei: Atemübungen, Meditation, Stressmoment

#### 2. Guided Meditations – Audio
- Geführte Meditationen in verschiedenen Längen (5 / 10 / 20 Min.)
- Kategorien: Morgenmotivation, Stressabbau, Einschlafen, Fokus
- Ruhige, authentische Stimme – kein überproduzierter Wellness-Ton
- Einsatz bei: Meditieren

#### 3. Relaxation Music – Audio
- Hintergrundmusik ohne Sprache für fokussierte Habits
- Kategorien: Yoga Flow, Deep Sleep, Focus, Nature Sounds
- Nutzer kann Musik laufen lassen während er den Habit ausführt
- Einsatz bei: Yoga, Spazieren, Schlafen, Sport

#### 4. Guided Journaling Prompts – Audio & Text
- Täglich wechselnde Journaling-Fragen als Text und optional gesprochen
- Kategorien: Gratitude, Selbstreflexion, Stressverarbeitung, Wocheneview
- Beispiele: *„What's one thing you're proud of today?"*, *„What would make tomorrow great?"*
- Einsatz bei: Tagebuch schreiben

---

### Upgrade-Touchpoints (wo Nutzer auf Premium stoßen)

- Beim Öffnen eines Habits → *„Enhance this habit with guided audio"*
- In der Library bei gesperrten Inhalten → Schloss-Icon + kurze Vorschau
- Nach dem ersten abgehakten Habit → *„Want to go deeper? Try Premium free for 7 days."*
- Nach 3 Tagen Streak → motivierender Nudge Richtung Premium

---

## Technischer Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | React Native |
| Plattformen | iOS & Android |
| Navigation | React Navigation |
| State Management | useState / useReducer (ggf. Zustand oder Redux) |
| Datenspeicherung | AsyncStorage (lokal) |
| Audio (Premium) | react-native-track-player |
| Zahlungsabwicklung | RevenueCat (In-App Purchases) |

---

## Mögliche Erweiterungen (Zukunft)

- Push-Benachrichtigungen / Erinnerungen
- Onboarding-Flow für neue Nutzer
- Stimmungstracking (tägliche Eingabe)
- KI-gestützte Meditationstexte & personalisierte Empfehlungen
- Community-Features / Challenges
- Apple Health / Google Fit Integration

---

---

## USP – Was MindFlow einzigartig macht

Apps wie Calm oder Headspace bieten Meditationen und Wellness-Inhalte an – aber sie lösen nicht das eigentliche Problem: **Warum hören Menschen nach zwei Wochen wieder auf?**

MindFlow kombiniert zwei Dinge, die bisher getrennt existieren:

1. **Mentale Gesundheit** – spezialisierte Habits, Infos und Anleitungen rund um Stressregulation und Wohlbefinden
2. **Gewohnheitspsychologie** – die Wissenschaft dahinter, wie man diese Praktiken wirklich langfristig in den Alltag integriert

Die Grundlage bildet das Buch *Atomic Habits* von James Clear, ergänzt durch eigene Erfahrungen des Gründers als Teil der Zielgruppe (Gen Z).

---

## Atomic Habits – Konzepte in der App

Die Prinzipien aus *Atomic Habits* sind auf zwei Ebenen in der App verankert:

### 1. Inline – kurze Tipps direkt bei jedem Habit
Jede Habit-Infoseite enthält einen kurzen Abschnitt, der erklärt, wie man diesen Habit konkret aufbaut und langfristig hält – basierend auf den folgenden Konzepten.

### 2. Bibliothek – eigener Bereich in der App
Ein dedizierter „Learn"-Bereich mit tiefergehenden Artikeln, Erklärungen und Übungen zu jedem Konzept.

---

### Die 4 Gesetze der Gewohnheitsbildung

| Gesetz | Prinzip | Anwendung in MindFlow |
|--------|---------|----------------------|
| **Obvious** (offensichtlich) | Reize sichtbar machen | Habit-Erinnerungen, Tagesplanung, visuelle Cues |
| **Attractive** (attraktiv) | Habits verlockend gestalten | Streaks, Fortschrittsanzeigen, Belohnungen |
| **Easy** (einfach) | Einstiegshürde minimieren | 2-Minuten-Versionen jedes Habits |
| **Satisfying** (befriedigend) | Sofortiges positives Feedback | Abhak-Animation, Streak-Feier, Fortschrittsbalken |

---

### 2-Minuten-Regel
Jeder Habit in MindFlow hat eine **2-Minuten-Einstiegsversion** – die kleinstmögliche Form der Gewohnheit:
- Meditieren → 2 Minuten Atemübung
- Tagebuch → 1 Satz aufschreiben
- Sport → 2 Minuten dehnen
- Spazieren → kurz an die frische Luft treten

Dies senkt die Einstiegshürde und hilft besonders Einsteigern, den ersten Schritt zu machen.

---

### Habit Stacking
Nutzer können Habits miteinander verknüpfen – neue Gewohnheiten werden an bestehende geknüpft:
> *„Nach meinem Morgenkaffee meditiere ich 5 Minuten."*

Die App unterstützt das Erstellen solcher Verknüpfungen beim Einrichten eines neuen Habits.

---

### Identity-Based Habits
MindFlow fördert einen identitätsbasierten Ansatz: Nicht *„Ich will meditieren"*, sondern *„Ich bin jemand, der täglich meditiert."*

Umsetzung in der App:
- Beim Onboarding wählen Nutzer eine Identität / ein Ziel: z. B. *„I want to become a calmer person"*
- Streaks und Fortschritt werden als Beweis dieser Identität kommuniziert: *„3 days in a row – you're building your identity as someone who meditates."*

---

## Onboarding-Flow

### Prinzipien
- Keine Registrierung, keine Fragen – Nutzer starten sofort
- Registrierung ist nur für Premium erforderlich
- Emotional abholen, Mehrwert in wenigen Sekunden vermitteln
- Max. 4 Screens, jeder mit einem klaren Fokus

### Screen-by-Screen

**Screen 1 – Welcome**
- Großes, ruhiges Visual (Animation / Illustration)
- Headline: *„Your mind deserves a routine."*
- Subtext: *„Small habits. Big change."*
- CTA-Button: *„Get started"*

**Screen 2 – Das Problem benennen**
- Kurze, ehrliche Aussage, die Gen Z abholt
- Headline: *„Life's a lot. We get it."*
- 3 kurze Punkte (Icons + Text):
  - 😮‍💨 Stress from school, work & life
  - 📱 Constant comparison on social media
  - 😴 Never really switching off
- CTA: *„That's why MindFlow exists"*

**Screen 3 – Die Lösung / USP**
- Headline: *„Build habits that actually stick."*
- Kurze Erklärung des Ansatzes (2-3 Sätze):
  *„MindFlow combines mental health practices with the science of habit building – so you don't just start, you keep going."*
- Visueller Hinweis auf Atomic Habits-Ansatz (z. B. kleines Badge: *„Based on Atomic Habits"*)
- CTA: *„Show me how"*

**Screen 4 – Habit-Auswahl (erster Hook)**
- Headline: *„Pick one habit to start with."*
- Alle verfügbaren Habits als auswählbare Karten (Icons + Name)
- Subtext: *„You can always add more later."*
- Ziel: Nutzer committet sich zu einem ersten Habit – Identity-based Einstieg
- CTA: *„Start my journey"* → direkt in die App

---

### Registrierung (nur für Premium)
- Kein Account-Zwang beim Start
- Beim Aktivieren von Premium: Registrierung via Apple, Google oder E-Mail
- Lokale Daten werden beim Login mit dem Account verknüpft

---

## Technische Architektur

### Grundprinzip
Version 1.0 kommt vollständig ohne Backend aus. Alle Daten werden lokal auf dem Gerät gespeichert. Das reduziert Komplexität, beschleunigt die Entwicklung und schützt die Privatsphäre der Nutzer. Cloud-Sync wird später als Premium-Feature nachgerüstet.

---

### Tech Stack

#### v1.0 (Launch)
| Bereich | Technologie | Begründung |
|---------|-------------|------------|
| Framework | React Native (Expo) | Cross-platform iOS & Android, schnelle Entwicklung |
| Navigation | React Navigation v6 | Bottom Tabs + Stack Navigation |
| Lokaler Speicher | AsyncStorage | Einfache Key-Value Persistenz |
| Datenverwaltung | Zustand | Leichtgewichtiges State Management |
| Notifications | Expo Notifications | Lokale Benachrichtigungen, kein Server nötig |

#### Ab v2.0 (Premium)
| Bereich | Technologie | Begründung |
|---------|-------------|------------|
| Backend & Auth | Supabase | Datenbank, Auth und File Storage in einem |
| Audio | Expo AV | Meditations- & Musikwiedergabe |
| Audio-Hosting | Supabase Storage / CDN | Streaming ohne App-Größe zu erhöhen |
| In-App Purchases | RevenueCat | Abo-Verwaltung iOS & Android |

---

### Datenstruktur (lokal)

Alle Daten werden als JSON in AsyncStorage gespeichert.

#### Habits
```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Meditation",
      "icon": "🧘",
      "color": "#7F77DD",
      "category": "meditation",
      "createdAt": "2024-01-01",
      "isCustom": false
    }
  ]
}
```

#### Planner Einträge
```json
{
  "plannedHabits": [
    {
      "id": "uuid",
      "habitId": "uuid",
      "time": "07:30",
      "repeatDays": [1, 2, 3, 4, 5],
      "notificationId": "expo-notification-id",
      "duration": 10
    }
  ]
}
```

#### Tracking (tägliche Einträge)
```json
{
  "tracking": {
    "2024-01-15": {
      "habitId-1": true,
      "habitId-2": false
    }
  }
}
```

---

### Architektur-Übersicht

```
src/
├── components/        → Wiederverwendbare UI-Komponenten
│   ├── HabitCard.tsx
│   ├── BreathingTimer.tsx
│   └── AudioPlayer.tsx
├── screens/           → Alle App-Screens
│   ├── HomeScreen.tsx
│   ├── PlannerScreen.tsx
│   ├── StatsScreen.tsx
│   ├── LibraryScreen.tsx
│   └── HabitDetailScreen.tsx
├── store/             → Zustand State Management
│   ├── habitStore.ts
│   ├── trackingStore.ts
│   └── plannerStore.ts
├── hooks/             → Custom React Hooks
│   ├── useStreak.ts
│   └── useCompletionRate.ts
├── utils/             → Hilfsfunktionen
│   ├── storage.ts     → AsyncStorage Wrapper
│   ├── notifications.ts
│   └── dateHelpers.ts
├── data/              → Statische Inhalte
│   ├── habits.ts      → Vorgefertigte Habits
│   └── library.ts     → Atomic Habits Artikel
└── assets/            → Audio, Bilder, Icons
    ├── meditations/
    └── music/
```

---

### Notifications

Lokale Push-Benachrichtigungen via Expo Notifications – kein Server erforderlich.

- Beim Planen eines Habits wird eine lokale Notification registriert
- Bei Änderung der Zeit: alte Notification löschen, neue registrieren
- Notification-ID wird im Planner-Eintrag gespeichert
- Beispiel-Text: *„🧘 Time to meditate – 5 minutes for your mind."*

---

### Spätere Erweiterungen (ab v2.0)

| Feature | Technologie |
|---------|-------------|
| Premium & Abo | RevenueCat + Supabase Auth |
| Cloud-Sync | Supabase (Postgres + Auth) |
| Audio-Streaming | Supabase Storage oder CDN |
| Analytik | PostHog (privacy-friendly) |

- Der Prototyp wurde als React-Web-App (Artifact) konzipiert und dient als visuelle Grundlage
- Die Umsetzung erfolgt in React Native für native iOS & Android Performance
- Das Abo-Modell ist von Anfang an im Design berücksichtigt, aber noch nicht aktiv
- Inhalte basieren auf *Atomic Habits* von James Clear sowie eigenen Erfahrungen des Gründers
