# Architect - Briefing & Kommunikation

**Rolle**: Architect (Orchestrierung)
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06

---

## Projektueberblick

Der OSCAL Viewer ist ein clientseitiger Viewer fuer OSCAL-Dokumente (Open Security Controls Assessment Language). Das Projekt nutzt Preact + TypeScript + Vite und wird auf GitHub Pages deployed.

## Aktuelle Prioritaeten

### Phase 1: Foundation (KW 6-9) - AKTIV
| Issue | Titel | Status | Zustaendig |
|-------|-------|--------|------------|
| #1 | Architektur-Design (ADR) | Offen - CRITICAL | Tech Lead + Architect |
| #2 | OSCAL Parser implementieren | Offen - CRITICAL | Frontend Developer |
| #3 | Catalog Renderer implementieren | Offen - CRITICAL | Frontend Developer + UI/UX |

### Phase 2: Erweiterung (KW 10-12)
| Issue | Titel | Prioritaet |
|-------|-------|------------|
| #4 | Profile Renderer | High |
| #5 | Component-Definition Renderer | High |
| #6 | SSP Renderer | High |
| #7 | Suchfunktion & Filter | Medium |

### Phase 3: Deploy (KW 13-14)
| Issue | Titel | Prioritaet |
|-------|-------|------------|
| #8 | PWA-Unterstuetzung (Offline) | Medium |
| #9 | Dokumentation vervollstaendigen | High |
| #10 | Shared Components als npm Package | Medium |

## Architektur-Entscheidungen

- **Zero-Backend**: Alles laeuft clientseitig, keine Daten verlassen den Browser
- **Preact statt React**: 3KB vs 40KB+ Bundle Size
- **Vite**: Schnelles HMR, optimierte Builds
- **TypeScript strict**: Typsicherheit fuer OSCAL-Strukturen

## Naechste Schritte (Architect)

1. Issue #1 abschliessen - ADR finalisieren mit Tech Lead
2. Komponentenarchitektur fuer Parser definieren
3. Schnittstellen zwischen Parser und Renderer spezifizieren
4. Aufgabenverteilung an Teammitglieder koordinieren

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Alle | Projektstart & Briefing | Erstellt |

