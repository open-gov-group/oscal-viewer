# Accessibility & Qualitätskriterien (DoD)

## 1. Accessibility (WCAG 2.1 AA / BITV-orientiert)
- Vollständige Tastaturbedienung: Tree, Accordion, Search, Dialoge.
- Sichtbarer Focus Ring (nicht nur Farbe/Shadow).
- Kontraste AA (idealerweise AAA für Fließtext).
- Keine Info nur über Farbe (Status immer Icon + Text).
- Semantik/ARIA:
  - Accordion: korrektes button/region, aria-expanded, aria-controls
  - Tree: roving tabindex, aria-level, aria-selected

## 2. UX Quality
- Virtualisierung großer Trees/Listen.
- Progressive Rendering: Skeletons, lazy detail sections.
- Suche: Debounce, klare Result-Segmente, „No results“ Guidance.
- Copy-to-clipboard mit dezenter Bestätigung.

## 3. Definition of Done
- Full responsive (320px–1440px+) ohne Funktionsverlust.
- Desktop fullscreen (keine boxed Shell).
- Navigation: Gesamttitel vollständig lesbar, nie abgeschnitten.
- Gruppen konsequent: Boxes + Accordions.
- Deep-linking + Copy Link.
- AA-Kontrast + Tastatur + Fokusführung.
