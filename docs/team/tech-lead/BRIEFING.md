# Tech Lead - Briefing & Kommunikation

**Rolle**: Tech Lead
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06

---

## Deine Verantwortlichkeiten

- Technische Architektur-Entscheidungen treffen und dokumentieren
- Code-Qualitaet sicherstellen durch Reviews und Standards
- Team technisch mentoren und weiterentwickeln
- OSCAL-Spezifikation verstehen und korrekte Implementierung sicherstellen
- Schnittstelle zur Gesamtprojekt-Architektur

## Aktueller Auftrag

### Sofort (Phase 1 - KW 6-9)

**Issue #1 - Architektur-Design (ADR)** [CRITICAL - BLOCKING]
- ADR fuer Technologie-Auswahl dokumentieren (Preact-Entscheidung)
- Komponentenarchitektur dokumentieren
- Build-Tooling-Dokumentation (Vite)
- Lieferort: `docs/decisions/`
- Akzeptanzkriterien: ADR erstellt, Komponentendiagramm vorhanden

**Code Review & Standards**
- ESLint-Konfiguration pruefen und ggf. erweitern
- TypeScript strict-Mode Patterns definieren
- Review-Prozess fuer PRs etablieren

### ADR-Status (Issue #1)

| ADR | Datei | Status |
|-----|-------|--------|
| ADR-001 | `docs/architecture/decisions/ADR_001_preact.md` | Finalisiert |
| ADR-002 | `docs/architecture/decisions/ADR_002_zero_backend.md` | Finalisiert |
| ADR-003 | `docs/architecture/decisions/ADR_003_component_architecture.md` | **NEU** - Dreischichtige Architektur |
| ADR-004 | `docs/architecture/decisions/ADR_004_build_tooling.md` | **NEU** - Vite Build-Konfiguration |

ARCHITECTURE.md wurde aktualisiert (v1.1.0) mit ADR-Referenzen.

### Architektur-Entscheidungen (durch Architect getroffen)
1. **Spezialisierte Parser pro Dokumenttyp** (nicht ein generischer Parser)
2. **ParseResult<T> Pattern** als einheitliches Rueckgabeformat
3. **Verzeichnisstruktur**: `types/ -> parser/ -> hooks/ -> components/`
4. **Domain Layer importiert nie aus Presentation** (strikte Abhaengigkeitsrichtung)

### Verbleibende Aufgaben fuer Tech Lead
1. ADRs reviewen und ggf. ergaenzen
2. TypeScript-Patterns fuer OSCAL-Typen in `src/types/oscal.ts` definieren
3. ESLint-Regeln fuer Layer-Abhaengigkeiten konfigurieren
4. Review-Prozess fuer PRs etablieren

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Architect | Architektur-Entscheidungen abstimmen |
| Frontend Developer | Parser-Design reviewen, Coding Standards |
| QA Engineer | Test-Strategie abstimmen |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Tech Lead | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | Tech Lead | Issue #1: ADR-003 + ADR-004 erstellt, ARCHITECTURE.md aktualisiert | Erledigt |

