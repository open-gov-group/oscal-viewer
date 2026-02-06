# UI/UX Designer - Briefing & Kommunikation

**Rolle**: UI/UX Designer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06
**Phase**: 2 - Erweiterung (KW 10-12)

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

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | UI/UX Designer | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | UI/UX Designer | Phase 2 Briefing: Design-Spezifikationen fuer alle Renderer | Aktiv |
