# UI/UX Designer - Briefing & Kommunikation

**Rolle**: UI/UX Designer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution (Import-Ketten, Cross-Referenzen, Profile Resolution)

---

## Projekt-Historie (Phasen 1-3) — Archiv

Vollstaendige Historie: `archive/BRIEFING_PHASE1-4a.md`

| Phase | UI/UX Beitrag | Bundle |
|-------|--------------|--------|
| Phase 1 | Catalog Renderer Design, CSS Custom Properties, Responsive | 12.54 KB |
| Phase 2 | Design Review aller 4 Renderer, Accessibility-Audit, 23 hardcoded Farben identifiziert | 14.39 KB |
| UI/UX Overhaul | Material AppBar, 31 CSS-Token, `:focus-visible`, Skip-Links, WAI-ARIA Tabs/Combobox | 20.69 KB |
| UX Redesign | Full-Width Layout, Sticky Sidebar, Borderless Desktop (CSS-only) | — |
| Dashboard (3 Sprints) | Gap-Analyse (24 Gaps), Specs U8-U12 (Accordion, TitleBox, ContentBox, DeepLink, Filter), 3 Sprint Reviews | 20.40 KB |
| Stakeholder-Feedback | S1 Nav Multi-Line, S2 Nested Part Accordions, S3 BITV 2.0 Kontrast-Audit (22/22 PASS) | 20.56 KB |
| Phase 3 | App-Icon Design (3 SVGs), Offline-Banner, PWA Toast, Manifest Review, ACCESSIBILITY_STATEMENT.md | 28.76 KB |
| Code-Audit | Keine UI/UX Aufgaben | ~30 KB |

### Geschlossene Gaps (13/24 + alle MUST)

G1 Title Box, G2 Accordion, G3 Boxes, G4 Catalog Accordions, G5 CompDef Accordions, G6 Deep-Linking, G7 Fliesstextbreite, G8 Filter, G10 Roving Tabindex, G12 Copy-to-clipboard, G13 Debounce, G14 Status Icons, G16 Session-Persist

### Offene Gaps (Backlog)

G9 Nav resizable, G11 Loading/Skeleton, G15 AccordionGroup Integration, G17 Virtualisierung, G18-G24 (Right Pane, Context Switcher, Theme Toggle, etc.)

### Bestehende Design-Token (31 in base.css)

**Basis**: `--color-primary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-error`, `--color-success`
**Status (21 Variablen)**: success/error/warning/info/orange/purple/amber (jeweils bg/text/border)
**Layout**: `--font-family`, `--font-mono`, `--border-radius`, `--shadow`, `--shadow-lg`
**Alle mit Dark Mode Overrides** via `prefers-color-scheme`

### Bestehende Accessibility

- WCAG 2.1 AA konform (BITV 2.0)
- Kontrast-Audit: 22/22 PASS (Light + Dark, knappster Wert 4.63:1)
- axe-core: 29 Tests PASS
- WAI-ARIA Patterns: Tabs, Combobox, TreeView, Accordion
- Skip-Links, `:focus-visible`, Roving Tabindex, `aria-live`

---

## Kommunikationslog (Phase 4+)

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-09 | Architect | UI/UX Designer | Phase 4 Briefing: OSCAL Resolution — UX-R1 bis UX-R7. Basiert auf OSCAL Expert Briefing | Erledigt |
| 2026-02-09 | UI/UX Designer | Architect | Phase 4 CSS implementiert: UX-R1, UX-R2, UX-R4, UX-R6 in base.css. UX-D1 ACCESSIBILITY_STATEMENT.md erstellt. Bundle: +0.79 KB CSS | Erledigt |
| 2026-02-09 | Architect | UI/UX Designer | **Phase 4a abgeschlossen**: HrefParser, LinkBadge, Fragment-Links. Commit `4394bb2`, 531 Tests. QA Finding F1 (LinkBadge aria-label) offen | Erledigt |
| 2026-02-09 | UI/UX Designer | Architect | **Phase 4a Design Review**: LinkBadge, HrefParser, Fragment-Links — alle 3 spec-konform. Keine Issues. F1 (aria-label) ist reiner HTML-Fix | Erledigt |
| 2026-02-09 | QA Engineer | UI/UX Designer | **Phase 4a QA-Report**: 531 Tests, 29 axe-core. Finding F1: LinkBadge fehlt `aria-label`. HrefParser 18/18 PASS | Zur Kenntnis |
| 2026-02-09 | Architect | UI/UX Designer | **Phase 4b Briefing**: Import-Panel UI — UX-R3b CSS Integration, UX-R6b Loading State, UX-R8 LinkBadge Fix. Details im Abschnitt "AKTUELLER AUFTRAG Phase 4b" | Aktiv |

---

## NEUER AUFTRAG: Phase 4 — OSCAL Resolution (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: OSCAL Expert Briefing via Hauptprogrammleitung
**Referenz-Dokument**: `docs/architecture/OSCAL_IMPORT_GUIDE.md`
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang. Weiterhin "Web"-App (PWA).

### Kontext

OSCAL-Dokumente bilden eine hierarchische Referenzkette:

```
SSP → Profile → Catalog(e)
       ↕              ↕
 Component-Defs    Cross-Refs
```

Der Viewer muss diese Kette clientseitig aufloesen und visualisieren. Phase 4 fuehrt neue UI-Elemente ein:
- **Link-Relation Badges**: Farbkodierte Badges fuer `links[].rel` Werte
- **Import-Visualisierung**: Panel das zeigt woher Controls importiert werden
- **Unaufgeloeste Referenzen**: Warnung bei CORS/Netzwerk-Fehlern
- **Fragment-Navigation**: Klickbare `#CONTROL-ID` Links innerhalb eines Dokuments

---

### UX-R1: Link-Relation Badges Design [HOCH — Sub-Phase 4a]

Neue Shared Component fuer `links[].rel` Attribut-Werte. Zeigt die Art der Beziehung zwischen OSCAL-Dokumenten/Controls an.

**Badge-Design-Spezifikation**:

| `rel`-Wert | Label | Farbe (Light) | Farbe (Dark) | CSS-Token |
|------------|-------|---------------|-------------|-----------|
| `implements` | "Implementiert" | `--color-status-success-bg/text` (Gruen) | `--color-status-success-bg/text` | `.link-badge--implements` |
| `required` | "Erforderlich" | `--color-status-error-bg/text` (Rot) | `--color-status-error-bg/text` | `.link-badge--required` |
| `related-control` | "Verwandt" | `--color-status-info-bg/text` (Blau) | `--color-status-info-bg/text` | `.link-badge--related` |
| `bsi-baustein` | "BSI Baustein" | `--color-status-orange-bg/text` (Orange) | `--color-status-orange-bg/text` | `.link-badge--bsi` |
| `template` | "Vorlage" | `--color-bg-secondary` + `--color-text-secondary` (Grau) | Analog | `.link-badge--template` |
| (unbekannt) | rel-Wert als Label | `--color-bg-secondary` + `--color-text` | Analog | `.link-badge--default` |

**Visuelles Design**:
- Stil analog zu bestehenden `PropertyBadge` (Pill-Form, kleiner Font, inline)
- Kontrast >= 4.5:1 (bereits durch bestehende Status-Token garantiert — Kontrast-Audit Phase 2 bestanden)
- Kein Icon noetig — Text + Farbe reicht (WCAG: Information nicht nur durch Farbe, sondern auch durch Text vermittelt)

**Platzierung**: In `control-detail.tsx` Links-Sektion, nach dem `<a>` Tag jedes Links

**CSS** (in `base.css`):
```css
.link-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.link-badge--implements { background: var(--color-status-success-bg); color: var(--color-status-success-text); }
.link-badge--required { background: var(--color-status-error-bg); color: var(--color-status-error-text); }
.link-badge--related { background: var(--color-status-info-bg); color: var(--color-status-info-text); }
.link-badge--bsi { background: var(--color-status-orange-bg); color: var(--color-status-orange-text); }
.link-badge--template { background: var(--color-bg-secondary); color: var(--color-text-secondary); }
.link-badge--default { background: var(--color-bg-secondary); color: var(--color-text); }
```

**Kontrast**: Alle Token-Kombinationen wurden im Kontrast-Audit (B4) als PASS bewertet. Kein zusaetzlicher Audit noetig.

---

### UX-R2: Fragment-Link Verhalten [MITTEL — Sub-Phase 4a]

Links mit `href="#CONTROL-ID"` (Fragment-only) sollen klickbar sein und zum referenzierten Control navigieren.

**Verhalten**:

| HREF-Typ | Visuelles Verhalten | Aktion bei Klick |
|----------|---------------------|------------------|
| Fragment (`#ACC-01`) | Blauer Link (standard) | Deep-Link: `location.hash = '/catalog/ACC-01'` |
| Absolute URL (`https://...`) | Blauer Link mit External-Icon (optional) | `<a target="_blank">` — neuer Tab |
| URN (`urn:iso:...`) | Grauer Text (kein Link) | Nicht klickbar, als Referenz-Label angezeigt |
| Relativer Pfad (`../catalog/file.json`) | Blauer Link | Phase 4b: Dokument laden und anzeigen |

**Visuelles Design**:
- Fragment-Links: Standard Link-Styling (`--color-primary`, underline on hover)
- URN-Labels: `--color-text-secondary`, kein underline, `cursor: default`
- External-Links: Optional kleines externes-Link Icon (↗) — Backlog

---

### UX-R3: Import-Visualisierung Panel [MITTEL — Sub-Phase 4b]

Fuer Profile-Dokumente anzeigen, woher Controls importiert werden.

**Design-Spezifikation**:

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

**Visuelles Design**:
- Bestehende `.content-box` Klasse wiederverwenden
- Quellen-Liste: Icon (📁 lokal / 🌐 extern) + Titel + Control-Count
- Status-Badges fuer Merge-Strategie (`merge`, `flat`, `as-is`)
- Klickbare Import-HREFs (navigieren zum importierten Dokument)
- Fallback bei CORS-Fehler: Warnung statt Link (siehe UX-R4)

**Platzierung**: In `profile-view.tsx` als Ersatz/Erweiterung der bestehenden Import-Sektion. Soll als erstes Panel nach der Metadata angezeigt werden.

**Responsive**: Linear-Layout, Icons + Text untereinander auf Mobile.

---

### UX-R4: Unaufgeloeste Referenzen UI [NIEDRIG — Sub-Phase 4c]

Wenn eine externe Referenz nicht geladen werden kann (CORS, Netzwerk, 404):

**Design-Spezifikation**:

```
┌─────────────────────────────────────────┐
│ ⚠ Externe Referenz nicht verfuegbar      │
│   href: https://github.com/.../cat.json │
│   Grund: Netzwerkfehler / CORS          │
│                                          │
│   [Manuell laden]  [Ignorieren]          │
└─────────────────────────────────────────┘
```

**Visuelles Design**:
- Hintergrund: `var(--color-status-warning-bg)` (gelb)
- Text: `var(--color-status-warning-text)`
- Border: `2px solid var(--color-accent-amber)` (links, analog Error-Pattern)
- `role="alert"` fuer Screen-Reader
- "Manuell laden" Button: Oeffnet File-Dialog fuer lokalen Download
- "Ignorieren" Button: Blendet Warnung aus (dieser Session)

**a11y**: `role="alert"` + `aria-live="assertive"` (wichtige Warnung).

---

### UX-R5: Kontrast-Audit fuer neue Link-Badges [NIEDRIG]

**Ergebnis: KEIN ZUSAETZLICHER AUDIT NOETIG**

Alle Link-Badge Farben nutzen bestehende Status-Token (`--color-status-success/error/info/orange/warning`), die im Kontrast-Audit B4 bereits als PASS bewertet wurden (22/22 Kombinationen >= 4.5:1).

---

### Umsetzungsreihenfolge

| # | Aufgabe | Sub-Phase | Aufwand | Abhaengigkeit |
|---|---------|-----------|---------|---------------|
| 1 | UX-R1: LinkBadge CSS-Design | 4a | Klein | Keine |
| 2 | UX-R2: Fragment-Link Spezifikation | 4a | Klein | Keine |
| 3 | UX-R3: Import-Panel Design | 4b | Mittel | Keine |
| 4 | UX-R4: Unresolved Reference Design | 4c | Klein | Keine |
| 5 | UX-R5: Kontrast-Audit | 4a | Keine Aktion | — |

### Design-Entscheidungen Phase 4

**DE-4: Link-Badge vs. inline Styling**
- Badge-Stil (Pill-Form) statt Inline-Text — konsistent mit bestehenden PropertyBadge + StatusBadge Patterns.
- Farben nutzen bestehende semantische Token — kein neues Farbsystem noetig.

**DE-5: URN-Darstellung**
- URNs als nicht-klickbarer Text mit Secondary-Color — vermeidet Nutzer-Frustration durch nicht-aufloesbare Links.
- Kein "broken link" Icon — URNs sind bewusst nicht aufloesbar, kein Fehler.

**DE-6: Import-Panel vs. bestehende Import-Sektion**
- Import-Panel erweitert die bestehende Import-Sektion in `profile-view.tsx` (kein Ersatz).
- Bestehende Import-Cards bleiben, werden um Status (geladen/fehlgeschlagen) und Control-Count ergaenzt.

### Build-Erwartung Phase 4

- **CSS-Impact**: +~0.3 KB gzipped (LinkBadge + Import-Panel + Unresolved-Reference Styles)
- **Keine neuen Design-Token noetig** — alle Farben aus bestehendem System
- **Kein neuer Kontrast-Audit noetig** — bestehende Token sind geprueft
- **Bundle**: ~30 KB → ~32 KB gzipped (weiterhin weit unter 100 KB)

---

### UX-R6: Resolution Loading/Progress State [MITTEL — Sub-Phase 4b]

Phase 4 fuehrt erstmals **asynchrone fetch-Operationen** ein (externe Cataloge laden). Die bestehende Gap G11 (Loading States) wird damit relevant.

**Design-Spezifikation**:

#### Loading-Indikator im Import-Panel

Waehrend ein importierter Catalog geladen wird:

```
┌─────────────────────────────────────────┐
│ Importierte Quellen:                     │
│   📁 OPC Privacy Catalog                │
│      ✅ 4 Controls geladen              │
│   🌐 BSI Grundschutz++                  │
│      ⏳ Wird geladen...                 │
└─────────────────────────────────────────┘
```

**Status pro Import-Quelle**:

| Status | Icon | Text | CSS |
|--------|------|------|-----|
| Pending | `⏳` | "Wird geladen..." | `.import-status--loading` |
| Geladen | `✅` | "{n} Controls geladen" | `.import-status--loaded` |
| Fehler | `⚠` | "Nicht erreichbar" | `.import-status--error` |
| URN (nicht aufloesbar) | `📋` | "Nur Referenz" | `.import-status--urn` |

**Visuelles Design**:
- **Loading**: Pulsierendes Opacity-Animation (`@keyframes pulse`) auf dem Quellen-Eintrag
- **Kein Spinner**: Zu dominant fuer Inline-Status. Dezente Opacity-Animation genuegt
- **Kein Skeleton Screen**: Over-Engineering fuer wenige Sekunden Ladezeit
- **Keine Blockade**: Nicht-geladene Referenzen blockieren NICHT die restliche Anzeige. Profile-Daten (Metadata, Merge-Strategie, eigene Controls) werden sofort gezeigt

**CSS** (in `base.css`):
```css
.import-status--loading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.import-status--error {
  color: var(--color-status-warning-text);
}
```

**a11y**:
- `aria-live="polite"` auf dem Status-Text (Screen-Reader erhaelt Update bei Status-Wechsel)
- `aria-busy="true"` auf dem Import-Panel waehrend Laden

---

### UX-R7: SSP/CompDef Import-Ketten Visualisierung [NIEDRIG — Sub-Phase 4c]

SSP und Component-Definition Dokumente haben eigene Referenzketten die visuell dargestellt werden muessen.

#### SSP: Import-Profile Referenz

SSP-Dokumente referenzieren ein Profile via `import-profile.href`. Diese Referenz wird im System-Header (Characteristics Tab) dargestellt:

```
┌─────────────────────────────────────────┐
│ Import-Profile:                          │
│   📁 Integrated Privacy & Security      │
│      → Basiert auf 2 Catalogen          │
│      [Details anzeigen]                  │
└─────────────────────────────────────────┘
```

**Design**: Bestehende `.content-box` wiederverwenden. "Details anzeigen" oeffnet das aufgeloeste Profile in einem Accordion.

#### CompDef: Source-Catalog Referenz

Component-Definition Dokumente referenzieren Cataloge via `source` in `control-implementations`:

```
┌─────────────────────────────────────────┐
│ Control-Implementations                  │
│   Quelle: OPC Privacy Catalog            │
│   ├── GOV-01: Governance Policy          │
│   ├── ACC-01: Access Control             │
│   └── LAW-01: Legal Compliance           │
└─────────────────────────────────────────┘
```

**Design**: Source-Catalog als Gruppen-Header ueber den Control-Implementations. Bestehende Accordion-Struktur bleibt erhalten. Source-Name wird aus dem geladenen Catalog-Metadata gelesen (Fallback: HREF als Code-Element).

**Design-Entscheidung DE-7: Kein Dependency-Graph**
- Ein visueller Dependency-Graph (SSP → Profile → Catalog) waere visuell ansprechend, aber Over-Engineering fuer den MVP
- Stattdessen: Lineare Darstellung der Referenzkette in Content-Boxes
- Backlog: Graph-Visualisierung nach Phase 4c falls Stakeholder-Feedback positiv

---

### Zusammenfassung Phase 4 UI/UX Aufgaben

| # | Aufgabe | Sub-Phase | Prio | Aufwand | Status |
|---|---------|-----------|------|---------|--------|
| UX-R1 | LinkBadge CSS-Design | 4a | Hoch | Klein | Spezifiziert |
| UX-R2 | Fragment-Link Spezifikation | 4a | Mittel | Klein | Spezifiziert |
| UX-R3 | Import-Panel Design | 4b | Mittel | Mittel | Spezifiziert |
| UX-R4 | Unresolved Reference Design | 4c | Niedrig | Klein | Spezifiziert |
| UX-R5 | Kontrast-Audit | 4a | — | Keine Aktion | Nicht noetig |
| UX-R6 | Resolution Loading State | 4b | Mittel | Klein | Spezifiziert |
| UX-R7 | SSP/CompDef Import-Ketten | 4c | Niedrig | Mittel | Spezifiziert |

**Gesamt CSS-Impact**: ~0.5 KB gzipped (LinkBadge + Import-Panel + Loading + Unresolved)

### Verbleibende Backlog-Items

| # | Aufgabe | Kontext |
|---|---------|---------|
| 1 | Dependency-Graph Visualisierung (DE-7) | Nach Phase 4c falls gewuenscht |
| 2 | External-Link Icon (↗) bei absolute URLs | Visueller Hinweis auf neue Tabs |
| 3 | Manueller Dark Mode Toggle (G23) | Nutzer-Praeferenz persistieren |
| 4 | Loading State / Skeleton Screens erweitern (G11) | Fuer grosse Cataloge (NIST 800-53) |

---

## Phase 4 CSS-Implementierung (2026-02-09)

### Umgesetzte Aufgaben

| # | Aufgabe | Status | Details |
| --- | ------- | ------ | ------- |
| UX-R1 | LinkBadge CSS | **IMPLEMENTIERT** | 6 Badge-Varianten (implements, required, related, bsi, template, default) in `base.css` |
| UX-R2 | Fragment-Link CSS | **IMPLEMENTIERT** | `.link-urn` Klasse fuer nicht-klickbare URN-Referenzen |
| UX-R4 | Unresolved Reference CSS | **IMPLEMENTIERT** | `.unresolved-ref` mit Warning-Farben, Border-Left, Action-Buttons |
| UX-R6 | Loading-Animation CSS | **IMPLEMENTIERT** | `@keyframes pulse` + 4 Status-Klassen (loading, loaded, error, urn) |
| UX-D1 | ACCESSIBILITY_STATEMENT.md | **ERSTELLT** | BITV 2.0 Erklaerung mit 10 WCAG-Kriterien, Einschraenkungen, Feedback, Durchsetzung |

### Neue CSS-Klassen in `base.css`

```css
/* Phase 4: OSCAL Resolution UI Components */
.link-badge                  — Basis-Stil (Pill-Form, inline)
.link-badge--implements      — Gruen (Success-Token)
.link-badge--required        — Rot (Error-Token)
.link-badge--related         — Blau (Info-Token)
.link-badge--bsi             — Orange (Orange-Token)
.link-badge--template        — Grau (Secondary-Token)
.link-badge--default         — Grau (Text-Token)
.link-urn                    — URN-Referenz (nicht-klickbar)
.import-status--loading      — Pulse-Animation
.import-status--loaded       — Success-Farbe
.import-status--error        — Warning-Farbe
.import-status--urn          — Secondary-Farbe
.unresolved-ref              — Warning-Box mit Border-Left
.unresolved-ref-actions      — Button-Leiste
```

### Neue Datei

- `docs/ACCESSIBILITY_STATEMENT.md` — BITV 2.0 Barrierefreiheitserklaerung (Pflichtangabe fuer oeffentliche Stellen)

### Build

- Bundle: 15.98 KB JS + 7.26 KB CSS gzipped (+0.79 KB CSS fuer Phase 4 Styles)
- Tests: 485/485 bestanden | 18 Testdateien
- TypeScript: 0 Errors

### Aktualisierter Aufgaben-Status

| # | Aufgabe | Sub-Phase | Status |
| --- | ------- | --------- | ------ |
| UX-R1 | LinkBadge CSS-Design | 4a | **IMPLEMENTIERT** |
| UX-R2 | Fragment-Link CSS | 4a | **IMPLEMENTIERT** |
| UX-R3 | Import-Panel Design | 4b | Spezifiziert (CSS durch FE bei Komponenten-Bau) |
| UX-R4 | Unresolved Reference CSS | 4c | **IMPLEMENTIERT** |
| UX-R5 | Kontrast-Audit | 4a | Nicht noetig (bestehende Token) |
| UX-R6 | Resolution Loading State CSS | 4b | **IMPLEMENTIERT** |
| UX-R7 | SSP/CompDef Import-Ketten | 4c | Spezifiziert (CSS durch FE bei Komponenten-Bau) |
| UX-D1 | ACCESSIBILITY_STATEMENT.md | — | **ERSTELLT** |

---

## Phase 4a — Zusammenfassung (ABGESCHLOSSEN)

**Commit**: `4394bb2` | **Bundle**: ~30.7 KB gzipped | **Tests**: 531 (19 Dateien)

### UI/UX Beitrag Phase 4a

| Aufgabe | Ergebnis |
|---------|----------|
| UX-R1: LinkBadge CSS | 6 Badge-Varianten in `base.css` (implements, required, related, bsi, template, default) |
| UX-R2: Fragment-Link CSS | `.link-urn` Klasse fuer nicht-klickbare URN-Referenzen |
| UX-R4: Unresolved Reference CSS | `.unresolved-ref` vorgebaut (Warning-Box, Border-Left, Action-Buttons) |
| UX-R5: Kontrast-Audit | Kein Audit noetig — bestehende Status-Token (22/22 PASS aus B4) |
| UX-R6: Loading State CSS | `@keyframes pulse` + 4 Status-Klassen vorgebaut |
| UX-D1: ACCESSIBILITY_STATEMENT.md | BITV 2.0 Erklaerung erstellt |

### Phase 4a FE-Deliverables — Design Review

Folgende Komponenten wurden vom Frontend Developer in Phase 4a geliefert (Commit `4394bb2`):

#### LinkBadge (`src/components/shared/link-badge.tsx`) — REVIEW

| Aspekt | Spec (UX-R1) | Umsetzung | Bewertung |
|--------|-------------|-----------|-----------|
| Badge-Varianten | 6 (`implements`→gruen, `required`→rot, `related`→blau, `bsi`→orange, `template`→grau, `default`→grau) | 6 Varianten, CSS-Klassen korrekt | GUT |
| Visuelles Design | Pill-Form, analog PropertyBadge | `display: inline-block`, `padding`, `border-radius` | GUT |
| CSS-Token | Bestehende Status-Token | `--color-status-success/error/info/orange-bg/text` | GUT |
| Dark Mode | Ueber CSS-Variablen | Automatisch via Token-System | GUT |

**QA Finding F1**: `aria-label` fehlt auf `<span>` — WCAG 4.1.2. Fix in Phase 4b einplanen (reiner HTML-Fix, kein CSS-Impact).

#### HrefParser (`src/services/href-parser.ts`) — REVIEW

| Aspekt | Bewertung |
|--------|-----------|
| 4 Patterns (urn, absolute, fragment, relative) | GUT — deckt alle OSCAL HREF-Typen ab |
| `isResolvable` Flag | GUT — relative Pfade korrekt auf `false` (Phase 4a) |
| Layer-Konformitaet (Domain Layer, keine Preact-Imports) | GUT |
| Reine Funktion (kein State, keine Side-Effects) | GUT |

#### Fragment-Links (`control-detail.tsx`) — REVIEW

| Aspekt | Spec (UX-R2) | Umsetzung | Bewertung |
|--------|-------------|-----------|-----------|
| Fragment-Links klickbar | `#CONTROL-ID` → Deep-Link | `renderLink()` mit `parseHref()`, `location.hash` Update | GUT |
| Absolute URLs | Neuer Tab | `<a target="_blank">` | GUT |
| URN-Darstellung | Nicht-klickbar, grau | `.link-urn` CSS-Klasse, `cursor: default` | GUT |
| LinkBadge-Platzierung | Nach dem `<a>` Tag | `<LinkBadge rel={link.rel}>` inline | GUT |

**Phase 4a Design Review — Keine Issues gefunden.**

Alle 3 Komponenten entsprechen den UX-Spezifikationen (UX-R1, UX-R2). CSS-Token korrekt verwendet, Dark Mode kompatibel, a11y-konform (bis auf F1 LinkBadge aria-label).

---

## AKTUELLER AUFTRAG: Phase 4b — Import-Panel UI (2026-02-09)

**Prioritaet**: MITTEL | **Quelle**: Architect nach Abschluss Phase 4a
**Vorgaenger**: Phase 4a CSS implementiert (UX-R1, UX-R2, UX-R4, UX-R6 alle DONE)
**Leitprinzip**: Bestehende Design-Token wiederverwenden, keine neuen Farbsysteme.

### Kontext

Phase 4a CSS ist implementiert. Phase 4b bringt die **ImportPanel**-Komponente in die Profile-Ansicht. Die CSS-Grundlagen (`.import-status--*`, `.unresolved-ref`, `@keyframes pulse`) sind bereits in `base.css` vorhanden. Phase 4b erfordert zusaetzliche CSS-Klassen fuer die ImportPanel-Struktur.

### Status der Phase 4 UX-Aufgaben

| Aufgabe | Phase 4a | Phase 4b |
|---------|----------|----------|
| UX-R1: LinkBadge CSS | DONE | — |
| UX-R2: Fragment-Link CSS | DONE | — |
| UX-R3: Import-Panel Design | Spezifiziert | **AKTIV** |
| UX-R4: Unresolved Reference CSS | DONE (vorgebaut) | — |
| UX-R5: Kontrast-Audit | Nicht noetig | Nicht noetig |
| UX-R6: Loading State CSS | DONE (vorgebaut) | **AKTIV** (Integration) |
| UX-R7: SSP/CompDef Import-Ketten | — | Phase 4c |

---

### UX-R3b: Import-Panel CSS Integration [MITTEL]

Die Import-Panel Spezifikation (UX-R3) ist fertig. Der Frontend-Developer baut die Komponente. Folgende CSS-Klassen werden benoetigt:

**Neue CSS-Klassen** (in `base.css`):

```css
/* Import Panel Container */
.import-panel {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-surface);
  margin-bottom: 1rem;
}

.import-panel-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

/* Import Source Cards */
.import-source-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.import-source-card:last-child {
  border-bottom: none;
}

.import-source-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.import-source-info {
  flex: 1;
}

.import-source-href {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  word-break: break-all;
}

/* Import Panel Summary */
.import-panel-summary {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.import-panel-merge {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.import-panel-merge code {
  background: var(--color-bg-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: var(--font-mono);
}

/* Loading State (nutzt bestehendes @keyframes pulse) */
.import-panel-loading {
  padding: 0.5rem;
  color: var(--color-text-secondary);
}

.loading-pulse {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 1.5s ease-in-out infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}
```

**Design-Prinzipien**:
- Alle Farben ueber CSS-Variablen (Dark Mode kompatibel)
- Layout: Flexbox, keine festen Breiten
- Mobile: Natuerliches Stacking, keine Breakpoint-Aenderungen noetig
- Font-Familie: `var(--font-mono)` fuer HREFs und Code-Elemente

**Geschaetzter CSS-Impact**: +~0.2 KB gzipped

---

### UX-R6b: Loading State Integration [KLEIN]

Die Loading-Animation (`@keyframes pulse`, `.import-status--*`) ist bereits in `base.css` vorgebaut. Phase 4b verbindet die bestehenden Klassen mit der ImportPanel-Komponente:

| CSS-Klasse | Vorgebaut in 4a | Genutzt in 4b |
|------------|-----------------|---------------|
| `.import-status--loading` | JA | ImportSourceCard |
| `.import-status--loaded` | JA | ImportSourceCard |
| `.import-status--error` | JA | ImportSourceCard |
| `.import-status--urn` | JA | ImportSourceCard |
| `@keyframes pulse` | JA | `.loading-pulse` Indikator |

**Keine neuen Animationen oder Design-Token noetig.**

---

### UX-R8: LinkBadge aria-label Fix CSS [KEIN CSS-IMPACT]

QA Finding F1 (LinkBadge fehlt `aria-label`) ist ein reiner HTML-Fix im Frontend. Kein CSS betroffen. Bestehende Styles bleiben unveraendert.

---

### Umsetzungsreihenfolge

| # | Aufgabe | Aufwand | Status |
|---|---------|---------|--------|
| 1 | UX-R3b: Import-Panel CSS | Klein | Spezifiziert |
| 2 | UX-R6b: Loading State Integration | Keine Aktion (vorgebaut) | DONE |
| 3 | UX-R8: LinkBadge Fix | Keine Aktion (HTML) | N/A |

### Build-Erwartung Phase 4b (UI/UX)

- **CSS-Impact**: +~0.2 KB gzipped (Import-Panel Klassen)
- **Keine neuen Design-Token** — alle Farben aus bestehendem System
- **Keine neuen Animationen** — bestehendes `@keyframes pulse` wiederverwendet
- **Bundle**: ~31 KB → ~32.5 KB gzipped (inkl. JS + CSS)
