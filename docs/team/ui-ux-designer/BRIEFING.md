# UI/UX Designer - Briefing & Kommunikation

**Rolle**: UI/UX Designer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-10
**Phase**: Phase 6+ (Assessment Results, POA&M, E2E Tests)

---

## Projekt-Historie (Phasen 1-5) — Archiv

| Phase | UI/UX Beitrag | Bundle |
|-------|--------------|--------|
| Phase 1 | Catalog Renderer Design, CSS Custom Properties, Responsive | 12.54 KB |
| Phase 2 | Design Review aller 4 Renderer, Accessibility-Audit, 23 hardcoded Farben identifiziert | 14.39 KB |
| UI/UX Overhaul | Material AppBar, 31 CSS-Token, `:focus-visible`, Skip-Links, WAI-ARIA Tabs/Combobox | 20.69 KB |
| UX Redesign | Full-Width Layout, Sticky Sidebar, Borderless Desktop (CSS-only) | — |
| Dashboard (3 Sprints) | Gap-Analyse (24 Gaps), Specs U8-U12, 3 Sprint Reviews | 20.40 KB |
| Stakeholder-Feedback | S1-S3 Reviews, BITV 2.0 Kontrast-Audit (22/22 PASS) | 20.56 KB |
| Phase 3 | App-Icon Design, Offline-Banner, PWA Toast, ACCESSIBILITY_STATEMENT.md | 28.76 KB |
| Phase 4 | LinkBadge CSS (6 Varianten), Fragment-Link CSS, Import-Panel CSS, Loading-Animation, Unresolved-Ref CSS | 33.58 KB |
| Phase 5 | ProseView Amber-Highlighting, ResourcePanel Cards, Cross-Doc Navigation Buttons, param-substitution CSS | 36.10 KB |

### Bestehende Design-Token (31+ in base.css)

**Basis**: `--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-error`, `--color-success`
**Status (21 Variablen)**: success/error/warning/info/orange/purple/amber (jeweils bg/text/border)
**Layout**: `--font-family`, `--font-mono`, `--border-radius`, `--shadow`, `--shadow-lg`
**Alle mit Dark Mode Overrides** via `prefers-color-scheme`

### Bestehende Accessibility

- WCAG 2.1 AA konform (BITV 2.0)
- Kontrast-Audit: 22/22 PASS (Light + Dark, knappster Wert 4.63:1)
- axe-core: 35 Tests PASS
- WAI-ARIA Patterns: Tabs, Combobox, TreeView, Accordion
- Skip-Links, `:focus-visible`, Roving Tabindex, `aria-live`

### Geschlossene Gaps (13/24 + alle MUST)

G1 Title Box, G2 Accordion, G3 Boxes, G4 Catalog Accordions, G5 CompDef Accordions, G6 Deep-Linking, G7 Fliesstextbreite, G8 Filter, G10 Roving Tabindex, G12 Copy-to-clipboard, G13 Debounce, G14 Status Icons, G16 Session-Persist

### Offene Gaps (Backlog)

G9 Nav resizable, G11 Loading/Skeleton, G15 AccordionGroup Integration, G17 Virtualisierung, G18-G24 (Right Pane, Context Switcher, Theme Toggle, etc.)

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-09 | Architect | UI/UX Designer | Phase 4 Briefing: UX-R1 bis UX-R7 | Erledigt |
| 2026-02-09 | UI/UX Designer | Architect | Phase 4 CSS implementiert: UX-R1, UX-R2, UX-R4, UX-R6 | Erledigt |
| 2026-02-09 | UI/UX Designer | Architect | Phase 4a Design Review: LinkBadge, HrefParser, Fragment-Links — spec-konform | Erledigt |
| 2026-02-09 | QA Engineer | UI/UX Designer | Phase 4a QA-Report: Finding F1 (LinkBadge aria-label) — reiner HTML-Fix | Erledigt |
| 2026-02-10 | Architect | UI/UX Designer | **Phase 4+5 abgeschlossen**: Alle UX-Spezifikationen umgesetzt. ProseView Amber-Highlighting, ResourcePanel Cards, Cross-Doc Navigation Buttons. 36.10 KB Bundle | Erledigt |
| 2026-02-10 | Architect | UI/UX Designer | **Phase 6 Planung**: AR Findings Dashboard Design, POA&M Milestone Timeline, Status-Farben | Aktiv |

---

## Phase 4+5 Zusammenfassung (ABGESCHLOSSEN)

### Phase 4 UI/UX Deliverables

| Aufgabe | Status |
|---------|--------|
| UX-R1: LinkBadge CSS (6 Varianten) | DONE |
| UX-R2: Fragment-Link CSS (.link-urn) | DONE |
| UX-R3: Import-Panel Design + CSS | DONE |
| UX-R4: Unresolved Reference CSS | DONE |
| UX-R5: Kontrast-Audit | Nicht noetig (bestehende Token) |
| UX-R6: Loading State CSS (@keyframes pulse) | DONE |
| UX-R7: SSP/CompDef Import-Ketten | DONE |
| UX-D1: ACCESSIBILITY_STATEMENT.md | DONE |

### Phase 5 UI/UX Deliverables

| Aufgabe | Status |
|---------|--------|
| ProseView: `.param-substitution` Amber-Highlighting | DONE |
| ResourcePanel: Resource Cards mit rlinks, citations | DONE |
| Cross-Doc Navigation: Source-Buttons im ImportPanel | DONE |
| Resolved Catalog: AccordionGroup fuer aufgeloeste Controls | DONE |

### Design-Entscheidungen (Phase 4+5)

| ID | Entscheidung |
|----|-------------|
| DE-4 | Link-Badge als Pill-Form (konsistent mit PropertyBadge/StatusBadge) |
| DE-5 | URNs als nicht-klickbarer Text (Secondary-Color, kein broken-link Icon) |
| DE-6 | Import-Panel erweitert bestehende Import-Sektion (kein Ersatz) |
| DE-7 | Kein Dependency-Graph (lineare Darstellung genuegt fuer MVP) |
| DE-8 | Amber-Highlighting fuer Parameter (unterscheidbar von Links und Status-Badges) |

---

## Phase 6 Ausblick

### UX-R9: Assessment Results Findings Dashboard [HOCH]

Design fuer das AR Findings Dashboard:

**Dashboard-Layout**:
```
┌──────────────────────────────────────────────┐
│ Assessment Results: [Title]                   │
├──────────────────────────────────────────────┤
│ Findings Summary                              │
│   ✅ 12 Satisfied  ❌ 3 Not Satisfied  ⚪ 1 Other │
├──────────────────────────────────────────────┤
│ ▸ Finding: AC-1 Access Control Policy         │
│   Status: ✅ Satisfied                        │
│   Observations: 2 | Risks: 0                 │
│ ▸ Finding: AC-2 Account Management            │
│   Status: ❌ Not Satisfied                    │
│   Observations: 1 | Risks: 1                 │
└──────────────────────────────────────────────┘
```

**Status-Farben**:

| Status | Farbe | CSS-Token |
|--------|-------|-----------|
| satisfied | Gruen | `--color-status-success-bg/text` |
| not-satisfied | Rot | `--color-status-error-bg/text` |
| other | Grau | `--color-bg-secondary` + `--color-text-secondary` |

**Visuelles Design**:
- Summary-Bar oben mit Zaehler-Badges (analog FilterBar Chips)
- Findings als Accordion-Liste (bestehende Accordion-Komponente)
- Status-Badge pro Finding (bestehende StatusBadge-Komponente erweitern)
- Observations und Risks als verschachtelte Accordions (bestehende PartView Tiefe)

### UX-R10: POA&M Milestone Timeline [MITTEL]

**Timeline-Layout**:
```
┌──────────────────────────────────────────────┐
│ Plan of Action & Milestones: [Title]          │
├──────────────────────────────────────────────┤
│ POA&M Item: AC-2 Account Management           │
│   Status: Open | Due: 2026-06-30              │
│   ├── Milestone 1: Policy Update (Complete)   │
│   ├── Milestone 2: Tool Config (In Progress)  │
│   └── Milestone 3: Training (Pending)         │
└──────────────────────────────────────────────┘
```

**Status-Farben**:

| Status | Farbe | CSS-Token |
|--------|-------|-----------|
| open | Orange | `--color-status-orange-bg/text` |
| closed | Gruen | `--color-status-success-bg/text` |
| risk-accepted | Amber | `--color-status-amber-bg/text` |

**Visuelles Design**:
- POA&M Items als Accordion-Liste
- Milestones als indizierte Liste innerhalb des Items
- Fortschritts-Indikator (CSS-only Progress-Bar mit `--color-primary`)
- Due-Date mit visueller Hervorhebung bei Ueberschreitung (Rot)

### UX-R11: Neue Status-Farben [NIEDRIG]

Moegliche neue CSS-Token fuer AR/POA&M:
- `--color-status-satisfied` (Alias fuer success-bg/text)
- `--color-status-not-satisfied` (Alias fuer error-bg/text)
- `--color-risk-low/moderate/high/critical` (4 Risiko-Stufen)

**Kontrast**: Alle neuen Token muessen >= 4.5:1 Kontrast haben. Bestehende Status-Token wiederverwenden wo moeglich.

### Build-Erwartung Phase 6 (UI/UX)

- **CSS-Impact**: +~0.3-0.5 KB gzipped (AR Dashboard + POA&M Timeline Styles)
- **Keine neuen Design-Systeme** — bestehende Token, Accordion, StatusBadge erweitern
- **Kontrast-Audit**: Nur fuer neue Risk-Level-Farben noetig (falls eingefuehrt)
- **Bundle**: ~36 KB -> ~39 KB gzipped (inkl. JS + CSS)
