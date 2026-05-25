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
