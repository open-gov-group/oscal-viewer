# Blueprint — Layout & Views (Catalog / Profile / Component / SSP)

## 1. Globales Layoutsystem
### Desktop (Fullscreen, ≥1200px)
**Shell (immer fullscreen):**
- Topbar (fix) 64–72px
- Body (flex row)
  - Left Navigation Pane: 360–420px (resizable)
  - Main Content Pane: fluid (min 640px)
  - Right Utility Pane (optional): 320px (optional, sonst in Main integrieren)

**Regeln:**
- Kein globaler max-width Container.
- Fließtexte in Boxes intern auf 72–88ch begrenzen.

### Tablet (768–1199px)
- Nav 300–340px, optional einklappbar
- Utility Pane entfällt → in Main

### Mobile (≤767px)
- Navigation als Drawer/Bottom Sheet
- Detailpane primär; tiefe Strukturen via Accordion

---

## 2. Navigation: Gesamttitel nie abschneiden
**Title Box (sticky) oben im Nav Pane**
- Dokumenttyp (klein)
- Gesamttitel (groß, wrap, keine Ellipse)
- Optional: Version/Modified

**Tree darunter** scrollt separat (virtuell).

---

## 3. Globale Komponenten
### Topbar
- Produktname/Logo
- Global Search (dominant)
- Document Switcher/File Selector
- Help/Settings + Theme Switch

### Left Navigation Pane
1) Title Box (sticky, wrap)
2) Context Switcher (Document Type/Datei)
3) Filter Bar (chips)
4) Hierarchy Tree / TOC (virtualisiert)

### Main Content Pane
- Sticky Header Strip optional: Breadcrumbs + Titel + Badges + Quick Actions
- Content: Summary Box + Accordion Groups + References + Metadata

---

## 4. View-spezifische Strukturen

## A) Catalog View
**Nav Tree:** Families → Controls → Enhancements/Parts  
**Main (Control Detail):**
1) Control Header Box (ID + Titel + Family/Parent)
2) Summary Box (Kurzbeschreibung/Scope)
3) Accordion „Control Structure“
   - Statement/Requirement (Parts)
   - Guidance/Discussion
   - Parameters
   - Enhancements (mit Count; je Enhancement: Box + optional nested Accordion)
4) References Box (Backmatter, Related)
5) Metadata Box (optional)

**Responsive:**
- Desktop optional 2-col in Main (Summary/Meta), Mobile 1-col.

## B) Profile View
**Nav Tree:** Imports → Modify Sets → Merge/Alterations  
**Main:**
1) Profile Header Box
2) Imports & Sources Box
3) Accordion „Modifications“
4) Effective Control Set Summary Box (Counts)
5) Results List/Table (filterbar; click opens detail)

## C) Component Definition View
**Nav Tree:** Components → Capabilities → Implementations  
**Main:**
1) Component Header Box (Name/Type/ID)
2) Overview Box
3) Accordion „Capabilities“
4) Accordion „Control Implementations“
   - pro Control: Statement Box + Evidence Box + Roles Box + References

## D) SSP View
**Nav Tree:** System Characteristics → Boundary → Roles → Implemented Controls → Backmatter  
**Main:**
1) SSP Header Box (System Name/ID, Impact, Owner)
2) System Characteristics Boxes (Label/Value grid)
3) Accordion „Boundary & Diagrams“
4) Accordion „Implemented Controls“ (Filter: implemented/partial/not)
5) Backmatter Box

---

## 5. Boxes & Accordions — Spezifikation
### Boxes
- Header: Titel + optional Count + Actions
- Body: Label/Value grid (2–3 Spalten Desktop, 1 Spalte Mobile)
- Textbreite intern begrenzen, Shell bleibt fullscreen

### Accordions
- Triggerzeile: Titel + Count + Status + Icon
- Controls: Expand all / Collapse all + Copy section link
- Zustand pro Session merken

---

## 6. Interaktionsdetails
- Resizable Nav Pane (min 320, max 520)
- Sticky Title Box + optional sticky Search/Filter
- Copy-to-clipboard für IDs/Links (dezente Toast)
- Keyboard: Tree (Arrows), Accordion (Enter/Space), Search (Esc)
