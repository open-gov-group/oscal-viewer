# OSCAL Viewer

**Universal OSCAL Viewer for all versions from 1.0.x to latest**

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-blue)](https://open-gov-group.github.io/oscal-viewer)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![OSCAL](https://img.shields.io/badge/OSCAL-1.0--1.1.2-orange)](https://pages.nist.gov/OSCAL/)

---

## Why This Project?

The existing [viewer.oscal.io](https://viewer.oscal.io/) only supports OSCAL versions up to **1.0.4**. Modern OSCAL catalogs (including the OpenGov Privacy Ecosystem) use **OSCAL 1.1.2** and newer versions.

This viewer provides:
- Support for **all OSCAL versions** (1.0.x through current)
- **Client-side only** rendering (no backend required)
- **PWA support** for offline use in air-gapped environments
- **Custom property display** (assurance_goal, legal references, etc.)
- **GitHub Pages deployment** for easy hosting

---

## Features

| Feature | Status |
|---------|--------|
| Catalog Viewer | Planned |
| Profile Viewer | Planned |
| Component-Definition Viewer | Planned |
| System Security Plan (SSP) Viewer | Planned |
| Search & Filter | Planned |
| URL Import | Planned |
| Drag & Drop | Planned |
| PWA Offline Mode | Planned |
| Print Styles | Planned |

---

## Quick Start

### View OSCAL Files

1. Visit [https://open-gov-group.github.io/oscal-viewer](https://open-gov-group.github.io/oscal-viewer)
2. Drag & drop your OSCAL JSON file, or
3. Paste a URL to an OSCAL file, or
4. Use the file picker to select a local file

### URL Parameters

```
https://open-gov-group.github.io/oscal-viewer?url=https://example.com/catalog.json
```

---

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/open-gov-group/oscal-viewer.git
cd oscal-viewer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
oscal-viewer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── src/
│   ├── parser/
│   │   ├── oscal-parser.ts     # Universal OSCAL JSON Parser
│   │   └── schema-detector.ts  # Version detection
│   ├── renderers/
│   │   ├── catalog.ts          # Catalog → HTML
│   │   ├── profile.ts          # Profile → HTML
│   │   ├── component.ts        # Component-Definition → HTML
│   │   └── ssp.ts              # SSP → HTML
│   ├── components/
│   │   ├── control-card.ts     # Control display component
│   │   ├── property-badge.ts   # Property display
│   │   ├── search-bar.ts       # Search functionality
│   │   └── filter-panel.ts     # Filter panel
│   ├── styles/
│   │   ├── base.css            # Base styles
│   │   ├── catalog.css         # Catalog-specific styles
│   │   └── print.css           # Print styles
│   ├── app.ts                  # Main application
│   └── index.html              # Entry point
├── public/
│   └── examples/               # Example OSCAL files
├── tests/
│   ├── parser.test.ts
│   └── renderers.test.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Language | TypeScript | Type safety, IDE support |
| Framework | Preact | Minimal bundle size (<5KB) |
| Build | Vite | Fast HMR, optimized builds |
| Styling | CSS Modules | Scoped styles, no runtime |
| Testing | Vitest | Fast, Vite-compatible |

### Bundle Size Target

- **< 100KB gzipped** total bundle size
- **< 1.5s** First Contentful Paint

---

## OSCAL Version Support

| Version | Status |
|---------|--------|
| 1.0.0 | Supported |
| 1.0.4 | Supported |
| 1.1.0 | Supported |
| 1.1.2 | Supported |
| Future | Designed for extensibility |

The parser automatically detects the OSCAL version and applies appropriate rendering.

---

## Supported Artifact Types

| Type | Description |
|------|-------------|
| **Catalog** | Control catalogs (NIST, ISO, BSI, DSGVO, SDM) |
| **Profile** | Baseline configurations and overlays |
| **Component-Definition** | Implementation components |
| **System Security Plan** | Complete SSP documents |

---

## Accessibility

This viewer is designed to meet **WCAG 2.1 AA** standards:
- Semantic HTML structure
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus indicators

---

## Part of the OpenGov Privacy Ecosystem

This viewer is part of the [OpenGov OSCAL Privacy Project](https://github.com/open-gov-group/opengov-oscal-privacy-project), which provides:

- **Privacy Catalogs** (DSGVO, SDM) in OSCAL format
- **Framework Mappings** (BSI Grundschutz++, ISO 27701)
- **Python Libraries** for OSCAL processing
- **RoPA Manager** for processing activities

---

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- **Live Demo**: [https://open-gov-group.github.io/oscal-viewer](https://open-gov-group.github.io/oscal-viewer)
- **Documentation**: [Team Specification](https://github.com/open-gov-group/opengov-oscal-privacy-project/blob/main/docs/architecture/OSCAL_VIEWER_TEAM.md)
- **OSCAL Standard**: [https://pages.nist.gov/OSCAL/](https://pages.nist.gov/OSCAL/)
- **OpenGov Privacy Project**: [https://github.com/open-gov-group/opengov-oscal-privacy-project](https://github.com/open-gov-group/opengov-oscal-privacy-project)

---

**Maintained by the OpenGov Viewer Team**
