# ADR-002: Zero-Backend Architektur

**Status**: Accepted
**Datum**: 2026-02-06
**Issue**: #1

---

## Kontext

Der OSCAL Viewer muss OSCAL-Dokumente anzeigen. Diese Dokumente können sensible Sicherheitsinformationen enthalten.

## Entscheidung

**Wir implementieren eine Zero-Backend Architektur. Alle Verarbeitung geschieht im Browser.**

## Begründung

### Vorteile

- **Privacy by Design**: Keine Daten verlassen den Client
- **Keine Server-Kosten**: GitHub Pages ist kostenlos
- **Keine Wartung**: Kein Server zu pflegen
- **Offline-Fähigkeit**: App funktioniert ohne Internet (nach initialem Laden)
- **Skalierung**: Beliebig viele Nutzer ohne Server-Last

### Nachteile

- Keine serverseitige Validierung
- Keine Persistenz über Browser hinaus
- Größere Client-Bundle-Size für Parsing-Logik

## Alternativen

### Backend-API

- **Pro**: Serverseitige Validierung, Persistenz
- **Contra**: Server-Kosten, Datenschutz-Bedenken
- **Abgelehnt weil**: Datenschutz kritisch bei Sicherheitsdokumenten

### Hybrid (Optional Backend)

- **Pro**: Flexibilität
- **Contra**: Komplexität, zwei Codepfade
- **Abgelehnt weil**: Unnötige Komplexität

## Konsequenzen

- Alle Parser im Browser implementieren
- File API für Uploads
- localStorage für User-Preferences
- Optional: IndexedDB für Dokument-Caching
