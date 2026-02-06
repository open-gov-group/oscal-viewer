# Tech Lead - Briefing & Kommunikation

**Rolle**: Tech Lead
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06
**Phase**: 2 - Erweiterung (KW 10-12)

---

## Deine Verantwortlichkeiten

- Technische Architektur-Entscheidungen treffen und dokumentieren
- Code-Qualitaet sicherstellen durch Reviews und Standards
- Team technisch mentoren und weiterentwickeln
- OSCAL-Spezifikation verstehen und korrekte Implementierung sicherstellen
- Schnittstelle zur Gesamtprojekt-Architektur

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

### Erledigte Aufgaben
- **Issue #1 (ADR)**: ADR-001 bis ADR-004 finalisiert, ARCHITECTURE.md v1.1.0
- **Issue #2 (Parser)**: 4 Parser implementiert, 43 Tests, 94.78% Coverage
- **Issue #3 (Catalog Renderer)**: Hierarchische Navigation, Control-Detail, Shared Components

### Getroffene Architektur-Entscheidungen
| ADR | Datei | Inhalt |
|-----|-------|--------|
| ADR-001 | `docs/architecture/decisions/ADR_001_preact.md` | Preact statt React (3KB vs 40KB) |
| ADR-002 | `docs/architecture/decisions/ADR_002_zero_backend.md` | Zero-Backend, alles clientseitig |
| ADR-003 | `docs/architecture/decisions/ADR_003_component_architecture.md` | Dreischichtige Architektur |
| ADR-004 | `docs/architecture/decisions/ADR_004_build_tooling.md` | Vite Build-Konfiguration |

### Etablierte Patterns
1. **ParseResult<T> Pattern**: `{ success: true, data: T } | { success: false, error: string }`
2. **Spezialisierte Parser pro Dokumenttyp** (nicht ein generischer Parser)
3. **Verzeichnisstruktur**: `types/ -> parser/ -> hooks/ -> components/`
4. **Domain Layer importiert nie aus Presentation** (strikte Abhaengigkeitsrichtung)
5. **Shared Components** in `src/components/shared/` (MetadataPanel, PropertyBadge)
6. **DocumentViewer** als Router-Komponente mit Switch auf `data.type`

---

## Aktueller Auftrag - Phase 2

### Prioritaet 1: Code Review & Standards durchsetzen - ERLEDIGT

**ESLint Layer-Regeln konfigurieren** - ERLEDIGT
- `.eslintrc.cjs` erstellt mit `no-restricted-imports` Overrides pro Verzeichnis
- `types/` darf nicht aus parser/, hooks/, components/ importieren
- `parser/` darf nicht aus hooks/, components/ importieren
- `hooks/` darf nicht aus components/ importieren
- Tests relaxed (kein `no-restricted-imports`, `any` erlaubt)
- `consistent-type-imports` Regel fuer `import type` Syntax
- Verifiziert: Layer-Verletzungen werden als Fehler erkannt

**TypeScript Patterns fuer neue Renderer** - ERLEDIGT
- `docs/CODING_STANDARDS.md` erstellt mit:
  - Renderer-Template (Verzeichnisstruktur, Props-Interface, useMemo)
  - Import-Reihenfolge und Konventionen
  - Checkliste fuer neue Renderer
  - CSS- und Branch-Naming-Konventionen

**Review-Prozess fuer PRs etablieren** - ERLEDIGT
- `.github/pull_request_template.md` erstellt mit Checkliste:
  - Code Quality (ESLint, TypeScript, Layer-Regeln)
  - Testing (Tests, Coverage >= 80%)
  - Accessibility (ARIA, Keyboard-Navigation)
  - Bundle Size
  - Renderer-spezifische Checks
- Branch-Naming: `feature/<issue-nr>-<beschreibung>`

### Prioritaet 2: Code Reviews Phase 2 Renderer

Folgende Issues werden vom Frontend Developer implementiert - du reviewst:

| Issue | Renderer | Komplexitaet | Review-Fokus |
|-------|----------|-------------|--------------|
| #4 | Profile Renderer | Mittel | Import-Referenzen korrekt aufgeloest |
| #5 | Component-Def Renderer | Mittel | Komponenten-Mapping-Darstellung |
| #6 | SSP Renderer | Hoch | Viele Sektionen, Performance |
| #7 | Suchfunktion | Hoch | Generisches Interface, Indexierung |

### Prioritaet 3: Performance-Ueberlegungen - ERLEDIGT

**ADR-005 erstellt** (`docs/architecture/decisions/ADR_005_performance_strategy.md`):
- **Stufe 1 (sofort)**: `useMemo` Pflicht fuer alle Renderer (Maps, Aggregationen, Filter)
- **Stufe 2 (sofort)**: Code Splitting per Dokumenttyp via `lazy()` + `Suspense`
- **Stufe 3 (bei Bedarf)**: Virtual Scrolling mit `@tanstack/react-virtual` (Trigger: >100ms Render)
- Identifiziertes Problem: `GroupTree.countGroupControls()` ohne Memoization
- Identifiziertes Problem: `DocumentViewer` statische Imports → Code Splitting einbauen

---

## Bestehende Code-Struktur (Phase 1)

```
src/
├── types/
│   └── oscal.ts              # Alle OSCAL TypeScript-Interfaces
├── parser/
│   ├── index.ts              # parseOscalDocument() - Haupteinstieg
│   ├── detect.ts             # detectDocumentType(), detectVersion()
│   ├── catalog.ts            # parseCatalog(), countControls()
│   ├── profile.ts            # parseProfile()
│   ├── component-definition.ts  # parseComponentDefinition()
│   └── ssp.ts                # parseSSP()
├── components/
│   ├── document-viewer.tsx   # Router: delegiert an typ-spezifische Views
│   ├── shared/
│   │   ├── metadata-panel.tsx   # Wiederverwendbar fuer alle Dokumenttypen
│   │   └── property-badge.tsx   # PropertyBadge + PropertyList
│   └── catalog/
│       ├── catalog-view.tsx     # Hauptansicht mit Sidebar + Content
│       ├── group-tree.tsx       # Hierarchische Baum-Navigation
│       └── control-detail.tsx   # Control-Detail mit Parts, Params, Links
├── styles/
│   └── base.css              # Alle Styles (~700 Zeilen)
├── app.tsx                   # Hauptapp mit File-Upload + Document-Routing
└── main.tsx                  # Preact-Einstiegspunkt
```

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Architect | Architektur-Entscheidungen abstimmen |
| Frontend Developer | Code Reviews, Coding Standards durchsetzen |
| QA Engineer | Test-Strategie, Coverage-Ziele |
| UI/UX Designer | Komponentenarchitektur neue Renderer |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Tech Lead | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | Tech Lead | Issue #1: ADR-003 + ADR-004 erstellt | Erledigt |
| 2026-02-06 | Architect | Tech Lead | Phase 2 Briefing: Code Review + Standards | Aktiv |
| 2026-02-06 | Tech Lead | Alle | ESLint Layer-Regeln in `.eslintrc.cjs` konfiguriert | Erledigt |
| 2026-02-06 | Tech Lead | Frontend Dev | Coding Standards in `docs/CODING_STANDARDS.md` dokumentiert | Erledigt |
| 2026-02-06 | Tech Lead | Alle | PR-Template in `.github/pull_request_template.md` erstellt | Erledigt |
| 2026-02-06 | Tech Lead | Alle | ADR-005 Performance-Strategie dokumentiert | Erledigt |
