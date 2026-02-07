# Design System — Light + Dark (Tokens & Verhalten)

## 1. Farbrollen (Roles statt Fixwerte)
### Core
- bg, bg-subtle, bg-elevated
- surface-1/2/3 (Pane-Flächen: Nav/Main/Utility)
- border, border-strong
- text, text-muted, text-disabled
- icon, icon-muted
- link, link-hover
- focus (Focus Ring)
- overlay (Backdrop)

### Status (jeweils bg/text/border)
- success, warning, danger, info, neutral

**Gov-Regel:** Status nie nur über Farbe → Icon + Label.

---

## 2. Light Theme (Prinzipien)
- Neutrale helle Grundfläche, minimale Abstufungen.
- Sehr dunkler Primärtext, „muted“ bleibt gut lesbar.
- Borders dezent, aber klar (Box-Haptik).

## 3. Dark Theme (Prinzipien)
- Kein reines Schwarz; dunkle neutrale Flächen.
- Elevation über Helligkeitsstufen, Schatten sparsam.
- Borders etwas stärker als in Light.

---

## 4. Typografie
- UI Sans für Navigation/Labels/Buttons.
- Mono für IDs (Controls/System IDs).

Empfohlene Größen:
- H1 Page Title: 22–28px Desktop, 20–24px Mobile
- Box Header: 16–18px
- Body: 14–16px, line-height 1.5–1.7
- Meta/Label: 12–13px (muted)

Lesbarkeit:
- Fließtext-Blöcke in Boxes intern auf 72–88ch begrenzen.

---

## 5. Spacing & Layout
- 4px Grid (4/8/12/16/24/32…)
- Pane Padding: 16–24px
- Box Padding: 16–20px
- Accordion Row Height: 44–52px
- Radius: 10–14px
- Shadow: subtil (Dark optional ohne Shadow)

---

## 6. Komponenten-Verhalten (Light/Dark)
### Boxes
- bg-elevated + border
- Dark: Border stärker, Schatten minimal/aus

### Accordions
- Hover/Active nicht nur heller/dunkler, sondern über surface-step (surface-2 → surface-3)
- Expand all / Collapse all + Copy link

### Navigation Tree
- Selected: surface-step + linker Marker, nicht „bunt“
- Title Box: wrap, keine Ellipse

---

## 7. States (Pflicht)
- Loading (Skeleton)
- Empty
- No Results (mit Reset)
- Error (Details einklappbar)
- Offline/Timeout (Retry)
