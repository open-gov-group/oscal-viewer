# ADR-007: npm Package Architecture

**Status**: Accepted
**Datum**: 2026-02-07
**Issue**: #10

---

## Kontext

Die OSCAL-Parser und -Types des Viewers sollen als eigenstaendiges npm Package veroeffentlicht werden. Andere Projekte (z.B. CI/CD-Pipelines, Validierungstools, andere Frontends) sollen OSCAL-Dokumente parsen koennen, ohne den gesamten Viewer als Abhaengigkeit einzubinden.

Bestehende Struktur (ADR-003):
```
src/types/oscal.ts          — TypeScript Interfaces fuer OSCAL
src/parser/index.ts         — parseOscalDocument() + Re-Exports
src/parser/detect.ts        — detectDocumentType(), detectVersion()
src/parser/catalog.ts       — parseCatalog(), countControls()
src/parser/profile.ts       — parseProfile()
src/parser/component-definition.ts — parseComponentDefinition()
src/parser/ssp.ts           — parseSSP()
```

## Entscheidung

**Wir exportieren ausschliesslich den Domain Layer (types + parser) als `@open-gov-group/oscal-parser`. Das Package hat keine Runtime-Abhaengigkeiten und wird ueber ein separates tsconfig.lib.json gebaut.**

### 1. Package-Scope: Nur Domain Layer

| Layer | Im Package | Begruendung |
|-------|-----------|-------------|
| `types/` | JA | Reine TypeScript Interfaces, keine Runtime-Abhaengigkeit |
| `parser/` | JA | Reines TypeScript, keine Framework-Imports |
| `hooks/` | NEIN | Preact-Abhaengigkeit (useState, useMemo) |
| `components/` | NEIN | Preact/JSX-Abhaengigkeit |
| `styles/` | NEIN | CSS, nicht relevant fuer Package |

**Begruendung**: Parser und Types sind framework-agnostisch. Jedes JavaScript/TypeScript-Projekt kann sie nutzen — React, Vue, Angular, Node.js, Deno. Eine Preact-Abhaengigkeit im Package wuerde die Wiederverwendbarkeit einschraenken.

### 2. Package-Name: @open-gov-group/oscal-parser

- **Scoped** unter der GitHub-Organisation (`@open-gov-group`)
- **"parser"** im Namen — klar was das Package macht
- Unterscheidbar vom Viewer (`oscal-viewer`)

### 3. Entry-Point: src/lib/index.ts

Neuer Entry-Point, der selektiv aus dem Domain Layer re-exportiert:

```typescript
// src/lib/index.ts
// Types
export type {
  Catalog, Profile, ComponentDefinition, SystemSecurityPlan,
  Control, Group, Parameter, Part, Metadata, Property, Link,
  OscalDocument, OscalDocumentType, ParseResult
} from '@/types/oscal'

// Parser functions
export {
  parseOscalDocument,
  parseCatalog, countControls,
  parseProfile,
  parseComponentDefinition,
  parseSSP,
  detectDocumentType, detectVersion
} from '@/parser/index'
```

**Warum ein separater Entry-Point?**
- Kontrollierte Public API — nicht alles was in `parser/` existiert muss oeffentlich sein
- Zukunftssicher — interne Refactorings aendern nicht die Package-API
- ESLint Layer-Regeln greifen automatisch (src/lib/ liegt im Domain Layer)

### 4. Build-Setup: Separates tsconfig.lib.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist/lib",
    "noEmit": false,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/lib/**/*.ts", "src/types/**/*.ts", "src/parser/**/*.ts"]
}
```

**Entscheidungen**:
- **Target ES2020**: Breitere Kompatibilitaet als ESNext (Node 14+)
- **Module ESNext**: Tree-Shaking-faehig fuer Bundler-Konsumenten
- **declaration + declarationMap**: TypeScript Declarations (.d.ts) und Source Maps mitliefern
- **Separates Build-Kommando**: `npm run build:lib` (unabhaengig von `npm run build` fuer die App)

### 5. Versionierung: Unabhaengig von der App

| Artefakt | Version | Registry |
|----------|---------|----------|
| OSCAL Viewer (App) | 0.x.y | GitHub Pages |
| @open-gov-group/oscal-parser | eigene SemVer | npm Registry |

Aenderungen am Parser erhoehen die Package-Version. UI-Aenderungen beruehren das Package nicht.

### 6. Testing: Bestehende Tests genuegen

Die bestehenden Parser-Tests (`tests/parser.test.ts`, `tests/fixtures.test.ts`) decken den gesamten Package-Code ab. Kein separates Test-Setup noetig.

## Layer-Konformitaet

Die bestehenden ESLint Layer-Regeln (ADR-003) garantieren, dass der Domain Layer nicht aus Application oder Presentation importiert:

```
src/lib/index.ts  →  src/types/*     ✅ Domain → Domain
src/lib/index.ts  →  src/parser/*    ✅ Domain → Domain
src/lib/index.ts  →  src/hooks/*     ❌ ESLint Error (Domain → Application)
src/lib/index.ts  →  src/components/* ❌ ESLint Error (Domain → Presentation)
```

Das Package ist architektonisch abgesichert — eine versehentliche UI-Abhaengigkeit wird sofort vom Linter erkannt.

## package.json Ergaenzungen

```json
{
  "main": "./dist/lib/index.js",
  "types": "./dist/lib/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/lib/index.js",
      "types": "./dist/lib/index.d.ts"
    }
  },
  "files": ["dist/lib/"],
  "scripts": {
    "build:lib": "tsc -p tsconfig.lib.json"
  }
}
```

## Konsequenzen

### Positiv
- Zero Runtime-Dependencies — leichtgewichtiges Package
- Framework-agnostisch — nutzbar in jedem JS/TS-Projekt
- Bestehende Tests decken Package ab — kein Mehraufwand
- ESLint-gesicherte Boundary — keine versehentlichen UI-Imports
- Tree-Shaking-faehig — Konsumenten laden nur was sie brauchen

### Negativ
- Zweiter Build-Schritt (`build:lib`) neben `build`
- Path-Alias `@/` muss im Package-Build aufgeloest werden
- Separate Versionierung erfordert Disziplin

### Risiken
- `@/` Path-Alias Aufloesung: `tsconfig.lib.json` mit `paths` konfiguriert, ggf. `tsc-alias` als Post-Build-Schritt noetig
- Breaking Changes im Parser betreffen sowohl App als auch Package-Konsumenten
