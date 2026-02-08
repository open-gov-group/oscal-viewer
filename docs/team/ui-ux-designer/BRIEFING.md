# UI/UX Designer - Briefing & Kommunikation

**Rolle**: UI/UX Designer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-07
**Phase**: Phase 3 (PWA, Dokumentation, npm Package)

---

## Deine Verantwortlichkeiten

- Intuitive Darstellung komplexer OSCAL-Strukturen
- Navigation in hierarchischen Dokumenten (Controls, Groups)
- Design System aufbauen und pflegen
- Accessibility (WCAG 2.1 AA) sicherstellen
- Responsive Design fuer alle Bildschirmgroessen

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

### Was wurde gebaut
Der **Catalog Viewer** ist die Referenz-Implementation fuer alle weiteren Renderer:

- **Layout**: Sidebar (320px) + Content Area (Grid)
- **Navigation**: Hierarchischer Baum mit expand/collapse (Chevron-Animation)
- **Control-Detail**: ID-Badge, Properties, Parameter, Parts, Links, Sub-Controls
- **Metadata-Panel**: Expandable `<details>` mit Titel, Version, Rollen, Parteien
- **Property-Badges**: Name:Value Pills mit Flex-Wrap
- **Responsive**: Print-Styles (Sidebar versteckt), mobile-faehig

### Bestehende CSS Custom Properties (in `src/styles/base.css`)
```css
--color-primary: #2563eb      /* Blau - Links, Badges */
--color-bg: #f8fafc            /* Heller Hintergrund */
--color-surface: #ffffff       /* Karten-Hintergrund */
--color-text: #1e293b          /* Haupttext */
--color-text-secondary: #64748b /* Sekundaertext */
--color-border: #e2e8f0        /* Raender */
--color-accent: #f59e0b        /* Amber - Parameter */
--radius: 8px                  /* Standard-Radius */
```

### Bestehende Komponenten-Styles
- `.catalog-view`, `.catalog-sidebar`, `.catalog-content`
- `.group-tree`, `.group-node`, `.control-node`, `.control-node--selected`
- `.control-detail`, `.control-id-badge`, `.control-class`
- `.metadata-panel`, `.property-badge`, `.property-list`
- `.param-item`, `.part-view`, `.part-prose`
- `.dropzone`, `.dropzone.dragging`

---

## Aktueller Auftrag - Phase 2

### Aufgabe 1: Design-Spezifikation Profile Renderer (Issue #4)

**Profile** zeigt Import-Beziehungen und Control-Modifikationen.

**Design-Vorschlaege**:
- Import-Quellen als Karten mit Pfeil-Verbindungen (woher kommen die Controls?)
- Include/Exclude-Controls als Tags (gruen/rot)
- Modifikationen hervorheben (welche Parameter geaendert wurden)
- Merge-Strategie als Info-Box

**Zu definieren**:
- Layout: Sidebar oder linear?
- Wie zeigen wir "diese Controls kommen aus Catalog X"?
- Farbkodierung fuer Modifikationstypen

### Aufgabe 2: Design-Spezifikation Component-Definition Renderer (Issue #5)

**Component-Definition** zeigt Software/Hardware-Komponenten und deren Control-Mappings.

**Design-Vorschlaege**:
- Komponenten-Karten mit Typ-Icon (Software, Hardware, Service, Policy, etc.)
- Control-Implementation als verschachtelte Liste pro Komponente
- Capabilities als optionale Sektion
- Status-Badges fuer Implementation-Status

**Zu definieren**:
- Karten-Layout oder Liste?
- Wie visualisiert man "Komponente X implementiert Control Y"?
- Gruppierung: nach Komponente oder nach Control?

### Aufgabe 3: Design-Spezifikation SSP Renderer (Issue #6)

**SSP** ist der komplexeste Dokumenttyp mit vielen Sektionen.

**Design-Vorschlaege**:
- **Tab-Navigation** oder **Accordion** fuer Hauptsektionen:
  1. System-Characteristics (Name, Beschreibung, Kategorisierung)
  2. System-Implementation (Users, Components, Services)
  3. Control-Implementation (wie jeder Control umgesetzt wird)
- System-Informationen prominent im Header
- Security-Kategorisierung visuell hervorheben (Low/Moderate/High)

**Zu definieren**:
- Tabs vs. Accordion vs. scrollbare Sektionen?
- Dashboard-aehnliche Uebersicht am Anfang?
- Wie zeigen wir die Beziehung zwischen Komponenten und Controls?

### Aufgabe 4: Design System erweitern

**Neue CSS Custom Properties definieren** fuer Phase 2:
- Farben fuer Dokumenttyp-Badges (Catalog=blau, Profile=gruen, CompDef=lila, SSP=orange)
- Farben fuer Implementierungsstatus (implemented, partial, planned, alternative, not-applicable)
- Icon-Set oder SVG-Sprites fuer Dokumenttypen

**Neue Komponenten-Patterns**:
- Tab-Navigation Komponente
- Status-Badge Komponente
- Referenz-Link Komponente (fuer cross-document Referenzen)
- Empty-State Illustrationen

### Aufgabe 5: Such-UI Design (Issue #7)

- Suchfeld-Platzierung (Header? Sidebar? Floating?)
- Live-Ergebnis-Dropdown oder Inline-Filterung?
- Ergebnis-Highlighting Stil
- Keine-Ergebnisse State

---

## Accessibility-Anforderungen (WCAG 2.1 AA)

- Keyboard-Navigation fuer alle Interaktionen
- Screen-Reader-Kompatibilitaet (ARIA Rollen sind in Phase 1 etabliert)
- Farbkontraste >= 4.5:1
- Focus-Indikatoren (bereits in Phase 1 vorhanden)
- Keine Information nur durch Farbe vermitteln

### Bestehende Guidelines
- `docs/guidelines/ACCESSIBILITY.md`
- `docs/guidelines/CODE_STYLE.md`

---

## Offene Design-Entscheidungen

1. **Dark Mode**: Soll ein Dark Mode eingeplant werden? (Toggle im Header?)
2. **Farbschema**: Aktuelles Schema beibehalten oder anpassen?
3. **Tab vs. Accordion**: Fuer SSP-Sektionen - was ist intuitiver?
4. **Dokumenttyp-Farben**: Vorschlag oben - passt das?

---

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Frontend Developer | Design-Umsetzung, Komponentenspezifikation |
| QA Engineer | Accessibility Testing |
| Tech Lead | Komponentenarchitektur |

---

## Design-Review Phase 2 (UI/UX Designer)

### Aufgabe 1: Profile Renderer - Bewertung

**Umsetzung**: Lineares Layout (kein Sidebar) - korrekte Entscheidung, da Profiles keine tiefe
Hierarchie haben. Import-Karten mit Include/Exclude-Tags (gruen/rot), Merge-Strategie als Info-Box,
Parameter-Settings und Alterations als separate Sektionen.

**Positiv**:
- Lineares Layout passt zur Datenstruktur (Import -> Merge -> Modify)
- Include/Exclude wird durch Text-Label UND Farbe unterschieden (a11y-konform)
- Stats-Bar gibt sofortigen Ueberblick
- Sektionen mit `aria-labelledby` korrekt verknuepft

**Verbesserungsbedarf**:
| # | Problem | Prioritaet | Aufwand |
|---|---------|------------|---------|
| P1 | Hardcoded Farben (`#dcfce7`, `#166534`, etc.) funktionieren nicht im Dark Mode | Hoch | Mittel |
| P2 | Import-href wird als reiner Text gezeigt - keine visuelle Verbindung "diese Controls kommen aus Catalog X" | Mittel | Mittel |
| P3 | Alter-Details zeigen nur technische IDs (`by-name`, `by-class`) - fuer Endnutzer schwer verstaendlich | Niedrig | Klein |

**Design-Entscheidungen (beantwortet)**:
- **Layout**: Linear ist korrekt (nicht Sidebar)
- **"Controls kommen aus Catalog X"**: Import-Cards zeigen die `href` als Code-Element. Empfehlung: Icon + "Source:" Label vor dem Link, eventuell mit visueller Pfeil-Verbindung in einer spaeteren Phase
- **Farbkodierung Modifikationstypen**: Gruen fuer Additions, Rot fuer Removals, Amber fuer Parameter-Aenderungen - bereits korrekt umgesetzt

---

### Aufgabe 2: Component-Def Renderer - Bewertung

**Umsetzung**: Master-Detail Layout (280px Sidebar + Content Area) analog zum Catalog.
Komponenten-Liste mit Type-Badge (lila), Detail-Ansicht mit Description, Purpose, Roles,
Control-Implementations. Capabilities als separate Sektion unterhalb.

**Positiv**:
- Master-Detail-Pattern konsistent mit Catalog angewendet
- Type-Badge in Sidebar ermoeglicht schnelles Scannen
- Control-Implementations gut organisiert pro Source
- Lila Farbschema unterscheidet klar vom Catalog (blau)
- `role="listbox"` + `role="option"` korrekt verwendet

**Verbesserungsbedarf**:
| # | Problem | Prioritaet | Aufwand |
|---|---------|------------|---------|
| C1 | Type-Badge nutzt hardcoded Lila (`#f0e6ff`, `#6b21a8`) - kein Dark Mode | Hoch | Klein |
| C2 | Kein Icon fuer Komponenten-Typen (Software, Hardware, Service, etc.) | Mittel | Mittel |
| C3 | Capabilities-Sektion kann bei vielen Komponenten untergehen (steht ganz unten) | Niedrig | Mittel |
| C4 | `compdef-requirement` hat hardcoded `border-left: 3px solid #8b5cf6` | Hoch | Klein |
| C5 | UUID-Anzeige bei Capabilities (`slice(0,8)...`) ist fuer Endnutzer kryptisch | Niedrig | Klein |

**Design-Entscheidungen (beantwortet)**:
- **Karten vs. Liste**: Sidebar-Liste mit Detail-Panel ist korrekt (konsistent mit Catalog)
- **Komponente X implementiert Control Y**: Wird gut durch verschachtelte Darstellung geloest (Komponente > Control-Implementations > Requirements)
- **Gruppierung**: Nach Komponente ist korrekt - Nutzer denken "was implementiert meine Komponente?"

---

### Aufgabe 3: SSP Renderer - Bewertung

**Umsetzung**: Tab-Navigation mit 3 Tabs (Characteristics, Implementation, Controls).
System-Header mit Name, Status-Badge, Sensitivity-Badge. Stats-Bar. Import-Profile-Referenz.
CIA-Triad als 3-Spalten-Grid. Implementation mit Users/Components/Inventory. Controls mit
Requirement-Cards, Statements und By-Component-Descriptions.

**Positiv**:
- Tab-Pattern ist exzellente Wahl fuer SSP (3 klar abgegrenzte Bereiche)
- CIA-Triad-Grid ist visuell klar und uebersichtlich
- Status-Badges sind gut farbkodiert (operational=gruen, under-dev=gelb, etc.)
- System-Header zeigt die wichtigsten Infos sofort
- `role="tablist"`, `role="tab"`, `aria-selected` korrekt verwendet

**Verbesserungsbedarf**:
| # | Problem | Prioritaet | Aufwand |
|---|---------|------------|---------|
| S1 | Tab-Panel fehlt `aria-labelledby` und `id` (Verbindung Tab <-> Panel) | Hoch | Klein |
| S2 | Tabs haben kein `aria-controls` Attribut | Hoch | Klein |
| S3 | Tabs haben kein `tabindex` Management (nur aktiver Tab tabindex=0) | Hoch | Klein |
| S4 | Keine Pfeil-Tasten-Navigation zwischen Tabs | Hoch | Mittel |
| S5 | Hardcoded Status-Farben funktionieren nicht im Dark Mode | Hoch | Mittel |
| S6 | Impact-Level-Werte koennten Farb-Kodierung nutzen (low=gruen, moderate=gelb, high=rot) | Niedrig | Klein |
| S7 | `by-component` zeigt nur UUID-Ausschnitt - besser waere der Komponentenname | Mittel | Mittel |

**Design-Entscheidungen (beantwortet)**:
- **Tabs vs. Accordion**: Tabs sind korrekt - SSP hat 3 distinkte Bereiche, die nicht gleichzeitig sichtbar sein muessen
- **Dashboard-Uebersicht**: Der Stats-Bar + System-Header erfuellen diese Rolle bereits. Ein separates Dashboard waere Over-Engineering
- **Beziehung Komponenten <-> Controls**: Wird durch `by-components` in der Controls-Ansicht geloest. Fuer eine bidirektionale Visualisierung waere ein Dependency-Graph in einer spaeteren Phase denkbar

---

### Aufgabe 4: Design System - Bewertung

**Aktueller Stand der CSS Custom Properties** (`src/styles/base.css`):
```
Definiert: --color-primary, --color-primary-hover, --color-bg, --color-bg-secondary,
           --color-text, --color-text-secondary, --color-border, --color-error,
           --color-success, --font-family, --font-mono, --border-radius, --shadow, --shadow-lg
Dark Mode: Nur --color-bg, --color-bg-secondary, --color-text, --color-text-secondary,
           --color-border werden ueberschrieben
```

**KRITISCH - `--color-surface` fehlt in `:root`!**
Die `.search-results` Klasse nutzt `var(--color-surface)` als `background-color`, aber diese
Variable ist nirgends definiert. Das ist ein **Bug** - der Dropdown-Hintergrund wird transparent
oder schwarz im Dark Mode.

**Fehlende Design-Tokens (nach Prioritaet)**:

| Kategorie | Token | Empfohlener Wert (Light) | Empfohlener Wert (Dark) |
|-----------|-------|--------------------------|-------------------------|
| **Bug-Fix** | `--color-surface` | `#ffffff` | `#1f2937` |
| **Semantisch** | `--color-warning` | `#f59e0b` | `#fbbf24` |
| **Semantisch** | `--color-info` | `#3b82f6` | `#60a5fa` |
| **Dokument-Typ** | `--color-catalog` | `#1a56db` | `#60a5fa` |
| **Dokument-Typ** | `--color-profile` | `#16a34a` | `#4ade80` |
| **Dokument-Typ** | `--color-compdef` | `#7c3aed` | `#a78bfa` |
| **Dokument-Typ** | `--color-ssp` | `#ea580c` | `#fb923c` |
| **Status** | `--color-status-implemented` | `#16a34a` | `#4ade80` |
| **Status** | `--color-status-partial` | `#ca8a04` | `#facc15` |
| **Status** | `--color-status-planned` | `#2563eb` | `#60a5fa` |
| **Status** | `--color-status-alternative` | `#7c3aed` | `#a78bfa` |
| **Spacing** | `--space-xs` bis `--space-xl` | 0.25rem - 2rem | (gleich) |
| **Font-Size** | `--text-xs` bis `--text-xl` | 0.75rem - 1.25rem | (gleich) |

**Hardcoded Farben** (muessen zu Variablen werden):
Insgesamt **23 hardcoded Farbwerte** in `base.css` gefunden, die im Dark Mode nicht funktionieren:
- Parameter-Akzent: `#f59e0b` (3x)
- CompDef-Lila: `#f0e6ff`, `#6b21a8`, `#8b5cf6` (5x)
- SSP-Orange: `#f97316` (1x)
- Status-Gruen: `#dcfce7`, `#166534`, `#bbf7d0` (5x)
- Status-Rot: `#fee2e2`, `#991b1b`, `#fecaca` (5x)
- Status-Gelb: `#fef9c3`, `#854d0e` (2x)
- Status-Blau: `#dbeafe`, `#1e40af` (2x)
- Error-Bg: `#fef2f2` (1x)

---

### Aufgabe 5: Such-UI - Bewertung

**Umsetzung**: Search-Bar im Document-Header platziert (immer sichtbar). SVG-Suchicon,
Input mit Placeholder, Clear-Button. Dropdown mit Ergebnissen: Type-Badge, ID, Title, Context.
Max 50 Ergebnisse mit "more"-Indikator.

**Positiv**:
- Platzierung im Header ist optimal (globale Suche, immer erreichbar)
- Live-Dropdown mit Ergebnis-Vorschau ist gutes UX-Pattern
- Result-Count gibt sofortiges Feedback
- `aria-label`, `aria-expanded`, `role="listbox"` vorhanden
- Clear-Button mit `aria-label="Clear search"` korrekt

**Verbesserungsbedarf**:
| # | Problem | Prioritaet | Aufwand |
|---|---------|------------|---------|
| SR1 | `--color-surface` NICHT DEFINIERT - Dropdown hat keinen sichtbaren Hintergrund (BUG) | Kritisch | Klein |
| SR2 | Keine Keyboard-Navigation im Dropdown (Pfeiltasten) | Hoch | Mittel |
| SR3 | Kein `aria-activedescendant` fuer Screen-Reader | Hoch | Mittel |
| SR4 | Ergebnisse nicht fokussierbar via Tab | Hoch | Klein |
| SR5 | Kein Escape-Key zum Schliessen des Dropdowns | Mittel | Klein |
| SR6 | Kein Highlighting des Suchbegriffs in Ergebnissen | Niedrig | Mittel |
| SR7 | Search Results Items sind `cursor: default` statt `cursor: pointer` | Niedrig | Klein |
| SR8 | Klick auf Ergebnis hat keine Aktion (kein onSelect callback) | Mittel | Mittel |

---

### Accessibility-Audit Phase 2

**WCAG 2.1 AA Compliance-Status**:

| Kriterium | Status | Details |
|-----------|--------|---------|
| 1.3.1 Info & Relationships | OK | Semantisches HTML, ARIA Rollen korrekt |
| 1.4.3 Contrast (Minimum) | WARNUNG | `--color-text-secondary` (#6b7280) auf weiss = 4.6:1 (knapp AA) |
| 1.4.11 Non-text Contrast | WARNUNG | Status-Badges: Farbe + Text - aber im Dark Mode unklar |
| 2.1.1 Keyboard | FEHLT | Tree: keine Pfeiltasten. Tabs: keine Pfeiltasten. Search: keine Pfeiltasten |
| 2.4.1 Bypass Blocks | FEHLT | Keine Skip-Links vorhanden |
| 2.4.3 Focus Order | WARNUNG | Tab-Reihenfolge grundsaetzlich korrekt, aber Tab-Pattern unvollstaendig |
| 2.4.7 Focus Visible | FEHLT | Kein `:focus-visible` im globalen CSS (nur Search-Input hat Focus-Style) |
| 4.1.2 Name, Role, Value | WARNUNG | SSP Tabs: `aria-controls` fehlt. Search: `aria-activedescendant` fehlt |

**Top-3 Accessibility-Fixes (sollten priorisiert werden)**:
1. `:focus-visible` Styles global hinzufuegen
2. Skip-Links im App-Layout
3. Keyboard-Navigation fuer Tree, Tabs, Search-Dropdown

---

### Offene Design-Entscheidungen - Antworten

**1. Dark Mode**:
Empfehlung: Automatischer Dark Mode via `prefers-color-scheme` reicht fuer Phase 2.
Ein manueller Toggle gehoert in Phase 3 (PWA, Issue #8).
**ABER**: Alle 23 hardcoded Farben muessen zu CSS-Variablen werden, sonst ist der
bestehende automatische Dark Mode visuell kaputt.

**2. Farbschema**:
Beibehalten. Das Blue-Primary (#1a56db) ist professionell und passend fuer Government/Security.
Erweitern um Dokumenttyp-Farben und Status-Farben (siehe Token-Tabelle oben).

**3. Tab vs. Accordion fuer SSP**:
**Tabs sind korrekt** (bereits implementiert). SSP hat 3 klar abgegrenzte Bereiche.
Tabs bieten bessere UX als Accordion: schnellerer Wechsel, klarere Orientierung.

**4. Dokumenttyp-Farben**:
Vorschlag passt: Catalog=Blau, Profile=Gruen, CompDef=Lila, SSP=Orange.
Diese Farben werden bereits implizit in der Implementation verwendet.
Muessen als CSS Custom Properties formalisiert werden.

---

### Zusammenfassung: Priorisierte Massnahmen

**Kritisch (vor Release)**:
1. `--color-surface` in `:root` definieren (Bug-Fix)
2. `:focus-visible` Styles global hinzufuegen

**Hoch (Phase 2 Abschluss)**:
3. Alle hardcoded Farben zu CSS-Variablen migrieren
4. Dark-Mode-Varianten fuer alle neuen Tokens
5. SSP Tab-Pattern vervollstaendigen (aria-controls, tabindex, Pfeiltasten)
6. Skip-Links hinzufuegen

**Mittel (Phase 3 Beginn)**:
7. Keyboard-Navigation fuer Tree und Search-Dropdown
8. Search: Klick auf Ergebnis navigiert zum Element
9. Component-Typ-Icons

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | UI/UX Designer | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | UI/UX Designer | Phase 2 Briefing: Design-Spezifikationen fuer alle Renderer | Aktiv |
| 2026-02-06 | UI/UX Designer | Architect | Design-Review Phase 2: alle 5 Aufgaben bewertet, 1 Bug gefunden, Accessibility-Audit, Design-Entscheidungen beantwortet | Abgeschlossen |
| 2026-02-06 | Architect | UI/UX Designer | UI/UX Overhaul umgesetzt (Commit a567973) - siehe "Behobene Findings" Sektion | Info |
| 2026-02-06 | UI/UX Designer | Architect | Review des Overhauls: 2 Nachbesserungen (aria-haspopup, Kontrast-Fix) - behoben | Abgeschlossen |
| 2026-02-06 | Architect | UI/UX Designer | UX Redesign: Full-Width + Sticky Sidebar (Vergleich mit viewer.oscal.io) | Aktiv |
| 2026-02-06 | UI/UX Designer | Architect | UX Redesign umgesetzt: CSS-only Refactoring, 254 Tests bestanden, 0 TSX-Aenderungen | Abgeschlossen |
| 2026-02-07 | Architect | UI/UX Designer | Neues Briefing 01-04: Dashboard-Redesign, Boxes/Accordions, Filter, Deep-Linking | Aktiv |
| 2026-02-07 | UI/UX Designer | Architect | Gap-Analyse: 24 Gaps identifiziert, 7 eigene ToDos, 12 Frontend-, 5 TechLead-, 8 QA-, 1 DevOps-ToDos | Aktiv |
| 2026-02-07 | UI/UX Designer | Architect | Sprint 1 Design Review: 7/7 FE-Tasks OK, 1 CSS-Fix (.accordion-heading), 2 Hinweise (CompDef headingLevel, Profile View nachholen) | Abgeschlossen |
| 2026-02-07 | UI/UX Designer | Architect | Tech Lead Review: CODING_STANDARDS.md v2.0.0 mit 10 Patterns GUT. TL2 (Deep-Linking ADR) kein Blocker - Spec U11 reicht. Empfehlung: Accordion-Pattern + Deep-Link-Pattern nachtraeglich in Standards aufnehmen | Abgeschlossen |
| 2026-02-07 | UI/UX Designer | Architect | Sprint 2 Design Review: 6/6 FE-Tasks SEHR GUT. 1 CSS-Cleanup (63 Zeilen Dead Code), 2 Minor Issues. 11/24 Gaps geschlossen. Sprint 3 Plan erstellt | Abgeschlossen |
| 2026-02-07 | UI/UX Designer | Architect | Sprint 3 Design Review: 5/5 Tasks GUT-SEHR GUT. 2 CSS-Fixes (cursor, rgba), 1 Info (AccordionGroup nicht integriert). 13/24 Gaps geschlossen. Alle MUST-Gaps erledigt — bereit fuer Phase 3 | Abgeschlossen |
| 2026-02-07 | Architect | UI/UX Designer | Stakeholder-Feedback: 3 Aufgaben (S1: Nav-Titel sichtbar, S2: Nested Part-Akkordions, S3: IFG/BITV Kontrast-Audit). Details im Abschnitt "AKTUELLER AUFTRAG" | Aktiv |
| 2026-02-07 | UI/UX Designer | Architect | Stakeholder-Feedback Review: S1 OK, S2 OK (1 CSS-Fix R12), S3 OK. Kontrast-Audit: 22/22 PASS. B5+B6 Reviews bestanden. Bundle: 14.20 KB JS + 6.36 KB CSS | Abgeschlossen |
| 2026-02-07 | Architect | UI/UX Designer | Phase 3 Briefing: Issues #8-#10 (PWA, Doku, npm Package). Details im Abschnitt "AKTUELLER AUFTRAG Phase 3" | Aktiv |
| 2026-02-07 | QA Engineer | Alle | INFO: Code-Kommentierungs-Audit — Note C- (2.6%). Neue Standards werden durch Tech Lead in CODING_STANDARDS Sektion 11 definiert. Details: `docs/team/qa-engineer/BRIEFING.md` | Info |
| 2026-02-08 | QA Engineer | Alle | INFO: Code-Kommentierungs-Audit ABGESCHLOSSEN — Finalnote A- (7.1%). CODING_STANDARDS v4.2.0 Sektion 11 + eslint-plugin-jsdoc aktiv | Abgeschlossen |

---

## UI/UX Overhaul - Behobene Findings (ABGESCHLOSSEN)

**Commit**: `a567973` | **Bundle**: 20.69 KB gzipped

### Status aller Phase 2 Findings

#### Kritische Findings (ALLE BEHOBEN)

| Finding | Status | Umsetzung |
|---------|--------|-----------|
| `--color-surface` nicht in `:root` definiert (Bug) | BEHOBEN | `--color-surface: #ffffff` (Light), `#1f2937` (Dark) |
| `:focus-visible` fehlt global | BEHOBEN | Globale `:focus-visible` und `:focus:not(:focus-visible)` Regeln |

#### Hohe Prioritaet (ALLE BEHOBEN)

| Finding | Status | Umsetzung |
|---------|--------|-----------|
| 23 hardcoded Farben (kein Dark Mode) | BEHOBEN | 21 semantische CSS-Variablen mit Dark Mode Varianten extrahiert |
| SSP Tabs: aria-controls/tabindex/Pfeiltasten fehlen | BEHOBEN | WAI-ARIA Tabs Pattern komplett: `tabDefs`-Array, Arrow/Home/End, `aria-controls`, tabIndex-Roving |
| Skip-Links fehlen | BEHOBEN | `<a href="#main-content" class="skip-link">` als erstes Kind |
| SearchBar: Keyboard-Navigation fehlt | BEHOBEN | ArrowUp/Down/Escape, `role="combobox"`, `aria-haspopup="listbox"`, `aria-activedescendant` |

#### Zusaetzliche Verbesserungen (UI/UX Overhaul)

| Massnahme | Details |
|-----------|---------|
| Material AppBar | Sticky Header, `--color-primary` Background, weisse Schrift, Document-Controls integriert |
| Source Sans 3 Font | Google Fonts (0 KB JS-Impact), professioneller Look |
| Responsive Design | Mobile sidebar toggle (FAB 56px), slide-in Overlay mit Backdrop |
| Touch Targets | `min-height: 44px` auf allen interaktiven Elementen (mobile) |
| Responsive Typografie | 14px (<480px) / 15px (<768px) / 16px (Desktop) |
| Material Transitions | `cubic-bezier(0.4, 0, 0.2, 1)` auf allen Animationen |
| Print Styles | Alle neuen UI-Elemente (skip-link, FAB, backdrop) korrekt ausgeblendet |

#### Review-Nachbesserungen (BEHOBEN)

| Finding | Severity | Umsetzung |
|---------|----------|-----------|
| `aria-haspopup="listbox"` fehlte auf Search-Combobox | MITTEL | Attribut auf Input hinzugefuegt |
| `.document-version` Kontrast unter WCAG AA | MITTEL | Opacity von 0.7 auf 0.85 erhoeht |

### Aktueller Stand der CSS Custom Properties

```css
/* Basis-Token (in :root + Dark Mode Override) */
--color-primary, --color-primary-hover, --color-bg, --color-bg-secondary,
--color-surface, --color-text, --color-text-secondary, --color-border,
--color-error, --color-success

/* Semantische Status-Token (21 Variablen, alle mit Dark Mode) */
--color-accent-amber, --color-accent-amber-bg, --color-accent-amber-text
--color-status-success-bg, --color-status-success-text, --color-status-success-border
--color-status-error-bg, --color-status-error-text, --color-status-error-border
--color-status-warning-bg, --color-status-warning-text
--color-status-orange-bg, --color-status-orange-text
--color-status-info-bg, --color-status-info-text
--color-accent-purple-bg, --color-accent-purple-text, --color-accent-purple-border
--color-accent-orange
--color-error-bg, --color-error-border
```

---

## UX Redesign: Full-Width Layout + Sticky Sidebar (ABGESCHLOSSEN)

**Ausloeser**: Vergleich mit viewer.oscal.io (EasyDynamics, React+MUI, Full-Width)
**Ziel**: State-of-the-Art UX - kein boxed Layout auf Desktop, verbesserte Scroll-Usability

### Referenz-Analyse: viewer.oscal.io
- React + MUI (Material Design 3), Full-Width Layout
- Card/List View Toggle fuer Controls
- Accordion-Pattern fuer Control-Sektionen
- EasyDynamics oscal-react-library

### Umgesetzte Aenderungen (reines CSS-Refactoring, keine TSX-Aenderungen)

| Bereich | Vorher | Nachher |
|---------|--------|---------|
| `.main` | `padding: 2rem`, `align-items: center` | `padding: 0`, `align-items: stretch` (Full-Width) |
| `.document-view` | `max-width: 1200px` | `width: 100%` (kein max-width) |
| `.catalog-layout` | `gap: 1rem`, `min-height: 60vh` | `gap: 0`, `min-height: calc(100vh - 64px)`, Full-Bleed via negative Margins |
| `.catalog-sidebar` | `border`, `border-radius`, `max-height: 75vh` | `position: sticky`, `top: 64px`, `height: calc(100vh - 64px)`, `border-right` Divider |
| `.catalog-content` | `border`, `border-radius`, `max-height: 75vh`, `overflow-y: auto` | `padding: 2rem 2.5rem`, natuerlicher Page-Scroll |
| `.compdef-*` | Analog zu Catalog (boxed) | Analog zu Catalog (Full-Width + Sticky) |
| `.profile-view` | Keine eigene Padding | `padding: 1.5rem 2.5rem` |
| `.ssp-view` | Keine eigene Padding | `padding: 1.5rem 2.5rem` |
| `.metadata-panel` | `border: 1px solid`, `border-radius` | `border-bottom` only (subtle Divider) |
| Dropzone | Zentriert | Bleibt zentriert (`.main:has(.dropzone)` Sonderregel) |

### Design-Prinzipien

1. **Full-Width**: Inhalte nutzen den vollen Viewport statt `max-width: 1200px`
2. **Sticky Sidebar**: Navigation bleibt beim Scrollen sichtbar (`position: sticky`)
3. **Page Scroll**: Content scrollt mit der Seite (kein Container-Scroll mit max-height)
4. **Borderless Desktop**: Keine Box-Borders auf Desktop, subtile Divider stattdessen
5. **Responsive Mobile**: Keine Aenderung am Mobile-Layout (Sidebar bleibt Overlay)

### Responsive-Anpassungen

- **Mobile (max-width: 768px)**: Layout-Margins zurueckgesetzt, View-Padding reduziert
- **Sidebars**: `position: fixed` Overlay bleibt, `height: auto`, kein `border-right`
- **Print**: Layout-Margins zurueckgesetzt
- **Dropzone**: Weiterhin zentriert via `:has()` Selektor

### Verifikation

- Build: 0 TypeScript-Fehler, Bundle 10.71 KB JS + 5.59 KB CSS gzipped
- Tests: 254/254 bestanden (keine Logik-Aenderungen)
- Keine TSX-Datei geaendert - reines CSS-Refactoring

---

---

## Briefing 01-04 Integration: Gap-Analyse (2026-02-07)

**Quelle**: `docs/team/ui-ux-designer/01_briefing_overview.md` bis `04_accessibility_quality_dod.md`
**Ziel**: Professionelles Dashboard-UI fuer Public Sector ("audit-ready")

### Was bereits umgesetzt ist

| Anforderung (Briefing) | Status | Umsetzung |
|------------------------|--------|-----------|
| Fullscreen Desktop (kein boxed) | DONE | `max-width` entfernt, Full-Width Layout |
| Sticky Sidebar Navigation | DONE | `position: sticky`, `height: calc(100vh - 64px)` |
| Topbar (64-72px, fix) | DONE | Material AppBar, 64px, sticky |
| Global Search im Header | DONE | SearchBar mit Combobox-Pattern |
| Keyboard: Search (Esc, Arrows) | DONE | ArrowUp/Down, Escape, aria-activedescendant |
| Keyboard: Tabs (Arrows) | DONE | SSP Tabs mit Arrow/Home/End |
| Focus Ring sichtbar | DONE | Globale `:focus-visible` Styles |
| Skip-Links | DONE | `<a href="#main-content">` |
| Touch Targets 44px | DONE | Mobile min-height auf interaktiven Elementen |
| Dark Mode (auto) | DONE | `prefers-color-scheme` mit 31 Token |
| Status Farben Light+Dark | DONE | 21 semantische Variablen |
| Responsiv Mobile | DONE | Sidebar Overlay, reduziertes Padding |
| Metadatenanzeige | DONE | MetadataPanel (expandable `<details>`) |
| Empty States | DONE | Sidebar-Platzhalter, Search No-Results |
| Error State | DONE | File-Parsing-Fehler mit `role="alert"` |

### Gap-Analyse: Was fehlt

#### Prio 1 — MUST (Kern-Funktionalitaet)

| # | Anforderung | Briefing-Ref | Aktueller Stand | Aufwand |
|---|-------------|-------------|-----------------|---------|
| G1 | **Title Box in Navigation** (sticky, full title wrap, kein Ellipsis) | 01§5, 02§2 | Nicht vorhanden. Titel nur im Header. In Nav-Sidebar fehlt Dokumenttitel komplett. | Mittel |
| G2 | **Accordion-Komponente** (shared, ARIA-konform) | 01§6, 02§5, 04§1 | Nicht vorhanden. Sektionen sind flache `<section>` mit Headings. Nur MetadataPanel nutzt `<details>`. | Hoch |
| G3 | **Boxes/Cards fuer Gruppierung** (bg-elevated + border) | 01§6, 02§5, 03§6 | Nicht vorhanden. Content wird ohne visuelle Gruppierung dargestellt. | Mittel |
| G4 | **Catalog Control Detail: Accordion-Sektionen** | 02§4A | Parts, Parameters, Links, Enhancements sind immer sichtbar. Keine Collapse-Moeglichkeit. | Mittel |
| G5 | **CompDef: Accordion fuer Capabilities + Control Impls** | 02§4C | Alles sichtbar, keine Collapse-Moeglichkeit. | Mittel |
| G6 | **Deep-Linking** (URL-Hash auf Controls/Sektionen) | 01§3 | Nicht vorhanden. Selektion nur in React-State, geht bei Reload verloren. | Hoch |
| G7 | **Fliesstextbreite 72-88ch** | 01§4, 02§1, 03§4 | Nicht begrenzt. Prose fuellt die volle Content-Breite. | Klein |
| G8 | **Filter** (Family, Control-ID, Keywords) | 01§3, 02§3 | Nicht vorhanden. Nur Global Search existiert. | Hoch |

#### Prio 2 — SHOULD (UX-Qualitaet)

| # | Anforderung | Briefing-Ref | Aktueller Stand | Aufwand |
|---|-------------|-------------|-----------------|---------|
| G9 | **Nav Pane breiter (360-420px) + resizable** | 02§1 | Fest 300/280px. Kein Resize-Handle. | Mittel |
| G10 | **Tree: Roving Tabindex + aria-level** | 04§1 | Alle Items tabbable (kein roving). Kein `aria-level`. | Mittel |
| G11 | **Loading State / Skeleton Screens** | 01§3, 03§7 | Nicht vorhanden. Parsing ist synchron. | Mittel |
| G12 | **Copy-to-clipboard** (IDs/Links) mit Toast | 01§3, 02§6 | Nicht vorhanden. | Mittel |
| G13 | **Search: Debounce** | 04§2 | Synchrone Filterung bei jedem Keystroke. | Klein |
| G14 | **Status: Icon + Text** (nie nur Farbe) | 01§7, 03§1, 04§1 | Status-Badges haben nur Farbe + Text. Kein Icon. | Mittel |
| G15 | **Expand All / Collapse All** (Accordion-Gruppen) | 02§5, 03§6 | Nicht vorhanden (keine Accordions). | Klein |
| G16 | **Accordion: Zustand pro Session merken** | 02§5 | Nicht vorhanden. | Klein |

#### Prio 3 — NICE-TO-HAVE (Spaetere Iteration)

| # | Anforderung | Briefing-Ref | Aktueller Stand | Aufwand |
|---|-------------|-------------|-----------------|---------|
| G17 | **Virtualisierung** grosser Trees/Listen | 01§3, 04§2 | Full DOM rendering. | Hoch |
| G18 | **Right Utility Pane** (optional) | 02§1 | Nicht vorhanden. | Hoch |
| G19 | **Context Switcher** (Document Type/Datei) | 02§3 | Nicht vorhanden. | Mittel |
| G20 | **Raw-View / Download / Export** | 01§3 | Nicht vorhanden. | Mittel |
| G21 | **Profile: Nav Tree** (statt linear) | 02§4B | Linear ohne Sidebar. | Hoch |
| G22 | **SSP: Nav Tree** (zusaetzlich zu Tabs) | 02§4D | Nur Tabs, kein Nav Tree. | Hoch |
| G23 | **Theme Switch im Header** | 02§3, 03§3 | Nur `prefers-color-scheme`, kein manueller Toggle. | Mittel |
| G24 | **Breadcrumbs** im Content-Bereich | 02§3 | Nicht vorhanden. | Klein |

### Design System: Token-Luecken (Briefing 03 vs. Ist)

| Briefing-Token | Aktuell vorhanden | Aktion |
|----------------|-------------------|--------|
| `bg-subtle` | `--color-bg-secondary` | Rename/Alias |
| `bg-elevated` | Nicht vorhanden | NEU: fuer Boxes/Cards |
| `surface-1/2/3` | Nur `--color-surface` | Erweitern fuer Pane-Abstufungen |
| `border-strong` | Nicht vorhanden | NEU: fuer Dark Mode |
| `text-disabled` | Nicht vorhanden | NEU |
| `icon`, `icon-muted` | Nicht vorhanden | NEU |
| `link`, `link-hover` | `--color-primary` | Eigenstaendige Token |
| `focus` | Nutzt `--color-primary` | Eigenstaendiges Token |
| `overlay` | Nicht vorhanden | NEU: Backdrop |
| Spacing Scale (4px Grid) | Ad-hoc rem-Werte | Systematisieren: `--space-1` bis `--space-8` |
| Border Radius 10-14px | `--border-radius: 8px` | Erhoehen oder differenzieren |

### Design-Entscheidungen (offen - benoetigen Architect-Feedback)

**DE-1: SSP Tab vs. Nav Tree**
- Briefing 02§4D will Nav Tree fuer SSP (Characteristics → Boundary → Roles → Controls → Backmatter)
- Aktuell: 3 Tabs (gut funktionierend, ARIA-komplett)
- **Empfehlung UI/UX**: Tabs beibehalten als Top-Level. Innerhalb der Tabs Accordions fuer Sub-Sektionen. Ein Nav Tree fuer SSP waere Over-Engineering bei nur 3 Hauptbereichen.

**DE-2: Profile Linear vs. Sidebar**
- Briefing 02§4B will Nav Tree (Imports → Modify Sets → Alterations)
- Aktuell: Linear (passt zur Datenstruktur)
- **Empfehlung UI/UX**: Nur bei grossen Profiles (>20 Alterations) lohnt sich ein Nav Tree. Fuer MVP: Linear beibehalten, ggf. Jump-Links/Anker-Navigation.

**DE-3: Nav Pane Breite**
- Briefing: 360-420px, resizable
- Aktuell: 300px fest
- **Empfehlung UI/UX**: Auf 340px erhoehen (Kompromiss). Resizable via CSS `resize: horizontal` oder JS-Drag-Handle ist Prio 2.

---

## UI/UX Designer — ToDo-Liste

### Sofort umsetzen (CSS + kleine TSX-Aenderungen)

| # | Aufgabe | Gap-Ref | Betroffene Dateien | Aufwand |
|---|---------|---------|-------------------|---------|
| U1 | Fliesstextbreite `max-width: 80ch` auf Prose-Elemente | G7 | `base.css` | Klein |
| U2 | Nav Sidebar auf 340px verbreitern | DE-3 | `base.css` | Klein |
| U3 | Design-Token erweitern: `bg-elevated`, `border-strong`, `text-disabled`, `overlay` | G3 | `base.css` `:root` + Dark Mode | Klein |
| U4 | Box-Komponente CSS-Klasse: `.content-box` (bg-elevated + border + radius) | G3 | `base.css` | Klein |
| U5 | Accordion CSS-Klasse: `.accordion`, `.accordion-trigger`, `.accordion-content` | G2 | `base.css` | Mittel |
| U6 | Title Box CSS: `.nav-title-box` (sticky, wrap, Dokumenttyp-Label) | G1 | `base.css` | Klein |
| U7 | Selected Tree Item: surface-step + left accent marker (statt primary-bg) | 03§6 | `base.css` | Klein |

### Design-Spezifikationen erstellen (fuer Frontend Developer)

| # | Aufgabe | Gap-Ref | Output |
|---|---------|---------|--------|
| U8 | Accordion-Komponente spezifizieren: Props, ARIA, States, Expand/Collapse All | G2, G15, G16 | Spezifikation in diesem Briefing |
| U9 | Title Box spezifizieren: Inhalt, Sticky-Verhalten, Responsive | G1 | Spezifikation in diesem Briefing |
| U10 | Content-Box spezifizieren: Varianten (Header, Summary, References, Metadata) | G3 | Spezifikation in diesem Briefing |
| U11 | Deep-Linking UX spezifizieren: URL-Schema, Scroll-Verhalten, Copy-Link-Button | G6, G12 | Spezifikation in diesem Briefing |
| U12 | Filter-UI spezifizieren: Chip-Bar, Filter-Kategorien pro View, Clear-All | G8 | Spezifikation in diesem Briefing |

---

---

## Design-Spezifikationen (fuer Frontend Developer)

### Spec U8: Accordion-Komponente

**Datei**: `src/components/shared/accordion.tsx`
**CSS**: `.accordion`, `.accordion-trigger`, `.accordion-content` (bereits in base.css)

```tsx
interface AccordionProps {
  title: string             // Trigger-Text
  count?: number            // Optional: Anzahl im Badge
  defaultOpen?: boolean     // Initial offen? (Default: false)
  id: string                // Fuer ARIA-Verknuepfung
  children: ComponentChildren
}
```

**ARIA-Pattern (WAI-ARIA Accordion)**:
- Trigger: `<button role="button" aria-expanded="true|false" aria-controls="{id}-content">`
- Content: `<div id="{id}-content" role="region" aria-labelledby="{id}-trigger" hidden?>`
- Chevron rotiert bei expanded

**Keyboard**:
- Enter/Space: Toggle open/close
- Focus auf dem Button-Element

**AccordionGroup-Komponente** (optional):
```tsx
interface AccordionGroupProps {
  children: ComponentChildren
}
```
- Bietet "Expand All" / "Collapse All" Buttons ueber `.accordion-actions`
- Accordion-Zustand optional in `sessionStorage` persistieren (Key: View + Section-ID)

**Verwendung in Views**:
- **CatalogView ControlDetail**: Parts, Parameters, Links, Enhancements je ein Accordion
- **CompDefView ComponentDetail**: Capabilities, Control Implementations je ein Accordion
- **SSP**: Innerhalb der Tabs fuer Sub-Sektionen (Impact Level, Authorization Boundary)

---

### Spec U9: Title Box

**Einbauen in**: `catalog-view.tsx`, `component-def-view.tsx` (in der Sidebar, als erstes Kind)
**CSS**: `.nav-title-box` (bereits in base.css)

```tsx
// Innerhalb der Sidebar, VOR dem Tree/List:
<div class="nav-title-box">
  <span class="nav-doc-type">Catalog</span>
  <span class="nav-doc-title">{catalog.metadata.title}</span>
  {catalog.metadata.version && (
    <span class="nav-doc-version">v{catalog.metadata.version}</span>
  )}
</div>
```

**Verhalten**:
- Position sticky (bleibt oben in der Sidebar)
- Titel wird IMMER vollstaendig angezeigt (word-wrap, kein Ellipsis)
- Dokumenttyp als kleines Label darueber
- Version optional darunter
- Tree/List scrollt UNTER der Title Box

**Datenquelle**: `metadata.title`, `metadata.version` aus dem jeweiligen Dokument-Objekt

---

### Spec U10: Content-Box

**CSS**: `.content-box`, `.content-box-header` (bereits in base.css)

**Varianten**:
1. **Summary Box**: Kurzbeschreibung oben im Detail-Panel
   ```html
   <div class="content-box">
     <div class="content-box-header"><h3>Overview</h3></div>
     <p class="part-prose">{description}</p>
   </div>
   ```

2. **Section Box**: Gruppierung von Inhalten (z.B. Properties, Roles)
   ```html
   <div class="content-box">
     <div class="content-box-header">
       <h4>Properties</h4>
       <span class="content-box-count">5</span>
     </div>
     <PropertyList props={...} />
   </div>
   ```

3. **References Box**: Links und Backmatter
   ```html
   <div class="content-box">
     <div class="content-box-header"><h4>References</h4></div>
     <ul class="links-list">...</ul>
   </div>
   ```

**Wann NICHT verwenden**: Stats-Bar, Metadata-Panel (haben eigene Patterns)

---

### Spec U11: Deep-Linking

**URL-Schema**:
```
#/{view}/{element-id}
Beispiele:
  #/catalog/ac-1
  #/catalog/ac-1.1
  #/compdef/{component-uuid}
  #/ssp/characteristics
  #/ssp/implementation
  #/ssp/controls
```

**Verhalten**:
1. Beim Laden: URL-Hash parsen → Element selektieren → in View scrollen
2. Bei Selektion: URL-Hash aktualisieren (`history.replaceState`)
3. Kein Full-Reload bei Hash-Change (SPA-Verhalten)

**Copy-Link-Button**:
- Kleiner Button (16x16 Icon) neben Control-IDs und Section-Headings
- Klick: Kopiert vollstaendige URL (`location.origin + location.pathname + hash`) in Clipboard
- Bestaetigung: Dezenter Toast ("Link copied") fuer 2 Sekunden
- CSS: `.copy-link-btn` (braucht noch Styling)

**Hook**: `useDeepLink(type: string)` im Application Layer
- Liest Hash bei Mount, gibt initialen Selection-Wert zurueck
- Updatet Hash bei Selection-Change

---

### Spec U12: Filter-UI

**Platzierung**: In der Sidebar, zwischen Title Box und Tree/List

**CSS**: `.filter-bar` (braucht noch Styling)

**Filter-Kategorien pro View**:

| View | Filter 1 | Filter 2 | Filter 3 |
|------|----------|----------|----------|
| Catalog | Family (Group-ID) | Keyword (Freitext) | - |
| CompDef | Component Type | - | - |
| SSP | Implementation Status | Component | - |
| Profile | Import Source | - | - |

**UX-Pattern**:
- Input-Feld mit "Filter..." Placeholder
- Aktive Filter als Chips unterhalb
- Chip: Label + X-Button zum Entfernen
- "Clear All" Link wenn Filter aktiv
- Filter reduziert die Tree/List-Eintraege (nicht die Detail-Ansicht)
- Filter + Global Search arbeiten unabhaengig (beide koennen gleichzeitig aktiv sein)

**Hook**: `useFilter(items, filterConfig)` im Application Layer

---

## Team-ToDos (Auftraege an andere Rollen)

### Frontend Developer

| # | Aufgabe | Gap-Ref | Prio | Aufwand | Abhaengigkeit |
|---|---------|---------|------|---------|---------------|
| FE1 | **Shared Accordion-Komponente** erstellen (`src/components/shared/accordion.tsx`) | G2 | 1 | Hoch | U5, U8 (CSS + Spec vom UI/UX Designer) |
| FE2 | **Title Box** in CatalogView + CompDefView Sidebars einbauen | G1 | 1 | Mittel | U6, U9 (CSS + Spec) |
| FE3 | **Catalog ControlDetail**: Sektionen in Accordions umbauen (Parts, Params, Links, Enhancements) | G4 | 1 | Mittel | FE1 |
| FE4 | **CompDef Detail**: Capabilities + Control Implementations in Accordions | G5 | 1 | Mittel | FE1 |
| FE5 | **Content-Boxes** auf alle Views anwenden (Summary, References, Metadata Boxes) | G3 | 1 | Mittel | U4, U10 (CSS + Spec) |
| FE6 | **Deep-Linking**: URL-Hash-Routing fuer Control-Selektion | G6 | 2 | Hoch | U11 (Spec) |
| FE7 | **Filter-Komponente**: FilterBar mit Chips, pro-View Filterlogik | G8 | 2 | Hoch | U12 (Spec) |
| FE8 | **Copy-to-clipboard** Button auf Control-IDs + Section-Links | G12 | 2 | Mittel | U11 (Spec) |
| FE9 | **Search: Debounce** (200ms) im useSearch Hook | G13 | 2 | Klein | - |
| FE10 | **Status Icons** neben Status-Text-Badges (Check, Warning, Info, X) | G14 | 2 | Mittel | - |
| FE11 | **Roving Tabindex** im GroupTree + aria-level Attribut | G10 | 2 | Mittel | - |
| FE12 | **Prose max-width**: `max-width: 80ch` auf `.part-prose`, `.compdef-description` etc. | G7 | 1 | Klein | U1 (CSS) |

### Tech Lead

| # | Aufgabe | Gap-Ref | Prio | Aufwand |
|---|---------|---------|------|---------|
| TL1 | **Accordion-Architektur**: Shared-Komponente in Component-Layer, State-Management (localStorage fuer Session-Persist?) | G2, G16 | 1 | Review |
| TL2 | **Deep-Linking ADR**: URL-Hash-Schema definieren (`#catalog/ac-1`, `#ssp/characteristics`) | G6 | 2 | ADR |
| TL3 | **Virtualisierung evaluieren**: react-virtual oder eigene Loesung fuer grosse Trees | G17 | 3 | Spike |
| TL4 | **ESLint-Regeln** fuer Accordion ARIA-Pflichtattribute pruefen | G2 | 1 | Klein |
| TL5 | **Design Token Architecture**: CSS Custom Properties vs. Design-Token-System (style-dictionary o.ae.) | 03 | 3 | ADR |

### QA Engineer

| # | Aufgabe | Gap-Ref | Prio | Aufwand |
|---|---------|---------|------|---------|
| QA1 | **Accordion-Tests**: ARIA-Attribute, Keyboard (Enter/Space), Expand/Collapse All | G2 | 1 | Mittel |
| QA2 | **Title Box Tests**: Langer Titel wird gewrapt (kein Ellipsis), Sticky-Verhalten | G1 | 1 | Klein |
| QA3 | **Deep-Linking Tests**: URL-Hash setzt korrekte Selektion, Reload behaelt State | G6 | 2 | Mittel |
| QA4 | **Filter Tests**: Filter reduziert Tree, Clear All, Kombination mit Search | G8 | 2 | Mittel |
| QA5 | **Copy-to-clipboard Tests**: Button sichtbar, Clipboard-Inhalt korrekt | G12 | 2 | Klein |
| QA6 | **Roving Tabindex Tests**: Arrow-Keys im Tree, Focus-Verhalten | G10 | 2 | Mittel |
| QA7 | **Responsive-Test 320px-1440px+**: Kein Funktionsverlust bei Extrembreiten | DoD | 1 | Mittel |
| QA8 | **axe-core Tests** fuer neue Accordion + Box Komponenten | G2, G3 | 1 | Mittel |

### DevOps Engineer

| # | Aufgabe | Gap-Ref | Prio | Aufwand |
|---|---------|---------|------|---------|
| DO1 | **Bundle Size Gate** pruefen: Accordion + Filter werden Bundle vergroessern | - | 2 | Klein |

---

## Empfohlene Umsetzungsreihenfolge

### Sprint 1: Foundation (Accordion + Boxes + Title Box)
1. UI/UX: CSS-Klassen + Design-Token (U1-U7)
2. UI/UX: Specs schreiben (U8-U10)
3. Frontend: Shared Accordion (FE1)
4. Frontend: Title Box (FE2)
5. Frontend: Content-Boxes (FE5)
6. QA: Tests fuer neue Komponenten (QA1, QA2, QA8)

### Sprint 2: Accordion-Integration + Deep-Linking
1. Frontend: Catalog Accordions (FE3)
2. Frontend: CompDef Accordions (FE4)
3. UI/UX: Deep-Linking + Filter Specs (U11, U12)
4. Tech Lead: Deep-Linking ADR (TL2)
5. Frontend: Deep-Linking (FE6)
6. Frontend: Search Debounce (FE9)
7. QA: Deep-Linking + Responsive Tests (QA3, QA7)

### Sprint 3: Filter + Polish
1. Frontend: Filter-Komponente (FE7)
2. Frontend: Copy-to-clipboard (FE8)
3. Frontend: Status Icons (FE10)
4. Frontend: Roving Tabindex (FE11)
5. QA: Filter + Copy Tests (QA4, QA5, QA6)

### Backlog (Prio 3)
- Virtualisierung (TL3, G17)
- Profile Nav Tree (G21)
- SSP Nav Tree (G22)
- Theme Switch (G23)
- Right Utility Pane (G18)
- Context Switcher (G19)
- Raw-View / Export (G20)

---

## Design-Review Sprint 1 (2026-02-07)

**Frontend Developer Sprint 1 Aufgaben**: FE1, FE2, FE3, FE4, FE5, FE9, FE12

### Review-Ergebnisse

| Aufgabe | Komponente | Bewertung | Anmerkungen |
|---------|-----------|-----------|-------------|
| FE1 Accordion | `accordion.tsx` | SEHR GUT | WAI-ARIA komplett, `headingLevel` korrekt, Chevron-Rotation funktional |
| FE2 Title Box | `catalog-view.tsx`, `component-def-view.tsx` | GUT | Korrekt platziert, CSS-Klassen wie spezifiziert |
| FE3 Catalog Accordions | `control-detail.tsx` | GUT | Content (defaultOpen), Params, Links, Enhancements - alle h3 |
| FE4 CompDef Accordions | `component-def-view.tsx` | GUT | CI Accordions funktional. **Hinweis**: `headingLevel={3}` ergaenzen |
| FE5 Content-Boxes | `component-def-view.tsx`, `ssp-view.tsx` | GUT | CompDef: Desc/Props/Roles. SSP: Impact/Boundary |
| FE9 Debounce | `use-search.ts` | GUT | 200ms, Timer-Cleanup sauber |
| FE12 Prose Width | CSS | GUT | Bereits via `max-width: 80ch` abgedeckt |

### Gefundene Issues

| # | Issue | Schwere | Fix |
|---|-------|---------|-----|
| R1 | `.accordion-heading` CSS fehlte - Browser-Default-Margins brechen Layout | Hoch | **BEHOBEN**: `margin: 0; font-size/weight/line-height: inherit` in base.css |
| R2 | CompDef CI-Accordions ohne `headingLevel` - nicht-semantische Heading-Hierarchie | Niedrig | Frontend Dev soll `headingLevel={3}` ergaenzen |
| R3 | ProfileView hat noch keine Accordions/Content-Boxes (war nicht in Sprint 1 Scope) | Info | Fuer Sprint 2 einplanen |

### Build nach Fix

- Bundle: 11.11 KB JS + 6.04 KB CSS gzipped
- TypeScript: 0 Errors
- Keine TSX-Aenderungen noetig (CSS-only Fix)

---

## Sprint 2: Naechste Schritte

### Aktuelle Prioritaeten

**Fuer den Frontend Developer (Sprint 2)**:

| # | Aufgabe | Prio | Abhaengigkeit | Details |
|---|---------|------|---------------|---------|
| FE3b | CompDef CI-Accordions: `headingLevel={3}` ergaenzen | 1 | - | Quick-Fix aus Review R2 |
| FE5b | Profile View: Content-Boxes + Accordions nachholen | 1 | FE1 (done) | Imports, Merge, Parameters, Alterations als Sektionen Box+Accordion |
| FE6 | Deep-Linking (URL-Hash Routing) | 1 | Spec U11 | `useDeepLink` Hook, Hash-Schema `#/catalog/ac-1` |
| FE8 | Copy-to-Clipboard auf Control-IDs | 2 | FE6 | Button + Toast, `navigator.clipboard.writeText` |
| FE10 | Status-Icons neben Badges (operational, planned, etc.) | 2 | - | SVG-Icons inline |
| FE11 | Roving Tabindex im GroupTree + `aria-level` | 2 | - | WAI-ARIA TreeView Pattern |

**Fuer den Tech Lead (Sprint 2)**:

| # | Aufgabe | Details |
|---|---------|---------|
| TL2 | Deep-Linking ADR: URL-Hash-Schema definieren | Parallel zu FE6 (Spec U11 reicht als Basis) |
| TL6 | Accordion + AccordionGroup Pattern in CODING_STANDARDS.md dokumentieren | Analog zu Tabs/Combobox Patterns |
| TL7 | Sprint 1 Code-Review: accordion.tsx, control-detail.tsx, component-def-view.tsx | Layer-Konformitaet, TypeScript, Patterns |

**Fuer QA (Sprint 2)**:

| # | Aufgabe | Details |
|---|---------|---------|
| QA1 | Accordion-Tests: ARIA, Keyboard, Expand/Collapse | Auf Sprint 1 Umsetzung |
| QA2 | Title Box Tests: Langer Titel wrap, Sticky | Auf Sprint 1 Umsetzung |
| QA7 | Responsive 320px-1440px+ | Gesamttest nach Sprint 1 |
| QA8 | axe-core Tests fuer Accordion + Content-Box | Auf Sprint 1 Umsetzung |

### Filter-Aufgabe verschoben

FE7 (Filter-Komponente) wird auf Sprint 3 verschoben, da Deep-Linking (FE6) wichtiger ist und die Filter-UX davon profitiert (Filter-State kann in URL-Hash persistiert werden).

---

## Design-Review Sprint 2 (2026-02-07)

**Frontend Developer Sprint 2 Aufgaben**: FE3b, FE5b, FE6, FE8, FE10, FE11

### Review-Ergebnisse

| Aufgabe | Komponente | Bewertung | Anmerkungen |
|---------|-----------|-----------|-------------|
| FE3b CompDef headingLevel | `component-def-view.tsx` | GUT | `headingLevel={3}` korrekt ergaenzt |
| FE5b Profile Accordions | `profile-view.tsx` | SEHR GUT | Imports/Params defaultOpen, Alters collapsed, Merge als Content-Box - exzellente UX-Entscheidung |
| FE6 Deep-Linking | `use-deep-link.ts` | SEHR GUT | Sauberer Application-Layer Hook, `hashchange` Listener, `history.replaceState`, SSP Tab-Persistenz |
| FE8 Copy-to-Clipboard | `copy-link-button.tsx` | GUT | Visuelles Feedback (Checkmark 2s), `aria-label` Wechsel, Graceful Fallback |
| FE10 Status Icons | `status-badge.tsx` | SEHR GUT | 8 Zustaende mit SVG-Icons, `aria-hidden` auf Icons, CSS-Variablen konsistent |
| FE11 Roving Tabindex | `group-tree.tsx` | EXZELLENT | WAI-ARIA TreeView komplett: Arrow Up/Down/Left/Right, Home/End, Parent-Navigation, `aria-level`, `aria-current` |

### QA-Beitrag Sprint 2

| Metrik | Vorher (Sprint 1) | Sprint 2 |
|--------|-------------------|----------|
| Tests | 254 | 322 (+68) |
| Statement Coverage | ~86% | 89.13% |
| axe-core Tests | 9 | 13 (+4) |
| Test-Dateien | 11 | 12 (+1) |

Neue Tests fuer: StatusBadge, Accordion, AccordionGroup, FAB, Backdrop, Tab-Keyboard, Combobox-Keyboard.

### Tech Lead Beitrag Sprint 2

CODING_STANDARDS.md v2.0.0 mit 10 Patterns dokumentiert. Sprint 2-spezifische Aufgaben (TL2 ADR, TL6 Accordion-Pattern, TL7 Code-Review) noch offen.

### Gefundene Issues

| # | Issue | Schwere | Fix |
|---|-------|---------|-----|
| R4 | Toter CSS-Code: `.ssp-status-badge` + `.ssp-status--*` und `.ssp-impl-status--*` (63 Zeilen) nach StatusBadge-Migration | Mittel | **BEHOBEN**: Dead CSS entfernt, -0.12 KB CSS |
| R5 | CopyLinkButton: Screen-Reader erhaelt kein Live-Update bei "copied" State | Niedrig | `aria-label` wechselt, reicht fuer Button-Fokus. Optional: `aria-live="polite"` Region |
| R6 | "Load another file" Button raeumt URL-Hash nicht auf | Niedrig | Hash bleibt bis naechster File-Load. Kein UX-Problem da Dropzone erscheint |

### Build nach Cleanup

- Bundle: 12.59 KB JS + 6.08 KB CSS gzipped
- TypeScript: 0 Errors
- Tests: 322/322 bestanden

---

## Sprint 2 Abschluss — Gap-Status

### Geschlossene Gaps

| Gap | Beschreibung | Sprint | Status |
|-----|-------------|--------|--------|
| G1 | Title Box in Navigation | S1 | DONE (FE2) |
| G2 | Accordion-Komponente (shared, ARIA) | S1 | DONE (FE1) |
| G3 | Boxes/Cards fuer Gruppierung | S1 | DONE (FE5) |
| G4 | Catalog Control Detail: Accordion-Sektionen | S1 | DONE (FE3) |
| G5 | CompDef: Accordion fuer Capabilities + CIs | S1 | DONE (FE4) |
| G6 | Deep-Linking (URL-Hash) | S2 | DONE (FE6) |
| G7 | Fliesstextbreite 72-88ch | S1 | DONE (FE12) |
| G10 | Tree: Roving Tabindex + aria-level | S2 | DONE (FE11) |
| G12 | Copy-to-clipboard mit Feedback | S2 | DONE (FE8) |
| G13 | Search: Debounce | S1 | DONE (FE9) |
| G14 | Status: Icon + Text (nie nur Farbe) | S2 | DONE (FE10) |

### Offene Gaps (fuer Sprint 3+)

| Gap | Beschreibung | Prio | Naechster Sprint |
|-----|-------------|------|------------------|
| G8 | Filter (Family, Control-ID, Keywords) | MUST | Sprint 3 |
| G9 | Nav Pane breiter + resizable | SHOULD | Backlog |
| G11 | Loading State / Skeleton Screens | SHOULD | Backlog |
| G15 | Expand All / Collapse All | SHOULD | Sprint 3 |
| G16 | Accordion: Zustand pro Session merken | SHOULD | Sprint 3 |
| G17 | Virtualisierung | NICE | Backlog |
| G18-G24 | Right Pane, Context Switcher, Theme Switch, etc. | NICE | Backlog |

---

## Design-Review Sprint 3 (2026-02-07)

**Frontend Developer Sprint 3 Aufgaben**: FE7, FE15, FE16, FE17, R6

### Review-Ergebnisse

| Aufgabe | Komponente | Bewertung | Anmerkungen |
|---------|-----------|-----------|-------------|
| FE7 Filter-Komponente | `use-filter.ts`, `filter-bar.tsx` | SEHR GUT | Sauberer Application-Layer Hook, FilterBar mit Keyword + Chips + Categories, pro-View Integration (Catalog: Family-Filter, CompDef: Type-Filter) |
| FE15 AccordionGroup | `accordion.tsx` | GUT | Preact Context fuer Expand/Collapse Signals, Buttons funktional. **Hinweis**: Noch in keinem View integriert |
| FE16 Session-Persist | `accordion.tsx` | SEHR GUT | `sessionStorage` mit `STORAGE_PREFIX`, sauberes try/catch fuer Private Mode, Initial-State via `readSavedState(id) ?? defaultOpen` |
| FE17 Search-Navigation | `search-bar.tsx`, `app.tsx` | GUT | `onSelect` Callback, Enter-Key + Click, `handleSearchSelect` dispatcht korrekt zu Deep-Link Hash |
| R6 Hash-Cleanup | `app.tsx` | GUT | "Load another file" raeumt URL-Hash auf via `history.replaceState` |

### Tech Lead Beitrag Sprint 3

CODING_STANDARDS.md v3.0.0: 15 Patterns dokumentiert (5 neue: Deep-Link, Filter, Accordion, Expand/Collapse, Session-Persist). 9 Shared Components katalogisiert. Code Review aller 6 neuen Dateien — alle layer-konform.

### QA Beitrag Sprint 3

| Metrik | Sprint 2 | Sprint 3 |
|--------|----------|----------|
| Tests | 322 | 350 (+28) |
| Test-Dateien | 12 | 14 (+2) |

Neue Tests: `use-filter.test.ts` (7 Tests), `filter-bar.test.tsx` (11 Tests), plus Updates fuer AccordionGroup, Session-Persist, SearchBar onSelect.

### Gefundene Issues

| # | Issue | Schwere | Fix |
|---|-------|---------|-----|
| R7 | `.search-result-item` hat `cursor: default` — Items sind seit Sprint 3 klickbar | Mittel | **BEHOBEN**: `cursor: pointer` in base.css |
| R8 | `.filter-chip-remove:hover` nutzt hardcoded `rgba(0,0,0,0.1)` — Dark Mode Problem | Klein | **BEHOBEN**: `var(--color-bg-secondary)` statt rgba |
| R9 | AccordionGroup wird in keinem View verwendet — nur definiert in accordion.tsx | Info | Sollte in ControlDetail (Catalog) und CompDef (CI-Sektionen) integriert werden |
| R10 | `.accordion-group` CSS-Klasse fehlt in base.css (AccordionGroup rendert `<div class="accordion-group">`) | Niedrig | Kein visueller Bug da kein Styling noetig, aber `.accordion-group` sollte als Kommentar/Placeholder existieren |
| R11 | Catalog filterGroups: Bei Keyword-Suche werden Sub-Controls nicht rekursiv geprueft | Niedrig | `controlMatchesKeyword` prueft nur top-level + direct children, nicht tiefer verschachtelte Controls |

### Build nach Fixes

- Bundle: 14.12 KB JS + 6.28 KB CSS gzipped
- TypeScript: 0 Errors
- Tests: 350/350 bestanden

---

## Sprint 3 Abschluss — Gap-Status

### Geschlossene Gaps (kumuliert)

| Gap | Beschreibung | Sprint | Status |
|-----|-------------|--------|--------|
| G1 | Title Box in Navigation | S1 | DONE (FE2) |
| G2 | Accordion-Komponente (shared, ARIA) | S1 | DONE (FE1) |
| G3 | Boxes/Cards fuer Gruppierung | S1 | DONE (FE5) |
| G4 | Catalog Control Detail: Accordion-Sektionen | S1 | DONE (FE3) |
| G5 | CompDef: Accordion fuer Capabilities + CIs | S1 | DONE (FE4) |
| G6 | Deep-Linking (URL-Hash) | S2 | DONE (FE6) |
| G7 | Fliesstextbreite 72-88ch | S1 | DONE (FE12) |
| G8 | Filter (Family, Control-ID, Keywords) | S3 | DONE (FE7) |
| G10 | Tree: Roving Tabindex + aria-level | S2 | DONE (FE11) |
| G12 | Copy-to-clipboard mit Feedback | S2 | DONE (FE8) |
| G13 | Search: Debounce | S1 | DONE (FE9) |
| G14 | Status: Icon + Text (nie nur Farbe) | S2 | DONE (FE10) |
| G15 | Expand All / Collapse All | S3 | TEILWEISE (FE15 — Komponente fertig, noch nicht in Views integriert) |
| G16 | Accordion: Zustand pro Session merken | S3 | DONE (FE16) |

**Gesamt: 13/24 Gaps geschlossen, 1 teilweise (G15)**

### Offene Gaps (Backlog)

| Gap | Beschreibung | Prio | Naechster Schritt |
|-----|-------------|------|-------------------|
| G9 | Nav Pane breiter + resizable | SHOULD | Backlog |
| G11 | Loading State / Skeleton Screens | SHOULD | Backlog |
| G15 | Expand All / Collapse All (Integration) | SHOULD | AccordionGroup in ControlDetail + CompDef integrieren |
| G17 | Virtualisierung | NICE | Backlog |
| G18-G24 | Right Pane, Context Switcher, Theme Switch, etc. | NICE | Backlog |

---

## Naechste Schritte: Phase 3 / Backlog

### Empfehlung: Dashboard-Redesign Sprint abgeschlossen

Alle **MUST-Gaps (G1-G8)** sind geschlossen. Alle **SHOULD-Gaps** ausser G9/G11 sind erledigt. Das Projekt ist bereit fuer **Phase 3** (Issues #8-#10: PWA, Dokumentation, npm Package).

### Verbleibende UX-Aufgaben (Backlog-Prioritaet)

| # | Aufgabe | Prioritaet | Kontext |
|---|---------|------------|---------|
| 1 | AccordionGroup in Views integrieren (G15) | Mittel | ControlDetail + CompDef mit "Expand All / Collapse All" wrappen |
| 2 | Manueller Dark Mode Toggle (G23) | Mittel | Fuer PWA (Issue #8) — Nutzer-Praeferenz persistieren |
| 3 | Nav Pane breiter/resizable (G9) | Niedrig | CSS `resize: horizontal` oder JS-Drag |
| 4 | Sidebar Close-Animation | Niedrig | CSS transition statt instant display:none |
| 5 | Komponenten-Typ-Icons (Software, Hardware, etc.) | Niedrig | SVG inline |
| 6 | Dokumenttyp-spezifische Farbvariablen | Niedrig | `--color-catalog`, `--color-profile`, etc. |
| 7 | Loading State / Skeleton Screens (G11) | Niedrig | Sinnvoll erst bei async Laden (z.B. URL-Import) |

---

## AKTUELLER AUFTRAG: Stakeholder-Feedback (2026-02-07)

**Prioritaet**: HOCH | **Quelle**: Fachverantwortliche nach Review der Live-Version
**Gesamtbewertung**: "Geht absolut in die richtige Richtung"

Die Fachverantwortlichen haben 3 Verbesserungswuensche identifiziert:

---

### Anforderung S1: Navigation — Gesamttitel sichtbar machen [HOCH]

**Stakeholder-Feedback**: "Navigation immer noch einzeilig — hier Gesamttitel in jeden Eintrag sichtbar machen"

**Ist-Zustand**:
- `.tree-group-title` und `.tree-control-title`: `text-overflow: ellipsis; white-space: nowrap`
- Bei langen Titeln (z.B. "Access Control Policy and Procedures") wird der Text abgeschnitten
- Gleiche Problematik bei `.compdef-component-title`

**Design-Aufgabe**:

1. **CSS-Aenderungen spezifizieren**: Multi-line Wrapping statt Ellipsis
   - `white-space: normal` statt `nowrap`
   - `word-wrap: break-word` fuer Umbruch
   - `align-items: flex-start` auf Parent-Containern (Chevron/ID oben ausrichten)
   - Vertikaler Abstand zwischen Eintraegen pruefen (padding-bottom ggf. erhoehen)

2. **Visuelles Layout pruefen**:
   - Tree-Eintraege mit 2-3 Zeilen Titel: Chevron und ID-Badge links oben fixiert
   - Ausreichender vertikaler Abstand zwischen Eintraegen
   - Mobile: Touch-Target (44px min-height) weiterhin eingehalten
   - Selected-State auf mehrzeilige Items anwenden (background-color auf gesamte Hoehe)

3. **Betroffene CSS-Klassen**:
   - `.tree-group-title` (Catalog Sidebar)
   - `.tree-control-title` (Catalog Sidebar)
   - `.compdef-component-title` (CompDef Sidebar)
   - `.tree-group-header` / `.tree-control-btn` (Parent-Container)

---

### Anforderung S2: Parts als verschachtelte Akkordions [HOCH]

**Stakeholder-Feedback**: "Parts sind noch nicht als Unterakkordions umgesetzt — Control (Akkordion) — darunter Parts (ebenfalls als Akkordion) — genauso Parts in Parts (Unterpart innerhalb des Parent Parts)"

**Ist-Zustand**:
- `PartView` in `control-detail.tsx` rendert Parts als flache `<div>` Elemente
- Sub-Parts werden rekursiv gerendert, aber NICHT als Accordions
- Parts haben keinen Collapse/Expand-Mechanismus

**Design-Spezifikation: Nested Part Accordions**

**Hierarchie**:
```
Control "AC-1: Access Control Policy"
└── [Accordion h3] Content (3 parts)  ← BESTEHEND
    ├── [Accordion h4] Statement       ← NEU
    │   ├── [Accordion h5] Item a      ← NEU
    │   ├── [Accordion h5] Item b      ← NEU
    │   └── [Accordion h5] Item c      ← NEU
    ├── [Accordion h4] Guidance        ← NEU
    └── [Accordion h4] Assessment Objective  ← NEU
        ├── [Accordion h5] Objective 1  ← NEU
        └── [Accordion h5] Objective 2  ← NEU
```

**Visuelle Gestaltung**:

| Ebene | Heading | Einrueckung | Default-State | Visueller Stil |
|-------|---------|-------------|---------------|----------------|
| Part depth=0 | h4 | 0 (innerhalb Content-Accordion) | Offen | Standard Accordion (Chevron + Titel + Count) |
| Part depth=1 | h5 | 1rem padding-left | Geschlossen | Leichterer Stil: kleinere Font-Size, dezenterer Hintergrund |
| Part depth=2+ | h6 | 2rem padding-left | Geschlossen | Noch dezenter: dotted left-border statt solid |

**CSS-Klassen** (neu zu erstellen in `base.css`):
```css
/* Nested accordion depth styling */
.part-children .accordion { padding-left: 1rem; }
.part-children .part-children .accordion { padding-left: 0.5rem; }

/* Depth 1: Leichterer Trigger */
.part-children .accordion-trigger { font-size: 0.9375rem; }

/* Depth 2+: Dezentester Stil */
.part-children .part-children .accordion-trigger {
  font-size: 0.875rem;
  border-left: 2px dotted var(--color-border);
  padding-left: 0.75rem;
}
```

**Sonderfaelle**:
- Parts mit `name="item"` und OHNE Titel: Flach rendern (kein Accordion), da sie nur Prose enthalten
- Parts ohne Sub-Parts und ohne Prose: Nicht rendern
- `formatPartName()` liefert Labels: Statement, Guidance, Assessment Objective, etc.

---

### Anforderung S3: Barrierefreiheit / IFG-Konformitaet [HOCH]

**Stakeholder-Feedback**: "Barrierefreiheit / IFG konform"

**Kontext**: IFG = **Informationsfreiheitsgesetz**. Barrierefreiheit erfordert Einhaltung der:
- **BITV 2.0** (Barrierefreie-Informationstechnik-Verordnung)
- **WCAG 2.1 Level AA** (Mindest-Anforderung gemaess BITV 2.0)
- **EN 301 549** (Europaeische Norm fuer IKT-Barrierefreiheit)

**Deine Aufgaben**:

#### B4: Kontrast-Audit

Alle folgenden Farb-Kombinationen systematisch pruefen (Minimum 4.5:1 Normaltext, 3:1 grosse Schrift):

| Text-Token | Hintergrund-Token | Light-Werte | Dark-Werte |
|------------|-------------------|-------------|------------|
| `--color-text` | `--color-bg` | #1f2937 auf #ffffff | #f9fafb auf #111827 |
| `--color-text-secondary` | `--color-bg` | #6b7280 auf #ffffff | #9ca3af auf #111827 |
| `--color-text` | `--color-bg-elevated` | #1f2937 auf #ffffff | #f9fafb auf #1f2937 |
| `--color-status-success-text` | `-success-bg` | #166534 auf #dcfce7 | #86efac auf #052e16 |
| `--color-status-error-text` | `-error-bg` | #991b1b auf #fee2e2 | #fca5a5 auf #450a0a |
| `--color-status-warning-text` | `-warning-bg` | #854d0e auf #fef9c3 | #fde68a auf #422006 |
| `--color-status-info-text` | `-info-bg` | #1e40af auf #dbeafe | #93c5fd auf #172554 |
| `--color-accent-purple-text` | `-purple-bg` | #6b21a8 auf #f0e6ff | #c4b5fd auf #2e1065 |
| `--color-accent-amber-text` | `-amber-bg` | #92400e auf #fef3c7 | #fcd34d auf #451a03 |

→ Ergebnis: Pass/Fail Report, Dark-Mode-Korrekturen bei Bedarf

#### B5: Nested Accordion visuelles Design reviewen

- Heading-Hierarchie (h3 → h4 → h5 → h6) auf Konsistenz pruefen
- Visuelle Unterscheidung der Tiefenebenen ausreichend?
- Einrueckung lesbar ohne zu viel horizontalen Platz zu verschwenden?

#### B6: Navigation Multi-Line Review

- Mehrzeilige Titel in Sidebar: Sind Chevron/ID korrekt oben ausgerichtet?
- Selected-State bei mehrzeiligen Items: Background korrekt auf volle Hoehe?
- Abstand zwischen Items ausreichend?

---

## Ergebnisse: Stakeholder-Feedback Design Review (2026-02-07)

### S1: Navigation Multi-Line Titel — REVIEW

**FE-Umsetzung**: CSS-only Aenderungen in `base.css`

| CSS-Klasse | Aenderung | Bewertung |
|------------|-----------|-----------|
| `.tree-group-title` | `white-space: normal; word-wrap: break-word; overflow: visible` | GUT |
| `.tree-control-title` | Identisch | GUT |
| `.compdef-component-title` | Identisch | GUT |
| `.tree-group-header` | `align-items: flex-start` (Chevron oben) | GUT |
| `.tree-control-btn` | `align-items: flex-start` (ID oben) | GUT |
| `.tree-control-row` | `align-items: flex-start` | GUT |
| `.compdef-component-item` | `align-items: flex-start` | GUT |
| Mobile Touch-Targets | `min-height: 44px` beibehalten | GUT |

**Ergebnis**: KEINE ISSUES. Multi-Line Wrapping korrekt, Chevron/ID oben ausgerichtet, Selected-State deckt volle Hoehe ab, Touch-Targets eingehalten.

---

### S2: Nested Part Accordions — REVIEW

**FE-Umsetzung**: `PartView` in `control-detail.tsx` umgebaut zu rekursiven Accordions.

| Aspekt | Umsetzung | Bewertung |
|--------|-----------|-----------|
| Heading-Hierarchie | h3(Content) → h4(depth=0) → h5(depth=1) → h6(depth=2+) | KORREKT |
| `defaultOpen` | depth=0 offen, depth>0 geschlossen | GUT |
| Flat-Rendering | Parts ohne Titel und ohne Kinder → flaches `<div>` | GUT |
| `formatPartName()` | Statement, Guidance, Assessment Objective, Overview, etc. | GUT |
| Font-Size Cascade | 0.875rem → 0.75rem → 0.6875rem (pro Tiefe) | GUT |
| Left-Border Nesting | `.part-children` mit `border-left: 2px solid` | GUT |
| Session-Persist | Ueber bestehende Accordion-Logik | GUT |

**Gefundene Issues**:

| # | Issue | Schwere | Fix |
|---|-------|---------|-----|
| R12 | Depth 2+ dotted border: CSS targetete `.accordion` (kein border-left), statt `.part-children` Container | Mittel | **BEHOBEN**: `.part-children .part-children { border-left-style: dotted; }` |
| R13 | Accordion ID `${partId}-${depth}` kann kollidieren wenn mehrere Parts gleichen Namen haben (z.B. zwei "item" Parts bei depth=1) | Niedrig | Empfehlung: Index in ID einbauen: `${partId}-${depth}-${i}` |

---

### S3: IFG/BITV Konformitaet — REVIEW

| # | Anforderung | WCAG | Umsetzung | Bewertung |
|---|-------------|------|-----------|-----------|
| A1 | `lang="en"` auf `<html>` | 3.1.1 | ✅ In `index.html` gesetzt | GUT |
| A2 | Heading-Hierarchie konsistent | 1.3.1 | ✅ h2→h3→h4→h5→h6 durch Part-Accordions | GUT |
| A3 | ARIA Landmarks | 1.3.1 | ✅ `<header role="banner">`, `<main>`, `<aside>`, `<footer>` | GUT |
| A5 | Tastatur-Zugang | 2.1.1 | ✅ Nested Accordions per Enter/Space, Tab-Reihenfolge logisch | GUT |
| A6 | Status-Aenderungen | 4.1.3 | ✅ `aria-live="polite"` auf CopyLinkButton | GUT |

---

### B4: Kontrast-Audit (WCAG 2.1 AA / BITV 2.0)

**Ergebnis: ALLE 22 KOMBINATIONEN BESTEHEN**

#### Light Mode

| Token-Kombination | Hex-Werte | Kontrast | Ergebnis |
|-------------------|-----------|----------|----------|
| `--color-text` auf `--color-bg` | #1f2937 / #ffffff | 14.68:1 | PASS |
| `--color-text-secondary` auf `--color-bg` | #6b7280 / #ffffff | 4.83:1 | PASS (knapp) |
| `--color-text` auf `--color-bg-elevated` | #1f2937 / #ffffff | 14.68:1 | PASS |
| Success: Text auf Bg | #166534 / #dcfce7 | 6.49:1 | PASS |
| Error: Text auf Bg | #991b1b / #fee2e2 | 6.80:1 | PASS |
| Warning: Text auf Bg | #854d0e / #fef9c3 | 6.38:1 | PASS |
| Info: Text auf Bg | #1e40af / #dbeafe | 7.15:1 | PASS |
| Purple: Text auf Bg | #6b21a8 / #f0e6ff | 7.25:1 | PASS |
| Amber: Text auf Bg | #92400e / #fef3c7 | 6.37:1 | PASS |

#### Dark Mode

| Token-Kombination | Hex-Werte | Kontrast | Ergebnis |
|-------------------|-----------|----------|----------|
| `--color-text` auf `--color-bg` | #f9fafb / #111827 | 16.98:1 | PASS |
| `--color-text-secondary` auf `--color-bg` | #9ca3af / #111827 | 6.99:1 | PASS |
| `--color-text` auf `--color-bg-elevated` | #f9fafb / #1f2937 | 14.05:1 | PASS |
| Success: Text auf Bg | #86efac / #052e16 | 10.62:1 | PASS |
| Error: Text auf Bg | #fca5a5 / #450a0a | 8.51:1 | PASS |
| Warning: Text auf Bg | #fde68a / #422006 | 11.70:1 | PASS |
| Info: Text auf Bg | #93c5fd / #172554 | 8.15:1 | PASS |
| Purple: Text auf Bg | #c4b5fd / #2e1065 | 8.25:1 | PASS |
| Amber: Text auf Bg | #fcd34d / #451a03 | 10.39:1 | PASS |

#### Zusaetzliche Kombinationen

| Token-Kombination | Hex-Werte | Kontrast | Ergebnis |
|-------------------|-----------|----------|----------|
| Link (light) | #1a56db / #ffffff | 6.18:1 | PASS |
| Link (dark) | #60a5fa / #111827 | 6.98:1 | PASS |
| Secondary auf bg-secondary (light) | #6b7280 / #f9fafb | 4.63:1 | PASS (knapp) |
| Secondary auf bg-secondary (dark) | #9ca3af / #1f2937 | 5.78:1 | PASS |

**Fazit**: Kein Korrekturbedarf. Knappste Werte bei `--color-text-secondary` (4.83:1 light, 4.63:1 auf bg-secondary) — beide ueber dem AA-Minimum von 4.5:1.

---

### B5: Nested Accordion Design Review

| Kriterium | Ergebnis |
|-----------|----------|
| Heading-Hierarchie (h3→h4→h5→h6) | ✅ Konsistent, keine Ebenen uebersprungen |
| Visuelle Unterscheidung der Tiefenebenen | ✅ Ausreichend durch Font-Size-Abstufung + Left-Border |
| Einrueckung | ✅ 1rem pro Ebene — lesbar ohne horizontalen Platzverbrauch |
| Depth 2+ dotted border | ✅ Nach Fix R12 jetzt korrekt |

---

### B6: Navigation Multi-Line Review

| Kriterium | Ergebnis |
|-----------|----------|
| Chevron/ID oben ausgerichtet | ✅ `align-items: flex-start` auf allen Containern |
| Selected-State volle Hoehe | ✅ `background-color` auf `.tree-control-row.selected` deckt gesamte Zeile |
| Abstand zwischen Items | ✅ Padding 0.5rem/0.375rem ausreichend |
| Touch-Targets | ✅ min-height 44px im Mobile Responsive |

---

### Build nach Fixes

- Bundle: 14.20 KB JS + 6.36 KB CSS gzipped
- TypeScript: 0 Errors
- Tests: 350/350 bestanden

---

## Stakeholder-Feedback - Zusammenfassung (ABGESCHLOSSEN)

| Aufgabe | Ergebnis |
|---------|----------|
| S1: Navigation Multi-Line | CSS-only Wrapping, Chevron/ID oben, Touch-Targets OK |
| S2: Nested Part Accordions | Rekursives Accordion, h4→h5→h6, dotted border (R12 Fix) |
| S3: IFG/BITV 2.0 Kontrast-Audit | 22/22 PASS (Light + Dark), knappste Werte 4.63:1 (>4.5:1) |

**Build**: 14.20 KB JS + 6.36 KB CSS gzipped | 390 Tests | Commit: `e2c8f28`

---

## AKTUELLER AUFTRAG: Phase 3 (2026-02-07)

**Prioritaet**: HOCH | **Issues**: #8, #9, #10
**Aktueller Stand**: 14.20 KB JS + 6.36 KB CSS gzipped, 390 Tests, BITV 2.0 konform

Phase 3 umfasst 3 Issues mit jeweils UI/UX-relevanten Aufgaben:

---

### Issue #8: Progressive Web App (PWA) — UI/UX Aufgaben [HOCH]

#### UX-P1: App-Icon Design [HOCH]

Das App-Icon wird als PWA-Icon (Homescreen, Taskbar) und als Favicon verwendet.

**Anforderungen**:
- **Favicon SVG**: Einfaches, skalierbares Icon (fuer Browser-Tab)
- **192x192 PNG**: Standard-Icon fuer Mobile-Homescreen
- **512x512 PNG**: Splash-Screen
- **512x512 Maskable PNG**: Safe Zone (innerhalb 80% Kreis) fuer Android Adaptive Icons

**Design-Vorgaben**:
- Primaerfarbe: `--color-primary` (#1a365d) als Hintergrund
- Weisses Symbol auf dunklem Grund (analog zur AppBar)
- Symbol: Stilisiertes Dokument oder OSCAL-bezogenes Motiv
- Kein Text im Icon (zu klein bei 192px)
- Kontrast auf weissem UND dunklem Hintergrund pruefen

**Formate**: SVG (Favicon) + PNG 192/512 (PWA) + PNG 512 Maskable

---

#### UX-P2: PWA Install-Erlebnis [MITTEL]

**Design-Spezifikation fuer "Install App" Prompt**:

- Browser-nativer Install-Prompt (kein eigener Button noetig in v1)
- Optional in spaeterer Iteration: Dezenter "Install App" Button in der AppBar oder als Banner
- Kein aggressiver Prompt — Nutzer sollen die App organisch entdecken

---

#### UX-P3: Offline-Status Anzeige [MITTEL]

**Design-Spezifikation**:

- **Banner bei Offline**: Dezentes Info-Banner unterhalb der AppBar
  - Text: "You are offline. Previously loaded documents are still available."
  - Hintergrund: `var(--color-status-info-bg)`, Text: `var(--color-status-info-text)`
  - Schliessbar via X-Button
  - `role="status"`, `aria-live="polite"` fuer Screen-Reader
- **Bei Online-Rueckkehr**: Banner verschwindet automatisch

**Keine visuellen Aenderungen noetig fuer**:
- Datei-Upload (funktioniert offline, da lokal)
- Suchfunktion (funktioniert offline, da lokal)
- Alle Views (funktionieren offline, da kein Backend)

---

#### UX-P4: PWA Update-Toast [NIEDRIG]

**Design-Spezifikation**:

- Toast-Nachricht am unteren Bildschirmrand
- Text: "New version available. Tap to update."
- Hintergrund: `var(--color-primary)`, Text: weiss
- Aktion: Klick/Tap laedt die Seite neu
- Verschwindet nach 10 Sekunden oder nach Interaktion

---

### Issue #9: Dokumentation — UI/UX Aufgaben [MITTEL]

#### UX-D1: BITV 2.0 Barrierefreiheitserklaerung [HOCH]

**Hintergrund**: BITV 2.0 verlangt eine **Erklaerung zur Barrierefreiheit** auf der Webseite. Dies ist eine Pflichtangabe fuer oeffentliche Stellen.

**Inhalt** (als Markdown-Datei `docs/ACCESSIBILITY_STATEMENT.md`):
1. Stand der Barrierefreiheit (vollstaendig/teilweise/nicht konform)
2. Bekannte Einschraenkungen (z.B. dynamisch geladene Inhalte)
3. Feedback-Mechanismus (E-Mail oder GitHub Issues)
4. Durchsetzungsverfahren (Verweis auf Schlichtungsstelle)

**Design-Entscheidung**: Link zur Barrierefreiheitserklaerung im Footer oder in der AppBar als sekundaerer Link.

---

#### UX-D2: Dokumentationsseite pruefen [NIEDRIG]

- README.md als "Landing Page" auf GitHub — dort ist bereits alles vorhanden
- Falls User-Guide erstellt wird: Design muss nicht aufwendig sein (reines Markdown)
- Keine eigene Doku-UI noetig (Viewer ist selbsterklaerend)

---

### Issue #10: npm Package — UI/UX Aufgaben [NIEDRIG]

Keine direkten UI/UX-Aufgaben. Das npm Package exportiert Parser und Types — keine visuellen Komponenten.

**Optional**: README.md des npm-Pakets koennte ein Code-Beispiel mit Screenshot enthalten.

---

### Umsetzungsreihenfolge

| # | Aufgabe | Issue | Geschaetzter Aufwand | Abhaengigkeit |
|---|---------|-------|---------------------|---------------|
| 1 | UX-P1: App-Icon Design | #8 | Mittel | Keine |
| 2 | UX-P3: Offline-Status Banner | #8 | Klein | Keine |
| 3 | UX-P4: PWA Update Toast | #8 | Klein | Keine |
| 4 | UX-D1: Barrierefreiheitserklaerung | #9 | Mittel | Keine |
| 5 | UX-P2: Install-Erlebnis | #8 | Klein | UX-P1 |

### Verbleibende Backlog-Items aus Dashboard-Redesign

Diese Punkte bleiben im Backlog und koennten in Phase 3 parallel adressiert werden:

| # | Aufgabe | Prio | Kontext |
|---|---------|------|---------|
| 1 | Manueller Dark Mode Toggle (G23) | Mittel | Fuer PWA — Nutzer-Praeferenz persistieren |
| 2 | Sidebar Close-Animation | Niedrig | CSS transition statt instant display:none |
| 3 | Loading State / Skeleton Screens (G11) | Niedrig | Sinnvoll erst bei async Laden |

---

## Ergebnisse: Phase 3 Design Review (2026-02-07)

### Uebersicht

Phase 3 umfasst Issues #8 (PWA), #9 (Dokumentation), #10 (npm Package). Die FE-Umsetzung wurde gegen die Spec im Briefing geprueft.

**Build nach Review**: 15.26 KB JS + 6.47 KB CSS gzipped | 390 Tests | 0 TS Errors

---

### UX-P1: App-Icon Design — REVIEW

**3 SVG-Dateien erstellt:**

| Datei | Zweck | Viewbox | Bewertung |
|-------|-------|---------|-----------|
| `public/favicon.svg` | Browser-Tab | 64x64 | GUT |
| `public/icons/icon.svg` | PWA Homescreen | 512x512 | GUT |
| `public/icons/icon-maskable.svg` | Android Adaptive | 512x512 | GUT |

**Design-Bewertung**:
- Motiv: Stilisiertes Dokument (Seiten + Textzeilen) mit blauem Checkmark-Kreis unten rechts
- Erkennbarkeit: Klar bei 64px (Favicon) und 512px (PWA), Symbol transportiert "Dokument + Validierung"
- Farbschema: `#1a365d` (Navy) + `#2b6cb0` (Accent-Blau) + `#fafafa` (Weiss)
- Maskable Safe Zone: Content innerhalb 80%-Kreis — korrekt eingehalten
- Kontrast: Navy auf weissem/dunklem Hintergrund gut sichtbar

**Gefundene Issues**:

| # | Issue | Schwere | Empfehlung |
|---|-------|---------|------------|
| R14 | Icon-Farbe `#1a365d` ≠ CSS `--color-primary` (#1a56db) | Mittel | Icons verwenden dunkleres Navy als die App. Fuer Konsistenz: entweder Icons auf `#1a56db` anpassen ODER akzeptieren, dass das App-Icon bewusst dunkler ist als die Header-Farbe |
| R15 | Nur SVG-Icons, keine PNG-Fallbacks (192/512) | Niedrig | Chromium und moderne Browser unterstuetzen SVG in manifest. Safari/iOS liest ohnehin keine Manifest-Icons. Akzeptabel fuer v1, PNG-Generierung als Backlog |
| R16 | Kein `<link rel="apple-touch-icon">` in index.html | Mittel | iOS/Safari zeigt kein PWA-Icon ohne apple-touch-icon. Empfehlung: PNG-Icon generieren und als apple-touch-icon einbinden |

---

### UX-P3: Offline-Status Anzeige — REVIEW

**FE-Umsetzung**: Offline-Detection via `navigator.onLine` + Event-Listener, Banner unterhalb Header.

| Aspekt | Spec | Umsetzung | Bewertung |
|--------|------|-----------|-----------|
| Banner-Text | "You are offline..." | Identisch | GUT |
| Farben | `--color-status-info-bg/text` | ~~`--color-warning-bg` (undefiniert!)~~ | **BEHOBEN** → Info-Farben |
| `role="status"` | Ja | Ja | GUT |
| Auto-Dismiss bei Reconnect | Ja | Ja (via Event-Listener) | GUT |
| X-Button zum Schliessen | Ja | Nicht implementiert | HINWEIS |

**Behobene Issues**:

| # | Issue | Schwere | Fix |
|---|-------|---------|-----|
| R17 | `.offline-banner` verwendete undefinierte CSS-Variablen (`--color-warning-bg`, `--color-warning-border`, `--color-warning-text`) mit Hardcoded-Fallbacks. Diese Tokens existieren NICHT in `:root` — die definierten heissen `--color-status-warning-*` | Mittel | **BEHOBEN**: Auf `var(--color-status-info-bg)` und `var(--color-status-info-text)` umgestellt. Semantisch korrekt: Offline ist informativ (App funktioniert weiterhin), nicht warnend |

**Offene Punkte**:

| # | Issue | Schwere | Empfehlung |
|---|-------|---------|------------|
| R18 | Kein X-Button zum Schliessen (Spec: "Schliessbar via X-Button") | Niedrig | Optional in naechster Iteration — Banner ist dezent und auto-dismiss funktioniert |

---

### UX-P4: PWA Update Toast — REVIEW

**FE-Umsetzung**: CSS fuer `.pwa-toast` vorbereitet, VitePWA mit `registerType: 'autoUpdate'`.

| Aspekt | Spec | Umsetzung | Bewertung |
|--------|------|-----------|-----------|
| Position | Unten rechts | `fixed; bottom: 1rem; right: 1rem` | GUT |
| Background | `var(--color-primary)` | `var(--color-primary)` | GUT |
| Text-Farbe | Weiss | `#fff` | GUT |
| Border-Radius | Design Token | `var(--border-radius)` | GUT |
| Box-Shadow | — | `rgba(0, 0, 0, 0.2)` (hardcoded) | AKZEPTABEL |
| Button-Overlay | — | `rgba(255, 255, 255, 0.2)` | AKZEPTABEL (White-on-Primary Pattern) |
| z-index | — | `1000` | GUT (ueber Header z-index 50) |

**Bewertung**: Toast-CSS ist solide. Die hardcodierten `rgba`-Werte fuer Shadow und Button-Overlay sind gaengige Patterns fuer Floating-Elemente auf farbigem Hintergrund — kein Handlungsbedarf.

---

### Manifest.json + VitePWA Config — REVIEW

**manifest.json**:

| Feld | Wert | Bewertung |
|------|------|-----------|
| `name` | "OSCAL Viewer" | GUT |
| `short_name` | "OSCAL" | GUT (max 12 Zeichen) |
| `description` | "Browser-based viewer for NIST OSCAL documents" | GUT |
| `start_url` | "/oscal-viewer/" | GUT (passt zu Vite `base`) |
| `display` | "standalone" | GUT (PWA ohne Browser-Chrome) |
| `background_color` | "#fafafa" | GUT (passt zu `--color-bg-secondary`) |
| `theme_color` | "#1a365d" | INKONSISTENT (s. R19) |
| Icons | SVG-only | AKZEPTABEL (s. R15) |

**Gefundene Issues**:

| # | Issue | Schwere | Empfehlung |
|---|-------|---------|------------|
| R19 | `theme_color` im Manifest (#1a365d) ≠ `<meta name="theme-color">` in index.html (#1a56db). Browser verwendet den Meta-Tag (korrekt = Header-Farbe). Manifest sollte angleichen | Mittel | Manifest `theme_color` auf `#1a56db` aendern ODER bewusst als Designentscheidung dokumentieren |

**VitePWA Config**:

| Aspekt | Bewertung |
|--------|-----------|
| `registerType: 'autoUpdate'` | GUT (nahtlose Updates) |
| `manifest: false` (externes manifest.json) | GUT |
| `globPatterns: ['**/*.{js,css,html,svg,png,woff2}']` | GUT (alle Assets gecacht) |
| Google Fonts Caching (StaleWhileRevalidate + CacheFirst) | GUT |
| Service Worker generiert (8 Precache-Entries, 111 KB) | GUT |

---

### Issue #10: npm Package (`src/lib/index.ts`) — REVIEW

| Aspekt | Bewertung |
|--------|-----------|
| 56 Typ-Exporte (alle `type`-Exporte, kein Runtime-Cost) | GUT |
| 6 Parser-Funktionsgruppen exportiert | GUT |
| Framework-unabhaengig (kein Preact-Import) | GUT |
| Tree-Shaking moeglich (individuelle Exporte) | GUT |
| Keine visuellen Komponenten (nur Domain-Layer) | GUT — entspricht ADR-003 |

**Keine Issues gefunden.** Public API ist sauber und minimal.

---

### Issue #9: Dokumentation (CONTRIBUTING.md) — REVIEW

| Aspekt | Bewertung |
|--------|-----------|
| Prerequisites + Setup | GUT (Node 18+, 4 Zeilen) |
| Commands-Tabelle | GUT (6 Befehle) |
| Architektur-Uebersicht | GUT (3-Schichten + Import-Regeln) |
| "How to Add a New OSCAL Renderer" | GUT (4 Schritte mit Code-Beispielen) |
| Code Conventions | GUT (6 Punkte) |
| PR Process | GUT (Standard 6-Schritt Workflow) |
| Lizenz-Hinweis | GUT |

**Keine Issues gefunden.** CONTRIBUTING.md ist vollstaendig und praxisnah.

---

### UX-D1: Barrierefreiheitserklaerung — STATUS

`docs/ACCESSIBILITY_STATEMENT.md` wurde **NICHT erstellt**. Dies ist eine UX-Designer-Aufgabe (mein Verantwortungsbereich) und wird als naechster Schritt bearbeitet.

---

### Phase 3 Review — Zusammenfassung

| Aufgabe | Ergebnis | Issues |
|---------|----------|--------|
| UX-P1: App-Icon Design | 3 SVG-Icons, klares Motiv, Safe Zone korrekt | R14 (Farbe), R15 (kein PNG), R16 (kein apple-touch-icon) |
| UX-P3: Offline-Banner | Funktional, auto-dismiss | R17 (CSS-Fix angewandt), R18 (kein X-Button) |
| UX-P4: PWA Toast | Solide CSS-Vorbereitung | Keine |
| Manifest + VitePWA | Korrekte Konfiguration | R19 (theme_color Inkonsistenz) |
| npm Package | Saubere Public API | Keine |
| CONTRIBUTING.md | Vollstaendig | Keine |
| ACCESSIBILITY_STATEMENT.md | Nicht erstellt | UX-D1 offen |

**Behobene Issues**: R17 (Offline-Banner CSS-Variablen → `--color-status-info-*`)

**Offene Empfehlungen fuer FE-Dev**:

| # | Empfehlung | Prio | Aufwand |
|---|-----------|------|---------|
| 1 | Manifest `theme_color` auf `#1a56db` angleichen (R19) | Mittel | 1 Zeile |
| 2 | `<link rel="apple-touch-icon">` in index.html (R16) | Mittel | 1 Zeile + PNG |
| 3 | Icon-Farben auf `#1a56db` pruefen/angleichen (R14) | Niedrig | 3 Dateien |
| 4 | Offline-Banner X-Button (R18) | Niedrig | ~10 Zeilen TSX + CSS |
| 5 | PNG-Fallback-Icons generieren (R15) | Niedrig | Build-Script |

**Build**: 15.26 KB JS + 6.47 KB CSS gzipped | 390 Tests | 0 TS Errors

---

## QA-Aufgaben Audit (2026-02-08)

Systematische Pruefung aller QA-Aufgaben (QA1-QA8) aus dem Dashboard-Redesign gegen den aktuellen Testbestand (485 Tests, 18 Testdateien).

### QA1: Accordion-Tests (ARIA, Keyboard, Expand/Collapse) — ABGEDECKT

| Teilbereich | Tests | Status |
|-------------|-------|--------|
| ARIA-Attribute (aria-expanded, aria-controls, aria-labelledby, role) | 5 | PASS |
| Heading-Level (h3, h4, h5, h6, Cap) | 6 | PASS |
| Expand All / Collapse All (AccordionGroup) | 4 | PASS |
| Session-Persistenz (sessionStorage) | 5 | PASS |
| Keyboard: Trigger ist `<button>` (inherent Enter/Space) | 2 | **NEU** |
| Keyboard: Toggle Open/Close | 1 | **NEU** |
| **Gesamt** | **33** | **VOLLSTAENDIG** |

**Neue Tests**: `QA1: trigger is a button element`, `QA1: trigger toggles on repeated clicks`

---

### QA2: Title Box Tests (Wrap, Sticky) — DEFERRED

**Grund**: Title Box ist CSS-only (Multi-Line Wrapping via `white-space: normal`, Sticky via `position: sticky`). jsdom hat keine Layout-Engine — CSS-Rendering kann nicht getestet werden.

**Empfehlung**: Playwright E2E-Tests fuer visuelle Regression (Backlog).

---

### QA3: Deep-Linking Tests (URL-Hash, Reload State) — ABGEDECKT

| Test | Status |
|------|--------|
| Gibt `null` zurueck wenn kein Hash gesetzt | **NEU** |
| Parst initialen Hash beim Mount | **NEU** |
| Ignoriert Hash fuer anderen viewType | **NEU** |
| `setSelectedId` aktualisiert URL-Hash | **NEU** |
| `setSelectedId(null)` loescht Hash | **NEU** |
| Reagiert auf `hashchange` Events | **NEU** |
| Funktioniert mit SSP viewType | **NEU** |
| Gibt `null` zurueck bei leerem Hash nach Prefix | **NEU** |
| **Gesamt** | **8 NEU** |

**Neue Datei**: `tests/hooks/use-deep-link.test.ts` (8 Tests)

---

### QA4: Filter Tests (Tree-Reduktion, Clear All, Search-Kombi) — ABGEDECKT

| Teilbereich | Tests | Status |
|-------------|-------|--------|
| useFilter Hook (Keyword, Chips, clearAll, Duplikate) | 7 | PASS |
| FilterBar Komponente (Rendering, Callbacks, Categories, a11y) | 11 | PASS |
| **Gesamt** | **18** | **VOLLSTAENDIG** |

**Hinweis**: Filter + Search Kombination ist ein Integrations-Szenario (View-Level). Einzelne Hooks sind vollstaendig getestet. Kombinationstest → Playwright E2E (Backlog).

---

### QA5: Copy-to-clipboard Tests — ABGEDECKT

| Test | Status |
|------|--------|
| `aria-live="polite"` fuer Screen-Reader-Feedback | PASS |
| Deskriptives `aria-label` ("Copy link to ac-1") | PASS |
| Keyboard-zugaenglicher Button | PASS |
| `clipboard.writeText` wird mit korrekter URL aufgerufen | **NEU** |
| `aria-label` wechselt zu "Link copied" nach Klick | **NEU** |
| Button bekommt `copied` CSS-Klasse nach Klick | **NEU** |
| **Gesamt** | **6** (3 bestehend + 3 **NEU**) |

---

### QA6: Roving Tabindex Tests (Arrow-Keys, Focus) — ABGEDECKT

| Teilbereich | Tests | Status |
|-------------|-------|--------|
| GroupTree: ArrowDown/Up, Home/End, Left/Right | 8 | PASS |
| GroupTree: Roving tabindex (tabindex 0/-1) | 1 | PASS |
| SSP Tabs: Roving tabindex | 3 | PASS |
| SearchBar: ArrowDown/Up, Escape | 4 | PASS |
| **Gesamt** | **16+** | **VOLLSTAENDIG** |

---

### QA7: Responsive-Test 320px-1440px+ — DEFERRED

**Grund**: jsdom hat keine Layout-Engine. Responsive Breakpoints, Media Queries, und CSS Grid/Flexbox-Verhalten koennen nicht in Unit-Tests geprueft werden.

**Empfehlung**: Playwright E2E-Tests mit `page.setViewportSize()` fuer 320px, 768px, 1024px, 1440px, 1920px (Backlog).

---

### QA8: axe-core Tests fuer Accordion + Boxes — ABGEDECKT

| Komponente | axe-core Assertion | Status |
|------------|-------------------|--------|
| MetadataPanel | `toHaveNoViolations` | PASS |
| PropertyBadge | `toHaveNoViolations` | PASS |
| PropertyList | `toHaveNoViolations` | PASS |
| CatalogView | `toHaveNoViolations` | PASS |
| GroupTree | `toHaveNoViolations` | PASS |
| ControlDetail | `toHaveNoViolations` | PASS |
| ProfileView | `toHaveNoViolations` | PASS |
| ComponentDefView | `toHaveNoViolations` | PASS |
| SspView | `toHaveNoViolations` | PASS |
| StatusBadge | `toHaveNoViolations` | PASS |
| Accordion | `toHaveNoViolations` | PASS |
| SearchBar (mit Ergebnissen) | `toHaveNoViolations` | PASS |
| SearchBar (ohne Ergebnisse) | `toHaveNoViolations` | PASS |
| ControlDetail + Nested Parts (QS12) | `toHaveNoViolations` | PASS |
| CatalogView + Nested Parts (QS19) | `toHaveNoViolations` | PASS |
| **Gesamt** | **15 Assertions** | **VOLLSTAENDIG** |

Zusaetzlich: Heading-Hierarchie (QS14, 2 Tests), Badge-Kontrast (QS16, 10 Tests).

---

### QA-Audit Zusammenfassung

| QA | Aufgabe | Ergebnis | Neue Tests |
|----|---------|----------|------------|
| QA1 | Accordion ARIA/Keyboard/Expand | **VOLLSTAENDIG** (33 Tests) | +3 |
| QA2 | Title Box Wrap/Sticky | **DEFERRED** (jsdom Limitation) | 0 |
| QA3 | Deep-Linking URL-Hash | **VOLLSTAENDIG** (8 Tests) | +8 |
| QA4 | Filter Reduce/Clear/Search | **VOLLSTAENDIG** (18 Tests) | 0 |
| QA5 | Copy-to-clipboard Feedback | **VOLLSTAENDIG** (6 Tests) | +3 |
| QA6 | Roving Tabindex Focus | **VOLLSTAENDIG** (16+ Tests) | 0 |
| QA7 | Responsive 320-1440px | **DEFERRED** (jsdom Limitation) | 0 |
| QA8 | axe-core Accessibility | **VOLLSTAENDIG** (15 Assertions) | 0 |

**Ergebnis**: 6/8 QA-Aufgaben vollstaendig abgedeckt, 2 als Playwright-Backlog deferred.

**Build**: 485 Tests | 18 Testdateien | 0 TS Errors
