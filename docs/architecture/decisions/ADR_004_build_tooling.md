# ADR-004: Vite als Build-Tool

**Status**: Accepted
**Datum**: 2026-02-06
**Issue**: #1

---

## Kontext

Der OSCAL Viewer benoetigt ein Build-Tool, das TypeScript und JSX kompiliert, Bundles optimiert und einen schnellen Entwicklungsserver bereitstellt. Das Performance-Budget (< 100KB gzipped) erfordert effizientes Tree-Shaking und Code-Splitting.

## Entscheidung

**Wir verwenden Vite 5.x als Build-Tool mit dem @preact/preset-vite Plugin.**

## Konfiguration

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  base: '/oscal-viewer/',       // GitHub Pages Subpath
  build: {
    outDir: 'dist',
    sourcemap: true,             // Debugging in Produktion
    rollupOptions: {
      output: {
        manualChunks: {
          preact: ['preact']     // Separater Preact-Chunk fuer Caching
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'                // Absolute Imports via @/
    }
  }
})
```

### TypeScript-Konfiguration

- **Target**: ES2020 (breite Browser-Unterstuetzung)
- **Module**: ESNext (Tree-Shaking-faehig)
- **Strict Mode**: Aktiviert (alle strict-Optionen)
- **JSX**: react-jsx mit Preact als Import-Source
- **Path Alias**: `@/*` -> `./src/*`

### Build-Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # App Bundle (~50KB gzip)
│   ├── preact-[hash].js     # Preact Runtime (~3KB gzip)
│   └── index-[hash].css     # Styles (~5KB gzip)
└── favicon.ico
```

## Begruendung

### Vorteile

- **Entwicklungsgeschwindigkeit**: Native ESM im Dev-Modus, kein Bundling noetig
- **Hot Module Replacement**: Aenderungen in < 50ms im Browser sichtbar
- **Optimierte Builds**: Rollup-basiert mit Tree-Shaking und Minification
- **Preact-Integration**: Offizielles Plugin (@preact/preset-vite) fuer nahtlose JSX/TSX
- **Einfache Konfiguration**: Minimaler Config-Aufwand, sinnvolle Defaults
- **Sourcemaps**: Debugging auch im Production Build moeglich

### Nachteile

- Abhaengigkeit von Rollup als Bundler (weniger Kontrolle als Webpack)
- Einige Webpack-Plugins nicht verfuegbar

## Alternativen

### Webpack 5
- **Pro**: Groesstes Plugin-Oekosystem, maximale Konfigurierbarkeit
- **Contra**: Langsamer Dev-Server, komplexere Konfiguration
- **Abgelehnt weil**: Entwicklungsgeschwindigkeit wichtiger, kein Bedarf an Webpack-Plugins

### esbuild (direkt)
- **Pro**: Schnellster Bundler
- **Contra**: Keine HTML-Verarbeitung, weniger Plugins, kein HMR out-of-the-box
- **Abgelehnt weil**: Vite nutzt esbuild intern und bietet bessere DX

### Parcel
- **Pro**: Zero Config
- **Contra**: Weniger Kontrolle ueber Output, groessere Install-Size
- **Abgelehnt weil**: Chunk-Splitting Kontrolle wichtig fuer Performance-Budget

## Performance-Budget

| Metrik | Ziel | Messung |
|--------|------|---------|
| Bundle Size (gzip) | < 100KB | `npm run build` + gzip-Analyse |
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 2.0s | Lighthouse |
| Lighthouse Score | > 90 | CI/CD Gate |

## Konsequenzen

- Alle Imports verwenden ES Module Syntax
- Path Alias `@/` fuer absolute Imports nutzen
- Neue Dependencies auf Bundle-Size-Impact pruefen
- Manual Chunks fuer grosse Dependencies definieren
- Source Maps bleiben in Production aktiv fuer Debugging
