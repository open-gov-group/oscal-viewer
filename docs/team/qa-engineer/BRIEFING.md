# QA Engineer - Briefing & Kommunikation

**Rolle**: QA Engineer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06

---

## Deine Verantwortlichkeiten

- Test-Strategie fuer OSCAL-Validierung definieren
- Automatisierte Tests fuer alle OSCAL-Versionen
- Cross-Browser Testing
- Accessibility-Compliance pruefen
- Performance-Benchmarks definieren

## Aktueller Auftrag

### Sofort (Phase 1 - KW 6-9)

**Test-Infrastruktur aufbauen**
- Vitest-Konfiguration pruefen und erweitern
- Test-Fixtures erstellen: OSCAL-Beispieldateien fuer alle Versionen
- Accessibility-Testing mit axe-core einrichten
- Coverage-Reporting konfigurieren (Ziel: >= 80%)

**Issue #2 & #3 begleiten**
- Testdaten fuer Parser bereitstellen (verschiedene OSCAL-Versionen)
- Akzeptanztests fuer Catalog Renderer definieren
- Edge Cases identifizieren (leere Catalogs, fehlende Felder, grosse Dokumente)

### Bestehende Test-Infrastruktur

| Tool | Status | Zweck |
|------|--------|-------|
| Vitest | Konfiguriert | Unit & Integration Tests |
| @vitest/coverage-v8 | Konfiguriert | Coverage Reporting |
| Playwright | Noch nicht | E2E Tests (spaeter) |
| axe-core | Noch nicht | Accessibility Tests |

### Bestehende Guidelines
- `docs/qa/TESTING_STRATEGY.md`
- `docs/qa/QUALITY_GATES.md`

### Test-Fokus nach Phase

```
Phase 1: Parser Unit Tests, Basis-Accessibility
Phase 2: Renderer Integration Tests, Cross-Browser
Phase 3: E2E Tests, Performance Benchmarks, Full Accessibility Audit
```

### OSCAL-Versionen zu testen
- 1.0.0, 1.0.4, 1.1.0, 1.1.2

### Offene Fragen an dich
1. Welche OSCAL-Beispieldateien stehen bereits zur Verfuegung (public/examples/)?
2. Sollen Edge Cases wie malformed JSON separat getestet werden?
3. Ab wann soll Playwright fuer E2E eingerichtet werden?

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Frontend Developer | Test-Coverage, Testdaten |
| Tech Lead | Test-Strategie Abstimmung |
| DevOps Engineer | CI/CD Test-Integration |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | QA Engineer | Initiales Briefing | Erstellt |

