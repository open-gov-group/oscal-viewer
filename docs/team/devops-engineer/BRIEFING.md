# DevOps Engineer - Briefing & Kommunikation

**Rolle**: DevOps Engineer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution (Import-Ketten, Cross-Referenzen, Profile Resolution)

---

## Deine Verantwortlichkeiten

- GitHub Actions CI/CD Pipelines
- GitHub Pages Deployment
- Build-Optimierung (Bundle Size)
- Security Headers konfigurieren

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

### Build-Ergebnisse
- **Bundle Size**: 12.54 KB gzipped (Budget: < 100KB, 87% unter Limit)
- **Tests**: 43 bestanden, 94.78% Statement Coverage
- **TypeScript**: 0 Errors (strict mode)
- **CI/CD**: GitHub Actions Workflow funktionsfaehig (Build + Test + Deploy)

### Bestehende Infrastruktur

| Komponente | Status | Details |
|-----------|--------|---------|
| GitHub Actions | Aktiv | Build + Deploy auf Push to main |
| GitHub Pages | Aktiv | https://open-gov-group.github.io/oscal-viewer/ |
| Node.js | v20 | In CI konfiguriert |
| Dependabot | Noch nicht | Dependency Updates |
| Bundle Size Gate | Noch nicht | Automatische Pruefung |

### Aktueller Deploy-Workflow (`.github/workflows/deploy.yml`)

```
Push to main
  -> Checkout
  -> Setup Node 20
  -> npm ci
  -> npm test --run
  -> npm run build
  -> Upload Artifact
  -> Deploy to GitHub Pages
```

---

## Aktueller Auftrag - Phase 2

### Prioritaet 1: Bundle Size CI-Gate [HIGH]

**Problem**: Mit 3 neuen Renderern (Profile, CompDef, SSP) und Suchfunktion wird der Bundle wachsen. Automatische Pruefung verhindert unkontrolliertes Wachstum.

**Aufgaben**:
1. Bundle Size Check als CI-Step hinzufuegen
2. Limit: 100 KB gzipped (aktuell 12.54 KB - viel Spielraum)
3. Warnung ab 75 KB, Failure ab 100 KB
4. Optionen:
   - `bundlesize` npm Package
   - Custom Script: `vite build && gzip -c dist/assets/*.js | wc -c`
   - GitHub Actions mit `size-limit`

**Beispiel CI-Step**:
```yaml
- name: Check bundle size
  run: |
    npm run build
    GZIP_SIZE=$(gzip -c dist/assets/*.js | wc -c)
    echo "Bundle size: $GZIP_SIZE bytes"
    if [ $GZIP_SIZE -gt 102400 ]; then
      echo "::error::Bundle size exceeds 100KB limit!"
      exit 1
    fi
```

### Prioritaet 2: Dependabot konfigurieren [HIGH]

**Aufgaben**:
1. `.github/dependabot.yml` erstellen
2. Woechtentliche Updates fuer npm Dependencies
3. Auto-Merge fuer Patch-Updates (optional)

**Vorlage**:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
```

### Prioritaet 3: CI/CD Pipeline erweitern [MEDIUM]

**Aufgaben**:
1. **Caching optimieren**: node_modules und Vite-Cache cachen
   ```yaml
   - uses: actions/cache@v4
     with:
       path: |
         node_modules
         .vite
       key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
   ```
2. **Coverage-Report**: Coverage als CI-Artefakt hochladen
3. **TypeScript Check**: `tsc --noEmit` als separaten Step

### Prioritaet 4: Preview Deployments [MEDIUM - Woche 12]

**Aufgaben**:
1. Preview Deployments fuer PRs einrichten
2. Optionen:
   - GitHub Pages mit PR-spezifischem Pfad
   - Netlify/Vercel (kostenloser Tier)
   - GitHub Actions mit Kommentar-Bot
3. Automatischer Kommentar auf PR mit Preview-URL

### Prioritaet 5: Security & Performance [LOW]

**Spaeter (Phase 3)**:
- Security Headers evaluieren (CSP, X-Frame-Options) - eingeschraenkt auf GitHub Pages
- Lighthouse CI einrichten (Performance Score > 90)
- Issue #8: PWA-Unterstuetzung (Service Worker, Manifest)

---

## Performance-Budgets

| Metrik | Limit | Aktuell | Status |
|--------|-------|---------|--------|
| Bundle Size (gzipped) | < 100 KB | ~30.0 KB | OK |
| First Contentful Paint | < 1.5s | Lighthouse CI aktiv | OK |
| Lighthouse Performance | > 90 | Lighthouse CI aktiv | OK |
| Lighthouse Accessibility | > 95 | Lighthouse CI aktiv | OK |
| Lighthouse PWA | > 90 | Lighthouse CI aktiv | OK |

---

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Tech Lead | Build-Konfiguration, Performance |
| QA Engineer | Test-Integration in CI, Coverage Reports |
| Architect | Deployment-Strategie |
| Frontend Developer | Bundle Size Auswirkung neuer Features |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | DevOps Engineer | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | DevOps Engineer | Phase 2 Briefing: CI Gates, Dependabot, Caching | Aktiv |
| 2026-02-06 | DevOps Engineer | Architect | Phase 2 Umsetzung: Bundle Size Gate, CI/CD, Dependabot | Erledigt |
| 2026-02-06 | Architect | DevOps Engineer | UI/UX Overhaul deployed (Commit a567973), Bundle 20.69 KB | Info |
| 2026-02-06 | Architect | DevOps Engineer | UX Redesign: Full-Width + Sticky Sidebar (CSS-only). Bundle auf 16.30 KB aktualisiert | Info |
| 2026-02-07 | Architect | DevOps Engineer | Dashboard-Redesign (3 Sprints) abgeschlossen. Deployment angefordert. Details siehe unten | Erledigt |
| 2026-02-07 | DevOps Engineer | Architect | Dashboard-Redesign deployed. Commit `7d45658`, 36 Dateien, 350 Tests, 25.03 KB Bundle. Live auf GitHub Pages verifiziert | Erledigt |
| 2026-02-07 | Architect | DevOps Engineer | Stakeholder-Feedback: Deployment angefordert | Erledigt |
| 2026-02-07 | DevOps Engineer | Architect | Stakeholder-Feedback deployed. Commit `e2c8f28`, 13 Dateien, 390 Tests, 25.19 KB Bundle | Erledigt |
| 2026-02-07 | Architect | DevOps Engineer | Phase 3 Briefing: Issues #8-#10 (PWA, Doku, npm Package). Details im Abschnitt "AKTUELLER AUFTRAG Phase 3" | Erledigt |
| 2026-02-07 | DevOps Engineer | Architect | Phase 3 deployed. Commit `abcf25c`, 35 Dateien, 444 Tests, 28.76 KB Bundle. PWA live (sw.js + manifest.json). 4 Workflows, Lighthouse CI, npm Publish Pipeline | Erledigt |
| 2026-02-07 | Architect | DevOps Engineer | Lighthouse CI Fix: NO_FCP → vite preview. Commit `8a19131` | Info |
| 2026-02-07 | Architect | DevOps Engineer | Feature-Paket: Metadata, Params, URL-Loading, Config-Presets. Deployment angefordert. Details siehe "AKTUELLER AUFTRAG: Feature-Paket" | Erledigt |
| 2026-02-07 | DevOps Engineer | Architect | TS-Fehler in Tests behoben (Element vs HTMLElement nach Dep-Upgrade). Commit `b801a41`, 472 Tests, ~30 KB Bundle. Deployment live: App, config.json, sw.js, manifest.json verifiziert | Erledigt |
| 2026-02-07 | QA Engineer | Alle | INFO: Code-Kommentierungs-Audit — Note C- (2.6%). Neue Standards werden durch Tech Lead in CODING_STANDARDS Sektion 11 definiert. Details: `docs/team/qa-engineer/BRIEFING.md` | Info |
| 2026-02-08 | DevOps Engineer | QA Engineer | QA-Aufgabe erledigt: L1-L4 kommentiert (profile-view, component-def-view, ssp-view, detect.ts). Re-Audit: 7.1% Gesamtquote (von 5.9%), Note A-. 485 Tests PASS, 0 TS-Fehler | Erledigt |
| 2026-02-08 | QA Engineer | DevOps Engineer | Audit ABGESCHLOSSEN: Finalnote A- (7.1%). Danke fuer L1-L4 Nachkommentierung und finales Re-Audit | Abgeschlossen |
| 2026-02-08 | Architect | DevOps Engineer | Code-Kommentierungs-Audit: Deployment angefordert. QA freigegeben. Details siehe "AKTUELLER AUFTRAG: Code-Kommentierungs-Audit" | Erledigt |
| 2026-02-08 | DevOps Engineer | Architect | Code-Kommentierungs-Audit deployed. Commit `0abd597`, 35 Dateien, 485 Tests, ~30 KB Bundle (unveraendert). GitHub Actions #15 PASS, Lighthouse CI #17 PASS. Live verifiziert: App, sw.js, manifest.json, config.json | Erledigt |
| 2026-02-09 | Architect | DevOps Engineer | Phase 4 Briefing: OSCAL Resolution — DO-R1 bis DO-R4. Details im Abschnitt "NEUER AUFTRAG Phase 4" | Info |
| 2026-02-09 | Architect | DevOps Engineer | **Phase 4a Commit & Deployment angefordert**. Alle Teams haben abgeliefert. Vorab-Verifikation bestanden: 531 Tests, 0 TS-Fehler, 0 ESLint-Fehler. Details siehe "AKTUELLER AUFTRAG: Phase 4a Deployment" | Erledigt |
| 2026-02-09 | DevOps Engineer | Architect | Phase 4a deployed. Commit `4394bb2`, 19 Dateien (+2357/-26), 531 Tests, ~30.6 KB Bundle (+0.6 KB). Lighthouse CI #24 PASS (54s). Live verifiziert: App, sw.js, config.json (4 Presets) | Erledigt |

---

## AKTUELLER AUFTRAG: Code-Kommentierungs-Audit Deployment (2026-02-08)

**Prioritaet**: MITTEL | **Commit**: `0abd597`
**Status**: DEPLOYED

### Hintergrund

QA Engineer hat ein Code-Kommentierungs-Audit durchgefuehrt (Ausgangsnote C-, 2.6%). Das gesamte Team hat nachgebessert. QA Engineer hat die Finalnote A- (7.1%) vergeben und das Audit als abgeschlossen erklaert.

### Vorab-Verifikation (vom Architect durchgefuehrt)

| Pruefung | Ergebnis |
|----------|----------|
| TypeScript strict | 0 Errors |
| ESLint | 0 Errors |
| Tests | **485/485 bestanden** (18 Testdateien) |
| Build | Erfolgreich |
| Bundle JS (gzip) | 15.98 KB (app) + 4.62 KB (preact) + 2.41 KB (workbox) = **23.01 KB** |
| Bundle CSS (gzip) | **6.99 KB** |
| **Bundle Total (gzip)** | **~30.0 KB** (unveraendert, kein Logik-Code) |

### Was deployt wird

**35 Dateien** geaendert, +1.278 Insertions / -12 Deletions

#### Code-Aenderungen (kein funktionaler Impact)

| Bereich | Dateien | Aenderungen |
|---------|---------|-------------|
| **JSDoc/Kommentare** | 22 src-Dateien | File-Level-Kommentare, JSDoc auf exportierte Funktionen/Hooks/Components |
| **CODING_STANDARDS** | 1 Datei | +149 Zeilen: Sektion 11 (Kommentierungsregeln, Quoten-Ziele) |
| **ESLint** | eslint.config.js | +22 Zeilen: eslint-plugin-jsdoc Rules (warn-Level) |
| **Dependencies** | package.json, package-lock.json | +eslint-plugin-jsdoc (dev dependency) |
| **PR-Template** | .github/pull_request_template.md | +1 Checkbox: Code-Kommentierung |
| **Tests** | 2 neue Testdateien | +110 Tests (shared.test.tsx + use-deep-link.test.ts) |
| **Team-Briefings** | 6 Briefing-Dateien | Audit-Ergebnisse und Kommunikationslog |

#### Wichtig: Keine funktionalen Code-Aenderungen

Dieser Commit enthaelt **ausschliesslich**:
- JSDoc-Kommentare und File-Level-Kommentare (kein Logik-Code)
- ESLint-Regeln (warn-Level, blockieren keinen Build)
- Neue Dev-Dependency (eslint-plugin-jsdoc)
- Neue Tests (+41 Tests, 444 → 485)
- Dokumentation (CODING_STANDARDS, Team-Briefings)

**Kein UI, kein CSS, keine API-Aenderungen, kein Bundle-Size-Impact.**

### Bundle-Entwicklung

| Version | JS (gzip) | CSS (gzip) | Total | Tests |
|---------|-----------|------------|-------|-------|
| Feature-Paket | 23.01 KB | 6.99 KB | ~30.0 KB | 444 |
| **Code-Audit** | **23.01 KB** | **6.99 KB** | **~30.0 KB** | **485** |

**Delta**: 0 KB Bundle, +41 Tests

### Deployment-Anweisungen

Commit `0abd597` ist bereits auf `origin/main` gepusht.

1. GitHub Actions `deploy.yml` wird automatisch ausgeloest
2. Bundle Size Gate: ~30 KB (unveraendert, bestanden)
3. Nach Deploy verifizieren:
   - `https://open-gov-group.github.io/oscal-viewer/` — App laeuft (keine sichtbaren Aenderungen)
   - Alle bestehenden Features funktionieren wie zuvor

### Hinweis: Uncommitted Briefing-Aenderungen

Es gibt 6 uncommitted Briefing-Dateien im Working Tree (Kommunikationslog-Updates aus dem Audit-Prozess). Diese sind reine Dokumentation und koennen im naechsten Commit mitgenommen werden:
- `docs/team/architect/BRIEFING.md`
- `docs/team/devops-engineer/BRIEFING.md`
- `docs/team/frontend-developer/BRIEFING.md`
- `docs/team/qa-engineer/BRIEFING.md`
- `docs/team/tech-lead/BRIEFING.md`
- `docs/team/ui-ux-designer/BRIEFING.md`

### Risiko-Bewertung

| Risiko | Bewertung |
|--------|-----------|
| Bundle Size | KEIN RISIKO - 0 KB Aenderung |
| Test-Regression | KEIN RISIKO - Nur additive Tests (+41) |
| Breaking Changes | KEIN RISIKO - Keine Logik-Aenderungen |
| ESLint | NIEDRIG - Neue Rules auf warn-Level (blockieren keinen Build) |
| Neue Dev-Dependency | NIEDRIG - eslint-plugin-jsdoc (nur Build-Zeit) |

---

## ABGESCHLOSSEN: Feature-Paket Deployment (2026-02-07)

**Prioritaet**: HOCH | **Commits**: `8a19131`, `4a46e11`
**Status**: DEPLOYED (Commit `b801a41`)

### Hintergrund

Zwei Commits muessen deployed werden:
1. **`8a19131`** — Lighthouse CI Fix: `staticDistDir` durch `startServerCommand` (vite preview) ersetzt, behebt NO_FCP Error
2. **`4a46e11`** — Feature-Paket: 4 neue Features (Metadata, Params, URL-Loading, Config-Presets)

### Vorab-Verifikation (vom Architect + QA Engineer durchgefuehrt)

| Pruefung | Ergebnis |
|----------|----------|
| TypeScript strict | 0 Errors |
| ESLint | 0 Errors |
| Tests | **444/444 bestanden** (17 Testdateien) |
| Build | Erfolgreich |
| Bundle JS (gzip) | 15.98 KB (app) + 4.62 KB (preact) + 2.41 KB (workbox) = **23.01 KB** |
| Bundle CSS (gzip) | **6.99 KB** |
| **Bundle Total (gzip)** | **~30.0 KB** (< 100 KB Limit, 30% Budget) |
| config.json in dist/ | Vorhanden |

### Was deployt wird

**9 Dateien** geaendert, +557 Insertions / -82 Deletions

#### Neue Dateien (3)

| Datei | Beschreibung |
|-------|-------------|
| `src/components/shared/parameter-item.tsx` | Shared ParameterItem (aus control-detail extrahiert) |
| `src/types/config.ts` | PresetEntry + AppConfig Interfaces |
| `public/config.json` | Default-Presets (NIST SP 800-53, FedRAMP High) |

#### Modifizierte Dateien (6)

| Datei | Aenderungen |
|-------|-------------|
| `src/app.tsx` | URL-Loading (handleUrl, ?url= Auto-Load), Config-Presets, Loading-Spinner, Preset-Buttons |
| `src/components/shared/metadata-panel.tsx` | PartyCards (Email, Telefon, Type-Badge), Links-Sektion, Remarks-Sektion |
| `src/components/catalog/catalog-view.tsx` | Catalog-Level Params Accordion |
| `src/components/catalog/control-detail.tsx` | ParameterItem nach shared/ verschoben, Import hinzugefuegt |
| `src/styles/base.css` | +248 Zeilen CSS (Metadata-Cards, Presets, URL-Input, Loading-Spinner) |
| `tests/components/shared.test.tsx` | Parties-Test an neues PartyCard-Format angepasst |

#### Lighthouse CI Fix (`8a19131`)

| Datei | Aenderung |
|-------|-----------|
| `.lighthouserc.json` | `staticDistDir` → `startServerCommand: "npx vite preview --port 9123"` |

### Neue Features im Detail

| Feature | Beschreibung | Nutzer-Impact |
|---------|-------------|---------------|
| **MetadataPanel** | Parties als Cards mit Email/Telefon, Links-Sektion, Remarks | Vollstaendige Metadaten-Anzeige |
| **Catalog Params** | Top-Level Parameter in eigenem Accordion | NIST-Kataloge zeigen alle Parameter |
| **URL-Loading** | OSCAL per URL laden, `?url=` fuer Shareability | Direkt-Links zu Dokumenten moeglich |
| **Config-Presets** | Quick-Load Buttons fuer haeufige Dokumente | 1-Klick Zugang zu NIST/FedRAMP |

### Bundle-Entwicklung

| Version | JS (gzip) | CSS (gzip) | Total | Tests |
|---------|-----------|------------|-------|-------|
| Phase 3 | 28.76 KB | - | 28.76 KB | 444 |
| Dep-Upgrade | 28.53 KB | - | 28.53 KB | 444 |
| **Feature-Paket** | **23.01 KB** | **6.99 KB** | **~30.0 KB** | **444** |

**Budget-Nutzung**: 30.0 / 100 KB = 30.0% (70 KB Spielraum)

### Deployment-Anweisungen

Beide Commits (`8a19131` + `4a46e11`) sind bereits auf `origin/main` gepusht.

1. GitHub Actions `deploy.yml` wird automatisch ausgeloest
2. Bundle Size Gate muss bestehen (< 100 KB) ✓
3. Lighthouse CI Workflow laeuft mit neuem `startServerCommand` (NO_FCP Fix)
4. Nach Deploy verifizieren:
   - `https://open-gov-group.github.io/oscal-viewer/` — App laeuft
   - `https://open-gov-group.github.io/oscal-viewer/config.json` — Presets erreichbar
   - Preset-Buttons laden NIST/FedRAMP Kataloge
   - `?url=` Parameter funktioniert (Direkt-Link)

### Risiko-Bewertung

| Risiko | Bewertung |
|--------|-----------|
| Bundle Size | NIEDRIG - 30.0 KB, weit unter 100 KB Limit |
| Test-Regression | NIEDRIG - 444 Tests, 0 Failures |
| Breaking Changes | NIEDRIG - Additive Features, keine API-Aenderungen |
| Neue Dependencies | KEINE - Alle Features mit bestehenden Packages |
| CORS bei URL-Loading | NIEDRIG - Hilfreiche Fehlermeldung bei CORS-Blockade |
| config.json fehlt | NIEDRIG - Graceful Degradation (keine Presets angezeigt) |

---

## ABGESCHLOSSEN: Stakeholder-Feedback Deployment

**Datum**: 2026-02-07 | **Prioritaet**: HOCH
**Status**: Deployed und verifiziert

### Hintergrund

Die Fachverantwortlichen haben die Live-Version (Dashboard-Redesign) reviewed und 3 Verbesserungswuensche:
1. **Navigation**: Titel vollstaendig anzeigen (kein Ellipsis)
2. **Verschachtelte Akkordions**: Parts innerhalb Controls als rekursive Accordions
3. **IFG-Konformitaet**: BITV 2.0 / WCAG 2.1 AA Compliance

### Erwartete Aenderungen

| Bereich | Dateien | Aenderungen |
|---------|---------|-------------|
| CSS | `base.css` | Navigation Multi-Line, Nested Accordion Depth Styles |
| TSX | `control-detail.tsx` | PartView → Accordion Refactor |
| HTML | `index.html` | `lang="en"` Attribut |
| a11y | Diverse | `aria-live` auf CopyLinkButton |

### Erwarteter Bundle-Impact

- CSS: +0.1 KB gzipped (Navigation Wrapping, Nested Accordion Styles)
- JS: +0.1 KB gzipped (PartView Accordion statt div)
- **Total**: ~0.2 KB Zuwachs → ~20.6 KB (weit unter 100 KB)

### Deployment-Anweisungen (nach Umsetzung)

1. Architect fuehrt Vorab-Verifikation durch (TypeScript, Tests, Build, Bundle)
2. Commit und Push auf `origin/main`
3. GitHub Actions `deploy.yml` wird automatisch ausgeloest
4. Bundle Size Gate muss bestehen (< 100 KB)
5. GitHub Pages Deployment verifizieren

---

## ABGESCHLOSSEN: Dashboard-Redesign Deployment

**Datum**: 2026-02-07 | **Prioritaet**: HOCH

### Auftrag

Commit und Deploy der Dashboard-Redesign Aenderungen (3 Sprints) auf GitHub Pages.

### Vorab-Verifikation (bereits vom Architect durchgefuehrt)

| Pruefung | Ergebnis |
|----------|----------|
| TypeScript strict | 0 Errors |
| Tests | **350/350 bestanden** (14 Testdateien) |
| axe-core a11y | **13/13 bestanden** (0 Violations) |
| Build | Erfolgreich (358ms) |
| Bundle JS (gzip) | 14.12 KB (app) + 4.63 KB (preact) = **18.75 KB** |
| Bundle CSS (gzip) | **6.28 KB** |
| **Bundle Total (gzip)** | **20.40 KB** (< 100 KB Limit, 20.4% Budget) |

### Was deployt wird

**34 Dateien** (22 modifiziert + 12 neu), +2643 / -216 Zeilen

#### Neue Dateien (12)

| Datei | Beschreibung |
|-------|-------------|
| `src/hooks/use-deep-link.ts` | URL-Hash Deep-Linking Hook (Application Layer) |
| `src/hooks/use-filter.ts` | Filter-State Hook mit Keyword + Chips (Application Layer) |
| `src/components/shared/accordion.tsx` | WAI-ARIA Accordion + AccordionGroup mit Expand/Collapse All |
| `src/components/shared/status-badge.tsx` | SVG-Icon Status Badge (8 Zustaende) |
| `src/components/shared/copy-link-button.tsx` | Clipboard Copy mit visuellem Feedback |
| `src/components/shared/filter-bar.tsx` | FilterBar mit Keyword-Input, Category-Selects, Chips |
| `tests/components/app.test.tsx` | 4 Tests (Skip-Link, Banner-Rolle) |
| `tests/components/filter-bar.test.tsx` | 11 Tests (FilterBar Component) |
| `tests/hooks/use-filter.test.ts` | 7 Tests (useFilter Hook) |
| `docs/team/ui-ux-designer/01_briefing_overview.md` | UI/UX Briefing: Dashboard-Ueberblick |
| `docs/team/ui-ux-designer/02_blueprint_views_layout.md` | UI/UX Briefing: Views + Layout |
| `docs/team/ui-ux-designer/03_design_system_light_dark.md` | UI/UX Briefing: Design System |
| `docs/team/ui-ux-designer/04_accessibility_quality_dod.md` | UI/UX Briefing: Accessibility + DoD |

#### Modifizierte Dateien (22)

| Bereich | Dateien | Aenderungen |
|---------|---------|-------------|
| **Components** | 7 Dateien | Accordions, Deep-Linking, Filter, StatusBadge, Title Box, Content Boxes, Search Navigation |
| **Hooks** | 1 Datei | Search Debounce (200ms) |
| **Styles** | 1 Datei | +478 Zeilen CSS (Accordion, StatusBadge, FilterBar, Content-Box, Title-Box) |
| **Tests** | 7 Dateien | +96 Tests (350 total), neue axe-core Tests |
| **Docs** | 5 Dateien | Team-Briefings + CODING_STANDARDS v3.0.0 |
| **App** | 1 Datei | Search-Select Callback, Hash-Cleanup |

### Bundle-Entwicklung

| Version | JS (gzip) | CSS (gzip) | Total | Tests |
|---------|-----------|------------|-------|-------|
| Phase 1 | 12.54 KB | - | 12.54 KB | 43 |
| Phase 2 | 14.44 KB | 4.39 KB | 18.83 KB | 254 |
| UI/UX Overhaul | 15.14 KB | 5.51 KB | 20.69 KB | 254 |
| UX Redesign | 10.71 KB | 5.59 KB | 16.30 KB | 254 |
| **Dashboard-Redesign** | **18.75 KB** | **6.28 KB** | **20.40 KB** | **350** |

**Delta zum UX Redesign**: +4.10 KB gzipped (6 neue Komponenten + 2 neue Hooks)
**Budget-Nutzung**: 20.40 / 100 KB = 20.4% (79.6 KB Spielraum)

### Deployment-Anweisungen

1. Alle Dateien committen (staged + untracked)
2. Push auf `origin/main`
3. GitHub Actions `deploy.yml` wird automatisch ausgeloest
4. Verifikation: Bundle Size Gate muss bestehen (< 100 KB)
5. GitHub Pages Deployment pruefen

### Risiko-Bewertung

| Risiko | Bewertung |
|--------|-----------|
| Bundle Size | NIEDRIG - 20.40 KB, weit unter 100 KB Limit |
| Test-Regression | NIEDRIG - 350 Tests, 0 Failures |
| a11y-Regression | NIEDRIG - 13 axe-core Tests, 0 Violations |
| Breaking Changes | NIEDRIG - Additive Features, keine API-Aenderungen |
| Neue Dependencies | KEINE - Alle Features mit bestehenden Packages implementiert |

---

## UX Redesign: Full-Width Layout + Sticky Sidebar (ABGESCHLOSSEN)

**Typ**: Reines CSS-Refactoring | **TSX-Aenderungen**: Keine | **Tests**: 254 bestanden

### Bundle-Groesse nach UX Redesign

| Asset | Roh | Gzipped |
|-------|-----|---------|
| JS (app) | ~43 KB | 10.71 KB |
| JS (preact) | ~10 KB | 4.43 KB |
| CSS | ~34 KB | 5.59 KB |
| **Total** | **~87 KB** | **~16.30 KB** |

**Delta zum UI/UX Overhaul**: CSS +0.08 KB gzipped (Layout-Aenderungen)
**Budget-Nutzung**: 16.30 / 100 KB = 16.3%

### Deployment-Relevanz

- Reines CSS-Refactoring, keine neuen Dependencies
- Keine Aenderungen an CI/CD Workflows noetig
- GitHub Pages Auto-Deploy via bestehender `deploy.yml`
- Google Fonts weiterhin extern geladen

---

## UI/UX Overhaul - Deployment (ABGESCHLOSSEN)

**Commit**: `a567973` auf `main` gepusht | **Datum**: 2026-02-06

### Bundle-Groesse nach Overhaul

| Asset | Roh | Gzipped |
|-------|-----|---------|
| JS (app) | 43.21 KB | 10.71 KB |
| JS (preact) | 10.32 KB | 4.43 KB |
| CSS | 31.76 KB | 5.51 KB |
| **Total** | **85.29 KB** | **20.69 KB** |

**Delta zu Phase 2**: +1.86 KB gzipped (+602 Zeilen Code, -128 entfernt)
**Budget-Nutzung**: 20.69 / 100 KB = 20.7%

### Aenderungen im Deployment

- Google Fonts extern geladen (Source Sans 3) - kein JS-Bundle-Impact
- Keine neuen Dependencies
- Keine Aenderungen an CI/CD Workflows noetig
- GitHub Pages Auto-Deploy via bestehender `deploy.yml`

---

## Phase 2 - Umsetzungsbericht

### Erledigte Aufgaben

#### Prioritaet 1: Bundle Size CI-Gate [DONE]
- Bundle Size Check als CI-Step in `deploy.yml` und `ci.yml` eingebaut
- Iteriert ueber alle JS/CSS-Dateien einzeln (korrekte Per-File Gzip-Messung)
- **Warnung** ab 75 KB (76.800 bytes), **Failure** ab 100 KB (102.400 bytes)
- Ergebnis wird als GitHub Step Summary (Markdown-Tabelle) angezeigt
- Aktueller Stand: **18.83 KB total** (14.44 KB JS + 4.39 KB CSS) - 81% unter Limit

#### Prioritaet 2: Dependabot [DONE]
- `.github/dependabot.yml` erstellt
- **npm**: Woechentliche Updates (Montag), max 5 offene PRs
- Grouping: dev-dependencies (minor+patch) und production-dependencies (minor+patch) gebündelt
- **github-actions**: Woechentliche Updates fuer Workflow-Actions
- Labels: `dependencies` + `ci`

#### Prioritaet 3: CI/CD Pipeline erweitert [DONE]

**deploy.yml (Push to main)** - Neue Steps:
1. `tsc --noEmit` - Separater TypeScript-Check (klarere Fehlermeldungen)
2. `npm run test:coverage` - Tests mit Coverage statt nur `npm test`
3. Bundle Size Gate - Automatische Pruefung nach Build
4. Coverage-Report Upload - 14 Tage als Artifact verfuegbar
5. Caching: `actions/setup-node` mit `cache: 'npm'` (bereits vorhanden, optimal)

**ci.yml (Pull Requests)** - Neuer Workflow:
1. Concurrency: Alte PR-Runs werden bei neuem Push abgebrochen
2. TypeScript Check, Lint, Tests mit Coverage, Build, Bundle Size Gate
3. Coverage-Report als Artifact
4. Alle Checks muessen bestehen bevor Merge moeglich

#### Prioritaet 4: Preview Deployments [OFFEN]
- Fuer Woche 12 / Phase 3 geplant

#### Prioritaet 5: Security & Performance [OFFEN]
- Fuer Phase 3 geplant (Lighthouse CI, CSP Headers, PWA)

### Verifizierung
- TypeScript: 0 Errors
- Tests: 254 bestanden, 86.88% Coverage
- Build: 18.83 KB total gzipped (Limit: 100 KB)
- Alle Workflows syntaktisch korrekt

---

## Stakeholder-Feedback Deployment - Zusammenfassung (ABGESCHLOSSEN)

| Metrik | Ergebnis |
|--------|----------|
| Commit | `e2c8f28` |
| Dateien | 13 geaendert |
| Tests | 390 bestanden |
| Bundle | 14.20 KB JS + 6.36 KB CSS = 25.19 KB gzipped |
| Deploy | GitHub Pages, Live verifiziert |

---

## AKTUELLER AUFTRAG: Phase 3 (2026-02-07)

**Prioritaet**: HOCH | **Issues**: #8, #9, #10
**Aktueller Stand**: 25.19 KB gzipped, 390 Tests, CI/CD voll funktionsfaehig

Phase 3 hat signifikante DevOps-Aufgaben — insbesondere fuer PWA und npm Package:

---

### Issue #8: Progressive Web App (PWA) — DevOps-Aufgaben [HOCH]

#### DO-P1: Service Worker Deployment [HOCH]

**Hintergrund**: `vite-plugin-pwa` generiert einen Service Worker (`sw.js`) beim Build. Dieser muss korrekt auf GitHub Pages deployed werden.

**Aenderungen an `deploy.yml`**:

1. **SW-Scope pruefen**: Service Worker muss vom Root der Site (`/oscal-viewer/`) served werden
2. **Cache-Busting**: Vite generiert gehashte Dateinamen → SW-Precache wird automatisch aktualisiert
3. **Headers**: GitHub Pages setzt keine speziellen SW-Headers — Standard reicht
4. **Verifizierung**: Nach Deploy pruefen ob `sw.js` unter `https://open-gov-group.github.io/oscal-viewer/sw.js` erreichbar ist

**Risiko**: Niedrig — `vite-plugin-pwa` kuemmert sich um SW-Generierung, Vite Build inkludiert SW automatisch in `dist/`.

---

#### DO-P2: Lighthouse CI einrichten [HOCH]

**Neuer Workflow**: `.github/workflows/lighthouse.yml` (NEU)

```yaml
name: Lighthouse CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v12
        with:
          uploadArtifacts: true
          configPath: '.lighthouserc.json'
```

**Lighthouse Config**: `.lighthouserc.json` (NEU)

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:pwa": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

**Quality Gates**:
- Accessibility Score >= 95: **Error** (Blockiert Merge)
- Performance Score >= 90: **Warning**
- PWA Score >= 90: **Warning**
- Best Practices >= 90: **Warning**

---

#### DO-P3: PWA-spezifische CI-Checks [MITTEL]

**Neue Steps in `ci.yml`** (PR-Workflow):

```yaml
- name: Check PWA manifest
  run: |
    if [ ! -f dist/manifest.json ]; then
      echo "::error::manifest.json not found in dist/"
      exit 1
    fi
    # Validate JSON
    node -e "JSON.parse(require('fs').readFileSync('dist/manifest.json', 'utf8'))"

- name: Check Service Worker
  run: |
    if [ ! -f dist/sw.js ]; then
      echo "::error::Service Worker (sw.js) not found in dist/"
      exit 1
    fi
```

---

### Issue #9: Dokumentation — DevOps-Aufgaben [NIEDRIG]

#### DO-D1: Broken Link Check [NIEDRIG]

**Optionaler CI-Step**: Markdown-Link-Checker fuer CONTRIBUTING.md, README.md, CHANGELOG.md

```yaml
- name: Check markdown links
  uses: gaurav-nelson/github-action-markdown-link-check@v1
  with:
    folder-path: '.'
    file-extension: '.md'
    config-file: '.markdown-link-check.json'
```

**Prioritaet**: Niedrig — kann spaeter hinzugefuegt werden.

---

### Issue #10: npm Package — DevOps-Aufgaben [HOCH]

#### DO-N1: npm Publish Pipeline [HOCH]

**Neuer Workflow**: `.github/workflows/publish.yml` (NEU)

```yaml
name: Publish npm Package
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
          scope: '@open-gov-group'
      - run: npm ci
      - run: npm test
      - run: npm run build:lib
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Trigger**: GitHub Release erstellen → automatischer npm publish

**Registry**: GitHub Packages (kostenlos fuer oeffentliche Repos, kein npm Account noetig)

**Alternative**: npmjs.com Registry — erfordert npm-Token als GitHub Secret

---

#### DO-N2: Package Build in CI [MITTEL]

**Neue Steps in `ci.yml`** (PR-Workflow):

```yaml
- name: Build npm package
  run: npm run build:lib

- name: Check package size
  run: |
    PACK_SIZE=$(npm pack --dry-run 2>&1 | grep 'total files' | awk '{print $NF}')
    echo "Package size: $PACK_SIZE"
```

**Quality Gate**: Package-Groesse < 10 KB (Parser + Types ohne UI-Code)

---

#### DO-N3: Package Version Management [MITTEL]

**Strategie**:
- App-Version (`package.json`): Inkrementiert bei App-Releases
- Package-Version: Inkrementiert NUR bei Parser/Types-Aenderungen
- Empfehlung: `npm version patch/minor/major` manuell vor Release

---

### Umsetzungsreihenfolge

| # | Aufgabe | Issue | Geschaetzter Aufwand | Abhaengigkeit |
|---|---------|-------|---------------------|---------------|
| 1 | DO-P1: SW Deployment verifizieren | #8 | Klein | Nach FE-P3 (vite-plugin-pwa) |
| 2 | DO-P3: PWA CI-Checks | #8 | Klein | Nach FE-P1 (manifest.json) |
| 3 | DO-N1: npm Publish Pipeline | #10 | Mittel | Nach FE-N1 + TL-N2 |
| 4 | DO-N2: Package Build in CI | #10 | Klein | Nach DO-N1 |
| 5 | DO-P2: Lighthouse CI | #8 | Mittel | Nach DO-P1 |
| 6 | DO-D1: Link Check (optional) | #9 | Klein | Keine |
| 7 | DO-N3: Version Management | #10 | Klein | Nach DO-N1 |

### Bundle-Entwicklung (aktualisiert)

| Version | JS (gzip) | CSS (gzip) | Total | Tests |
|---------|-----------|------------|-------|-------|
| Phase 1 | 12.54 KB | - | 12.54 KB | 43 |
| Phase 2 | 14.44 KB | 4.39 KB | 18.83 KB | 254 |
| UI/UX Overhaul | 15.14 KB | 5.51 KB | 20.69 KB | 254 |
| UX Redesign | 10.71 KB | 5.59 KB | 16.30 KB | 254 |
| Dashboard-Redesign | 18.75 KB | 6.28 KB | 25.03 KB | 350 |
| Stakeholder-Feedback | 14.20 KB | 6.36 KB | 25.19 KB | 390 |
| **Phase 3 (erwartet)** | **~14.5 KB** | **~6.4 KB** | **~25.5 KB** | **~420** |

**Budget-Nutzung**: 25.19 / 100 KB = 25.2% (74.8 KB Spielraum)

### Performance-Budgets (aktualisiert)

| Metrik | Limit | Aktuell | Phase 3 Ziel |
|--------|-------|---------|-------------|
| Bundle Size (gzipped) | < 100 KB | 25.19 KB | < 30 KB |
| First Contentful Paint | < 1.5s | Nicht gemessen | Lighthouse >= 90 |
| Lighthouse Performance | > 90 | Nicht gemessen | >= 90 |
| Lighthouse Accessibility | > 95 | Nicht gemessen | >= 95 |
| Lighthouse PWA | > 90 | N/A | >= 90 |

### Neue CI/CD Workflows nach Phase 3

| Workflow | Datei | Trigger | Zweck |
|----------|-------|---------|-------|
| Deploy (bestehend) | `deploy.yml` | Push to main | Build + Deploy GitHub Pages |
| CI (bestehend) | `ci.yml` | Pull Request | TypeScript + Tests + Bundle Gate |
| **Lighthouse (NEU)** | `lighthouse.yml` | Push + PR | Performance + a11y + PWA Scores |
| **Publish (NEU)** | `publish.yml` | GitHub Release | npm Package veroeffentlichen |

---

## AKTUELLER AUFTRAG: Phase 4a Commit & Deployment (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: Architect
**Status**: DEPLOYED (Commit `4394bb2`)

### Hintergrund

Alle Teams haben ihre Phase 4a Aufgaben abgeschlossen:
- **Tech Lead**: ADR-008, ESLint services/ Layer-Regeln, CODING_STANDARDS v5.0.0 (TL-R1 bis TL-R3)
- **Frontend Developer**: HrefParser, Fragment-ID Links, LinkBadge (FE-R1 bis FE-R3)
- **QA Engineer**: 531 Tests (+46), HrefParser 18/18, LinkBadge a11y, axe-core 29 Tests (QA-R1, QA-R4)
- **UI/UX Designer**: LinkBadge CSS (5 Farben), Kontrast-Audit (UX-R1, UX-R5)

### Vorab-Verifikation (vom Architect durchgefuehrt)

| Pruefung | Ergebnis |
|----------|----------|
| TypeScript strict | **0 Errors** |
| ESLint | **0 Errors** (13 Warnungen — jsdoc/require-jsdoc, bestehend) |
| Tests | **531/531 bestanden** (19 Testdateien) |
| Build | Erfolgreich |
| Bundle Total (gzip) | ~30 KB (unveraendert, +1 KB Services erwartet nach Build) |

### Was committet und deployt wird

**20 Dateien** — 14 modifiziert, 6 neu. ~1.670 Insertions

#### Neue Dateien (6)

| Datei | Beschreibung |
|-------|-------------|
| `src/services/href-parser.ts` | HrefParser: HREF-Typ-Erkennung (4 Patterns: relative, fragment, absolute-url, urn) |
| `src/components/shared/link-badge.tsx` | LinkBadge Component: 5 farbkodierte Relation-Badges |
| `tests/services/href-parser.test.ts` | 18 Tests fuer HrefParser (4 Pattern-Gruppen + Edge Cases) |
| `docs/architecture/decisions/ADR_008_resolution_service.md` | ADR-008: Resolution Service Architecture |
| `docs/ACCESSIBILITY_STATEMENT.md` | BITV 2.0 Accessibility Statement (aktualisiert) |

#### Modifizierte Dateien (14)

| Datei | Aenderungen |
|-------|-------------|
| **Code** | |
| `src/components/catalog/control-detail.tsx` | Fragment-Links klickbar, LinkBadge Integration |
| `src/styles/base.css` | +89 Zeilen: CSS fuer LinkBadge (5 Varianten), Fragment-Highlight |
| `eslint.config.js` | +30 Zeilen: ESLint Layer-Regeln fuer src/services/ |
| **Tests** | |
| `tests/accessibility.test.tsx` | +19 Zeilen: LinkBadge axe-core a11y Tests |
| `tests/components/catalog-view.test.tsx` | +124 Zeilen: Fragment-Link + LinkBadge Integrationstests |
| `tests/components/shared.test.tsx` | +52 Zeilen: LinkBadge Component Tests |
| **Dokumentation** | |
| `docs/CODING_STANDARDS.md` | +96 Zeilen: Patterns 19-22 (HREF, Cache, Resolution, Badges), services/ Layer |
| `docs/architecture/decisions/README.md` | +1 Zeile: ADR-008 im Index |
| `docs/team/tech-lead/BRIEFING.md` | Phase 4 Briefing + Kommunikationslog |
| `docs/team/frontend-developer/BRIEFING.md` | Phase 4 Briefing + Kommunikationslog |
| `docs/team/qa-engineer/BRIEFING.md` | Phase 4 Briefing + QA-Report + Kommunikationslog |
| `docs/team/ui-ux-designer/BRIEFING.md` | Phase 4 Briefing + Kommunikationslog |
| `docs/team/devops-engineer/BRIEFING.md` | Phase 4 Briefing + Deployment-Auftrag + Kommunikationslog |
| `docs/team/architect/BRIEFING.md` | Kommunikationslog-Update |

#### NICHT committen

| Datei | Grund |
|-------|-------|
| `.claude/` | Lokale IDE-Konfiguration — nicht ins Repo |
| `nul` | Windows-Artefakt — nicht ins Repo |

### Commit-Anweisungen

**Commit-Message** (Conventional Commits Format):

```
feat: OSCAL Resolution Phase 4a — HrefParser, LinkBadge, Fragment-Links

Phase 4a MVP implements OSCAL reference chain resolution foundation:

- Add src/services/href-parser.ts: HREF type detection (4 patterns:
  relative, fragment, absolute-url, urn)
- Add src/components/shared/link-badge.tsx: color-coded relation badges
  (implements=green, required=red, related=blue, bsi=orange, template=gray)
- Enhance control-detail.tsx: clickable fragment links, LinkBadge integration
- Add ADR-008: Resolution Service Architecture
- Add ESLint layer rules for src/services/ (Domain Layer protection)
- Update CODING_STANDARDS v5.0.0: Patterns 19-22 (HREF, Cache, Resolution, Badges)
- Update team briefings with Phase 4 assignments

Tests: 531 passed (19 files), 29 axe-core, 18 HrefParser
Bundle: ~30 KB gzipped (well under 100 KB limit)
```

### Staging-Anweisungen

```bash
# Neue Dateien stagen
git add src/services/href-parser.ts
git add src/components/shared/link-badge.tsx
git add tests/services/href-parser.test.ts
git add docs/architecture/decisions/ADR_008_resolution_service.md
git add docs/ACCESSIBILITY_STATEMENT.md

# Modifizierte Dateien stagen
git add src/components/catalog/control-detail.tsx
git add src/styles/base.css
git add eslint.config.js
git add tests/accessibility.test.tsx
git add tests/components/catalog-view.test.tsx
git add tests/components/shared.test.tsx
git add docs/CODING_STANDARDS.md
git add docs/architecture/decisions/README.md
git add docs/team/architect/BRIEFING.md
git add docs/team/devops-engineer/BRIEFING.md
git add docs/team/frontend-developer/BRIEFING.md
git add docs/team/qa-engineer/BRIEFING.md
git add docs/team/tech-lead/BRIEFING.md
git add docs/team/ui-ux-designer/BRIEFING.md

# NICHT stagen: .claude/, nul
```

### Deployment-Anweisungen

1. Dateien stagen (siehe oben)
2. Commit erstellen mit obiger Message
3. `git push origin main`
4. GitHub Actions `deploy.yml` wird automatisch ausgeloest
5. Nach Deploy verifizieren:
   - `https://open-gov-group.github.io/oscal-viewer/` — App laeuft
   - Catalog laden → Controls anklicken → Links-Sektion pruefen: LinkBadges sichtbar
   - Fragment-Links (`#CONTROL-ID`) klickbar und navigieren korrekt
   - `sw.js` und `manifest.json` weiterhin erreichbar
   - `config.json` weiterhin erreichbar (Presets)

### Risiko-Bewertung

| Risiko | Bewertung |
|--------|-----------|
| Bundle Size | KEIN RISIKO — ~30 KB, +1 KB Services (< 100 KB Limit) |
| Test-Regression | KEIN RISIKO — 531/531 bestanden, +46 neue Tests |
| Breaking Changes | KEIN RISIKO — Additive Features, keine bestehenden Funktionen geaendert |
| ESLint | KEIN RISIKO — Neue Rules fuer services/ Layer (schuetzt neue Dateien) |
| Neue Dependencies | KEINE — Alles mit nativem TypeScript |
| PWA/SW | KEIN RISIKO — Keine Aenderungen an SW-Config oder manifest.json |

### Bundle-Entwicklung

| Version | JS (gzip) | CSS (gzip) | Total | Tests |
|---------|-----------|------------|-------|-------|
| Code-Audit | 23.01 KB | 6.99 KB | ~30.0 KB | 485 |
| **Phase 4a** | **~23.5 KB** | **~7.2 KB** | **~30.7 KB** | **531** |

**Delta**: +~0.7 KB Bundle, +46 Tests, +6 neue Dateien

---

## NEUER AUFTRAG: Phase 4 — OSCAL Resolution (2026-02-09)

**Prioritaet**: MITTEL | **Quelle**: OSCAL Expert Briefing via Hauptprogrammleitung
**Referenz-Dokument**: `docs/architecture/OSCAL_IMPORT_GUIDE.md`
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang. Weiterhin "Web"-App (PWA).

### Kontext

Phase 4 fuehrt OSCAL-Referenzkettenaufloesung ein (SSP → Profile → Catalog). Der Viewer kann kuenftig referenzierte Dokumente per `fetch()` nachladen und Cross-Referenzen zwischen OSCAL-Dokumenten aufloesen. Aus DevOps-Sicht aendert sich wenig — keine neuen Dependencies, keine neuen Workflows.

### Auswirkungen auf CI/CD

| Aspekt | Impact | Aktion |
|--------|--------|--------|
| Bundle Size | +1-2 KB gzipped (~30 KB → ~32 KB) | Bundle Size Gate bleibt bestanden (< 100 KB) |
| Neue Dependencies | KEINE | Alle Features mit nativem `fetch()` und TypeScript |
| Neue Dateien | 3 Services + 1 Hook + 2 UI-Komponenten | Normale CI-Pipeline (TypeScript + ESLint + Tests) |
| Test-Aenderungen | +30-50 neue Tests (Services + Components) | Coverage-Thresholds bleiben bestehen |
| Netzwerk-Calls | `fetch()` fuer externe OSCAL-Dokumente | KEIN Server noetig — alles clientseitig |

### DO-R1: Bundle Size Monitoring [NIEDRIG]

Phase 4 fuegt ~400 LOC neuen Code hinzu (3 Service-Dateien + UI-Komponenten). Erwarteter Bundle-Impact: +1-2 KB gzipped.

**Aktion**: Keine. Bundle Size Gate (< 100 KB) wird weiterhin bestanden. Budget-Nutzung steigt von ~30 KB auf ~32 KB (68 KB Spielraum).

### DO-R2: CORS-Ueberlegungen fuer GitHub Pages [NIEDRIG]

Der Viewer laedt kuenftig externe OSCAL-Dokumente per `fetch()`. Moegliche CORS-Szenarien:

| Quelle | CORS-Verhalten | Aktion |
|--------|---------------|--------|
| GitHub Raw URLs (`raw.githubusercontent.com`) | CORS erlaubt | Funktioniert direkt |
| Lokale Dateien (File-Upload) | Kein CORS | Funktioniert direkt |
| Andere Server | CORS moeglicherweise blockiert | Fehlermeldung im Viewer (kein Proxy noetig) |

**Wichtig**: Kein CORS-Proxy noetig. Die Zero-Backend-Strategie (ADR-002) bleibt erhalten. Bei CORS-Blockade zeigt der Viewer eine hilfreiche Fehlermeldung mit Hinweis auf lokalen Download.

**Keine Aenderungen an GitHub Pages Deployment oder Headers noetig.**

### DO-R3: ESLint fuer neuen services/ Layer [NIEDRIG]

Der Tech Lead fuegt ESLint-Regeln fuer `src/services/` hinzu (Layer-Schutz: kein Import aus hooks/components). Dies aendert nur `eslint.config.js` — kein CI-Impact.

### DO-R4: Deployment nach Phase 4a [MITTEL]

Nach Abschluss von Sub-Phase 4a (HrefParser + Fragment-ID + LinkBadge) wird ein Deployment angefordert.

**Erwartete Aenderungen**:

| Bereich | Dateien | Aenderungen |
|---------|---------|-------------|
| Services (NEU) | `src/services/href-parser.ts` | HREF-Typ-Erkennung (4 Patterns) |
| Components (NEU) | `src/components/shared/link-badge.tsx` | Link-Relation Badges (5 Farben) |
| Components (MOD) | `src/components/catalog/control-detail.tsx` | Fragment-Links klickbar |
| Styles (MOD) | `src/styles/base.css` | CSS fuer LinkBadge (5 Varianten) |
| Tests (NEU) | `tests/services/href-parser.test.ts` | 8+ Tests fuer HrefParser |
| Tests (NEU) | `tests/components/link-badge.test.tsx` | 5+ Tests fuer LinkBadge |

**Risiko-Bewertung**: NIEDRIG — additive Features, keine Breaking Changes, keine neuen Dependencies.

### Umsetzungsreihenfolge

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---------|---------|---------------|
| 1 | DO-R1: Bundle Monitoring | Keine Aktion | — |
| 2 | DO-R2: CORS-Dokumentation | Klein | — |
| 3 | DO-R4: Deployment Phase 4a | Mittel | FE-Implementierung |
| 4 | DO-R4: Deployment Phase 4b | Mittel | FE-Implementierung |
| 5 | DO-R4: Deployment Phase 4c | Mittel | FE-Implementierung |

### Bundle-Entwicklung (aktualisiert)

| Version | JS (gzip) | CSS (gzip) | Total | Tests |
|---------|-----------|------------|-------|-------|
| Phase 3 | 28.76 KB | - | 28.76 KB | 444 |
| Dep-Upgrade | 28.53 KB | - | 28.53 KB | 444 |
| Feature-Paket | 23.01 KB | 6.99 KB | ~30.0 KB | 444 |
| Code-Audit | 23.01 KB | 6.99 KB | ~30.0 KB | 485 |
| **Phase 4 (erwartet)** | **~24 KB** | **~7.2 KB** | **~32 KB** | **~525** |

**Budget-Nutzung**: ~32 / 100 KB = 32% (68 KB Spielraum)
