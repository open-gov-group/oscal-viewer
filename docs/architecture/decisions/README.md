# Architecture Decision Records - OSCAL Viewer

Dieses Verzeichnis enthält Architecture Decision Records (ADRs) für den OSCAL Viewer.

## ADR Index

| Nr. | Titel | Status | Datum |
|-----|-------|--------|-------|
| 001 | [Preact als UI Framework](ADR_001_preact.md) | Accepted | 2026-02-06 |
| 002 | [Zero-Backend Architektur](ADR_002_zero_backend.md) | Accepted | 2026-02-06 |
| 003 | [Dreischichtige Komponentenarchitektur](ADR_003_component_architecture.md) | Accepted | 2026-02-06 |
| 004 | [Vite Build-Konfiguration](ADR_004_build_tooling.md) | Accepted | 2026-02-06 |
| 005 | [Performance-Strategie](ADR_005_performance_strategy.md) | Accepted | 2026-02-06 |
| 006 | [PWA-Strategie](ADR_006_pwa.md) | Accepted | 2026-02-07 |
| 007 | [npm Package Architecture](ADR_007_npm_package.md) | Accepted | 2026-02-07 |
| 008 | [Resolution Service Architecture](ADR_008_resolution_service.md) | Accepted | 2026-02-09 |
| 009 | [Resolved Catalog, Parameter Substitution & Cross-Document Navigation](ADR_009_resolved_catalog.md) | Accepted | 2026-02-10 |
| 010 | XML Parser Strategy | Proposed | — |

## Neues ADR erstellen

1. Kopiere das Template unten
2. Benenne die Datei: `ADR_XXX_kurzer_titel.md`
3. Fülle alle Abschnitte aus
4. Erstelle PR für Review

---

## Template

```markdown
# ADR-XXX: [Titel]

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Datum**: YYYY-MM-DD

## Kontext

[Was ist die Situation/das Problem?]

## Entscheidung

[Was wurde entschieden?]

## Begründung

[Warum diese Entscheidung?]

## Alternativen

[Was wurde auch betrachtet?]

## Konsequenzen

[Was folgt daraus?]
```
