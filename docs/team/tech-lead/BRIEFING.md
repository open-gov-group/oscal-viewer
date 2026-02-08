# Tech Lead - Briefing & Kommunikation

**Rolle**: Tech Lead
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06
**Phase**: Phase 3 (PWA, Dokumentation, npm Package)

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
| 2026-02-06 | Architect | Tech Lead | UI/UX Overhaul umgesetzt (Commit a567973). Neue Code-Patterns eingefuehrt | Info |
| 2026-02-06 | Architect | Tech Lead | UX Redesign: Full-Width + Sticky Sidebar (CSS-only). Neue Layout-Patterns eingefuehrt | Info |
| 2026-02-07 | Tech Lead | Alle | CODING_STANDARDS.md v2.0.0: 10 UI/UX-Patterns dokumentiert (CSS-Variablen, ARIA Tabs, Combobox, Mobile Sidebar, Layout) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | Code Review: 6 neue Dateien (useDeepLink, useFilter, FilterBar, StatusBadge, Accordion, CopyLinkButton) - alle layer-konform | Erledigt |
| 2026-02-07 | Tech Lead | Alle | ESLint-Fix: `filter-bar.tsx:61` ASI-Safety Semikolon entfernt | Erledigt |
| 2026-02-07 | Tech Lead | Alle | CODING_STANDARDS.md v3.0.0: Deep-Link, Filter, Accordion Patterns + Shared Components Uebersicht | Erledigt |
| 2026-02-07 | Architect | Tech Lead | Stakeholder-Feedback: 3 Aufgaben (S1: Nav-Titel, S2: Nested Part-Akkordions + Pattern 16, S3: IFG/BITV Standards) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | S1-S3 Reviews OK, CODING_STANDARDS v3.1.0, 390 Tests, Kontrast-Audit 22/22 PASS | Erledigt |
| 2026-02-07 | Architect | Tech Lead | Phase 3 Briefing: Issues #8-#10 (PWA, Doku, npm Package). Details im Abschnitt "AKTUELLER AUFTRAG Phase 3" | Aktiv |
| 2026-02-07 | Tech Lead | Alle | TL-P1: ADR-006 PWA-Strategie erstellt (vite-plugin-pwa, Precache, autoUpdate, eigene manifest.json) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-N1: ADR-007 npm Package Architecture erstellt (@open-gov-group/oscal-parser, Domain Layer only) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-D1: CONTRIBUTING.md aktualisiert (Renderer-Anleitung, Hooks, BITV 2.0, PR-Template-Verweis) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-D2: CHANGELOG.md erstellt (Keep a Changelog Format, v0.1.0 + v0.2.0 + Unreleased) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-N2: tsconfig.lib.json erstellt, src/lib/index.ts bereits vorhanden (Review OK) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-P2: CODING_STANDARDS.md v4.0.0 — Sektion 9 (PWA/SW) + Sektion 10 (npm Package Exports) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-P3: PR-Template erweitert — SW/PWA + npm Package Checklisten | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-N3: ESLint Layer-Regel fuer src/lib/ hinzugefuegt (hooks + components Import verboten) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | TL-D3: ADR Index aktualisiert (ADR-006 + ADR-007) | Erledigt |
| 2026-02-07 | Tech Lead | Alle | Validierung: ESLint 0 Fehler, TypeScript 0 Fehler, 390/390 Tests, 27 axe-core | Erledigt |
| 2026-02-07 | QA Engineer | Tech Lead | AKTION: Code-Kommentierungs-Audit — Note C- (2.6%). CODING_STANDARDS Sektion 11 (JSDoc/Kommentierung) erstellen + PR-Template Checkbox. Details: `docs/team/qa-engineer/BRIEFING.md` Abschnitt "Code-Kommentierungs-Audit" | Erledigt |
| 2026-02-08 | Tech Lead | Alle | E1: CODING_STANDARDS.md v4.1.0 — Sektion 11 "Code-Kommentierung & JSDoc" (11.1-11.6: File-Level, JSDoc Funktionen/Hooks, Interfaces, Inline, Quoten-Ziele, Checkliste) | Erledigt |
| 2026-02-08 | Tech Lead | Alle | E3: PR-Template — Checkbox "Code-Kommentierung: File-Level-Kommentar, JSDoc auf exportierte Funktionen/Hooks" unter Code Quality | Erledigt |
| 2026-02-08 | Tech Lead | Alle | Validierung: ESLint 0 Fehler, TypeScript 0 Fehler, 472/472 Tests bestanden | Erledigt |
| 2026-02-08 | QA Engineer | Tech Lead | Re-Audit: E1 + E3 ERLEDIGT. Note C+ (5.9%). Verbleibend: Frontend Dev muss profile-view.tsx + component-def-view.tsx kommentieren | Abgeschlossen |
| 2026-02-08 | Tech Lead | Alle | E4: `eslint-plugin-jsdoc` installiert und konfiguriert — `jsdoc/require-jsdoc` (warn, publicOnly) in eslint.config.js. 16 Warnungen auf bestehenden Exports, 0 Fehler | Erledigt |
| 2026-02-08 | Tech Lead | Alle | CODING_STANDARDS.md v4.2.0 — Sektion 11.5 Quoten-Tabelle aktualisiert (Re-Audit-Daten), neue Sektion 11.7 ESLint-Enforcement dokumentiert | Erledigt |
| 2026-02-08 | Tech Lead | Alle | Validierung: ESLint 0 Fehler + 16 Warnungen (jsdoc), TypeScript 0 Fehler, 472/472 Tests bestanden | Erledigt |
| 2026-02-08 | QA Engineer | Tech Lead | Audit ABGESCHLOSSEN: Alle Tech-Lead-Empfehlungen (E1, E3, E4) vollstaendig umgesetzt. Finalnote A- (7.1%). CODING_STANDARDS v4.2.0 ist Referenz-Standard | Abgeschlossen |

---

## UI/UX Overhaul - Architektur-Relevante Aenderungen

**Commit**: `a567973` | **Bundle**: 20.69 KB gzipped | **Tests**: 254 bestanden

### Neue Code-Patterns (in CODING_STANDARDS.md aufnehmen) - ERLEDIGT (v2.0.0)

1. **CSS-Variablen-Pflicht**: Keine hardcoded Farbwerte ausserhalb `:root`. Immer `var(--color-...)` nutzen.
   - 21 semantische Variablen mit Dark Mode Varianten in `base.css:3-75`

2. **WAI-ARIA Tabs Pattern** (Referenz: `ssp-view.tsx`):
   - `tabDefs`-Array ausserhalb der Komponente
   - `handleTabKeyDown()` fuer ArrowLeft/Right/Home/End
   - `aria-controls`, `tabIndex`-Roving (aktiv=0, andere=-1)

3. **Combobox Pattern** (Referenz: `search-bar.tsx`):
   - `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`
   - `aria-activedescendant` mit `useState` fuer `activeIndex`
   - Keyboard: ArrowUp/Down/Escape

4. **Mobile Sidebar Toggle Pattern** (Referenz: `catalog-view.tsx`):
   - `useState(false)` fuer `sidebarOpen`
   - FAB-Button (56px, rund, `display: none` auf Desktop, `flex` auf Mobile)
   - `.sidebar-backdrop` + `.open` Klasse auf `<aside>`
   - Handler schliesst Sidebar bei Auswahl: `setSidebarOpen(false)`

5. **Material Transition Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` statt `ease`

### Layer-Konformitaet

Die Aenderungen respektieren die Dreischicht-Architektur:
- **Presentation Layer** (components/): State-Management fuer Sidebar + Keyboard nur in Components
- **Application Layer** (hooks/): Keine Aenderungen noetig
- **Domain Layer** (types/, parser/): Keine Aenderungen noetig
- **Styles**: Alle visuellen Aenderungen in `base.css`, keine Inline-Styles

---

## UX Redesign: Full-Width Layout + Sticky Sidebar (ABGESCHLOSSEN)

**Typ**: Reines CSS-Refactoring in `base.css` | **TSX-Aenderungen**: Keine | **Tests**: 254 bestanden

### Architektur-Bewertung

**Layer-Konformitaet**: Vollstaendig konform. Alle Aenderungen ausschliesslich im Stylesheet (Presentation Layer). Keine Logik-, Hook- oder Parser-Aenderungen.

### Neue CSS-Layout-Patterns (in CODING_STANDARDS.md aufnehmen) - ERLEDIGT (v2.0.0)

6. **Full-Width Layout**: Kein `max-width` auf View-Container, Inhalte nutzen vollen Viewport
   - `.document-view { width: 100% }` statt `max-width: 1200px`

7. **Sticky Sidebar Pattern** (Referenz: `base.css` `.catalog-sidebar`, `.compdef-sidebar`):
   - `position: sticky`, `top: 64px` (Header-Hoehe), `height: calc(100vh - 64px)`
   - `overflow-y: auto` fuer eigenen Scroll-Kontext
   - `border-right: 1px solid var(--color-border)` als Divider

8. **Full-Bleed Grid Pattern** (Referenz: `base.css` `.catalog-layout`):
   - `margin: 0 -2.5rem`, `width: calc(100% + 5rem)` fuer Rand-zu-Rand Layouts
   - `grid-template-columns: 300px 1fr`, `gap: 0`
   - `min-height: calc(100vh - 64px)` fuer Viewport-fuellende Layouts

9. **Page Scroll statt Container Scroll**: Content scrollt mit der Seite
   - Kein `max-height` + `overflow-y: auto` auf Content-Bereichen
   - Natuerliches Browser-Scroll-Verhalten beibehalten

10. **Borderless Desktop Design**: Subtile Divider statt Box-Borders
    - Sidebar: `border-right` statt `border` + `border-radius`
    - Metadata: `border-bottom` only
    - `.main:has(.dropzone)` Sonderregel fuer zentrierte Dropzone

---

## AKTUELLER AUFTRAG: Stakeholder-Feedback (2026-02-07)

**Prioritaet**: HOCH | **Quelle**: Fachverantwortliche nach Review der Live-Version
**Gesamtbewertung**: "Geht absolut in die richtige Richtung"

Die Fachverantwortlichen haben 3 Verbesserungswuensche identifiziert:

---

### Anforderung S1: Navigation — Gesamttitel sichtbar machen [HOCH]

**Architektur-Relevanz**: Keine. Reines CSS-Refactoring (Entfernung von `text-overflow: ellipsis` und `white-space: nowrap`). Keine Auswirkung auf Layer-Architektur oder Komponenten-Interfaces.

**Code-Review-Fokus**: CSS-only Aenderung in `base.css`. Pruefen dass Touch-Targets (44px) und Mobile-Layout nicht beeintraechtigt werden.

---

### Anforderung S2: Parts als verschachtelte Akkordions [HOCH]

**Architektur-Relevanz**: Mittel. Betrifft `PartView` in `control-detail.tsx` (Presentation Layer).

**Zu pruefen und in CODING_STANDARDS.md dokumentieren**:

#### Pattern 16: Nested Accordion (Recursive Parts)

**Referenz**: `control-detail.tsx` → `PartView`

```tsx
// Rekursive Accordion-Verschachtelung fuer OSCAL Parts
const PartView = ({ part, depth = 0 }) => {
  const headingLevel = Math.min(4 + depth, 6) as 4 | 5 | 6
  return (
    <Accordion headingLevel={headingLevel} defaultOpen={depth === 0}>
      {/* prose, props, links */}
      {part.parts?.map(child => (
        <PartView part={child} depth={depth + 1} />
      ))}
    </Accordion>
  )
}
```

**Regeln**:
1. `headingLevel` MUSS mit der Tiefe inkrementieren: h4 → h5 → h6
2. HTML erlaubt maximal `<h6>` — bei `depth >= 3` bleibt heading level bei 6
3. `defaultOpen={depth === 0}` — nur Top-Level Parts offen
4. Parts ohne Titel (z.B. `name="item"` mit leerem Label) werden FLACH gerendert (kein Accordion)
5. `Accordion`-Komponente muss `headingLevel` 4, 5, 6 unterstuetzen (aktuell: 2-6 — OK)
6. Accordion-ID-Schema: `{partId ?? partName}-{depth}` — eindeutig innerhalb eines Controls

**Heading-Hierarchie-Konsistenz** (WCAG 1.3.1):
```
<h2> Control Title         (control-detail.tsx)
  <h3> Content             (Accordion, bestehend)
    <h4> Statement         (PartView, depth=0)
      <h5> Item a          (PartView, depth=1)
      <h5> Item b          (PartView, depth=1)
    <h4> Guidance           (PartView, depth=0)
  <h3> Parameters           (Accordion, bestehend)
  <h3> Links                (Accordion, bestehend)
  <h3> Control Enhancements (Accordion, bestehend)
```

→ Keine Hierarchie-Spruenge, konsistent von h2 bis h6.

**Layer-Konformitaet**: Vollstaendig konform. Aenderung betrifft nur Presentation Layer. Kein neuer Hook oder Parser noetig. Bestehende `Accordion`-Komponente wird wiederverwendet.

**Performance-Ueberlegung** (ADR-005 relevant):
- Bei grossen NIST-Catalogen (z.B. 800-53: ~400 Controls mit je 3-5 Parts und 2-10 Sub-Parts) koennte die Anzahl der Accordion-Instanzen steigen
- Accordion-State via `sessionStorage` — bei vielen Items evtl. sessionStorage-Quota beachten
- Empfehlung: Monitoring nach Umsetzung, bei Performance-Problemen `useMemo` auf PartView-Rendering

---

### Anforderung S3: Barrierefreiheit / IFG-Konformitaet [HOCH]

**Architektur-Relevanz**: Mittel. IFG erfordert BITV 2.0 Compliance, die auf WCAG 2.1 AA basiert.

**Zu pruefen**:

| BITV 2.0 Anforderung | WCAG | Status | Aktion |
|----------------------|------|--------|--------|
| Sprache des Dokuments | 3.1.1 | FEHLT | `lang="en"` auf `<html>` in `index.html` |
| Konsistente Heading-Hierarchie | 1.3.1 | Wird durch S2 verbessert | Review nach Umsetzung |
| Status Messages programmatisch | 4.1.3 | LUECKE | `aria-live="polite"` auf CopyLinkButton Feedback |
| Tastatur vollstaendig | 2.1.1 | DONE | Nested Accordions erben Keyboard-Pattern |
| Fokus-Reihenfolge logisch | 2.4.3 | PRUEFEN | Tab-Order bei verschachtelten Accordions verifizieren |

**CODING_STANDARDS.md Update**:
- Pattern 16: Nested Accordion (s.o.)
- Abschnitt "Barrierefreiheit / BITV 2.0" hinzufuegen:
  - `lang`-Attribut auf `<html>` Pflicht
  - Heading-Hierarchie lueckenlos (keine Spruenge h2 → h4)
  - `aria-live` fuer Status-Meldungen (Clipboard, Loading)
  - Kontrast >= 4.5:1 fuer allen Text (keine Ausnahmen)

**Keine ADR noetig**: Die Aenderungen sind inkrementell und folgen bestehenden Patterns.

---

## Stakeholder-Feedback - Zusammenfassung (ABGESCHLOSSEN)

| Aufgabe | Tech-Lead-Aktion | Ergebnis |
|---------|-----------------|----------|
| S1: Navigation Multi-Line | CSS Review | OK — keine Layer-Aenderung |
| S2: Nested Part Accordions | Pattern 16 definiert, h4→h5→h6 Review | OK — 1 CSS-Fix (dotted border) |
| S3: IFG/BITV 2.0 | CODING_STANDARDS v3.1.0 (BITV 2.0 Sektion) | OK — 6 Standards (8.1-8.6) |

**Build**: 14.20 KB JS + 6.36 KB CSS gzipped | 390 Tests | Commit: `e2c8f28`

---

## AKTUELLER AUFTRAG: Phase 3 (2026-02-07)

**Prioritaet**: HOCH | **Issues**: #8, #9, #10
**Aktueller Stand**: 14.20 KB JS + 6.36 KB CSS, 390 Tests, BITV 2.0 konform, CODING_STANDARDS v3.1.0

Phase 3 umfasst 3 Issues mit jeweils architektur-relevanten Aufgaben:

---

### Issue #8: Progressive Web App (PWA) [HOCH]

#### TL-P1: ADR-006 PWA-Strategie [HOCH]

**Datei**: `docs/architecture/decisions/ADR_006_pwa.md` (NEU)

**Entscheidungen zu dokumentieren**:

1. **Build-Tool**: `vite-plugin-pwa` (Workbox-basiert)
   - **Begruendung**: Integriert sich nahtlos in bestehende Vite-Config, generiert Service Worker automatisch, Workbox ist der De-facto-Standard
   - **Alternativen verworfen**: Manueller SW (zu fehleranfaellig), Partytown (nicht fuer Offline gedacht)

2. **Caching-Strategie**: Precache (App Shell) + Runtime-Cache (Google Fonts)
   - App Shell: JS, CSS, HTML werden beim Install gecacht — sofortige Offline-Verfuegbarkeit
   - OSCAL-Dateien: NICHT gecacht (User laedt eigene Dateien lokal)
   - Google Fonts: `StaleWhileRevalidate` (Stylesheets), `CacheFirst` (Webfonts)

3. **Update-Strategie**: `autoUpdate` (prompt-less)
   - **Begruendung**: Die App hat keinen User-State der verloren gehen kann (Dateien werden lokal geladen)
   - **Alternative**: `prompt` — unnoetig, da kein Data-Loss-Risiko

4. **Manifest**: Eigene `manifest.json` in `public/` (nicht auto-generiert)
   - **Begruendung**: Mehr Kontrolle ueber Icons, Start-URL, Display-Modus

**Layer-Konformitaet**: Service Worker ist Build-Artefakt, nicht Teil der App-Architektur. Keine Aenderung an der Dreischicht-Architektur. `vite-plugin-pwa` bleibt Dev-Dependency.

---

#### TL-P2: CODING_STANDARDS.md v4.0.0 aktualisieren [MITTEL]

**Neue Patterns fuer Phase 3**:

##### Pattern 17: PWA Service Worker

```
- Service Worker wird durch vite-plugin-pwa automatisch generiert
- KEIN manueller SW-Code in src/
- Caching-Konfiguration NUR in vite.config.ts
- Runtime-Caching fuer externe Ressourcen (Fonts, CDN)
- App-Code bleibt SW-unabhaengig (Graceful Degradation)
```

##### Pattern 18: npm Package Exports

```
- Package Entry-Point: src/lib/index.ts
- NUR Domain Layer exportieren (types/, parser/)
- KEINE Preact/UI-Abhaengigkeiten im Package
- TypeScript Declarations (.d.ts) mitliefern
- Separates tsconfig.lib.json fuer Package-Build
```

---

#### TL-P3: Service Worker Review-Checkliste [MITTEL]

Bei PRs die den Service Worker betreffen, folgende Punkte pruefen:

| # | Check | Details |
|---|-------|---------|
| 1 | Precache-Manifest korrekt | Alle App-Assets enthalten, keine sensiblen Dateien |
| 2 | Cache-Invalidierung | Version-Hash in Dateinamen (Vite macht das automatisch) |
| 3 | Keine User-Daten gecacht | OSCAL-Dateien werden NICHT gecacht |
| 4 | Fonts-Caching sinnvoll | Google Fonts mit Expiration, nicht unbegrenzt |
| 5 | Update-Flow getestet | Neuer Deploy → alter SW wird ersetzt → kein Stuck-State |
| 6 | Offline-Fallback | App laeuft ohne Netzwerk (kein white-screen) |

---

### Issue #9: Dokumentation [MITTEL]

#### TL-D1: CONTRIBUTING.md erstellen [HOCH]

**Datei**: `CONTRIBUTING.md` (NEU, im Root)

**Inhalt**:
1. **Getting Started**: `npm install`, `npm run dev`, `npm test`
2. **Architecture Overview**: Verweis auf ARCHITECTURE.md und ADRs
3. **Coding Standards**: Verweis auf docs/CODING_STANDARDS.md
4. **How to add a new OSCAL Renderer**: Schritt-fuer-Schritt
   - Types in `oscal.ts` definieren
   - Parser in `parser/` erstellen
   - View in `components/{typ}/` erstellen
   - In `document-viewer.tsx` registrieren
   - Tests schreiben
5. **PR-Prozess**: Verweis auf `.github/pull_request_template.md`
6. **Layer-Architektur-Regeln**: Domain → Application → Presentation

#### TL-D2: CHANGELOG.md erstellen [MITTEL]

**Datei**: `CHANGELOG.md` (NEU, im Root)

**Format**: Keep a Changelog (https://keepachangelog.com/)

```markdown
# Changelog

## [Unreleased]

## [0.2.0] - 2026-02-07
### Added
- Stakeholder-Feedback: Multi-line navigation titles, nested part accordions, BITV 2.0 compliance
- Dashboard-Redesign: Accordion, Deep-Linking, Filter, StatusBadge, CopyLinkButton
- UI/UX Overhaul: Material Design, responsive, accessibility fixes
- Full-Width Layout with sticky sidebar

## [0.1.0] - 2026-02-06
### Added
- Initial release: Catalog, Profile, Component-Def, SSP renderers
- Global search with per-type indexing
- axe-core accessibility testing (254 tests)
```

#### TL-D3: ADR Index aktualisieren [NIEDRIG]

- Bestehende ADRs: 001-005
- Neue ADR: 006 (PWA)
- Optional: ADR-007 (npm Package Architecture)

---

### Issue #10: npm Package [HOCH]

#### TL-N1: ADR-007 npm Package Architecture [HOCH]

**Datei**: `docs/architecture/decisions/ADR_007_npm_package.md` (NEU)

**Entscheidungen zu dokumentieren**:

1. **Package-Scope**: Nur Domain Layer (types + parser)
   - **Begruendung**: Wiederverwendbar ohne Framework-Abhaengigkeit
   - Parser sind reines TypeScript, keine Preact-Imports
   - Types sind reine Interfaces, keine Runtime-Abhaengigkeit

2. **Package-Name**: `@open-gov-group/oscal-parser`
   - Scoped Package unter der GitHub-Organisation
   - "parser" im Namen — klar was das Package macht

3. **Build-Setup**: Separates `tsconfig.lib.json`
   - Target: ES2020 (breitere Kompatibilitaet)
   - Module: ESNext (Tree-Shaking-faehig)
   - Declaration: true (TypeScript Declarations mitliefern)
   - Entry: `src/lib/index.ts`

4. **Versionierung**: Unabhaengig von der App
   - App: v0.x.y (GitHub Pages)
   - Package: eigene Version, Semantic Versioning
   - Aenderungen am Parser erhoehen Package-Version

5. **Testing**: Bestehende Parser-Tests + Fixture-Tests decken das Package ab
   - Kein separates Test-Setup noetig

**Layer-Konformitaet**: ESLint Layer-Regeln garantieren bereits, dass Domain Layer nicht aus Application/Presentation importiert. Das npm Package exportiert den bestehenden Code — keine Umstrukturierung noetig.

---

#### TL-N2: package.json Konfiguration [HOCH]

**Aenderungen in `package.json`**:

```json
{
  "name": "@open-gov-group/oscal-parser",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/lib/index.js",
  "types": "./dist/lib/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/lib/index.js",
      "types": "./dist/lib/index.d.ts"
    }
  },
  "files": ["dist/lib/"],
  "scripts": {
    "build:lib": "tsc -p tsconfig.lib.json"
  }
}
```

**Wichtig**: Das bestehende `vite build` fuer die App bleibt unveraendert. `build:lib` ist ein separater Build-Schritt nur fuer das npm Package.

---

#### TL-N3: ESLint Layer-Regeln pruefen [MITTEL]

Verifizieren dass die bestehenden Layer-Regeln den Package-Export absichern:

| Import-Richtung | Erlaubt | ESLint-Regel |
|----------------|---------|--------------|
| `src/lib/index.ts` → `src/types/*` | JA | Domain → Domain |
| `src/lib/index.ts` → `src/parser/*` | JA | Domain → Domain |
| `src/lib/index.ts` → `src/hooks/*` | NEIN | Domain → Application (verboten) |
| `src/lib/index.ts` → `src/components/*` | NEIN | Domain → Presentation (verboten) |

→ Bestehende Regeln reichen aus. `src/lib/` liegt im Domain Layer.

---

### Umsetzungsreihenfolge

| # | Aufgabe | Issue | Geschaetzter Aufwand | Abhaengigkeit |
|---|---------|-------|---------------------|---------------|
| 1 | TL-P1: ADR-006 PWA | #8 | Mittel | Keine |
| 2 | TL-N1: ADR-007 npm Package | #10 | Mittel | Keine |
| 3 | TL-D1: CONTRIBUTING.md | #9 | Mittel | Keine |
| 4 | TL-D2: CHANGELOG.md | #9 | Klein | Keine |
| 5 | TL-N2: package.json Review | #10 | Klein | TL-N1 |
| 6 | TL-P2: CODING_STANDARDS v4.0.0 | #8+#10 | Mittel | TL-P1, TL-N1 |
| 7 | TL-P3: SW Review-Checkliste | #8 | Klein | TL-P1 |
| 8 | TL-N3: ESLint-Regeln pruefen | #10 | Klein | TL-N2 |
| 9 | TL-D3: ADR Index | #9 | Klein | TL-P1, TL-N1 |

### Build-Erwartung Phase 3

- PWA: Kein Bundle-Impact (SW wird separat generiert)
- npm Package: Kein App-Bundle-Impact (separater Build)
- Neue Dev-Dependencies: `vite-plugin-pwa`
- Tests: 390 bestehende Tests + neue PWA/Package Tests
- Neue Dateien: 2 ADRs, CONTRIBUTING.md, CHANGELOG.md, tsconfig.lib.json, src/lib/index.ts
