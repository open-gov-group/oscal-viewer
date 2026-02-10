# Tech Lead - Briefing & Kommunikation

**Rolle**: Tech Lead
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-10
**Phase**: Phase 6+ (Assessment Results, POA&M, E2E Tests)

---

## Deine Verantwortlichkeiten

- Technische Architektur-Entscheidungen treffen und dokumentieren
- Code-Qualitaet sicherstellen durch Reviews und Standards
- Team technisch mentoren und weiterentwickeln
- OSCAL-Spezifikation verstehen und korrekte Implementierung sicherstellen
- Schnittstelle zur Gesamtprojekt-Architektur

---

## Projekt-Historie (Phasen 1-5) — Archiv

| Phase | Ergebnis | Commit | Tests |
|-------|----------|--------|-------|
| Phase 1 | ADR-001 bis ADR-004, ARCHITECTURE.md, Parser, Catalog Renderer | `983c8ff` | 43 |
| Phase 2 | ESLint Layer-Regeln, CODING_STANDARDS, PR-Template, 4 Renderer Reviews | `759b012` | 254 |
| UI/UX Overhaul | Material Design, CSS-Variablen, a11y Audit | `a567973` | 254 |
| Dashboard-Redesign | CODING_STANDARDS v3.0.0 (15 Patterns), Accordion/Filter/DeepLink Architektur | `195b58e` | 350 |
| Stakeholder-Feedback | S1-S3 Reviews, BITV 2.0 Konformitaet | — | 350 |
| Phase 3 | ADR-006 (PWA), ADR-007 (npm), CODING_STANDARDS v4.0.0, CHANGELOG.md, CI/CD Pipelines | `abcf25c` | 444 |
| Dependency-Upgrade | Vite 7, Vitest 4, ESLint 9 Flat Config, Node 22 LTS | — | 444 |
| Feature-Paket | MetadataPanel, URL-Loading, Config-Presets Reviews | `4a46e11` | 444 |
| Code-Audit | CODING_STANDARDS v4.2.0 Sektion 11, eslint-plugin-jsdoc | `0abd597` | 485 |
| Phase 4 | ADR-008, ESLint services/ Layer-Regeln, CODING_STANDARDS v5.0.0 (Patterns 19-22), DocumentCache/ResolutionService/useResolver/ImportPanel Reviews | `4394bb2` | 583 |
| Phase 5 | ADR-009, CODING_STANDARDS v5.1.0 (Patterns 23-27), ParamSubstitutor/ProseView/ResourcePanel/Cross-Doc Navigation Reviews | — | 650 |

### Etablierte Architektur-Entscheidungen

| ADR | Inhalt |
|-----|--------|
| ADR-001 | Preact statt React (3KB vs 40KB) |
| ADR-002 | Zero-Backend, alles clientseitig |
| ADR-003 | Dreischichtige Architektur (Domain -> Application -> Presentation) |
| ADR-004 | Vite Build-Konfiguration |
| ADR-005 | ESLint Layer-Schutz |
| ADR-006 | PWA mit vite-plugin-pwa |
| ADR-007 | npm Package (@open-gov-group/oscal-parser) |
| ADR-008 | Resolution Service Architecture (HrefParser, DocumentCache, ResolutionService) |
| ADR-009 | Resolved Catalog, Parameter Substitution & Cross-Document Navigation |

### Etablierte Patterns (CODING_STANDARDS v5.1.0)

- ParseResult<T> Pattern, spezialisierte Parser pro Dokumenttyp
- Dreischicht: types/ -> parser/ -> services/ -> hooks/ -> components/
- ESLint Layer-Regeln (Flat Config), consistent-type-imports
- Shared Components in src/components/shared/
- Hooks: useSearch, useDeepLink, useFilter, useResolver, useSspResolver, useSourceResolver
- Services: HrefParser, DocumentCache, ResolutionService, ParamSubstitutor (Domain Layer)
- Patterns 1-27 in CODING_STANDARDS v5.1.0

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-09 | Architect | Tech Lead | Phase 4 Briefing: TL-R1 bis TL-R5 | Erledigt |
| 2026-02-09 | Tech Lead | Alle | TL-R1: ADR-008 erstellt, TL-R2: ESLint services/ Regeln, TL-R3: CODING_STANDARDS v5.0.0 | Erledigt |
| 2026-02-09 | QA Engineer | Tech Lead | Phase 4a QA-Report: 8/9 PASS, Finding F1 (LinkBadge aria-label) | Erledigt |
| 2026-02-09 | Architect | Tech Lead | Phase 4b Briefing: TL-R4b Code Reviews (DocumentCache, ResolutionService, useResolver, ImportPanel) | Erledigt |
| 2026-02-10 | Tech Lead | Alle | **Phase 5 abgeschlossen**: ADR-009 erstellt (Resolved Catalog, ParamSubstitutor, Cross-Doc Navigation). CODING_STANDARDS v5.1.0 (Patterns 23-27: ProseView, ParamSubstitutor, ResourcePanel, Cross-Doc Navigation, Fragment Resolution). ADR Index aktualisiert | Erledigt |
| 2026-02-10 | Architect | Tech Lead | **Phase 6 Planung**: AR/POA&M Architektur, Playwright E2E Strategie, XML Parser Evaluierung | Aktiv |

---

## Phase 6 Ausblick

### TL-R6: ADR-010 Assessment Results & POA&M Types [HOCH]

Neue OSCAL-Dokumenttypen erfordern eine Architektur-Entscheidung:

- **Assessment Results (AR)**: Findings, Observations, Risks — komplexe verschachtelte Strukturen
- **POA&M**: Plan of Action & Milestones — Milestone-basiertes Status-Tracking
- **Neue Typen in `src/types/oscal.ts`**: AssessmentResults, Finding, Observation, Risk, POAMItem, Milestone
- **Parser-Pattern**: Bestehende ParseResult<T> Architektur erweitern

### TL-R7: CODING_STANDARDS v5.2.0 [MITTEL]

Neue Patterns fuer Phase 6:
- Pattern 28: Assessment Results Parser (Findings-Hierarchie)
- Pattern 29: POA&M Parser (Milestone-Tracking)
- Pattern 30: Playwright E2E Test Pattern

### TL-R8: Code Reviews Phase 6 [MITTEL]

| Review-Fokus | Beschreibung |
|-------------|-------------|
| AR Parser | Findings -> Observations -> Risks Verknuepfung korrekt? |
| AR View | Findings-Dashboard mit Status-Aggregation |
| POA&M Parser | Milestone-Timeline, Completion-Tracking |
| POA&M View | Timeline-Darstellung, Status-Farben (satisfied/not-satisfied) |
| Playwright Specs | E2E-Szenarien: Cross-Doc Navigation, PWA Offline, URL-Loading |

### Build-Erwartung Phase 6

- **Neue Dateien**: 2 Parser + 2 Views + Tests + Playwright Specs
- **Bundle-Impact**: +2-3 KB gzipped (AR + POA&M Parser/Views)
- **Tests**: 650 bestehend + ~80-100 neue Tests (Parser + Views + E2E)
- **Budget**: ~36 KB -> ~39 KB gzipped (weiterhin weit unter 100 KB Limit)
