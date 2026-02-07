# ADR-006: Progressive Web App (PWA) Strategie

**Status**: Accepted
**Datum**: 2026-02-07
**Issue**: #8

---

## Kontext

Der OSCAL Viewer soll als Progressive Web App bereitgestellt werden, um Offline-Faehigkeit und eine native App-Erfahrung zu ermoeglichen. Die App ist ein Zero-Backend Client (ADR-002): Nutzer laden OSCAL-Dateien lokal aus ihrem Dateisystem. Es gibt keinen Server-State, keine Authentifizierung und keine API-Aufrufe fuer Nutzdaten.

Voraussetzungen:
- Bestehende Vite-Build-Pipeline (ADR-004)
- Deployment auf GitHub Pages (statisches Hosting)
- Bundle: 14.20 KB JS + 6.36 KB CSS gzipped
- Externe Ressource: Google Fonts (Material Symbols)

## Entscheidung

**Wir verwenden `vite-plugin-pwa` (Workbox-basiert) mit Precache fuer die App Shell und Runtime-Caching fuer Google Fonts. Updates werden automatisch ohne User-Prompt eingespielt.**

### 1. Build-Tool: vite-plugin-pwa

Integriert sich nahtlos in die bestehende Vite-Konfiguration. Generiert den Service Worker automatisch aus der Build-Ausgabe. Workbox ist der De-facto-Standard fuer PWA-Caching.

**Alternativen verworfen**:
- Manueller Service Worker: Zu fehleranfaellig (Cache-Invalidierung, Versioning). Workbox loest diese Probleme automatisch.
- Partytown: Fuer Web Worker Offloading gedacht, nicht fuer Offline-Faehigkeit.

### 2. Caching-Strategie: Precache + Runtime-Cache

| Ressource | Strategie | Begruendung |
|-----------|-----------|-------------|
| App Shell (JS, CSS, HTML, SVG) | **Precache** | Beim Install gecacht, sofortige Offline-Verfuegbarkeit |
| Google Fonts Stylesheets | **StaleWhileRevalidate** | Zeigt gecachte Version, aktualisiert im Hintergrund |
| Google Fonts Webfonts (woff2) | **CacheFirst** (365 Tage) | Aendert sich nie bei gleicher URL, maximale Performance |
| OSCAL-Dateien | **Nicht gecacht** | User laedt eigene Dateien lokal per File API |

### 3. Update-Strategie: autoUpdate (prompt-less)

Die App hat keinen persistierten User-State (keine DB, kein localStorage fuer Nutzdaten). OSCAL-Dateien werden bei jeder Sitzung neu aus dem Dateisystem geladen. Daher besteht kein Risiko von Datenverlust bei automatischen Updates.

**Alternative verworfen**: `prompt` — Wuerde User unnoetig mit Update-Dialogen belasten, obwohl kein Data-Loss-Risiko besteht.

### 4. Manifest: Eigene manifest.json in public/

Statt auto-generiertem Manifest verwenden wir eine eigene `public/manifest.json`. Dies gibt volle Kontrolle ueber:
- App-Name und Beschreibung
- Icons in verschiedenen Groessen
- Start-URL (`/oscal-viewer/`)
- Display-Modus (`standalone`)
- Theme- und Hintergrundfarbe

## Konfiguration (Referenz)

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    runtimeCaching: [{
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'google-fonts-stylesheets' }
    }, {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }
      }
    }]
  },
  manifest: false  // Eigene manifest.json in public/
})
```

## Layer-Konformitaet

Der Service Worker ist ein Build-Artefakt, das von `vite-plugin-pwa` generiert wird. Er ist **nicht** Teil der Dreischicht-Architektur (ADR-003):

```
Domain (types/, parser/) -> Application (hooks/) -> Presentation (components/)
                                                           |
                                                    [Service Worker]
                                                    (Build-Artefakt)
```

- Kein SW-Code in `src/`
- `vite-plugin-pwa` bleibt Dev-Dependency
- App-Code ist SW-unabhaengig (Graceful Degradation)
- Caching-Konfiguration lebt ausschliesslich in `vite.config.ts`

## Konsequenzen

### Positiv
- Offline-Faehigkeit ohne manuellen SW-Code
- Automatische Cache-Invalidierung ueber Content-Hashes (Vite-Standard)
- Google Fonts funktionieren offline nach erstem Besuch
- Installierbar als native-aehnliche App (Add to Home Screen)
- Kein Bundle-Size-Impact (SW wird separat generiert)

### Negativ
- Neue Dev-Dependency (`vite-plugin-pwa`, bereits installiert)
- Cache-Debugging erfordert DevTools > Application > Service Workers
- Erste Offline-Nutzung erst nach initialem Online-Besuch moeglich

### Risiken
- Service Worker Stuck-State: Geloest durch `autoUpdate` + Workbox Precache-Manifest mit Hashes
- sessionStorage-Daten (Accordion-State) gehen bei Browser-Cache-Clear verloren — akzeptabel
