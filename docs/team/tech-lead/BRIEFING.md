# Tech Lead - Briefing & Kommunikation

**Rolle**: Tech Lead
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution (Import-Ketten, Cross-Referenzen, Profile Resolution)

---

## Deine Verantwortlichkeiten

- Technische Architektur-Entscheidungen treffen und dokumentieren
- Code-Qualitaet sicherstellen durch Reviews und Standards
- Team technisch mentoren und weiterentwickeln
- OSCAL-Spezifikation verstehen und korrekte Implementierung sicherstellen
- Schnittstelle zur Gesamtprojekt-Architektur

---

## Projekt-Historie (Phasen 1-3) — Archiv

Vollstaendige Historie: `archive/BRIEFING_PHASE1-4a.md`

| Phase | Ergebnis | Commit | Tests |
|-------|----------|--------|-------|
| Phase 1 | ADR-001 bis ADR-004, ARCHITECTURE.md, Parser, Catalog Renderer | `983c8ff` | 43 |
| Phase 2 | ESLint Layer-Regeln, CODING_STANDARDS, PR-Template, 4 Renderer Reviews | `759b012` | 254 |
| UI/UX Overhaul | Material Design, CSS-Variablen, a11y Audit | `a567973` | 254 |
| Dashboard-Redesign | CODING_STANDARDS v3.0.0 (15 Patterns), Accordion/Filter/DeepLink Architektur | `195b58e` | 350 |
| Stakeholder-Feedback | S1-S3 Reviews, BITV 2.0 Konformitaet | — | 350 |
| Phase 3 | ADR-006 (PWA), ADR-007 (npm), CODING_STANDARDS v4.0.0, CHANGELOG.md, CI/CD Pipelines | `abcf25c` | 444 |
| Dependency-Upgrade | Vite 7, Vitest 4, ESLint 9 Flat Config, Node 22 LTS | — | 444 |
| Feature-Paket | MetadataPanel, URL-Loading, Config-Presets Reviews | `4a46e11` | 444 |
| Code-Audit | CODING_STANDARDS v4.2.0 Sektion 11, eslint-plugin-jsdoc | `0abd597` | 485 |

### Etablierte Architektur-Entscheidungen

| ADR | Inhalt |
|-----|--------|
| ADR-001 | Preact statt React (3KB vs 40KB) |
| ADR-002 | Zero-Backend, alles clientseitig |
| ADR-003 | Dreischichtige Architektur (Domain → Application → Presentation) |
| ADR-004 | Vite Build-Konfiguration |
| ADR-005 | ESLint Layer-Schutz |
| ADR-006 | PWA mit vite-plugin-pwa |
| ADR-007 | npm Package (@open-gov-group/oscal-parser) |

### Etablierte Patterns (CODING_STANDARDS v5.0.0)

- ParseResult<T> Pattern, spezialisierte Parser pro Dokumenttyp
- Dreischicht: types/ → parser/ → services/ → hooks/ → components/
- ESLint Layer-Regeln (Flat Config), consistent-type-imports
- Shared Components in src/components/shared/
- Hooks: useSearch, useDeepLink, useFilter (Application Layer)
- Services: Domain Layer, reine Funktionen, kein Preact Import

---

## Kommunikationslog (Phase 4+)

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-09 | Architect | Tech Lead | Phase 4 Briefing: OSCAL Resolution — TL-R1 bis TL-R5. Details im Abschnitt "NEUER AUFTRAG Phase 4" | Aktiv |
| 2026-02-09 | Tech Lead | Alle | TL-R1: ADR-008 Resolution Service Architecture erstellt (3 Module: HrefParser, DocumentCache, ResolutionService, Layer-Konformitaet, CORS-Strategie) | Erledigt |
| 2026-02-09 | Tech Lead | Alle | TL-R2: ESLint Layer-Regeln fuer src/services/ hinzugefuegt (hooks/components/preact Import verboten) | Erledigt |
| 2026-02-09 | Tech Lead | Alle | TL-R3: CODING_STANDARDS.md v5.0.0 — Sektion 1 (services/ Layer), Sektion 12 (Patterns 19-22: HREF Resolution, Document Cache, Resolution Hooks, Link-Badges) | Erledigt |
| 2026-02-09 | Tech Lead | Alle | ADR Index aktualisiert (ADR-008 hinzugefuegt) | Erledigt |
| 2026-02-09 | Tech Lead | Alle | Validierung: ESLint 0 Fehler + 13 Warnungen (jsdoc), TypeScript 0 Fehler, 485/485 Tests bestanden | Erledigt |
| 2026-02-09 | QA Engineer | Tech Lead | **Phase 4a QA-Report**: CODING_STANDARDS v5.0.0 Konformitaet 8/9 PASS. Sektion 12 Patterns 19-22 korrekt implementiert. ESLint services/-Layer-Regeln greifen (0 Fehler). 1 Abweichung: LinkBadge fehlt `aria-label` (Sektion 12.4 Regel 4). 531 Tests, 29 axe-core | Zur Kenntnis |
| 2026-02-09 | Architect | Tech Lead | **Phase 4b Briefing**: Profile Resolution — TL-R4b Code Review (DocumentCache, ResolutionService, useResolver, ImportPanel). Details im Abschnitt "AKTUELLER AUFTRAG Phase 4b" | Aktiv |

---

## NEUER AUFTRAG: Phase 4 — OSCAL Resolution (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: OSCAL Expert Briefing via Hauptprogrammleitung
**Referenz-Dokument**: `docs/architecture/OSCAL_IMPORT_GUIDE.md`
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang. Weiterhin "Web"-App (PWA).

### Kontext

Der OSCAL-Experte hat die vollstaendige Import- und Referenzierungskette definiert:

```
SSP → Profile → Catalog(e)
       ↕              ↕
 Component-Defs    Cross-Refs
```

Der Viewer muss diese Kette clientseitig aufloesen koennen. Bestehender ADR-003 (Import Resolution) beschreibt den Hybrid-Ansatz (Lazy Loading + Fallback). Jetzt wird die konkrete Implementierung geplant.

---

### TL-R1: ADR-008 Resolution Service Architecture [HOCH]

**Datei**: `docs/architecture/decisions/ADR_008_resolution_service.md` (NEU)

**Entscheidungen zu dokumentieren**:

1. **Services Layer im Domain Layer**: Neuer Ordner `src/services/` neben `types/` und `parser/`
   - **Begruendung**: Reine Funktionen, kein Framework-Abhaengigkeit, testbar ohne Browser
   - Services importieren aus `types/` und `parser/`, nie aus `hooks/` oder `components/`
   - Bestehende Layer-Hierarchie bleibt: Domain → Application → Presentation

2. **3 Service-Module**:

   a) **HrefParser** (`src/services/href-parser.ts`):
   ```typescript
   type HrefType = 'relative' | 'fragment' | 'absolute-url' | 'urn'
   interface ParsedHref {
     type: HrefType
     path: string
     fragment?: string
     isResolvable: boolean
   }
   function parseHref(href: string): ParsedHref
   ```
   - URN (`urn:...`) → `isResolvable: false`, als Referenz-Label anzeigen
   - Fragment (`#ID`) → Internes Lookup im geladenen Dokument
   - Relative Pfade (`../catalog/file.json`) → relativ zum Basisdokument aufloesen
   - Absolute URLs (`https://...`) → `fetch()` mit CORS-Handling

   b) **DocumentCache** (`src/services/document-cache.ts`):
   ```typescript
   class DocumentCache {
     get(url: string): OscalDocument | undefined
     set(url: string, doc: OscalDocument): void
     private normalize(url: string): string  // Fragment entfernen, lowercase
   }
   ```
   - Verhindert doppeltes Laden bei Mehrfach-Referenzen
   - URL-Normalisierung: Fragment entfernen, lowercase

   c) **ResolutionService** (`src/services/resolver.ts`):
   ```typescript
   interface ResolutionService {
     resolveHref(href: string, baseUrl: string): Promise<ResolvedReference>
     resolveProfile(profile: Profile): Promise<ResolvedCatalog>
     resolveSSP(ssp: SSP): Promise<ResolvedSSP>
   }
   ```

3. **CORS-Strategie**: GitHub raw URLs (`raw.githubusercontent.com`) direkt. Fehlermeldung bei CORS-Blockade mit Hinweis auf lokalen Download. Kein Proxy.

4. **Leichtgewichts-Prinzip**: Services ~200 LOC, geschaetzter Bundle-Impact +1-2 KB gzipped

**Layer-Konformitaet**:
```
src/services/ → src/types/   ✅ Domain → Domain
src/services/ → src/parser/  ✅ Domain → Domain
src/services/ → src/hooks/   ❌ VERBOTEN
src/services/ → src/components/ ❌ VERBOTEN
```

---

### TL-R2: ESLint Layer-Regeln fuer services/ [HOCH]

**Datei**: `eslint.config.js`

Neuer Abschnitt fuer `src/services/`:
```javascript
{
  files: ['src/services/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/hooks/*', '../hooks/*'], message: 'Services (Domain) cannot import from hooks (Application)' },
        { group: ['@/components/*', '../components/*'], message: 'Services (Domain) cannot import from components (Presentation)' },
        { group: ['preact', 'preact/*'], message: 'Services must be framework-independent' }
      ]
    }]
  }
}
```

---

### TL-R3: CODING_STANDARDS.md v5.0.0 [MITTEL]

Neue Patterns fuer Phase 4:

#### Pattern 19: HREF Resolution
```
- parseHref() fuer alle href-Attribute nutzen (nie manuelles String-Parsing)
- URNs (urn:...) als nicht-aufloesbar markieren, Label anzeigen
- Fragment-IDs (#ID) intern aufloesen, nicht netzwerk-laden
- Relative Pfade relativ zum Basisdokument aufloesen
```

#### Pattern 20: Document Cache
```
- Alle geladenen Dokumente im DocumentCache registrieren
- Cache-Key ist normalisierte URL (ohne Fragment, lowercase)
- Cache-Miss → fetch() → parse → cache → return
- Kein TTL (Session-basiert, Reload = frischer Cache)
```

#### Pattern 21: Resolution Hooks
```
- ResolutionService im Domain Layer (reine Funktionen)
- Hook-Wrapper (useResolver) im Application Layer fuer State + Loading + Error
- Components nutzen nur den Hook, nie den Service direkt
```

#### Pattern 22: Link-Relation Badges
```
- rel="implements" → Gruen (PropertyBadge-Stil)
- rel="required" → Rot
- rel="related-control" → Blau
- rel="bsi-baustein" → Orange
- rel="template" → Grau
- Unbekannte rel-Werte → Standard-Badge
```

---

### TL-R4: Code Review Fokus Phase 4 [MITTEL]

| Sub-Phase | Review-Fokus |
|-----------|-------------|
| 4a (MVP) | HrefParser: Alle 4 Patterns korrekt? Fragment-Aufloesung robust? |
| 4b (Profile) | Profile Resolution Pipeline: imports → filter → merge → modify korrekt? |
| 4c (SSP/CompDef) | SSP-Kette: import-profile → by-components Mapping korrekt? |

**Performance-Ueberlegungen** (ADR-005):
- DocumentCache verhindert doppelte Netzwerk-Requests
- Profile Resolution kann mehrere Cataloge laden → parallel `Promise.all`
- Grosse Cataloge (NIST 800-53: ~18.000 Zeilen): Parsing-Performance testen
- `useMemo` auf aufgeloeste Daten (nicht bei jedem Render neu aufloesen)

---

### TL-R5: Validierungsregeln [NIEDRIG]

Der OSCAL-Experte empfiehlt Warnungen fuer:

| Regel | Pruefung |
|-------|---------|
| Namespace | `ns` muss gueltige URI sein |
| Leere Arrays | `parts[]`, `props[]`, `links[]` duerfen nicht `[]` sein |
| UUID-Format | Muss UUIDv4 sein |
| OSCAL-Version | `metadata.oscal-version` muss vorhanden sein |
| Broken Links | `href`-Ziele muessen existieren |

→ Spaeter als optionalen Validierungs-Layer implementieren (nach Phase 4b).

---

### Umsetzungsreihenfolge

| # | Aufgabe | Sub-Phase | Aufwand | Abhaengigkeit |
|---|---------|-----------|---------|---------------|
| 1 | TL-R1: ADR-008 | 4a | Mittel | Keine |
| 2 | TL-R2: ESLint services/ | 4a | Klein | TL-R1 |
| 3 | TL-R3: CODING_STANDARDS v5.0.0 | 4a | Mittel | TL-R1 |
| 4 | TL-R4: Code Review 4a | 4a | Klein | FE-Implementierung |
| 5 | TL-R4: Code Review 4b | 4b | Mittel | FE-Implementierung |
| 6 | TL-R5: Validierungsregeln | 4c | Klein | Nach 4b |

### Build-Erwartung Phase 4

- Bundle-Impact: +1-2 KB gzipped (Services + UI)
- Neue Dateien: ADR-008, 3 Service-Dateien, 1-2 UI-Komponenten
- Tests: Bestehende 485 Tests + neue Service-Tests + Integration-Tests
- Budget: ~30 KB → ~32 KB gzipped (weiterhin weit unter 100 KB Limit)

---

## AKTUELLER AUFTRAG: Phase 4b — Profile Resolution (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: Architect nach Abschluss Phase 4a
**Vorgaenger**: Phase 4a abgeschlossen (Commit `4394bb2`, 531 Tests)
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang.

### Kontext

Phase 4a hat die Grundlagen gelegt: HrefParser (4 Patterns), LinkBadge (5 Farben), Fragment-Links. Phase 4b baut darauf auf und implementiert die **Profile Resolution Pipeline** — das Kernstueck der OSCAL-Referenzkettenaufloesung.

**Bestehender Code (Phase 4a)**:
- `src/services/href-parser.ts` — `parseHref()` mit ParsedHref Typ (74 LOC)
- `src/components/shared/link-badge.tsx` — LinkBadge Component (45 LOC)
- `src/components/catalog/control-detail.tsx` — `renderLink()` mit Fragment-Navigation
- `eslint.config.js` — services/ Layer-Regeln aktiv

**Wichtige Phase 4a Einschraenkung**: `parseHref()` gibt `isResolvable: false` fuer relative Pfade zurueck. Phase 4b muss das aendern: relative Pfade werden resolvable wenn ein `baseUrl` Kontext vorhanden ist (d.h. wenn das Dokument via URL geladen wurde).

---

### TL-R4b-1: Code Review DocumentCache [HOCH]

**Datei**: `src/services/document-cache.ts` (NEU)

**Review-Checkliste**:
1. Layer-Konformitaet: Kein Import aus hooks/, components/, preact
2. URL-Normalisierung korrekt: Fragment entfernen (`#` und alles danach), `toLowerCase()`
3. `Map<string, OscalDocument>` als interner Cache-Typ
4. Kein TTL/Expiration — Session-basiert (Reload = frischer Cache)
5. `get()`, `set()`, `has()`, `clear()` Methoden vorhanden
6. Keine Side-Effects (kein fetch, kein localStorage)
7. JSDoc auf Klasse und allen exportierten Methoden (CODING_STANDARDS v5.0.0 Sektion 11)

---

### TL-R4b-2: Code Review ResolutionService [HOCH]

**Datei**: `src/services/resolver.ts` (NEU)

**Review-Checkliste**:
1. Layer-Konformitaet: Importiert nur aus types/, parser/, services/ — nie hooks/components
2. `resolveHref(href, baseUrl, cache)` korrekt:
   - URN → Fehler/Label (nicht aufloesbar)
   - Fragment → Lookup im aktuellen Dokument (kein fetch)
   - Relative Pfade → `new URL(path, baseUrl)` Aufloesung
   - Absolute URL → `fetch()` mit CORS-Handling
3. **GitHub URL-Transformation**: `github.com/.../blob/...` → `raw.githubusercontent.com/...`
4. Profile Resolution Pipeline:
   a) `imports[].href` → Cataloge laden (**parallel** mit `Promise.all`)
   b) `include-controls.with-ids` → Controls filtern (nur ausgewaehlte IDs behalten)
   c) `include-all` → Alle Controls uebernehmen
   d) `merge.combine.method` → `use-first` / `merge` / `keep` korrekt implementiert
   e) `modify.set-parameters` → Parameter-Werte in Controls aktualisieren
   f) `modify.alters` → Controls erweitern (adds) / reduzieren (removes)
5. **Fehlerbehandlung**: CORS-TypeError separat fangen, hilfreiche Fehlermeldung
6. **Cache-Nutzung**: Vor jedem fetch im DocumentCache pruefen
7. **Performance**: `Promise.all` fuer paralleles Laden, kein sequentielles await in Schleifen

---

### TL-R4b-3: Code Review useResolver Hook [MITTEL]

**Datei**: `src/hooks/use-resolver.ts` (NEU)

**Review-Checkliste**:
1. Layer-Konformitaet: Hook im Application Layer, importiert aus services/
2. State-Management: `resolvedDoc`, `loading`, `error` als separate States
3. DocumentCache-Instanz: Eine pro Hook (oder Singleton?) — Entscheidung dokumentieren
4. `resolve()` Funktion: Setzt loading=true, ruft Service auf, setzt Ergebnis oder Fehler
5. Cleanup: Abgebrochene Requests bei Component-Unmount (AbortController oder Flag)
6. Pattern-Konformitaet: Analog zu useSearch, useFilter (CODING_STANDARDS Pattern 21)

---

### TL-R4b-4: Code Review ImportPanel [MITTEL]

**Datei**: `src/components/shared/import-panel.tsx` (NEU)

**Review-Checkliste**:
1. Zeigt Import-Quellen mit Typ-Indikator (lokal vs. extern)
2. Anzahl ausgewaehlter Controls pro Import-Quelle
3. Merge-Strategie anzeigen (combine.method)
4. Modifikationen zusammenfassen (Anzahl set-parameters + alters)
5. `aria-live="polite"` auf Loading-States (UX-R6 Spezifikation)
6. Bestehende CSS-Variablen verwenden (keine hardcoded Farben)
7. Integration in profile-view.tsx — ersetzt/erweitert bestehende Import-Sektion

---

### TL-R4b-5: HrefParser Update Review [NIEDRIG]

**Datei**: `src/services/href-parser.ts` (MODIFIZIERT)

Phase 4a gibt `isResolvable: false` fuer relative Pfade zurueck. Phase 4b muss das aendern:
- `parseHref()` Interface bleibt gleich
- Relative Pfade: `isResolvable: true` wenn in einem Kontext mit baseUrl aufgerufen
- **Option A**: `isResolvable` immer `true` fuer relative (Caller entscheidet)
- **Option B**: Zweiter Parameter `baseUrl?: string` an parseHref
- **Empfehlung**: Option A (einfacher, keine API-Aenderung fuer bestehende Aufrufer)

---

### Umsetzungsreihenfolge

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---------|---------|---------------|
| 1 | TL-R4b-5: HrefParser Update Review | Klein | FE-Implementierung |
| 2 | TL-R4b-1: DocumentCache Review | Klein | FE-Implementierung |
| 3 | TL-R4b-2: ResolutionService Review | Hoch | FE-Implementierung |
| 4 | TL-R4b-3: useResolver Review | Mittel | FE-Implementierung |
| 5 | TL-R4b-4: ImportPanel Review | Mittel | FE-Implementierung |

### Build-Erwartung Phase 4b

- **Neue Dateien**: 2 Services + 1 Hook + 1 UI-Komponente = 4 Dateien
- **Modifizierte Dateien**: href-parser.ts, profile-view.tsx, base.css
- **Bundle-Impact**: +1-1.5 KB gzipped (~300 LOC neuer Code)
- **Tests**: 531 bestehend + ~30-40 neue Tests (Cache, Resolver, Hook, Panel)
- **Budget**: ~31 KB → ~32.5 KB gzipped (weiterhin weit unter 100 KB Limit)
