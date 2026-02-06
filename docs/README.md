# OSCAL Viewer Documentation

Diese Dokumentation enthält alle Informationen zur Entwicklung, Architektur und Qualitätssicherung des OSCAL Viewers.

## Struktur

```
docs/
├── team/                    # Team-Dokumentation
│   ├── ROLES.md             # Rollen und Verantwortlichkeiten
│   └── ONBOARDING.md        # Onboarding Guide
├── architecture/            # Architektur-Dokumentation
│   ├── ARCHITECTURE.md      # System-Architektur
│   ├── TECH_STACK.md        # Technologie-Stack
│   └── decisions/           # Architecture Decision Records
├── guidelines/              # Entwicklungs-Guidelines
│   ├── DEVELOPMENT.md       # Entwicklungs-Richtlinien
│   ├── CODE_STYLE.md        # Code-Konventionen
│   └── ACCESSIBILITY.md     # Accessibility-Standards
└── qa/                      # Qualitätssicherung
    ├── TESTING_STRATEGY.md  # Test-Strategie
    └── QUALITY_GATES.md     # Quality Gates
```

## Schnelleinstieg

- **Neue Entwickler**: Starte mit [ONBOARDING.md](team/ONBOARDING.md)
- **Architektur**: Siehe [ARCHITECTURE.md](architecture/ARCHITECTURE.md)
- **Code-Standards**: Siehe [CODE_STYLE.md](guidelines/CODE_STYLE.md)

## Entwicklung starten

```bash
# Repository klonen
git clone https://github.com/open-gov-group/oscal-viewer.git
cd oscal-viewer

# Dependencies installieren
npm install

# Dev Server starten
npm run dev
```

## Ressourcen

- [OSCAL Documentation](https://pages.nist.gov/OSCAL/)
- [Preact Documentation](https://preactjs.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Maintainer**: [Viewer Team](https://github.com/orgs/open-gov-group/teams/viewer-team)
