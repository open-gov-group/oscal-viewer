# QA Engineer - Briefing & Kommunikation

**Rolle**: QA Engineer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution (Import-Ketten, Cross-Referenzen, Profile Resolution)

---

## Projekt-Historie (Phasen 1-3) — Archiv

Vollstaendige Historie: `archive/BRIEFING_PHASE1-4a.md`

| Phase | Tests | Coverage | axe-core | Testdateien |
|-------|-------|----------|----------|-------------|
| Phase 1 | 43 | 94.78% | 0 | 1 |
| Phase 2 | 254 | 86.88% | 9 | 11 |
| Dashboard-Redesign | 350 | 89.13% | 13 | 14 |
| Stakeholder-Feedback | 390 | ~89% | 15 | 14 |
| Phase 3 | 444 | 87.99% | 15 | 17 |
| Code-Audit | 485 | ~88% | 15 | 18 |
| Phase 4a | 531 | ~88% | 29 | 19 |

### Bestehende Test-Infrastruktur

- **Framework**: Vitest 4 + @testing-library/preact + vitest-axe
- **Coverage**: V8 (Thresholds: 70/65/78/70)
- **Fixtures**: `tests/fixtures/` (NIST 800-53 Catalog, Profile, CompDef, SSP)
- **axe-core**: 29 Accessibility-Tests (alle PASS)
- **Kontrast-Audit B4**: 22/22 Kombinationen PASS (Light + Dark)
- **DEFERRED**: Playwright E2E (Title Box Sticky, Responsive 320-1440px)

### Bestehende Testdateien

```
tests/
├── parser.test.ts, fixtures.test.ts, docs.test.ts
├── components/ (catalog-view, profile-view, component-def-view, ssp-view, shared, pwa, lib, accessibility)
├── hooks/ (use-search, use-deep-link, use-filter)
└── services/ (href-parser)
```

---

## Kommunikationslog (Phase 4+)

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-09 | Architect | QA Engineer | Phase 4 Briefing: OSCAL Resolution QA-Strategie (HrefParser, DocumentCache, ResolutionService) | Aktiv |
| 2026-02-09 | QA Engineer | Architect | Phase 4a QA-Report: 531 Tests, 29 axe-core, 8/8 HrefParser, 5/5 LinkBadge. Finding F1 (aria-label) offen | Abgeschlossen |
| 2026-02-09 | QA Engineer | Frontend Dev | Finding F1: LinkBadge fehlt `aria-label` (WCAG 4.1.2) — Fix in Phase 4b | Offen |
| 2026-02-09 | Architect | QA Engineer | Phase 4b Briefing: Profile Resolution QA (DocumentCache, ResolutionService, useResolver, ImportPanel) | Aktiv |

---

## NEUER AUFTRAG: Phase 4 — OSCAL Resolution QA-Strategie (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: OSCAL Expert Briefing via Hauptprogrammleitung
**Referenz-Dokument**: `docs/architecture/OSCAL_IMPORT_GUIDE.md`
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem OSCAL-Referenzketten-Funktionsumfang

### Kontext

Phase 4 fuehrt einen neuen `src/services/` Layer ein (Domain Layer), der OSCAL-Referenzketten clientseitig aufloest. Neue Module:

- **HrefParser** (`src/services/href-parser.ts`) — 4 HREF-Patterns erkennen
- **DocumentCache** (`src/services/document-cache.ts`) — Geladene Dokumente cachen
- **ResolutionService** (`src/services/resolver.ts`) — Profile/SSP Import-Ketten aufloesen

Dazu kommen neue UI-Komponenten (LinkBadge, ImportPanel) und ein neuer Hook (useResolver).

---

### QA-R1: HrefParser Tests [HOCH — Sub-Phase 4a]

**Testdatei**: `tests/services/href-parser.test.ts` (NEU)

Mindest-Testfaelle:

| # | Testfall | Eingabe | Erwartung |
|---|---------|---------|-----------|
| 1 | Relativer Pfad | `../catalog/file.json` | `type: 'relative', path: '../catalog/file.json', isResolvable: true` |
| 2 | Relativer Pfad mit Fragment | `catalog.json#GOV-01` | `type: 'relative', fragment: 'GOV-01'` |
| 3 | Fragment-only | `#ACC-01` | `type: 'fragment', fragment: 'ACC-01', path: ''` |
| 4 | Absolute URL | `https://github.com/.../catalog.json` | `type: 'absolute-url', isResolvable: true` |
| 5 | Absolute URL mit Fragment | `https://example.com/cat.json#C-1` | `type: 'absolute-url', fragment: 'C-1'` |
| 6 | URN | `urn:iso:std:iso-iec:27701` | `type: 'urn', isResolvable: false` |
| 7 | Leerer String | `""` | Definiertes Verhalten (kein Crash) |
| 8 | Nur Fragment-Zeichen | `#` | `type: 'fragment', fragment: ''` |

**Pattern**: Reine Unit-Tests, kein DOM noetig, kein Preact.

---

### QA-R2: DocumentCache Tests [HOCH — Sub-Phase 4b]

**Testdatei**: `tests/services/document-cache.test.ts` (NEU)

| # | Testfall | Beschreibung |
|---|---------|-------------|
| 1 | Cache-Miss | `get()` auf unbekannte URL → `undefined` |
| 2 | Cache-Hit | `set()` dann `get()` → gleiches Dokument |
| 3 | URL-Normalisierung | `set('URL#frag')` → `get('URL')` findet es |
| 4 | Case-Insensitiv | `set('HTTP://X.COM/A')` → `get('http://x.com/a')` findet es |
| 5 | has() Methode | `has()` vor und nach `set()` |
| 6 | Verschiedene URLs | Verschiedene Dokumente unter verschiedenen URLs |

---

### QA-R3: ResolutionService Tests [HOCH — Sub-Phase 4b]

**Testdatei**: `tests/services/resolver.test.ts` (NEU)

**Herausforderung**: `fetch()` muss gemockt werden (kein echtes Netzwerk in Tests).

**Strategie**: `vi.stubGlobal('fetch', mockFetch)` mit vorbereiteten Responses.

| # | Testfall | Beschreibung |
|---|---------|-------------|
| 1 | resolveHref relativer Pfad | Mock-Fetch fuer relative URL, Parser aufrufen |
| 2 | resolveHref Fragment | Kein Fetch, internes Lookup |
| 3 | resolveHref URN | Kein Fetch, `isResolvable: false` |
| 4 | resolveHref HTTP-Fehler | Mock-Fetch mit `status: 404` → Error |
| 5 | resolveHref CORS-Fehler | Mock-Fetch wirft `TypeError` → spezifische Meldung |
| 6 | resolveProfile einfach | 1 Import, 2 Controls → gefilterter Catalog |
| 7 | resolveProfile multi-import | 2 Imports parallel → zusammengefuehrter Catalog |
| 8 | resolveProfile mit modify | set-parameters + alters angewandt |
| 9 | Cache-Nutzung | Zweiter Aufruf gleicher URL → kein erneuter Fetch |

**Test-Fixtures**: Minimale OSCAL-Profile und Cataloge als JSON-Objekte im Testfile.

---

### QA-R4: LinkBadge Component Tests [MITTEL — Sub-Phase 4a]

**Testdatei**: `tests/components/link-badge.test.tsx` (NEU)

| # | Testfall | Beschreibung |
|---|---------|-------------|
| 1 | rel="implements" | Rendert "Implementiert" mit gruener Klasse |
| 2 | rel="required" | Rendert "Erforderlich" mit roter Klasse |
| 3 | rel="related-control" | Rendert "Verwandt" mit blauer Klasse |
| 4 | Unbekannter rel | Rendert den rel-Wert als Label mit Default-Klasse |
| 5 | axe-core | Keine a11y Violations |

---

### QA-R5: useResolver Hook Tests [MITTEL — Sub-Phase 4b]

**Testdatei**: `tests/hooks/use-resolver.test.ts` (NEU)

| # | Testfall | Beschreibung |
|---|---------|-------------|
| 1 | Initial State | `loading: false, error: null, resolvedDoc: null` |
| 2 | Erfolgreicher Resolve | `loading` Uebergang, `resolvedDoc` gesetzt |
| 3 | Fetch-Fehler | `error` gesetzt, `resolvedDoc: null` |
| 4 | CORS-Fehler | Spezifische Fehlermeldung |

---

### QA-R6: Integration Tests [NIEDRIG — Sub-Phase 4c]

| # | Testfall | Beschreibung |
|---|---------|-------------|
| 1 | Profile mit aufgeloestem Catalog | Profile laden → Import aufloesen → Controls anzeigen |
| 2 | Fragment-Navigation | Link mit `#CONTROL-ID` klicken → Deep-Link gesetzt |
| 3 | Unaufgeloeste Referenz | CORS-Fehler → Warnung angezeigt |

---

### OSCAL-Validierungsregeln Tests [NIEDRIG — nach Phase 4b]

Der OSCAL-Experte empfiehlt Validierungs-Warnungen. Falls implementiert, Tests fuer:

| Regel | Testfall |
|-------|---------|
| Leere Arrays | `parts: []` → Warnung |
| UUID-Format | Ungueltige UUID → Warnung |
| OSCAL-Version fehlt | `metadata` ohne `oscal-version` → Warnung |
| Namespace ungueltig | `ns: "nicht-uri"` → Warnung |

---

### Umsetzungsreihenfolge

| # | Testdatei | Sub-Phase | Aufwand | Abhaengigkeit |
|---|-----------|-----------|---------|---------------|
| 1 | href-parser.test.ts | 4a | Klein | FE-R1 |
| 2 | link-badge.test.tsx | 4a | Klein | FE-R3 |
| 3 | document-cache.test.ts | 4b | Klein | FE-R4 |
| 4 | resolver.test.ts | 4b | Hoch | FE-R5 |
| 5 | use-resolver.test.ts | 4b | Mittel | FE-R6 |
| 6 | Integration Tests | 4c | Mittel | Alle Services |

### Test-Erwartung Phase 4

- **Neue Testdateien**: 5-6 Dateien
- **Geschaetzte neue Tests**: 30-50 Tests
- **Gesamt**: 485 + ~40 = ~525 Tests
- **Coverage-Ziel**: Services >= 90% (reine Funktionen, gut testbar)
- **axe-core**: LinkBadge + ImportPanel + UnresolvedReference pruefen
- **Keine neuen Dependencies**: `vi.stubGlobal('fetch', ...)` fuer Netzwerk-Mocks

---

## Phase 4a QA-Report (2026-02-09)

**Scope**: Sub-Phase 4a MVP — HrefParser + Fragment-ID + Link-Badges
**Implementierung**: FE-R1 (HrefParser), FE-R2 (Fragment-Resolution), FE-R3 (LinkBadge)

### Bestandsaufnahme

| Datei | Typ | LOC | Status |
|-------|-----|-----|--------|
| `src/services/href-parser.ts` | Domain Service (NEU) | 74 | Implementiert |
| `src/components/shared/link-badge.tsx` | Shared Component (NEU) | 45 | Implementiert |
| `src/components/catalog/control-detail.tsx` | Component (GEAENDERT) | 195 | Refactored: `renderLink()` + `parseHref()` + `LinkBadge` |
| `tests/services/href-parser.test.ts` | Unit-Tests (NEU) | 131 | 18 Tests |
| `tests/components/catalog-view.test.tsx` | Integration-Tests (ERWEITERT) | +100 | Link Resolution (7) + LinkBadge Integration (7) |
| `tests/components/shared.test.tsx` | Unit-Tests (ERWEITERT) | +50 | LinkBadge (9) |
| `tests/accessibility.test.tsx` | axe-core (ERWEITERT) | +14 | LinkBadge a11y (2) |
| `src/styles/base.css` | CSS (ERWEITERT) | +16 | `.link-badge--*` Klassen |
| `eslint.config.js` | ESLint (ERWEITERT) | +22 | `src/services/` Layer-Regeln |
| `docs/CODING_STANDARDS.md` | Standards (ERWEITERT) | v5.0.0 | Sektion 12 (4 Patterns) |

### Verifikations-Ergebnis

| Pruefung | Ergebnis |
|----------|----------|
| TypeScript strict | 0 Errors |
| ESLint | 0 Errors, 13 Warnings (vorbestehend — jsdoc/require-jsdoc) |
| Tests | **531/531** bestanden (+2 neue axe-core, +44 in vorherigen Sessions) |
| axe-core a11y | **29/29** bestanden (2 neue: LinkBadge known + unknown rel) |
| Build | Erfolgreich |
| Bundle JS (gzip) | 16.35 KB |
| Bundle CSS (gzip) | 7.26 KB |
| **Bundle Total (gzip)** | **~30.64 KB** (< 100 KB Limit) |

### QA-R1 Verifikation: HrefParser Tests

| # | Briefing-Testfall | Testdatei Zeile | Status |
|---|---|---|---|
| 1 | Relativer Pfad | href-parser.test.ts:95-98 | PASS |
| 2 | Relativer Pfad + Fragment | href-parser.test.ts:105-109 | PASS |
| 3 | Fragment-only | href-parser.test.ts:67-85 | PASS |
| 4 | Absolute URL | href-parser.test.ts:33-41 | PASS |
| 5 | Absolute URL + Fragment | href-parser.test.ts:48-52 | PASS |
| 6 | URN | href-parser.test.ts:5-23 | PASS |
| 7 | Leerer String | href-parser.test.ts:118-123 | PASS |
| 8 | Nur `#` | href-parser.test.ts:87-91 | PASS |

**Ergebnis**: 8/8 Briefing-Testfaelle + 10 zusaetzliche Edge Cases = **18 Tests PASS**

### QA-R4 Verifikation: LinkBadge Tests

| # | Briefing-Testfall | Testdatei | Status |
|---|---|---|---|
| 1 | rel="implements" rendert | shared.test.tsx:225-228 | PASS |
| 2 | rel="required" rendert | shared.test.tsx:230-233 | PASS |
| 3 | rel="related-control" rendert | shared.test.tsx:235-238 | PASS |
| 4 | Unbekannter rel → Default | shared.test.tsx:250-253 | PASS |
| 5 | axe-core (known rel) | accessibility.test.tsx (NEU) | PASS |
| 6 | axe-core (unknown rel) | accessibility.test.tsx (NEU) | PASS |

**Ergebnis**: 5/5 Briefing-Testfaelle + 6 zusaetzliche (CSS-Modifier, Badges-Count) = **11+ Tests PASS**

### CODING_STANDARDS v5.0.0 Konformitaets-Audit

| Regel | Beschreibung | Status | Severity |
|-------|-------------|--------|----------|
| 12.1 R1 | Kein manuelles href-Parsing | **PASS** | — |
| 12.1 R3 | Fragment ohne Netzwerk-Request | **PASS** | — |
| 12.1 R4 | Relative Pfade relativ zu Basisdokument | FAIL (Design) | LOW — Phase 4b |
| 12.4 R3 | CSS-Variablen fuer Badge-Farben | **PASS** | — |
| **12.4 R4** | **aria-label auf LinkBadge** | **FAIL** | **HOCH** |
| 11.1 | File-Level-Kommentar (3 Dateien) | **PASS** | — |
| 1.0 | ESLint services/ Layer-Regeln | **PASS** | — |

**Score**: 8/9 PASS (89%)

### Findings

#### F1: LinkBadge fehlt `aria-label` [HOCH — Frontend Dev]

**Betroffene Datei**: `src/components/shared/link-badge.tsx` Zeile 41

**Problem**: CODING_STANDARDS v5.0.0 Sektion 12.4 Regel 4 verlangt:
> "Badges muessen aria-label fuer Screenreader haben (z.B. aria-label='Beziehung: Implementiert')"

**Aktuell**:
```tsx
<span class={`link-badge link-badge--${modifier}`}>
  {label}
</span>
```

**Erwartet**:
```tsx
<span class={`link-badge link-badge--${modifier}`} aria-label={`Link: ${label}`}>
  {label}
</span>
```

**Severity**: HOCH — WCAG 4.1.2 (Accessible Name). Der sichtbare Text ("Implements") gibt Screenreadern keinen Kontext, dass es sich um eine Beziehungs-Klassifikation handelt.

#### F2: Relative Pfade nicht aufloesbar [NIEDRIG — Design]

**Betroffene Datei**: `src/services/href-parser.ts` Zeile 66

**Problem**: Relative Pfade werden als `isResolvable: false` markiert. CODING_STANDARDS 12.1 Regel 4 verlangt Aufloesung relativ zum Basisdokument.

**Bewertung**: Erwartetes Verhalten in Phase 4a (kein Base-URL-Kontext verfuegbar). Phase 4b/4c wird dies mit `resolveHref(href, baseUrl, cache)` loesen. **Kein Blocker.**

### Naechste Schritte

1. **Frontend Dev**: F1 beheben — `aria-label` auf LinkBadge ergaenzen
2. **QA**: Nach F1-Fix Re-Test des axe-core Tests (sollte weiterhin PASS sein)
3. **Phase 4b**: QA-R2 (DocumentCache Tests), QA-R3 (ResolutionService Tests), QA-R5 (useResolver Tests) — warten auf FE-R4, FE-R5, FE-R6 Implementierung

---

## AKTUELLER AUFTRAG: Phase 4b — Profile Resolution QA (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: Architect nach Abschluss Phase 4a
**Vorgaenger**: Phase 4a QA-Report (531 Tests, 29 axe-core, Finding F1 offen)
**Leitprinzip**: TDD wo moeglich — Tests vor oder parallel zur Implementierung.

### Kontext

Phase 4b implementiert die Profile Resolution Pipeline. Vier neue Module entstehen:
- **DocumentCache** (`src/services/document-cache.ts`) — In-Memory Cache fuer geladene Dokumente
- **ResolutionService** (`src/services/resolver.ts`) — Profile Import-Ketten aufloesen
- **useResolver** (`src/hooks/use-resolver.ts`) — Application Layer Hook
- **ImportPanel** (`src/components/shared/import-panel.tsx`) — Import-Quellen Visualisierung

Zusaetzlich werden bestehende Module modifiziert:
- `href-parser.ts` — relative Pfade werden `isResolvable: true`
- `link-badge.tsx` — `aria-label` Fix (Finding F1)

---

### QA-R4b-F1: LinkBadge aria-label Re-Test [HOCH — sofort]

**QA Finding F1 aus Phase 4a**: LinkBadge fehlt `aria-label` (WCAG 4.1.2).

**Erwartung nach Fix**:
```tsx
<span class="link-badge link-badge--implements" aria-label="Implements">
  Implements
</span>
```

**Tests**:
| # | Test | Datei | Status |
|---|------|-------|--------|
| 1 | LinkBadge hat `aria-label` Attribut (known rel) | shared.test.tsx | NEU |
| 2 | LinkBadge hat `aria-label` Attribut (unknown rel) | shared.test.tsx | NEU |
| 3 | axe-core LinkBadge: 0 Violations | accessibility.test.tsx | RE-TEST |

---

### QA-R4b-HP: HrefParser Update Re-Test [MITTEL]

**Aenderung**: Relative Pfade aendern sich von `isResolvable: false` zu `isResolvable: true`.

**Bestehende Tests anpassen** (`tests/services/href-parser.test.ts`):

| # | Test | Vorher | Nachher |
|---|------|--------|---------|
| 1 | Relativer Pfad ohne Fragment | `isResolvable: false` | `isResolvable: true` |
| 2 | Relativer Pfad mit Fragment | `isResolvable: false` | `isResolvable: true` |

**Alle anderen HrefParser Tests** bleiben unveraendert (URN, Fragment, Absolute URL).

---

### QA-R2: DocumentCache Tests [HOCH]

**Testdatei**: `tests/services/document-cache.test.ts` (NEU)

**Hinweis**: Reine Unit-Tests — kein DOM, kein Preact, kein fetch. Schnelle Ausfuehrung.

| # | Testfall | Beschreibung | Erwartung |
|---|---------|-------------|-----------|
| 1 | Cache-Miss | `get()` auf unbekannte URL | `undefined` |
| 2 | Cache-Hit | `set('url', doc)` dann `get('url')` | gleiches Dokument-Objekt |
| 3 | URL Fragment-Stripping | `set('url#frag', doc)` → `get('url')` | findet das Dokument |
| 4 | Case-Insensitive | `set('HTTP://X.COM/A', doc)` → `get('http://x.com/a')` | findet das Dokument |
| 5 | has() vor set() | `has('unknown')` | `false` |
| 6 | has() nach set() | `set('url', doc)` → `has('url')` | `true` |
| 7 | Verschiedene URLs | 2 Dokumente unter 2 URLs | Korrekt getrennt |
| 8 | clear() | `set()` → `clear()` → `get()` | `undefined`, `size === 0` |
| 9 | size Property | `set()` x3 → `size` | `3` |
| 10 | Ueberschreiben | `set('url', doc1)` → `set('url', doc2)` → `get('url')` | `doc2` |

**Test-Fixture** (minimales OscalDocument):
```typescript
const mockDoc: OscalDocument = {
  type: 'catalog',
  version: '1.1.0',
  data: { uuid: 'test-uuid', metadata: { title: 'Test', 'last-modified': '2026-01-01', version: '1.0', 'oscal-version': '1.1.0' }, groups: [], controls: [] }
} as unknown as OscalDocument
```

---

### QA-R3: ResolutionService Tests [HOCH]

**Testdatei**: `tests/services/resolver.test.ts` (NEU)

**Herausforderung**: `fetch()` muss gemockt werden.

**Setup**:
```typescript
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

afterEach(() => {
  mockFetch.mockReset()
})
```

**Test-Fixtures**: Minimale OSCAL-Profile und Cataloge als JSON-Objekte.

| # | Testfall | Mock-Setup | Erwartung |
|---|---------|-----------|-----------|
| **resolveHref** | | | |
| 1 | Fragment-only `#ACC-01` | Kein fetch | `type: 'fragment'`, kein Netzwerk-Call |
| 2 | URN `urn:iso:...` | Kein fetch | Error/nicht aufloesbar |
| 3 | Absolute URL erfolgreich | `mockFetch → 200 + JSON` | Dokument zurueck, im Cache |
| 4 | Absolute URL CORS-Fehler | `mockFetch → TypeError` | Spezifische CORS-Fehlermeldung |
| 5 | Absolute URL 404 | `mockFetch → 404` | HTTP-Fehlermeldung |
| 6 | Relative Pfad mit baseUrl | `mockFetch → 200 + JSON` | `new URL(path, baseUrl)` korrekt aufgeloest |
| **fetchDocument** | | | |
| 7 | Cache-Hit | Cache vorbefuellt | Kein fetch, Dokument aus Cache |
| 8 | Cache-Miss | `mockFetch → 200 + JSON` | fetch aufgerufen, Dokument im Cache |
| 9 | GitHub URL-Transformation | `mockFetch` pruefen | `raw.githubusercontent.com` in URL |
| **resolveProfile** | | | |
| 10 | Einfacher Import (1 Catalog, include-all) | Mock-Catalog mit 3 Controls | Alle 3 Controls zurueck |
| 11 | Include-controls.with-ids | Mock-Catalog mit 5 Controls | Nur 2 gefilterte Controls |
| 12 | Multi-Import (2 Cataloge parallel) | 2 Mock-Cataloge | Controls aus beiden zusammengefuehrt |
| 13 | Modify set-parameters | Profile mit set-parameter | Parameter-Wert im Control aktualisiert |
| 14 | Modify alters (add) | Profile mit alter + add | Control um Part erweitert |
| 15 | CORS-Fehler bei einem Import | 1 OK + 1 TypeError | Teilergebnis + Error-Array |

**Performance-Aspekt**: Test 12 (Multi-Import) muss pruefen, dass `Promise.all` verwendet wird (beide Fetches parallel, nicht sequentiell). Pruefung via `mockFetch.mock.calls.length === 2` vor `await`.

---

### QA-R5: useResolver Hook Tests [MITTEL]

**Testdatei**: `tests/hooks/use-resolver.test.ts` (NEU)

**Setup**: `renderHook` aus `@testing-library/preact`.

| # | Testfall | Beschreibung | Erwartung |
|---|---------|-------------|-----------|
| 1 | Initial State | Hook initialisieren | `loading: false, error: null, resolved: null, sources: []` |
| 2 | Loading State | `resolve()` aufrufen | `loading: true` waehrend Promise pending |
| 3 | Erfolgreicher Resolve | Mock-resolveProfile erfolgreich | `loading: false, resolved !== null` |
| 4 | Fetch-Fehler | Mock-resolveProfile wirft Error | `loading: false, error !== null` |
| 5 | Cache-Reuse | 2x `resolve()` aufrufen | Gleiche Cache-Instanz (useRef) |

**Mock-Strategie**: `vi.mock('@/services/resolver')` fuer isolierte Hook-Tests.

---

### QA-R4b-IP: ImportPanel Component Tests [MITTEL]

**Testdatei**: `tests/components/import-panel.test.tsx` (NEU)

| # | Testfall | Beschreibung | Erwartung |
|---|---------|-------------|-----------|
| 1 | Rendert Import-Quellen | 2 Sources | 2 Source-Cards sichtbar |
| 2 | Zeigt Control-Count | Source mit 4 Controls | "4 controls" Text |
| 3 | Loading State | `loading: true` | Loading-Indikator, `aria-busy="true"` |
| 4 | Error Source | Source mit `status: 'error'` | Fehler-Anzeige, Warning-Styling |
| 5 | Merge-Strategie | `merge.combine.method: 'use-first'` | "use-first" angezeigt |
| 6 | Modification Summary | 3 set-params, 1 alter | "3 parameters modified", "1 alterations" |
| 7 | axe-core (normal) | Volle ImportPanel-Fixture | 0 Violations |
| 8 | axe-core (loading) | `loading: true` | 0 Violations |

---

### Umsetzungsreihenfolge

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---------|---------|---------------|
| 1 | QA-R4b-F1: LinkBadge aria-label Re-Test | Klein | FE-R4b-fix |
| 2 | QA-R4b-HP: HrefParser Update Re-Test | Klein | FE-R4b-0 |
| 3 | QA-R2: DocumentCache Tests | Klein | FE-R4 |
| 4 | QA-R3: ResolutionService Tests | Hoch | FE-R5 |
| 5 | QA-R5: useResolver Hook Tests | Mittel | FE-R6 |
| 6 | QA-R4b-IP: ImportPanel Tests | Mittel | FE-R7 |

### Test-Erwartung Phase 4b

| Metrik | Phase 4a | Phase 4b (erwartet) | Delta |
|--------|----------|---------------------|-------|
| Tests gesamt | 531 | ~570-580 | +40-50 |
| Testdateien | 19 | 22-23 | +3-4 |
| axe-core Tests | 29 | 31-33 | +2-4 |
| Service-Tests | 18 | ~45 | +27 |
| Hook-Tests | 0 (useResolver) | ~5 | +5 |
| Coverage Services | ~95% | >= 90% | Ziel |

### Test-Infrastruktur Phase 4b

| Tool | Zweck | Status |
|------|-------|--------|
| `vi.stubGlobal('fetch', ...)` | Netzwerk-Mocks fuer ResolutionService | Nativ (Vitest) |
| `renderHook` (@testing-library/preact) | Hook-Tests fuer useResolver | Bereits verfuegbar |
| `vi.mock('@/services/resolver')` | Isolierte Hook-Tests | Nativ (Vitest) |
| `axe()` (vitest-axe) | a11y-Tests fuer ImportPanel | Bereits konfiguriert |

**Keine neuen Test-Dependencies noetig.**
