# ADR-001: Preact als UI Framework

**Status**: Accepted
**Datum**: 2026-02-06
**Issue**: #1

---

## Kontext

Der OSCAL Viewer ist eine Client-Side-Only Web-Applikation, die über GitHub Pages gehostet wird. Die Bundle-Größe ist kritisch für schnelle Ladezeiten.

## Entscheidung

**Wir verwenden Preact als UI Framework.**

## Begründung

### Vorteile

- **Minimale Größe**: 3KB (gzip) vs React's 40KB+
- **React-Kompatibilität**: Gleiche API, einfache Migration möglich
- **Performance**: Schnellere Runtime als React
- **Bewährte Technologie**: Produktionseinsatz bei großen Projekten

### Nachteile

- Kleineres Ökosystem als React
- Einige React-Libraries nicht kompatibel

## Alternativen

### React

- **Pro**: Größeres Ökosystem
- **Contra**: Deutlich größere Bundle Size
- **Abgelehnt weil**: Bundle Size kritisch für UX

### Vue

- **Pro**: Gute Developer Experience
- **Contra**: Andere Syntax, Team-Erfahrung mit React/Preact
- **Abgelehnt weil**: Team hat React-Erfahrung

### Vanilla JS

- **Pro**: Keine Dependencies
- **Contra**: Aufwändiger, fehleranfälliger
- **Abgelehnt weil**: Entwicklungsgeschwindigkeit wichtiger

## Konsequenzen

- Alle Komponenten in JSX/TSX
- Hooks für State Management
- Kompatibilität mit preact/compat für React-Libraries prüfen
