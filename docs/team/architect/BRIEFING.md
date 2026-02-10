# Architect - Briefing & Kommunikation

**Rolle**: Architect (Orchestrierung)
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-10
**Phase**: Phase 6+ (Assessment Results, POA&M, E2E Tests)

---

## Projektueberblick

Der OSCAL Viewer ist ein clientseitiger Viewer fuer OSCAL-Dokumente (Open Security Controls Assessment Language). Das Projekt nutzt Preact + TypeScript + Vite und wird auf GitHub Pages deployed.

## Projekt-Historie

| Phase | Ergebnis | Tests | Bundle | Commit |
|-------|----------|-------|--------|--------|
| Phase 1 | ADR-001 bis ADR-004, Parser, Catalog Renderer | 43 | 12.54 KB | `983c8ff` |
| Phase 2 | 4 Renderer, ESLint, CODING_STANDARDS, Dashboard, Stakeholder-Feedback | 390 | 20.56 KB | `759b012` |
| Phase 3 | PWA, CONTRIBUTING, CHANGELOG, npm Package, Dependency-Upgrade | 444 | 28.53 KB | `abcf25c` |
| Feature-Paket | MetadataPanel++, URL-Loading, Config-Presets, Code-Audit | 485 | ~30 KB | `0abd597` |
| Phase 4 | HrefParser, DocumentCache, ResolutionService, LinkBadge, ImportPanel, ADR-008, CODING_STANDARDS v5.0.0 | 583 | 33.58 KB | `4394bb2` |
| Phase 5 | ParamSubstitutor, ProseView, ResourcePanel, Cross-Doc Navigation, Resolved Catalog, ADR-009, CODING_STANDARDS v5.1.0 | 650 | 36.10 KB | — |

## Architektur-Entscheidungen

| ADR | Inhalt | Datum |
|-----|--------|-------|
| ADR-001 | Preact statt React (3KB vs 40KB) | 2026-02-06 |
| ADR-002 | Zero-Backend, alles clientseitig | 2026-02-06 |
| ADR-003 | Dreischichtige Architektur (Domain -> Application -> Presentation) | 2026-02-06 |
| ADR-004 | Vite Build-Konfiguration | 2026-02-06 |
| ADR-005 | Performance-Strategie (Memoization, Code Splitting) | 2026-02-06 |
| ADR-006 | PWA mit vite-plugin-pwa | 2026-02-07 |
| ADR-007 | npm Package (@open-gov-group/oscal-parser) | 2026-02-07 |
| ADR-008 | Resolution Service Architecture (HrefParser, DocumentCache, Resolver) | 2026-02-09 |
| ADR-009 | Resolved Catalog, Parameter Substitution & Cross-Document Navigation | 2026-02-10 |

## Ausblick (nach Phase 6)

### Naechste Schritte (Phase 7-10)

1. **Phase 7 — XML Parser (2-3 Sprints)**: OSCAL XML nativ im Browser parsen. DOMParser-basierter Adapter, detect.ts Erweiterung, ADR-010.
2. **Phase 8 — npm Package Publish (1 Sprint)**: @open-gov-group/oscal-parser auf npm veroeffentlichen. NPM_TOKEN, Integration Tests, Versionsstrategie.
3. **Phase 9 — Performance / Lazy Loading (2 Sprints)**: Virtual Scrolling, dynamic import(), Bundle-Optimierung.
4. **Phase 10 — Accessibility Re-Audit BITV 2.0 (1-2 Sprints)**: Vollstaendiger WCAG 2.1 AA Audit fuer alle seit Phase 2 hinzugekommenen Komponenten.

> Detaillierte Phase 7-10 Plaene: siehe **ORCHESTRATION.md v3.0**

### Aufgabenverteilung Phase 6

| Rolle | Schwerpunkt |
|-------|-------------|
| Tech Lead | ADR-010 (AR/POA&M Types), CODING_STANDARDS v5.2, Parser/View Reviews |
| Frontend Dev | AR/POA&M Parser + Views, DocumentViewer Integration, Search Indexing |
| QA | AR/POA&M Tests, View Tests, axe-core, Playwright E2E Specs |
| DevOps | Playwright CI Workflow (e2e.yml), Bundle Monitoring, E2E on PRs |
| UI/UX | AR Findings Dashboard Design, POA&M Milestone Timeline, Status-Farben |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Alle | Projektstart & Briefing | Abgeschlossen |
| 2026-02-07 | QA Engineer | Architect | Code-Kommentierungs-Audit: Note C- (2.6%) | Abgeschlossen |
| 2026-02-08 | QA Engineer | Architect | Re-Audit: Note C+ (5.9%), dann A- (7.1%) | Abgeschlossen |
| 2026-02-09 | QA Engineer | Architect | Phase 4a QA-Report: 531 Tests, 29 axe-core, Finding F1 (LinkBadge aria-label) | Abgeschlossen |
| 2026-02-09 | Architect | Alle | Phase 4a+4b Briefing: OSCAL Resolution (HrefParser, DocumentCache, ResolutionService, ImportPanel) | Abgeschlossen |
| 2026-02-09 | DevOps | Architect | Phase 4a deployed: Commit `4394bb2`, 531 Tests, ~30.6 KB Bundle | Abgeschlossen |
| 2026-02-10 | Architect | Alle | **Phase 4+5 abgeschlossen**: Resolution Infrastructure + Resolved Catalog + ParamSubstitutor + Cross-Doc Navigation. 650 Tests, 36.10 KB Bundle. ADR-009 erstellt, CODING_STANDARDS v5.1.0 (Patterns 23-27), CHANGELOG 0.3.0 + 0.4.0 | Abgeschlossen |
| 2026-02-10 | Architect | Alle | **Phase 6 Planung**: Assessment Results + POA&M Parser/Views + Playwright E2E. Briefings an alle Rollen verteilt | Aktiv |
