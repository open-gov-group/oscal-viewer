# ADR-008: Resolution Service Architecture

**Status**: Accepted
**Datum**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution

---

## Kontext

OSCAL-Dokumente bilden eine hierarchische Import- und Referenzierungskette:

```
SSP --> Profile --> Catalog(e)
         |              |
   Component-Defs   Cross-Refs
```

Der Viewer muss diese Kette clientseitig aufloesen koennen. ADR-003 definiert die Dreischicht-Architektur (Domain -> Application -> Presentation), ADR-002 bestimmt das Zero-Backend-Prinzip. Die Resolution-Logik muss als reine Domain-Funktionen implementiert werden, die ohne Framework und ohne Server funktionieren.

Referenz: `docs/architecture/OSCAL_IMPORT_GUIDE.md` (OSCAL Expert Briefing)

## Entscheidung

**Wir fuehren einen neuen `src/services/` Ordner im Domain Layer ein, der drei Module fuer die OSCAL-Referenzaufloesung enthaelt.**

### 1. Services Layer im Domain Layer

Der `src/services/` Ordner liegt auf gleicher Ebene wie `types/` und `parser/` im Domain Layer:

```
Domain Layer
├── types/          # TypeScript-Interfaces (OSCAL-Modell)
├── parser/         # Dokumentverarbeitung (JSON -> Typen)
├── services/       # Referenzaufloesung (NEU)
│   ├── href-parser.ts      # HREF-Parsing (4 Patterns)
│   ├── document-cache.ts   # Cache fuer geladene Dokumente
│   └── resolver.ts         # Resolution-Orchestrierung
└── lib/            # npm Package Entry-Point
```

Import-Regeln fuer `src/services/`:
- `services/` -> `types/` : Erlaubt (Domain -> Domain)
- `services/` -> `parser/` : Erlaubt (Domain -> Domain)
- `services/` -> `hooks/` : VERBOTEN (Domain -> Application)
- `services/` -> `components/` : VERBOTEN (Domain -> Presentation)
- `services/` -> `preact` : VERBOTEN (Framework-Unabhaengigkeit)

### 2. Drei Service-Module

#### a) HrefParser (`src/services/href-parser.ts`)

Reine Funktion ohne Seiteneffekte. Erkennt und klassifiziert OSCAL `href`-Attribute:

```typescript
type HrefType = 'relative' | 'fragment' | 'absolute-url' | 'urn'

interface ParsedHref {
  type: HrefType
  path: string           // Dateipfad oder URL (leer bei Fragment-only)
  fragment?: string      // Control-ID nach # (ohne #-Zeichen)
  isResolvable: boolean  // false bei URNs
}

function parseHref(href: string): ParsedHref
```

Die vier HREF-Patterns:

| Pattern | Beispiel | `type` | `isResolvable` |
|---------|----------|--------|----------------|
| Relativer Pfad | `../catalog/file.json` | `relative` | `true` |
| Fragment-ID | `#GOV-01` | `fragment` | `true` |
| Absolute URL | `https://github.com/.../cat.json` | `absolute-url` | `true` |
| URN | `urn:iso:std:iso-iec:27701` | `urn` | `false` |

Kombinationen (z.B. `catalog.json#GOV-01`) werden korrekt in `path` + `fragment` zerlegt.

#### b) DocumentCache (`src/services/document-cache.ts`)

Session-basierter Cache fuer bereits geladene OSCAL-Dokumente. Verhindert doppelte Netzwerk-Requests bei Mehrfach-Referenzen:

```typescript
class DocumentCache {
  get(url: string): OscalDocument | undefined
  set(url: string, doc: OscalDocument): void
  has(url: string): boolean
  private normalize(url: string): string
}
```

URL-Normalisierung:
- Fragment entfernen (`url.split('#')[0]`)
- Lowercase (`url.toLowerCase()`)
- Kein TTL (Session-basiert, Browser-Reload = frischer Cache)

#### c) ResolutionService (`src/services/resolver.ts`)

Orchestriert die Referenzaufloesung fuer verschiedene OSCAL-Dokumenttypen:

```typescript
interface ResolvedReference {
  document: OscalDocument
  source: string       // Urspruengliche href
  resolvedUrl: string  // Aufgeloeste URL
  fromCache: boolean
}

// Reine Funktionen (kein Class-State, erhalten Cache als Parameter)
function resolveHref(href: string, baseUrl: string, cache: DocumentCache): Promise<ResolvedReference>
function resolveProfile(profile: Profile, baseUrl: string, cache: DocumentCache): Promise<ResolvedCatalog>
function resolveSSP(ssp: SSP, baseUrl: string, cache: DocumentCache): Promise<ResolvedSSP>
```

Profile Resolution Pipeline:
1. `imports[].href` -> Catalog(e) laden (parallel via `Promise.all`)
2. `include-controls.with-ids` -> Controls filtern
3. `merge` -> Controls zusammenfuehren
4. `modify.set-parameters` -> Parameter ueberschreiben
5. `modify.alters` -> Controls erweitern/aendern

### 3. CORS-Strategie

Kein Proxy-Server (ADR-002: Zero-Backend):

- **GitHub URLs**: Automatische Konvertierung `github.com` -> `raw.githubusercontent.com`
- **Andere URLs**: Direkter `fetch()`, CORS-Fehler werden abgefangen
- **Fehlerbehandlung**: Benutzerfreundliche Meldung mit Hinweis auf manuellen Download
- **URNs**: Nicht aufloesbar, als Referenz-Label anzeigen

### 4. Hook-Integration (Application Layer)

Services werden ueber einen Hook-Wrapper im Application Layer angebunden:

```typescript
// src/hooks/use-resolver.ts (Application Layer)
function useResolver() {
  // State: loading, error, resolvedDoc
  // Nutzt ResolutionService + DocumentCache intern
  // Components rufen nur den Hook auf, nie den Service direkt
}
```

## Begruendung

### Warum `src/services/` statt Erweiterung von `src/parser/`?

- **Separation of Concerns**: Parser transformieren JSON -> Typen (synchron, rein). Services orchestrieren Netzwerk + Cache (asynchron, mit Seiteneffekten via `fetch`).
- **Testbarkeit**: Services koennen mit gemocktem `fetch` isoliert getestet werden.
- **Bundle-Impact**: Services werden nur geladen wenn Resolution benoetigt wird (Code Splitting moeglich).

### Warum reine Funktionen statt Klassen-Instanzen?

- Konsistent mit bestehendem Parser-Pattern (reine Funktionen)
- Cache als expliziter Parameter statt verstecktem Zustand
- Einfacher zu testen (kein Setup/Teardown)

### Warum kein Proxy-Server?

- ADR-002 (Zero-Backend) ist gesetzt
- GitHub raw URLs funktionieren ohne CORS
- Fehlermeldung bei CORS-Blockade ist akzeptabel (manueller Download als Fallback)

## Alternativen

### Service Worker als Proxy

- **Pro**: Koennte CORS umgehen
- **Contra**: SW hat keine CORS-Sonderrechte, wuerde nicht helfen
- **Abgelehnt weil**: Technisch nicht moeglich fuer Cross-Origin-Requests

### Resolution im Parser-Layer

- **Pro**: Weniger Dateien/Ordner
- **Contra**: Vermischung von synchroner Transformation und asynchroner Netzwerk-Logik
- **Abgelehnt weil**: Bricht das bestehende Parser-Pattern (rein synchron, keine Seiteneffekte)

### Zentraler Application-Layer Service

- **Pro**: Nahe an den Hooks
- **Contra**: Domain-Logik gehoert nicht in den Application Layer
- **Abgelehnt weil**: Verletzt Dreischicht-Architektur (ADR-003)

## Konsequenzen

- `src/services/` wird als neuer Ordner im Domain Layer etabliert
- ESLint Layer-Regeln muessen `services/` schuetzen (kein Import aus hooks/components/preact)
- `src/lib/index.ts` kann spaeter Services re-exportieren (npm Package)
- CODING_STANDARDS.md benoetigt neue Patterns (HREF Resolution, Document Cache, Resolution Hooks, Link-Badges)
- Geschaetzter Bundle-Impact: +1-2 KB gzipped (~200 LOC Services + ~200 LOC UI)
- Bestehende 485 Tests bleiben unberuehrt; neue Service-Tests kommen hinzu
