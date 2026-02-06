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

### Prioritaet 1: Code Review & Standards durchsetzen

**ESLint Layer-Regeln konfigurieren**
- Import-Regeln die verhindern, dass `src/types/` oder `src/parser/` aus `src/components/` importieren
- `no-restricted-imports` Regel fuer Layer-Verletzungen
- Empfehlung: `eslint-plugin-import` mit `import/no-restricted-paths`

**TypeScript Patterns fuer neue Renderer**
- Neue Renderer (Profile, CompDef, SSP) muessen dem Catalog-Renderer-Pattern folgen:
  - Eigenes Verzeichnis unter `src/components/<type>/`
  - Hauptkomponente: `<Type>View` (z.B. `ProfileView`)
  - Integration in `DocumentViewer` via neuen `case` im Switch
  - Nutzung von Shared Components (MetadataPanel, PropertyBadge)
- Referenz-Implementation: `src/components/catalog/catalog-view.tsx`

**Review-Prozess fuer PRs etablieren**
- PR-Template erstellen (`.github/pull_request_template.md`)
- Checkliste: Tests, Coverage, Accessibility, Bundle Size
- Branch-Naming-Konvention: `feature/<issue-nr>-<beschreibung>`

### Prioritaet 2: Code Reviews Phase 2 Renderer

Folgende Issues werden vom Frontend Developer implementiert - du reviewst:

| Issue | Renderer | Komplexitaet | Review-Fokus |
|-------|----------|-------------|--------------|
| #4 | Profile Renderer | Mittel | Import-Referenzen korrekt aufgeloest |
| #5 | Component-Def Renderer | Mittel | Komponenten-Mapping-Darstellung |
| #6 | SSP Renderer | Hoch | Viele Sektionen, Performance |
| #7 | Suchfunktion | Hoch | Generisches Interface, Indexierung |

### Prioritaet 3: Performance-Ueberlegungen

- Grosse OSCAL-Dokumente (z.B. NIST 800-53 mit 1000+ Controls) koennen langsam rendern
- Evaluate: `useMemo` fuer teure Berechnungen (bereits in CatalogView genutzt)
- Virtual Scrolling fuer lange Listen (z.B. `@tanstack/virtual`)
- Code Splitting per Dokumenttyp (Vite dynamic imports)

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
