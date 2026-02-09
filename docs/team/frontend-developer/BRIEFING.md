# Frontend Developer - Briefing & Kommunikation

**Rolle**: Frontend Developer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution (Import-Ketten, Cross-Referenzen, Profile Resolution)

---

## Deine Verantwortlichkeiten

- UI-Komponenten fuer alle OSCAL-Dokumenttypen implementieren
- Performance optimieren (grosse OSCAL-Dokumente)
- Unit und Integration Tests schreiben
- Accessibility in Code umsetzen

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

| Issue | Titel | Ergebnis |
|-------|-------|----------|
| #2 | OSCAL Parser | 4 Parser, 43 Tests, 94.78% Coverage, 100% Functions |
| #3 | Catalog Renderer | Hierarchische Navigation, Control-Detail, Shared Components |

## Phase 2 - Zusammenfassung (ABGESCHLOSSEN)

| Issue | Titel | Ergebnis |
|-------|-------|----------|
| #4 | Profile Renderer | Imports, Merge-Strategie, Modifications (Parameter + Alters) |
| #5 | Component-Def Renderer | Sidebar + Detail-Layout, Control-Implementations, Capabilities |
| #6 | SSP Renderer | Tabbed UI (Characteristics, Implementation, Controls), Status-Badges |
| #7 | Suchfunktion | useSearch Hook, per-Typ Indexing, SearchBar mit Live-Filterung |

### Phase 2 Build-Ergebnis
- Bundle: 14.39 KB gzipped (9.96 KB App + 4.43 KB Preact, Budget: < 100KB)
- TypeScript: 0 Errors (strict mode)
- Tests: 70 bestanden (43 Parser + 27 Search)
- Vite Build: 298ms

### Phase 2 Aenderungen im Detail

**Issue #4 - Profile Renderer** [ERLEDIGT]
- `src/components/profile/profile-view.tsx` - 284 Zeilen
- Komponenten: ProfileView, ImportCard, ControlSelection, MergeInfo, ModifySection, SetParameterCard, AlterCard
- Import-Quellen mit Include/Exclude-Tags (farblich kodiert)
- Merge-Strategie-Anzeige (combine, flat, as-is)
- Modifikationen: Parameter-Werte und Alterations mit Remove/Add-Badges
- In `document-viewer.tsx` registriert

**Issue #5 - Component Definition Renderer** [ERLEDIGT]
- `src/components/component-def/component-def-view.tsx` - 201 Zeilen
- Sidebar mit Komponenten-Liste + Typ-Badge (software, hardware, etc.)
- Detail-Ansicht: Beschreibung, Purpose, Properties, Responsible Roles
- Control-Implementations mit Requirement-Cards und Statement-Anzeige
- Capabilities-Sektion mit Incorporates-Referenzen
- In `document-viewer.tsx` registriert

**Issue #6 - SSP Renderer** [ERLEDIGT]
- `src/components/ssp/ssp-view.tsx` - 306 Zeilen
- System-Header mit Name, Status-Badge, Sensitivity-Level
- Tabbed Navigation: Characteristics | Implementation | Controls
- Characteristics: Description, System-IDs, Security Impact Levels (CIA-Grid), Authorization Boundary
- Implementation: Users (mit Roles), Components (mit Typ + Status), Inventory Items
- Controls: Implemented Requirements mit by-component Beschreibungen, Implementation-Status-Badges
- In `document-viewer.tsx` registriert

**Issue #7 - Suchfunktion** [ERLEDIGT]
- `src/hooks/use-search.ts` - 217 Zeilen (Application Layer)
- `src/components/shared/search-bar.tsx` - 67 Zeilen (Presentation Layer)
- Per-Dokumenttyp Indexing: Catalog (Groups+Controls+Prose), Profile (Imports+Alters+Params), CompDef (Components+Requirements), SSP (System+Components+Users+Requirements)
- Case-insensitive Textsuche, Min. 2 Zeichen
- SearchBar in Document-Header integriert (in `app.tsx`)
- Dropdown mit Typ-Badges, Ergebnis-Limit 50, Kontext-Anzeige

**Bugfix**: `vite.config.ts` Path-Alias von `'/src'` zu `resolve(__dirname, 'src')` geaendert (Windows-Kompatibilitaet fuer Vitest)

## UI/UX Overhaul - Zusammenfassung (ABGESCHLOSSEN)

**Commit**: `a567973` | **Bundle**: 20.69 KB gzipped (< 100 KB Limit)

Alle kritischen UI/UX Findings aus Phase 2 wurden behoben + Material Design + Responsive.

### Geaenderte Dateien (dein Code betroffen)

| Datei | Aenderungen |
|-------|-------------|
| `src/styles/base.css` | +21 semantische CSS-Variablen, `--color-surface` Bug-Fix, alle hardcoded Farben ersetzt, Material AppBar, responsive Breakpoints, FAB + Sidebar-Overlay, touch targets, print styles |
| `src/app.tsx` | Skip-Link hinzugefuegt, Header zu Material AppBar umgebaut (Document-Controls in `header-actions`), `id="main-content"` auf `<main>` |
| `src/components/ssp/ssp-view.tsx` | Tab-Array (`tabDefs`), `handleTabKeyDown` fuer Arrow/Home/End, `aria-controls`, `tabIndex`-Roving, `id` auf Tabs und Panels |
| `src/components/shared/search-bar.tsx` | `role="combobox"`, `aria-haspopup="listbox"`, `aria-activedescendant`, ArrowUp/Down/Escape Handler, aktives Highlighting |
| `src/components/catalog/catalog-view.tsx` | `sidebarOpen` State, `handleControlSelect` (schliesst Sidebar), FAB-Button, Backdrop-Overlay |
| `src/components/component-def/component-def-view.tsx` | `sidebarOpen` State, `handleComponentSelect` (schliesst Sidebar), FAB-Button, Backdrop-Overlay |
| `index.html` | Google Fonts Link (Source Sans 3) |

### Neue Patterns (fuer kuenftige Entwicklung beachten)

1. **Sidebar Toggle Pattern**: `useState(false)` + FAB-Button (nur mobile via CSS `display: none/flex`) + `.sidebar-backdrop` + `.open` Klasse auf Sidebar
2. **CSS-Variablen statt hardcoded Farben**: Immer `var(--color-...)` nutzen, nie direkte Hex-Werte ausserhalb `:root`
3. **WAI-ARIA Tabs Pattern**: `tabDefs`-Array, `handleTabKeyDown`, `aria-controls`, `tabIndex`-Roving
4. **Material Transitions**: `cubic-bezier(0.4, 0, 0.2, 1)` statt `ease`
5. **Touch Targets**: `min-height: 44px` auf interaktiven Elementen (mobile)

---

## Aktuelle Code-Struktur

```
src/
├── types/
│   └── oscal.ts                 # Alle OSCAL TypeScript-Interfaces
├── parser/
│   ├── index.ts                 # parseOscalDocument() - Haupteinstieg
│   ├── detect.ts                # Erkennung: Typ + Version
│   ├── catalog.ts               # parseCatalog(), countControls()
│   ├── profile.ts               # parseProfile()
│   ├── component-definition.ts  # parseComponentDefinition()
│   └── ssp.ts                   # parseSSP()
├── hooks/
│   └── use-search.ts            # useSearch() Hook + buildIndex()
├── components/
│   ├── document-viewer.tsx      # Router - alle 4 Typen registriert
│   ├── shared/
│   │   ├── metadata-panel.tsx   # <MetadataPanel metadata={...} />
│   │   ├── property-badge.tsx   # <PropertyBadge> + <PropertyList>
│   │   └── search-bar.tsx       # <SearchBar> mit Dropdown-Ergebnissen
│   ├── catalog/
│   │   ├── catalog-view.tsx     # Catalog: Sidebar + Detail
│   │   ├── group-tree.tsx       # Baum-Navigation
│   │   └── control-detail.tsx   # Control-Detail mit Parts/Params
│   ├── profile/
│   │   └── profile-view.tsx     # Profile: Imports, Merge, Modify
│   ├── component-def/
│   │   └── component-def-view.tsx  # CompDef: Sidebar + Detail
│   └── ssp/
│       └── ssp-view.tsx         # SSP: Tabbed (Chars, Impl, Controls)
├── styles/
│   └── base.css                 # Alle Styles (~2170 Zeilen)
├── app.tsx                      # Hauptapp mit Search-Integration
└── main.tsx
tests/
├── parser.test.ts               # 43 Parser-Tests
└── search.test.ts               # 27 Search-Indexing-Tests
```

---

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Tech Lead | Code Reviews, Coding Standards |
| UI/UX Designer | Komponentenspezifikation, Design-Umsetzung |
| QA Engineer | Test-Strategie, Testdaten |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Frontend Developer | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | Frontend Developer | Issue #2: Parser komplett (4 Typen, 43 Tests) | Erledigt |
| 2026-02-06 | Architect | Frontend Developer | Issue #3: Catalog Renderer komplett | Erledigt |
| 2026-02-06 | Architect | Frontend Developer | Phase 2 Briefing: Issues #4-#7 | Erledigt |
| 2026-02-06 | Frontend Developer | Architect | Phase 2 komplett: alle 4 Issues implementiert, 70 Tests, 14.39 KB Bundle | Erledigt |
| 2026-02-06 | Architect | Frontend Developer | UI/UX Overhaul: Material Design, a11y, Responsive (Commit a567973). Neue Patterns beachten: CSS-Variablen, Sidebar-Toggle, ARIA Tabs | Info |
| 2026-02-06 | Architect | Frontend Developer | UX Redesign: Full-Width Layout + Sticky Sidebar (CSS-only, keine TSX-Aenderungen). Neues Layout-Pattern beachten | Info |
| 2026-02-07 | Architect | Frontend Developer | Stakeholder-Feedback: 3 Aufgaben (S1: Nav-Titel, S2: Part-Akkordions, S3: IFG/BITV). Details im Abschnitt "AKTUELLER AUFTRAG" | Erledigt |
| 2026-02-07 | Frontend Developer | Architect | Stakeholder-Feedback komplett: S1 CSS-only, S2 PartView rekursiv, S3 lang+aria-live. 390 Tests, 14.20 KB JS + 6.36 KB CSS | Erledigt |
| 2026-02-07 | Architect | Frontend Developer | Phase 3 Briefing: Issues #8-#10 (PWA, Doku, npm Package). Details im Abschnitt "AKTUELLER AUFTRAG Phase 3" | Aktiv |
| 2026-02-07 | QA Engineer | Frontend Dev | AKTION: Code-Kommentierungs-Audit — Bestehenden Code nachkommentieren. Prio 1 SOFORT: Hooks (use-search, use-deep-link, use-filter). Prio 2: Komplexe Components (app.tsx, catalog-view, group-tree, control-detail, ssp-view). Prio 3: Shared+Types. Details: `docs/team/qa-engineer/BRIEFING.md` Abschnitt "Code-Kommentierungs-Audit" Empfehlung E2 | Erledigt |
| 2026-02-08 | QA Engineer | Frontend Dev | Re-Audit: E2 Prio 1 ERLEDIGT (Hooks 9.8%), E2 Prio 3 ERLEDIGT (Shared 9.2%). **OFFEN: profile-view.tsx (302 LOC, 0%) + component-def-view.tsx (297 LOC, 0%) + ssp-view.tsx Helper (3 Stk.)** — Blocker fuer Gesamtquote >= 8% | Erledigt |
| 2026-02-08 | QA Engineer | Frontend Dev | Audit ABGESCHLOSSEN: Alle Kommentierungsaufgaben erledigt. profile-view 5.2%, component-def-view 5.0%. Gesamtnote A- (7.1%) | Abgeschlossen |
| 2026-02-09 | QA Engineer | Frontend Dev | **Phase 4a QA-Report — Finding F1 (HOCH)**: LinkBadge (`src/components/shared/link-badge.tsx`) fehlt `aria-label` gemaess CODING_STANDARDS v5.0.0 Sektion 12.4 Regel 4. Fix: `<span aria-label={label} ...>`. 531 Tests bestanden, 29 axe-core Tests (inkl. 2 neue LinkBadge). HrefParser 18/18 Tests PASS. Details: `docs/team/qa-engineer/BRIEFING.md` Abschnitt "Phase 4a QA-Report" | Offen |

---

## UX Redesign: Full-Width Layout + Sticky Sidebar (ABGESCHLOSSEN)

**Typ**: Reines CSS-Refactoring | **Datei**: `src/styles/base.css` | **TSX-Aenderungen**: Keine

Der UI/UX Designer hat nach Vergleich mit viewer.oscal.io ein Full-Width Layout umgesetzt.

### Was sich geaendert hat (nur CSS)

| Bereich | Vorher | Nachher |
|---------|--------|---------|
| `.main` | `padding: 2rem`, `align-items: center` | `padding: 0`, `align-items: stretch` |
| `.document-view` | `max-width: 1200px` | `width: 100%` (kein max-width) |
| `.catalog-layout` | `gap: 1rem`, `min-height: 60vh` | `gap: 0`, `min-height: calc(100vh - 64px)`, Full-Bleed |
| `.catalog-sidebar` | `border`, `border-radius`, `max-height: 75vh` | `position: sticky`, `top: 64px`, `height: calc(100vh - 64px)` |
| `.catalog-content` | `border`, `border-radius`, Container-Scroll | `padding: 2rem 2.5rem`, natuerlicher Page-Scroll |
| `.compdef-*` | Analog boxed | Analog Full-Width + Sticky |
| `.profile-view` | Kein eigenes Padding | `padding: 1.5rem 2.5rem` |
| `.ssp-view` | Kein eigenes Padding | `padding: 1.5rem 2.5rem` |
| `.metadata-panel` | `border: 1px solid`, `border-radius` | `border-bottom` only (subtle Divider) |

### Neue Layout-Patterns (fuer kuenftige Entwicklung)

1. **Full-Width statt boxed**: Kein `max-width` auf `.document-view`, Inhalte nutzen vollen Viewport
2. **Sticky Sidebar**: `position: sticky`, `top: 64px` (Header-Hoehe), `height: calc(100vh - 64px)`
3. **Full-Bleed Grids**: Negative Margins + `width: calc(100% + 5rem)` fuer Rand-zu-Rand Layouts
4. **Page Scroll statt Container Scroll**: Content scrollt mit der Seite (kein `overflow-y: auto`)
5. **Borderless Desktop**: Subtile Divider (`border-right`, `border-bottom`) statt Box-Borders

### Build-Ergebnis

- Bundle: 10.71 KB JS + 5.59 KB CSS gzipped (kein Logik-Impact)
- Tests: 254/254 bestanden (keine Regressionen)

---

## UI/UX Designer Aufgaben - Sprint 1 (ABGESCHLOSSEN)

Umsetzung der Frontend-Aufgaben (FE1-FE12) aus dem UI/UX Designer Briefing.

### Umgesetzte Aufgaben

| ID | Aufgabe | Ergebnis |
|----|---------|----------|
| FE1 | Shared Accordion-Komponente | `src/components/shared/accordion.tsx` - WAI-ARIA Pattern, `headingLevel` Prop, count Badge |
| FE2 | Title Box in Sidebars | CatalogView + CompDefView: `.nav-title-box` mit Doc-Type, Title, Version |
| FE3 | Catalog ControlDetail Accordions | Content (defaultOpen), Parameters, Links, Control Enhancements - je mit h3 Heading |
| FE4 | CompDef Detail Accordions | Control Implementations per CI als Accordion mit Source-Titel + Requirement-Count |
| FE5 | Content-Boxes | CompDef: Description, Properties, Roles; SSP: Impact Level, Auth Boundary |
| FE9 | Search Debounce | 200ms Debounce via `useRef`/`useEffect`/`setTimeout` in `useSearch` Hook |
| FE12 | Prose max-width | Bereits in CSS (`max-width: 80ch` an 6 Stellen) |

### Neue/geaenderte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/shared/accordion.tsx` | **NEU** - Shared Accordion + AccordionGroup |
| `src/components/catalog/control-detail.tsx` | Sections → Accordions mit `headingLevel={3}` |
| `src/components/catalog/catalog-view.tsx` | Nav Title Box hinzugefuegt |
| `src/components/component-def/component-def-view.tsx` | Nav Title Box, Content-Boxes, CI Accordions |
| `src/components/ssp/ssp-view.tsx` | Content-Boxes mit h3 Headings (korrekte Hierarchie) |
| `src/hooks/use-search.ts` | 200ms Debounce mit `debouncedQuery` + `timerRef` |

### Build-Ergebnis

- Bundle: 11.11 KB JS + 6.01 KB CSS gzipped
- TypeScript: 0 Errors
- Tests: 254/254 bestanden (inkl. axe-core a11y)

---

## UI/UX Designer Aufgaben - Sprint 2 (ABGESCHLOSSEN)

Umsetzung der verbleibenden Frontend-Aufgaben aus dem UI/UX Designer Briefing.

### Umgesetzte Aufgaben

| ID | Aufgabe | Ergebnis |
|----|---------|----------|
| FE3b | CompDef CI-Accordions headingLevel | `headingLevel={3}` ergaenzt (Review R2 Quick-Fix) |
| FE5b | Profile View Content-Boxes + Accordions | Imports/Params/Alters als Accordions, Merge als Content-Box |
| FE6 | Deep-Linking (URL-Hash Routing) | `useDeepLink` Hook, Schema `#/{view}/{id}`, CatalogView + CompDefView + SspView integriert |
| FE8 | Copy-to-Clipboard | `CopyLinkButton` Shared Component, in ControlDetail Header integriert |
| FE10 | Status-Icons | `StatusBadge` Shared Component mit SVG-Icons (8 Zustaende), SSP-View integriert |
| FE11 | Roving Tabindex + aria-level | WAI-ARIA TreeView Pattern, Arrow/Home/End Navigation, `aria-level` auf allen Treeitems |

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/hooks/use-deep-link.ts` | Application Layer Hook: URL-Hash lesen/schreiben, `hashchange`-Listener |
| `src/components/shared/copy-link-button.tsx` | Button mit `navigator.clipboard.writeText()`, visuelles Feedback (Checkmark 2s) |
| `src/components/shared/status-badge.tsx` | SVG-Icon + Text Badge, 8 Status-Zustaende (operational, planned, etc.) |

### Geaenderte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/catalog/catalog-view.tsx` | `useDeepLink('catalog')` statt `useState` fuer selectedControlId |
| `src/components/catalog/control-detail.tsx` | `CopyLinkButton` im Control-Header |
| `src/components/catalog/group-tree.tsx` | Roving Tabindex (`tabIndex={-1}` + `useEffect`/`onFocus`), Arrow-Key Navigation, `aria-level` |
| `src/components/component-def/component-def-view.tsx` | `useDeepLink('compdef')`, `headingLevel={3}` auf CI-Accordion |
| `src/components/profile/profile-view.tsx` | Sections als Accordions (Imports, Params, Alters), Merge als Content-Box |
| `src/components/ssp/ssp-view.tsx` | `useDeepLink('ssp')` fuer Tab-Persistenz, `StatusBadge` statt hardcoded Spans |
| `src/app.tsx` | Hash-Cleanup beim Laden neuer Dokumente |
| `src/styles/base.css` | CSS fuer StatusBadge (Varianten + Icons) + CopyLinkButton |

### Build-Ergebnis

- Bundle: 12.59 KB JS + 6.20 KB CSS gzipped
- TypeScript: 0 Errors
- Tests: 254/254 bestanden (inkl. axe-core a11y)
- Test-Fix: `beforeEach` Hash-Cleanup in 3 Testdateien (useDeepLink Hash-Persistenz)

---

## UI/UX Designer Aufgaben - Sprint 3 (ABGESCHLOSSEN)

Umsetzung der verbleibenden Frontend-Aufgaben aus dem UI/UX Designer Briefing (Gap-Analyse).

### Umgesetzte Aufgaben

| ID | Aufgabe | Ergebnis |
|----|---------|----------|
| R6 | URL-Hash Cleanup | "Load another file" Button setzt `history.replaceState` (Hash entfernt) |
| FE17 | Search-Result Navigation | `onSelect` Callback in SearchBar, `handleSearchSelect` in App, Deep-Linking per `location.hash` |
| FE15 | AccordionGroup Expand/Collapse All | Preact Context-Signal-Pattern, "Expand all"/"Collapse all" Buttons in AccordionGroup |
| FE16 | Accordion Session-Persist | `sessionStorage` Key `accordion-{id}`, Open/Close State bleibt bei Reload erhalten |
| FE7 | Filter-Komponente (Sidebar, Chip-Bar) | `useFilter` Hook, `FilterBar` Component, Catalog (Family+Keyword), CompDef (Type+Keyword) |

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/hooks/use-filter.ts` | Application Layer Hook: Keyword + Chip State, addChip/removeChip/clearAll |
| `src/components/shared/filter-bar.tsx` | FilterBar mit Input, Category-Selects, Chips, Clear-All Button |
| `tests/hooks/use-filter.test.ts` | 7 Tests fuer useFilter Hook |
| `tests/components/filter-bar.test.tsx` | 11 Tests fuer FilterBar Component |

### Geaenderte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/shared/accordion.tsx` | Preact Context fuer Expand/Collapse Signals, `sessionStorage` Persistenz |
| `src/components/shared/search-bar.tsx` | `onSelect` Prop, `handleSelect`, Enter-Key + Click Handler |
| `src/components/catalog/catalog-view.tsx` | FilterBar in Sidebar, `filterGroups`/`filterControlList` Hilfsfunktionen |
| `src/components/component-def/component-def-view.tsx` | FilterBar in Sidebar, Type-Kategorien, Keyword-Filter auf Components |
| `src/app.tsx` | `handleSearchSelect` Callback, Hash-Cleanup bei "Load another file" |
| `src/styles/base.css` | CSS fuer FilterBar (`.filter-bar`, `.filter-chip`, `.filter-clear-all`) |
| `tests/components/shared.test.tsx` | +5 AccordionGroup Tests, +5 Session-Persist Tests, `sessionStorage.clear()` |
| `tests/components/component-def-view.test.tsx` | Anpassung "renders type badges" (getAllBy wegen Filter-Select) |

### Build-Ergebnis

- Bundle: 14.11 KB JS + 6.28 KB CSS gzipped
- TypeScript: 0 Errors
- Tests: 350/350 bestanden (96 neue Tests seit Sprint 2)
- Neue Gaps geschlossen: G8 (Filter), G15 (Expand All), G16 (Session-Persist)

### Offene FE-Aufgaben

Alle FE-Aufgaben aus dem UI/UX Designer Briefing sind umgesetzt. Verbleibend im Backlog:
- G9: Nav Pane breiter + resizable (Backlog)
- G11: Loading State / Skeleton Screens (Backlog)
- G17: Virtualisierung fuer grosse Dokumente (Backlog)

---

## AKTUELLER AUFTRAG: Stakeholder-Feedback (2026-02-07)

**Prioritaet**: HOCH | **Quelle**: Fachverantwortliche nach Review der Live-Version
**Gesamtbewertung**: "Geht absolut in die richtige Richtung"

Die Fachverantwortlichen haben 3 Verbesserungswuensche identifiziert:

---

### Aufgabe S1: Navigation — Gesamttitel sichtbar machen [HOCH]

**Problem**: Navigationstitel werden einzeilig dargestellt und bei langen Titeln abgeschnitten (`text-overflow: ellipsis`). Der vollstaendige Titel soll in jedem Eintrag sichtbar sein.

**Betroffene Stellen**:

| Datei | CSS-Klasse | Aktuell | Aenderung |
|-------|-----------|---------|-----------|
| `base.css` | `.tree-group-title` (Zeile ~917-922) | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | `white-space: normal; word-wrap: break-word; overflow: visible` |
| `base.css` | `.tree-control-title` (Zeile ~998-1002) | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | `white-space: normal; word-wrap: break-word; overflow: visible` |
| `base.css` | `.compdef-component-title` (Zeile ~1554-1558) | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | `white-space: normal; word-wrap: break-word; overflow: visible` |

**TSX-Aenderungen**: Vermutlich keine noetig (reines CSS).

**Layout-Anpassungen**:
- `.tree-group-header` und `.tree-control-btn`: `align-items: center` → `align-items: flex-start` (damit Chevron/ID oben bleibt bei mehrzeiligen Titeln)
- `.tree-control-row`: eventuell `align-items: flex-start` statt `center`
- Min-Height beibehalten fuer Touch-Targets (44px mobile)
- Padding-Unterseite pruefen fuer visuellen Abstand zwischen Eintraegen

**Risiko**: Niedrig (CSS-only, keine Logik-Aenderungen)

---

### Aufgabe S2: Parts als verschachtelte Akkordions [HOCH]

**Problem**: Parts innerhalb von Controls werden aktuell als flache `<div>`-Elemente gerendert (`PartView` in `control-detail.tsx`). Die Fachverantwortlichen wuenschen eine rekursive Accordion-Struktur:

```
Control (Accordion — bereits vorhanden: "Content")
└── Part: Statement (Accordion)
    └── Part: Item a (Accordion)
    └── Part: Item b (Accordion)
        └── Part: Sub-Item (Accordion)
└── Part: Guidance (Accordion)
└── Part: Assessment Objective (Accordion)
```

**Betroffene Datei**: `src/components/catalog/control-detail.tsx`

**Aktuelle Implementierung** (Zeile 138-163):
```tsx
const PartView: FunctionComponent<PartViewProps> = ({ part, depth = 0 }) => {
  // Rendert als flache <div>, NICHT als Accordion
  // Rekursive Sub-Parts ebenfalls als <div>
}
```

**Gewuenschte Implementierung**:
```tsx
const PartView: FunctionComponent<PartViewProps> = ({ part, depth = 0 }) => {
  const partLabel = formatPartName(part.name)
  const title = part.title ?? partLabel
  const hasContent = !!(part.prose || part.props?.length || part.parts?.length || part.links?.length)

  // headingLevel: h4 fuer depth=0, h5 fuer depth=1, h6 fuer depth=2, max h6
  const headingLevel = Math.min(4 + depth, 6) as 4 | 5 | 6

  // Kein Titel und kein verschachtelter Inhalt → flach rendern (z.B. "item" Parts)
  if (!title && !part.parts?.length) {
    return (
      <div class="part-view part-inline">
        {part.prose && <div class="part-prose">{part.prose}</div>}
      </div>
    )
  }

  return (
    <Accordion
      id={`${part.id ?? part.name}-${depth}`}
      title={title || part.name}
      count={part.parts?.length}
      defaultOpen={depth === 0}  // Top-Level Parts offen
      headingLevel={headingLevel}
    >
      {part.prose && <div class="part-prose">{part.prose}</div>}
      {part.props && part.props.length > 0 && <PropertyList props={part.props} />}
      {part.links && part.links.length > 0 && (
        <ul class="links-list">
          {part.links.map((link, i) => (
            <li key={`${link.href}-${i}`}>
              <a href={link.href} rel="noopener noreferrer">{link.text ?? link.href}</a>
            </li>
          ))}
        </ul>
      )}
      {part.parts && part.parts.length > 0 && (
        <div class="part-children">
          {part.parts.map((child, i) => (
            <PartView key={child.id ?? `${child.name}-${i}`} part={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </Accordion>
  )
}
```

**Heading-Hierarchie-Limit**:
- Control-Header: `<h2>`
- Content-Accordion: `<h3>` (bestehend)
- Part depth=0: `<h4>` (Statement, Guidance, Assessment)
- Part depth=1: `<h5>` (Items a, b, c)
- Part depth=2+: `<h6>` (Sub-Items — max HTML-Level)
- Tiefer als h6: weiterhin h6 verwenden (HTML-Limit)

**Accordion-Verhalten**:
- Top-Level Parts (depth=0): `defaultOpen={true}` (z.B. Statement)
- Sub-Parts (depth>0): `defaultOpen={false}` (collapsed)
- Session-Persist ueber bestehende Accordion-Logik (sessionStorage)
- Parts ohne Titel (z.B. `name="item"` mit leerer formatPartName) als flacher Content rendern

**ID-Schema fuer Accordion**: `{partId ?? partName}-{depth}` — muss innerhalb eines Controls eindeutig sein

**Risiko**: Mittel (rekursive Komponentenlogik, Heading-Hierarchie beachten)

---

### Aufgabe S3: Barrierefreiheit / IFG-Konformitaet [HOCH]

**Hintergrund**: Die Loesung soll konform zum **Informationsfreiheitsgesetz (IFG)** sein. Das bedeutet Einhaltung der **BITV 2.0** (Barrierefreie-Informationstechnik-Verordnung), die auf **WCAG 2.1 AA** und **EN 301 549** basiert.

**Aktueller Stand**: Viele a11y-Anforderungen sind bereits umgesetzt (Skip-Link, Focus-Visible, ARIA Tabs/Combobox/TreeView, axe-core Tests). Folgende Luecken muessen geschlossen werden:

| # | Anforderung | WCAG | Aktueller Stand | Aenderung |
|---|-------------|------|-----------------|-----------|
| A1 | `lang`-Attribut auf `<html>` | 3.1.1 | Nicht gesetzt | `lang="en"` in `index.html` setzen |
| A2 | Heading-Hierarchie konsistent | 1.3.1 | Teilweise — Parts haben `<h4>` ohne umschliessenden `<h3>` in manchen Faellen | Durch Part-Accordions (S2) behoben |
| A3 | ARIA Landmarks vollstaendig | 1.3.1 | `<main>`, `<nav>`, `<header>` vorhanden, `<aside>` vorhanden | Pruefen: `role="banner"` auf Header, `<footer>` oder `role="contentinfo"` falls noetig |
| A4 | Kontrast-Pruefung alle Farb-Tokens | 1.4.3 | 31 Token definiert, Dark Mode vorhanden | Systematische Kontrastpruefung aller Text-auf-Hintergrund Kombinationen |
| A5 | Tastatur-Zugang vollstaendig | 2.1.1 | TreeView, Tabs, Combobox, Accordion — alle mit Keyboard | Nested Accordions: Enter/Space zum Oeffnen, Tab-Reihenfolge logisch |
| A6 | Status-Aenderungen kommuniziert | 4.1.3 | StatusBadge hat `aria-hidden` auf Icon | Clipboard-Feedback: `aria-live="polite"` Region ergaenzen |
| A7 | Fehler-Identifikation | 3.3.1 | Error-State mit `role="alert"` | Bereits konform |

**Umsetzung**:
1. `lang="en"` in `index.html` auf `<html>` Tag setzen (1 Zeile)
2. Nested Accordion Heading-Hierarchie durch S2 sicherstellen
3. `aria-live="polite"` auf CopyLinkButton Feedback
4. Systematische Kontrast-Pruefung mit dem QA Engineer abstimmen

**Risiko**: Niedrig (additive ARIA-Attribute, keine Logik-Aenderungen)

---

### Umsetzungsreihenfolge

| # | Aufgabe | Geschaetzter Aufwand | Abhaengigkeit |
|---|---------|---------------------|---------------|
| 1 | S1: Navigation Titel (CSS) | Klein | Keine |
| 2 | S2: Parts als Akkordions (TSX) | Mittel | Keine |
| 3 | S3: IFG/BITV a11y-Fixes | Klein | S2 (Heading-Hierarchie) |

### Build-Erwartung

- Bundle-Impact: ~0.2 KB gzipped (CSS-Aenderungen + PartView-Refactor)
- Tests: Bestehende 350 Tests muessen bestehen, neue Tests fuer nested Parts
- axe-core: 0 neue Violations

---

## Stakeholder-Feedback - Zusammenfassung (ABGESCHLOSSEN)

| Aufgabe | Ergebnis |
|---------|----------|
| S1: Navigation Multi-Line | CSS-only: `white-space: normal`, `align-items: flex-start` |
| S2: Nested Part Accordions | PartView rekursiv mit Accordion, h4→h5→h6, dotted border |
| S3: IFG/BITV 2.0 | `lang="en"`, `aria-live="polite"`, Kontrast-Audit 22/22 PASS |

**Build**: 14.20 KB JS + 6.36 KB CSS gzipped | 390 Tests | Commit: `e2c8f28`

---

## AKTUELLER AUFTRAG: Phase 3 (2026-02-07)

**Prioritaet**: HOCH | **Issues**: #8, #9, #10
**Aktueller Stand**: 14.20 KB JS + 6.36 KB CSS gzipped, 390 Tests, 0 TS Errors

Phase 3 umfasst 3 Issues mit jeweils Frontend-relevanten Aufgaben:

---

### Issue #8: Progressive Web App (PWA) [HOCH]

**Ziel**: OSCAL Viewer als installierbare Offline-PWA bereitstellen.

**Hintergrund**: In `index.html` werden `manifest.json` und `favicon.svg` bereits referenziert, aber die Dateien existieren noch nicht. Es gibt keinen Service Worker und keine Offline-Faehigkeit.

#### Aufgabe FE-P1: PWA Manifest erstellen [HOCH]

**Datei**: `public/manifest.json` (NEU)

```json
{
  "name": "OSCAL Viewer",
  "short_name": "OSCAL",
  "description": "Browser-based viewer for NIST OSCAL documents",
  "start_url": "/oscal-viewer/",
  "display": "standalone",
  "background_color": "#fafafa",
  "theme_color": "#1a365d",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Hinweis**: `start_url` muss den Vite `base`-Pfad `/oscal-viewer/` verwenden (GitHub Pages).

#### Aufgabe FE-P2: App Icons erstellen [MITTEL]

- `public/favicon.svg` — SVG-Icon (wird bereits in index.html referenziert)
- `public/icons/icon-192.png` — 192x192 PNG
- `public/icons/icon-512.png` — 512x512 PNG
- `public/icons/icon-maskable-512.png` — 512x512 mit Safe Zone fuer Maskable

**Design-Vorgabe**: Abstimmung mit UI/UX Designer. Vorschlag: Stilisiertes OSCAL-Logo oder Dokument-Symbol in `--color-primary` (#1a365d).

#### Aufgabe FE-P3: Service Worker mit vite-plugin-pwa [HOCH]

**Dependency**: `vite-plugin-pwa` (Dev-Dependency)

**Datei**: `vite.config.ts` — Plugin hinzufuegen

```ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts-stylesheets' }
        }, {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } }
        }]
      },
      manifest: false // Wir nutzen unsere eigene manifest.json
    })
  ]
})
```

**Caching-Strategie**:
- **App Shell** (JS, CSS, HTML): Precache (beim Install)
- **Google Fonts**: StaleWhileRevalidate (Stylesheets) + CacheFirst (Webfonts)
- **OSCAL-Dateien**: Werden NICHT gecacht (der User laedt eigene Dateien lokal)

#### Aufgabe FE-P4: Offline-UI [MITTEL]

- Pruefen ob `navigator.onLine` verfuegbar
- Bei Offline: Info-Banner "You are offline. Previously loaded documents are still available."
- Kein harter Fehler — die App funktioniert vollstaendig offline (keine Backend-Calls)

#### Aufgabe FE-P5: PWA Update-Benachrichtigung [NIEDRIG]

- Bei `vite-plugin-pwa` `registerType: 'autoUpdate'` wird der SW automatisch aktualisiert
- Optional: Toast-Nachricht "New version available. Reload to update."

**Layer-Konformitaet**: Alle Aenderungen im Presentation Layer (Components) und Build Config. Kein Domain/Application Layer betroffen.

---

### Issue #9: Dokumentation [MITTEL]

Doku-Aufgaben mit Frontend-Relevanz:

#### Aufgabe FE-D1: CONTRIBUTING.md Code-Beispiele [MITTEL]

- README.md verlinkt auf `CONTRIBUTING.md`, aber die Datei fehlt
- Frontend-relevanter Inhalt: "How to add a new OSCAL renderer" mit Verweis auf CODING_STANDARDS.md
- Komponentenstruktur, Props-Interface, Datei-Konvention
- Keine TSX-Aenderung, nur Doku

#### Aufgabe FE-D2: Inline-Kommentare pruefen [NIEDRIG]

- Shared Components (`accordion.tsx`, `filter-bar.tsx`, `copy-link-button.tsx`) haben gute JSDoc
- Hooks (`useSearch`, `useDeepLink`, `useFilter`) pruefen: Sind Eingabe/Ausgabe dokumentiert?
- Parser: Bereits gut dokumentiert

---

### Issue #10: npm Package [HOCH]

**Ziel**: Parser und Types als wiederverwendbares npm-Paket `@open-gov-group/oscal-parser` veroeffentlichen.

#### Aufgabe FE-N1: Package Exports definieren [HOCH]

**Betroffene Dateien**: `src/types/oscal.ts`, `src/parser/*.ts`

- Neuen Entry-Point erstellen: `src/lib/index.ts`
- Exports: Alle Types + alle Parser-Funktionen + `parseOscalDocument`
- Kein Preact-Import im Package (reines TypeScript)

```ts
// src/lib/index.ts
export type { Catalog, Profile, ComponentDefinition, SystemSecurityPlan, ... } from '@/types/oscal'
export { parseOscalDocument } from '@/parser'
export { parseCatalog } from '@/parser/catalog'
export { parseProfile } from '@/parser/profile'
export { parseComponentDefinition } from '@/parser/component-definition'
export { parseSSP } from '@/parser/ssp'
export { detectDocumentType, detectVersion } from '@/parser/detect'
```

#### Aufgabe FE-N2: Sicherstellen dass Parser Framework-unabhaengig bleiben [HOCH]

- `src/types/oscal.ts`: Nur TypeScript Interfaces — OK
- `src/parser/*.ts`: Pruefen ob Preact-Imports vorhanden sind — sollten NICHT sein
- `src/parser/index.ts`: Nur Types + reine Funktionen — OK
- Layer-Architektur garantiert: Domain Layer (types/, parser/) importiert nie aus hooks/ oder components/

**Risiko**: Niedrig — ESLint Layer-Regeln verhindern bereits unerlaubte Imports.

---

### Umsetzungsreihenfolge

| # | Aufgabe | Issue | Geschaetzter Aufwand | Abhaengigkeit |
|---|---------|-------|---------------------|---------------|
| 1 | FE-P1: manifest.json | #8 | Klein | Keine |
| 2 | FE-P2: App Icons | #8 | Klein | UI/UX Designer |
| 3 | FE-P3: vite-plugin-pwa | #8 | Mittel | FE-P1 |
| 4 | FE-P4: Offline-UI | #8 | Klein | FE-P3 |
| 5 | FE-N1: Package Exports | #10 | Mittel | Keine |
| 6 | FE-N2: Parser-Unabhaengigkeit | #10 | Klein | FE-N1 |
| 7 | FE-D1: CONTRIBUTING.md | #9 | Klein | Keine |
| 8 | FE-P5: PWA Update Toast | #8 | Klein | FE-P3 |

### Build-Erwartung Phase 3

- Bundle-Impact PWA: ~0 KB (Service Worker wird separat generiert von vite-plugin-pwa)
- Bundle-Impact npm: ~0 KB (nur Build-Config, kein neuer App-Code)
- Neue Dev-Dependency: `vite-plugin-pwa`
- Tests: 390 bestehende Tests muessen bestehen + neue PWA-Tests
- Budget: 14.20 KB JS + 6.36 KB CSS → weiterhin weit unter 100 KB

---

## NEUER AUFTRAG: Phase 4 — OSCAL Resolution (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: OSCAL Expert Briefing via Hauptprogrammleitung
**Referenz-Dokument**: `docs/architecture/OSCAL_IMPORT_GUIDE.md`
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang. "Web"-App (PWA bleibt).

### Kontext

OSCAL-Dokumente bilden eine **hierarchische Referenzkette**:

```
SSP → Profile → Catalog(e)
       ↕              ↕
 Component-Defs    Cross-Refs
```

Der Viewer muss diese Kette clientseitig aufloesen koennen. Es wird ein neuer `src/services/` Ordner im Domain Layer eingefuehrt (reine Funktionen, kein Preact).

### Neue Verzeichnisstruktur

```
src/
├── types/                       # Domain: Interfaces (bestehend)
├── parser/                      # Domain: Dokumentverarbeitung (bestehend)
├── services/                    # Domain: Resolution & Caching (NEU)
│   ├── href-parser.ts           #   HREF-Typ-Erkennung (4 Patterns)
│   ├── document-cache.ts        #   Cache fuer geladene Dokumente
│   └── resolver.ts              #   Resolution Service
├── hooks/                       # Application: State & Logik (bestehend)
│   ├── use-search.ts            #   (bestehend)
│   ├── use-deep-link.ts         #   (bestehend)
│   ├── use-filter.ts            #   (bestehend)
│   └── use-resolver.ts          #   NEU: Hook-Wrapper fuer ResolutionService
├── components/                  # Presentation: UI (bestehend)
│   ├── shared/
│   │   ├── link-badge.tsx       #   NEU: Link-Relation Badges
│   │   └── import-panel.tsx     #   NEU: Import-Visualisierung
│   └── ...
└── ...
```

---

### Sub-Phase 4a: MVP — Catalog Enhancement

#### FE-R1: HrefParser (`src/services/href-parser.ts`) [HOCH]

Reine Funktion zur Erkennung der 4 HREF-Patterns:

```typescript
type HrefType = 'relative' | 'fragment' | 'absolute-url' | 'urn'

interface ParsedHref {
  type: HrefType
  path: string           // Dateipfad oder URL
  fragment?: string      // Control-ID nach #
  isResolvable: boolean  // URNs sind nicht aufloesbar
}

function parseHref(href: string): ParsedHref {
  if (href.startsWith('urn:'))
    return { type: 'urn', path: href, isResolvable: false }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    const [path, fragment] = href.split('#')
    return { type: 'absolute-url', path, fragment, isResolvable: true }
  }

  if (href.startsWith('#'))
    return { type: 'fragment', path: '', fragment: href.slice(1), isResolvable: true }

  const [path, fragment] = href.split('#')
  return { type: 'relative', path, fragment, isResolvable: true }
}
```

**Layer**: Domain (keine Preact-Imports!)
**Tests**: Mindestens 4 Tests (einer pro Pattern) + Edge Cases

---

#### FE-R2: Fragment-ID Aufloesung in Catalog [MITTEL]

Bestehende Links in `control-detail.tsx` (`links[]` mit `href="#CONTROL-ID"`) klickbar machen:

- `parseHref(link.href)` aufrufen
- Bei `type: 'fragment'` → Deep-Link setzen: `location.hash = /catalog/${fragment}`
- Bei `type: 'absolute-url'` → `<a>` mit `target="_blank"` (externer Link)
- Bei `type: 'urn'` → Nur als Label anzeigen (nicht klickbar)

**Betroffene Datei**: `src/components/catalog/control-detail.tsx` (Links-Sektion, ca. Zeile 54-72)

---

#### FE-R3: Link-Relation Badges (`src/components/shared/link-badge.tsx`) [MITTEL]

Neue Shared Component fuer `links[].rel` Werte:

```tsx
interface LinkBadgeProps {
  rel: string
}

const REL_STYLES: Record<string, { label: string; className: string }> = {
  'implements': { label: 'Implementiert', className: 'link-badge--implements' },
  'required': { label: 'Erforderlich', className: 'link-badge--required' },
  'related-control': { label: 'Verwandt', className: 'link-badge--related' },
  'bsi-baustein': { label: 'BSI Baustein', className: 'link-badge--bsi' },
  'template': { label: 'Vorlage', className: 'link-badge--template' },
}

export const LinkBadge: FunctionComponent<LinkBadgeProps> = ({ rel }) => {
  const style = REL_STYLES[rel] ?? { label: rel, className: 'link-badge--default' }
  return <span class={`link-badge ${style.className}`}>{style.label}</span>
}
```

**CSS** (in `base.css`):
- `.link-badge--implements` → `var(--color-success)` (Gruen)
- `.link-badge--required` → `var(--color-error)` (Rot)
- `.link-badge--related` → `var(--color-primary)` (Blau)
- `.link-badge--bsi` → `var(--color-accent)` (Orange)
- `.link-badge--template` → `var(--color-text-secondary)` (Grau)

**Integration**: In `control-detail.tsx` Links-Sektion nach dem `<a>` Tag das `<LinkBadge rel={link.rel} />` anzeigen (nur wenn `link.rel` vorhanden).

---

### Sub-Phase 4b: Profile Resolution

#### FE-R4: DocumentCache (`src/services/document-cache.ts`) [HOCH]

```typescript
class DocumentCache {
  private cache = new Map<string, OscalDocument>()

  get(url: string): OscalDocument | undefined {
    return this.cache.get(this.normalize(url))
  }

  set(url: string, doc: OscalDocument): void {
    this.cache.set(this.normalize(url), doc)
  }

  has(url: string): boolean {
    return this.cache.has(this.normalize(url))
  }

  private normalize(url: string): string {
    return url.split('#')[0].toLowerCase()
  }
}
```

**Layer**: Domain (kein Preact!)
**Session-basiert**: Kein TTL, Reload = frischer Cache

---

#### FE-R5: ResolutionService (`src/services/resolver.ts`) [HOCH]

```typescript
interface ResolvedReference {
  document: OscalDocument
  source: string      // Urspruengliche href
  resolvedUrl: string // Aufgeloeste URL
  fromCache: boolean
}

async function resolveHref(
  href: string,
  baseUrl: string,
  cache: DocumentCache
): Promise<ResolvedReference>

async function resolveProfile(
  profile: Profile,
  baseUrl: string,
  cache: DocumentCache
): Promise<ResolvedCatalog>
```

**Profile Resolution Pipeline**:
1. `imports[].href` → Cataloge laden (parallel mit `Promise.all`)
2. `include-controls.with-ids` → Controls filtern
3. `merge.combine.method` → Controls zusammenfuehren
4. `modify.set-parameters` → Parameter-Werte anwenden
5. `modify.alters` → Controls erweitern/aendern
6. Ergebnis: Resolved Catalog

**CORS-Handling**: GitHub URLs (`github.com`) → `raw.githubusercontent.com` Transformation. Bei CORS-Fehler → `TypeError` fangen, hilfreiche Fehlermeldung anzeigen.

---

#### FE-R6: useResolver Hook (`src/hooks/use-resolver.ts`) [MITTEL]

```typescript
interface UseResolverResult {
  resolve: (href: string, baseUrl: string) => Promise<void>
  resolvedDoc: OscalDocument | null
  loading: boolean
  error: string | null
}

function useResolver(): UseResolverResult
```

**Layer**: Application (Hook-Wrapper um ResolutionService)
**Pattern**: Analog zu bestehenden Hooks (useSearch, useFilter)

---

#### FE-R7: Import-Visualisierung (`src/components/shared/import-panel.tsx`) [MITTEL]

Fuer Profile-Dokumente anzeigen:

```
┌─────────────────────────────────────────┐
│ Importierte Quellen:                     │
│   📁 OPC Privacy Catalog (lokal)         │
│      → 4 Controls ausgewaehlt            │
│   🌐 BSI Grundschutz++ (extern)          │
│      → 2 Controls ausgewaehlt            │
├─────────────────────────────────────────┤
│ Merge-Strategie: merge                   │
│ Modifikationen: 3 Parameter, 1 Alter    │
└─────────────────────────────────────────┘
```

**Integration**: In `profile-view.tsx` als Ersatz/Erweiterung der bestehenden Import-Sektion.

---

### Sub-Phase 4c: SSP + CompDef Resolution

#### FE-R8: SSP Resolution [MITTEL]

```
SSP → import-profile.href → Profile aufloesen (FE-R5)
    → control-implementation → Zeige welche Controls wie umgesetzt
    → by-components → Zeige welche Komponente was implementiert
```

**Betroffene Datei**: `src/components/ssp/ssp-view.tsx`

#### FE-R9: Component-Definition Resolution [MITTEL]

```
Component-Def → source → Catalog aufloesen
              → control-id → Zuordnung Control ↔ Komponente
              → "Welche Komponente implementiert welches Control?"
```

**Betroffene Datei**: `src/components/component-def/component-def-view.tsx`

#### FE-R10: Unaufgeloeste Referenzen UI [NIEDRIG]

Wenn eine Referenz nicht aufgeloest werden kann (CORS, Netzwerk, 404):

```tsx
<div class="unresolved-reference" role="alert">
  <span class="unresolved-icon">⚠</span>
  <div>
    <strong>Externe Referenz nicht verfuegbar</strong>
    <p>href: {href}</p>
    <p>Grund: {error}</p>
  </div>
</div>
```

---

### Umsetzungsreihenfolge

| # | Aufgabe | Sub-Phase | Aufwand | Abhaengigkeit |
|---|---------|-----------|---------|---------------|
| 1 | FE-R1: HrefParser | 4a | Klein | Keine |
| 2 | FE-R2: Fragment-ID Catalog | 4a | Klein | FE-R1 |
| 3 | FE-R3: LinkBadge | 4a | Klein | Keine |
| 4 | FE-R4: DocumentCache | 4b | Klein | Keine |
| 5 | FE-R5: ResolutionService | 4b | Hoch | FE-R1, FE-R4 |
| 6 | FE-R6: useResolver Hook | 4b | Mittel | FE-R5 |
| 7 | FE-R7: Import-Panel | 4b | Mittel | FE-R6 |
| 8 | FE-R8: SSP Resolution | 4c | Mittel | FE-R5 |
| 9 | FE-R9: CompDef Resolution | 4c | Mittel | FE-R5 |
| 10 | FE-R10: Unresolved UI | 4c | Klein | FE-R6 |

### Build-Erwartung Phase 4

- **Neue Dateien**: 3 Services + 1 Hook + 2 UI-Komponenten = 6 Dateien
- **Bundle-Impact**: +1-2 KB gzipped (~400 LOC neuer Code)
- **Tests**: Bestehende 485 + neue Service-Tests + Hook-Tests + Component-Tests
- **Budget**: ~30 KB → ~32 KB gzipped (weiterhin weit unter 100 KB)
- **Keine neuen Dependencies**: Alles mit nativem `fetch()` und TypeScript
