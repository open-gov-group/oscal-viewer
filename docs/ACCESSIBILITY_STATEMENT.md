# Erklaerung zur Barrierefreiheit

**Stand**: 2026-02-09
**Geltungsbereich**: OSCAL Viewer — https://open-gov-group.github.io/oscal-viewer/
**Rechtsgrundlage**: BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung), EN 301 549, WCAG 2.1

---

## Stand der Barrierefreiheit

Diese Web-Anwendung ist **weitgehend konform** mit WCAG 2.1 Level AA gemaess BITV 2.0.

### Konformitaetsbewertung

Die Barrierefreiheit wurde durch folgende Massnahmen geprueft:

- **Automatisiertes Audit**: axe-core Tests fuer alle 11 Kernkomponenten (15 Assertions, alle bestanden)
- **Kontrast-Audit**: 22 Farbkombinationen (Light + Dark Mode) systematisch geprueft — alle >= 4.5:1 (WCAG AA)
- **Strukturelle Pruefung**: Heading-Hierarchie (h1-h6), ARIA-Landmarks, Skip-Link, Tastaturzugang
- **Tastatur-Tests**: Accordion (Enter/Space), Tree-Navigation (Arrow-Keys, Home/End), Tab-Reihenfolge

### Umgesetzte Barrierefreiheitsmerkmale

| WCAG-Kriterium | Beschreibung | Status |
|----------------|-------------|--------|
| 1.3.1 Info und Beziehungen | Semantisches HTML, ARIA-Roles, Heading-Hierarchie | Erfuellt |
| 1.4.3 Kontrast (Minimum) | Alle Text-Hintergrund-Kombinationen >= 4.5:1 | Erfuellt |
| 1.4.11 Nicht-Text Kontrast | UI-Komponenten und Grafiken >= 3:1 | Erfuellt |
| 2.1.1 Tastatur | Alle Funktionen per Tastatur erreichbar | Erfuellt |
| 2.4.1 Bloecke umgehen | Skip-Link "Skip to main content" | Erfuellt |
| 2.4.2 Seite betitelt | Aussagekraeftiger Seitentitel | Erfuellt |
| 2.4.6 Ueberschriften | Konsistente h1-h6 Hierarchie, keine Ebenen uebersprungen | Erfuellt |
| 3.1.1 Sprache der Seite | `lang="en"` auf `<html>` Element | Erfuellt |
| 4.1.2 Name, Rolle, Wert | ARIA-Attribute auf allen interaktiven Elementen | Erfuellt |
| 4.1.3 Statusmeldungen | `aria-live="polite"` fuer Clipboard-Feedback, Offline-Banner | Erfuellt |

---

## Bekannte Einschraenkungen

| # | Einschraenkung | WCAG | Erlaeuterung |
|---|---------------|------|--------------|
| 1 | Kein manueller Dark/Light-Mode Toggle | 1.4.1 | Anwendung folgt der System-Einstellung (`prefers-color-scheme`). Ein manueller Toggle ist geplant (Backlog) |
| 2 | Sidebar nicht per Drag resizable | 2.5.1 | Sidebar hat feste Breite. Fuer Nutzer mit eingeschraenktem Sichtfeld kann dies limitierend sein |
| 3 | Dynamisch geladene Inhalte (URL-Import) | 4.1.3 | Beim Laden externer OSCAL-Dokumente via URL wird ein Loading-Indikator mit `role="status"` angezeigt. Bei CORS-Fehlern wird eine informative Fehlermeldung angezeigt |
| 4 | Kein Volltext in XML-Dokumenten | 1.1.1 | Der Viewer unterstuetzt derzeit nur JSON-Format. XML-Dokumente werden nicht verarbeitet |

---

## Feedback-Mechanismus

Wenn Sie Barrieren in der Nutzung dieser Anwendung feststellen, kontaktieren Sie uns:

- **GitHub Issues**: https://github.com/open-gov-group/oscal-viewer/issues
  (Label: `accessibility`)
- **E-Mail**: Ueber die im Repository angegebenen Kontaktdaten

Wir bemuehen uns, gemeldete Barrieren innerhalb von 4 Wochen zu beheben.

---

## Durchsetzungsverfahren

Sollten Sie nach Kontaktaufnahme keine zufriedenstellende Antwort erhalten, koennen Sie sich an die zustaendige Schlichtungsstelle wenden:

**Schlichtungsstelle nach Paragraph 16 BGG**
beim Beauftragten der Bundesregierung fuer die Belange von Menschen mit Behinderungen

- Webseite: https://www.schlichtungsstelle-bgg.de
- E-Mail: info@schlichtungsstelle-bgg.de
- Telefon: +49 (0)30 18 527-2805

---

## Technische Informationen

| Merkmal | Wert |
|---------|------|
| Technologie | Preact + TypeScript (Client-side SPA) |
| Konformitaetsziel | WCAG 2.1 Level AA |
| Pruefverfahren | Automatisiert (axe-core) + manuell (Kontrast-Audit, Keyboard-Test) |
| Letzte Pruefung | 2026-02-09 |
| Naechste Pruefung | Geplant bei jedem Major-Release |

---

## Aenderungshistorie

| Datum | Aenderung |
|-------|-----------|
| 2026-02-09 | Erstfassung |
