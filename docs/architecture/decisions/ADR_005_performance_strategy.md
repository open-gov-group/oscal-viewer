# ADR-005: Performance-Strategie fuer grosse OSCAL-Dokumente

**Status**: Accepted
**Datum**: 2026-02-06
**Issue**: #4, #5, #6

---

## Kontext

OSCAL-Dokumente koennen sehr gross werden. Beispiel: NIST SP 800-53 Rev. 5 Catalog enthaelt 1000+ Controls in 20 Gruppen. System Security Plans koennen hunderte implementierte Requirements mit verschachtelten Statements enthalten. Phase 2 fuehrt drei neue Renderer ein (Profile, Component-Definition, SSP), die mit solchen Datenmengen umgehen muessen.

## Entscheidung

**Wir verfolgen eine gestufte Performance-Strategie: Memoization sofort, Code Splitting sofort, Virtual Scrolling bei Bedarf.**

## Massnahmen

### Stufe 1: Memoization (sofort, alle Renderer)

Jeder Renderer MUSS `useMemo` fuer folgende Operationen nutzen:
- Aufbau von Lookup-Maps (z.B. `controlMap` in CatalogView)
- Zaehlung/Aggregation (z.B. `countControls`)
- Gefilterte/transformierte Listen

```tsx
// KORREKT
const controlMap = useMemo(() => buildControlMap(catalog), [catalog])

// FALSCH - berechnet bei jedem Render neu
const controlMap = buildControlMap(catalog)
```

Callback-Referenzen mit `useCallback` sind nur noetig, wenn sie als Props an memoized Kindkomponenten weitergegeben werden.

### Stufe 2: Code Splitting per Dokumenttyp (sofort)

`DocumentViewer` soll Renderer per Dynamic Import laden. Vite unterstuetzt dies nativ:

```tsx
import { lazy, Suspense } from 'preact/compat'

const CatalogView = lazy(() => import('./catalog/catalog-view'))
const ProfileView = lazy(() => import('./profile/profile-view'))
const CompDefView = lazy(() => import('./component-definition/compdef-view'))
const SspView = lazy(() => import('./ssp/ssp-view'))
```

**Vorteil**: Nutzer, die nur Catalogs betrachten, laden nie den SSP-Renderer.

### Stufe 3: Virtual Scrolling (bei Bedarf)

Falls Performance-Tests zeigen, dass Listen mit 500+ Eintraegen spuerbar langsam sind:
- `@tanstack/react-virtual` (kompatibel mit Preact via `preact/compat`)
- Nur fuer flache Listen (z.B. implementierte Requirements in SSP)
- NICHT fuer Baumstrukturen (GroupTree nutzt bereits Lazy-Expand)

**Trigger**: Render-Zeit > 100ms oder sichtbares Ruckeln bei NIST 800-53.

## Bestehende Optimierungen

| Stelle | Optimierung | Status |
|--------|------------|--------|
| `CatalogView` | `useMemo` fuer controlMap + countControls | Vorhanden |
| `GroupTree` | Lazy-Expand (nur offene Gruppen rendern) | Vorhanden |
| `GroupTree` | `countGroupControls()` ohne Memoization | **Verbesserbar** |
| `vite.config.ts` | `manualChunks` fuer Preact | Vorhanden |
| `DocumentViewer` | Statische Imports | **Code Splitting einbauen** |

## Konsequenzen

### Positiv
- Kein zusaetzliches Dependency fuer Stufe 1 und 2
- Code Splitting reduziert Initial-Load um geschaetzt 30-50% pro Dokumenttyp
- Klare Richtlinien fuer Frontend Developer

### Negativ
- `lazy`/`Suspense` erfordert `preact/compat` Import
- Virtual Scrolling (falls noetig) fuegt ~8KB zum Bundle hinzu

### Risiken
- `preact/compat` Lazy-Loading muss getestet werden (Kompatibilitaet)
- Zu fruehe Optimierung vermeiden - erst messen, dann optimieren
