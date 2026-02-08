## Summary

<!-- Kurze Beschreibung der Aenderungen (1-3 Saetze) -->

Closes #<!-- Issue-Nummer -->

## Changes

<!-- Was wurde geaendert? -->
-

## Checklist

### Code Quality
- [ ] ESLint laeuft fehlerfrei (`npm run lint`)
- [ ] TypeScript kompiliert fehlerfrei (`tsc --noEmit`)
- [ ] Keine `any` Types eingefuehrt
- [ ] Layer-Regeln eingehalten (types -> parser -> hooks -> components)
- [ ] Code-Kommentierung: File-Level-Kommentar, JSDoc auf exportierte Funktionen/Hooks

### Testing
- [ ] Tests geschrieben/aktualisiert
- [ ] Tests laufen durch (`npm test`)
- [ ] Coverage >= 80% fuer neue Dateien

### Accessibility
- [ ] ARIA-Labels fuer interaktive Elemente
- [ ] Keyboard-Navigation funktioniert
- [ ] Semantisches HTML verwendet

### Bundle Size
- [ ] Keine grossen neuen Dependencies eingefuehrt
- [ ] `npm run build` erfolgreich

### Renderer-spezifisch (falls zutreffend)
- [ ] `MetadataPanel` fuer Metadata genutzt
- [ ] `PropertyBadge`/`PropertyList` fuer Properties genutzt
- [ ] Integration in `DocumentViewer` (neuer case)
- [ ] CSS-Klassen mit Komponenten-Prefix

### Service Worker / PWA (falls zutreffend)
- [ ] Precache-Manifest korrekt (alle App-Assets, keine sensiblen Dateien)
- [ ] Cache-Invalidierung via Version-Hash (Vite-Standard)
- [ ] Keine User-Daten gecacht (OSCAL-Dateien werden NICHT gecacht)
- [ ] Fonts-Caching mit Expiration (nicht unbegrenzt)
- [ ] Update-Flow getestet (neuer Deploy ersetzt alten SW)
- [ ] Offline-Fallback funktioniert (kein White-Screen)

### npm Package (falls zutreffend)
- [ ] Nur Domain Layer exportiert (types/, parser/)
- [ ] Keine Preact/UI-Imports im Package
- [ ] `npm run build:lib` erfolgreich
- [ ] TypeScript Declarations (.d.ts) korrekt generiert
