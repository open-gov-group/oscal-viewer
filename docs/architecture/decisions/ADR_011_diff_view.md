# ADR-011: Multi-Document Comparison (Diff-View)

**Status**: Accepted
**Datum**: 2026-02-11
**Phase**: Phase 13 — Multi-Dokument Vergleich

---

## Kontext

Nutzer muessen verschiedene Versionen desselben OSCAL-Dokuments vergleichen koennen (z.B. "Was hat sich zwischen v1 und v2 unseres Katalogs geaendert?"). Der Viewer unterstuetzt bisher nur ein Dokument gleichzeitig.

Randbedingungen:
- Zero-Backend-Prinzip (ADR-002): Vergleich muss vollstaendig clientseitig erfolgen
- Zero-Dependency: Kein externes Diff-Paket (nur `preact` in Prod-Dependencies)
- Bundle-Budget: < 100 KB gzipped (aktuell ~40 KB)
- Dreischicht-Architektur (ADR-003): Diff-Logik im Domain Layer
- WCAG 2.1 AA / BITV 2.0 Compliance

## Entscheidung

**Wir implementieren einen OSCAL-semantischen Diff als parallelen Rendering-Pfad, der zwei Dokumente gleichen Typs ueber stabile Identifikatoren (control.id, param.id, uuid) vergleicht.**

### Kerndesign

1. **OSCAL-Semantischer Diff** statt Text-Diff: Elemente werden ueber stabile IDs gematchet. Ergebnis ist eine typisierte `DiffEntry<T>` Struktur mit Status (added/removed/modified/unchanged) und menschenlesbaren Aenderungsbeschreibungen.

2. **Map-basierter Algorithmus** (`diffByKey<T>`): Generische Funktion baut je eine Map fuer links und rechts, vergleicht per Key-Lookup. O(n+m) Laufzeit.

3. **Paralleler Rendering-Pfad**: Bestehender Single-Document-Flow bleibt unveraendert. Bei `compareMode === true` wird `CompareView` statt `DocumentViewer` gerendert.

4. **Lazy-Loading**: CompareView und CompareDropzone werden per `lazy()` + `Suspense` geladen — kein Impact auf die initiale Bundle-Groesse.

5. **Nur Same-Type Vergleich**: Catalog vs Catalog, Profile vs Profile etc. Cross-Type-Vergleich (z.B. Catalog vs Profile) wird mit Fehlermeldung abgelehnt.

## Alternativen (abgelehnt)

| Alternative | Grund fuer Ablehnung |
|---|---|
| Externes Diff-Paket (diff-match-patch, deep-diff) | Verletzt Zero-Dependency-Prinzip, +7 KB Bundle |
| Text/Zeilen-basierter Diff | Nicht OSCAL-semantisch, keine strukturierten Aenderungen (z.B. "Parameter geaendert") |
| Always-On Split-View | Zu komplex fuer MVP, erfordert Umbau des gesamten Layouts |
| Multi-Document State (Map statt Single) | Ueberengineert fuer den primaeren Use-Case (2 Dokumente vergleichen) |

## Architektur

```
Domain Layer:
  src/types/diff.ts          — DiffEntry<T>, DiffSummary, MetadataDiff, DocumentDiffResult
  src/services/differ.ts     — diffByKey(), diffMetadata(), diff{Catalog,Profile,CompDef,Ssp,AR,Poam}()

Application Layer:
  src/hooks/use-compare.ts   — State-Management, File/URL-Loading, Typ-Validierung

Presentation Layer:
  src/components/compare/
    compare-view.tsx          — Hauptlayout mit Summary + Sections
    compare-dropzone.tsx      — Sekundaeres Dokument laden
    diff-badge.tsx            — Farbcodierter Status-Badge (added/removed/modified/unchanged)
    metadata-diff.tsx         — Seite-an-Seite Metadaten-Vergleich
    diff-entry-card.tsx       — Einzelner Diff-Eintrag
```

## Konsequenzen

- **Bundle**: ~5.5 KB lazy-loaded (kein Impact auf initiale Load)
- **Tests**: +75 Tests (51 differ + 24 compare-view)
- **Neue Dateien**: 8 Source + 2 Test
- **Modifizierte Dateien**: app.tsx (+30 Zeilen), base.css (+280 Zeilen)
- **Accessibility**: DiffBadge mit aria-label, Summary-Bar mit role="status", Farbe + Text (nicht nur Farbe)
