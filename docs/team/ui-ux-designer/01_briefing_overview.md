# UI/UX Briefing — Modernes OSCAL Dashboard (Public Sector)

**Ziel:** Ein professionelles, modernes, seriöses Dashboard-UI zur Übersicht, Navigation und Detailansicht komplexer OSCAL-Inhalte — orientiert an den Funktionalitäten von `viewer.oscal.io`.

## 1. Kontext & Zielsetzung
- Dashboard zur Darstellung und Navigation von OSCAL-Strukturen (z. B. Catalog, Profile, Component Definition, SSP).
- Zielgruppe: **Öffentliche Verwaltung** (Audit-/Compliance-nahe Nutzung, hohe Erwartung an Klarheit, Robustheit, Barrierearmut).
- Designprinzip: **ruhig, präzise, vertrauenswürdig** („audit-ready“).

## 2. Erfolgskriterien
- Schnelles Auffinden relevanter Inhalte (Navigation + Suche + Filter).
- Verständliche Hierarchien trotz Komplexität (saubere IA).
- Voll responsiv ohne Funktionsverlust.
- Barrierearm (mindestens WCAG 2.1 AA/BITV-orientiert).

## 3. Funktionsumfang (Must/Should)
### Must
- Navigation über Hierarchiebaum (links) + Detailpane (rechts).
- Global Search (dok.-weit) + Filter (z. B. Family, Control-ID, Keywords).
- Deep-Linking auf konkrete Elemente (Sections/Controls).
- Metadatenanzeige (Version, Modified, Owner etc.) in strukturierter Form.
- Zustandsmanagement: Loading, Empty, Error, No results, Offline/Timeout.

### Should
- Raw-View / Download / Export (falls Produktumfang).
- Virtualisierung großer Trees/Listen.
- Copy-to-clipboard (IDs/Links) mit dezenter Bestätigung.

## 4. Layout-Vorgabe: Fullscreen (Desktop)
- **Desktop muss fullscreen sein** (kein boxed Layout, kein max-width Container für die Shell).
- Leselimits nur **innerhalb** von Text-Boxes (z. B. `max-width: 72–88ch`), nicht für die Gesamtfläche.

## 5. Navigation-Vorgabe: Gesamttitel immer lesbar
- In der Navigation muss der **Gesamttitel vollständig sichtbar sein** (kein Abschneiden/keine Ellipse).
- Lösung: **Title Box** oben in der linken Navigation, mehrzeilig mit Wrap, optional „Show more/less“ bei extrem langen Titeln.
- Title Box bleibt sticky; Tree darunter scrollt.

## 6. Gruppierung & Haptik (Kernanforderung)
- Gruppierungen werden konsequent in **Boxes (Cards/Panels)** und **Accordions** umgesetzt.
- Ziel: bessere Haptik/Handhabung, klare visuelle Struktur, weniger kognitive Last.

## 7. Accessibility & Compliance
- Tastaturbedienung (Tree, Accordion, Search) vollständig.
- Sichtbarer Fokus (Focus Ring), logische Focus-Order.
- Kontrast AA, keine Informationsvermittlung nur über Farbe (Status: Icon + Text).
- Semantik: ARIA korrekt für Accordion/Tree.

## 8. Deliverables (für UI/UX Expert*in)
- User Flows (mind. 3), IA/Sitemap, Wireframes (Desktop/Tablet/Mobile).
- HiFi Screens in Figma (Shell + 4 Views + States).
- Mini Design System (Tokens, Komponenten, States, Accessibility Notes).
