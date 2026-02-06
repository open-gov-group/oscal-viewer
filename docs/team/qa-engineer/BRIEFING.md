# QA Engineer - Briefing & Kommunikation

**Rolle**: QA Engineer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06
**Phase**: 2 - Erweiterung (KW 10-12)

---

## Deine Verantwortlichkeiten

- Test-Strategie fuer OSCAL-Validierung definieren
- Automatisierte Tests fuer alle OSCAL-Versionen
- Cross-Browser Testing
- Accessibility-Compliance pruefen
- Performance-Benchmarks definieren

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

### Bestehende Test-Ergebnisse
- **43 Unit Tests** bestanden (alle in `tests/parser.test.ts`)
- **94.78% Statement Coverage** im Parser
- **100% Function Coverage** im Parser
- **0 TypeScript Errors** (strict mode)
- **12.54 KB Bundle** gzipped

### Was getestet wird
- `detectDocumentType()` - 8 Tests (alle 4 Typen + Edge Cases)
- `detectVersion()` - 7 Tests
- `parseCatalog()` - 6 Tests
- `countControls()` - 2 Tests
- `parseProfile()` - 4 Tests
- `parseComponentDefinition()` - 4 Tests
- `parseSSP()` - 5 Tests
- `parseOscalDocument()` - 7 Tests (Integration)

### Was NICHT getestet wird (Luecken)
- Keine Renderer-Tests (Komponenten-Tests fehlen)
- Keine echten OSCAL-Dateien als Fixtures (nur Minimal-Mocks)
- Kein Accessibility-Testing (axe-core nicht eingerichtet)
- Kein Cross-Browser Testing
- Keine E2E Tests
- Keine Performance-Tests

---

## Aktueller Auftrag - Phase 2

### Prioritaet 1: Echte OSCAL Test-Fixtures [HIGH]

**Problem**: Aktuelle Tests nutzen minimale JSON-Mocks. Echte OSCAL-Dateien haben komplexere Strukturen.

**Aufgaben**:
1. Echte OSCAL-Beispieldateien beschaffen von:
   - NIST OSCAL Repository: https://github.com/usnistgov/oscal-content
   - Mindestens 1 Datei pro Dokumenttyp (Catalog, Profile, CompDef, SSP)
2. Dateien ablegen unter `tests/fixtures/`
3. Tests schreiben die echte Dateien parsen und Ergebnisse pruefen
4. OSCAL-Versionen testen: 1.0.0, 1.0.4, 1.1.0, 1.1.2

**Struktur-Vorschlag**:
```
tests/
├── fixtures/
│   ├── catalog-nist-800-53.json     # Grosser Catalog
│   ├── catalog-minimal.json          # Kleiner Test-Catalog
│   ├── profile-moderate.json         # NIST Moderate Baseline
│   ├── component-def-example.json    # Beispiel CompDef
│   └── ssp-example.json              # Beispiel SSP
├── parser.test.ts                    # Bestehende Parser-Tests
├── fixtures.test.ts                  # Tests mit echten OSCAL-Dateien
└── components/                       # Renderer-Tests (neu)
    ├── catalog-view.test.tsx
    ├── profile-view.test.tsx
    ├── component-def-view.test.tsx
    └── ssp-view.test.tsx
```

### Prioritaet 2: Komponenten-Tests [HIGH]

**Aufgaben**:
1. `@testing-library/preact` einrichten (falls noch nicht vorhanden)
2. Tests fuer bestehenden CatalogView schreiben
3. Tests fuer neue Renderer schreiben (sobald implementiert)
4. Testen: Rendering, Navigation, Interaktion, Edge Cases

**Test-Beispiel**:
```tsx
import { render, screen } from '@testing-library/preact'
import { CatalogView } from '@/components/catalog/catalog-view'

describe('CatalogView', () => {
  it('renders catalog metadata', () => {
    render(<CatalogView catalog={mockCatalog} />)
    expect(screen.getByText('NIST 800-53')).toBeTruthy()
  })
})
```

### Prioritaet 3: Accessibility Testing mit axe-core [HIGH]

**Aufgaben**:
1. `axe-core` und `@axe-core/playwright` oder `vitest-axe` installieren
2. Accessibility-Tests fuer alle Renderer-Komponenten
3. WCAG 2.1 AA Violations als Test-Failures
4. Focus-Management testen (Keyboard-Navigation)

**Beispiel**:
```tsx
import { axe, toHaveNoViolations } from 'jest-axe' // oder vitest-axe
expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<CatalogView catalog={mockCatalog} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Prioritaet 4: Cross-Browser Testing [MEDIUM]

- Chrome, Firefox, Safari, Edge (neueste Versionen)
- Manuell oder mit Playwright
- Fokus auf: Layout, CSS Grid/Flexbox, Tree-Navigation

### Prioritaet 5: E2E Tests mit Playwright [MEDIUM - Woche 12]

**Aufgaben**:
1. Playwright einrichten und konfigurieren
2. E2E-Szenarien:
   - Datei per Drag & Drop laden
   - Datei per File-Input laden
   - Catalog navigieren (Group expandieren, Control auswaehlen)
   - "Load another file" Funktion
   - Fehlermeldung bei ungueltigem JSON
3. In CI/CD integrieren

---

## Bestehende Test-Infrastruktur

| Tool | Status | Zweck |
|------|--------|-------|
| Vitest | Konfiguriert | Unit & Integration Tests |
| @vitest/coverage-v8 | Konfiguriert | Coverage Reporting |
| @testing-library/preact | Pruefen | Komponenten-Tests |
| vitest-axe | Einrichten | Accessibility Tests |
| Playwright | Einrichten | E2E Tests |

### Bestehende Guidelines
- `docs/qa/TESTING_STRATEGY.md`
- `docs/qa/QUALITY_GATES.md`

### Coverage-Ziele
- Parser: >= 90% (aktuell 94.78%)
- Renderer: >= 80%
- Gesamt: >= 80%

---

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Frontend Developer | Test-Coverage, Testdaten, Renderer-Tests |
| Tech Lead | Test-Strategie Abstimmung |
| DevOps Engineer | CI/CD Test-Integration |
| UI/UX Designer | Accessibility Anforderungen |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | QA Engineer | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | QA Engineer | Phase 2 Briefing: Fixtures, Komponenten-Tests, axe-core | Aktiv |
