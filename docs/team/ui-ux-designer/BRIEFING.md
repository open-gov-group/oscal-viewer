# UI/UX Designer - Briefing & Kommunikation

**Rolle**: UI/UX Designer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06
**Phase**: UX Redesign (Full-Width Layout) ABGESCHLOSSEN - Phase 3 als naechstes

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

### Verbleibende Design-Aufgaben (Phase 3+)

| # | Aufgabe | Prioritaet |
|---|---------|------------|
| 1 | Sidebar Close-Animation (aktuell: instant wg. display:none) | Niedrig |
| 2 | Search: Klick auf Ergebnis navigiert zum Element | Mittel |
| 3 | Komponenten-Typ-Icons (Software, Hardware, etc.) | Niedrig |
| 4 | Dokumenttyp-spezifische Farbvariablen (--color-catalog, etc.) | Niedrig |
| 5 | Manueller Dark Mode Toggle (fuer PWA, Issue #8) | Mittel |
