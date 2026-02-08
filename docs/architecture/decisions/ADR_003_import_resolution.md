# ADR-003: Import & Referenz-Auflösung

**Status**: Accepted
**Datum**: 2026-02-08
**Quelle**: OSCAL Expert Briefing - Import & Referenzierung

---

## Kontext

OSCAL-Dokumente bilden eine **hierarchische Referenzkette**:

```
SSP → Profile → Catalog(e)
       ↕              ↕
 Component-Defs    Cross-Refs
```

Der Viewer muss diese Referenzen auflösen, um Dokumente vollständig darzustellen. Da wir eine Zero-Backend-Architektur verwenden (ADR-002), muss die gesamte Auflösung clientseitig erfolgen.

## Entscheidung

**Wir implementieren einen Hybrid-Ansatz: Basis-Dokumente werden mit der App gebündelt, externe Referenzen werden per Lazy Loading aufgelöst.**

## Begründung

### Vorteile
- Schnelle Erstanzeige (Basis-Kataloge sofort verfügbar)
- Externe Kataloge werden bei Bedarf nachgeladen
- Offline-Fähigkeit für lokale Dateien bleibt erhalten
- Kein Build-Step für Updates externer Kataloge nötig

### Nachteile
- CORS-Handling für externe URLs erforderlich
- Komplexere Implementierung als reine Build-Time-Resolution
- Fallback-Strategie bei Netzwerkfehlern nötig

## Konsequenzen

### Resolution Service implementieren

```typescript
interface ResolutionService {
  resolveHref(href: string, baseUrl: string): Promise<OscalDocument>
  resolveProfile(profile: Profile): Promise<ResolvedCatalog>
  resolveImportChain(ssp: SSP): Promise<ResolvedSSP>
}
```

### CORS-Proxy für externe URLs (bei Bedarf)

Externe GitHub-URLs (`raw.githubusercontent.com`) sollten direkt funktionieren. Falls nicht: lokale Kopie im Repository als Fallback.
