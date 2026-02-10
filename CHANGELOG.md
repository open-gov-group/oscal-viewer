# Changelog

All notable changes to the OSCAL Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-10

First stable release of OSCAL Viewer — a zero-backend, client-only viewer for all
six OSCAL document types with full JSON and XML support.

### Highlights

- **6 OSCAL Document Types**: Catalog, Profile, Component Definition, System Security Plan (SSP), Assessment Results (AR), Plan of Action & Milestones (POA&M)
- **JSON + XML**: Native XML parser via browser DOMParser — zero dependencies
- **OSCAL Resolution**: Profile and SSP import chains auto-resolve with cross-document navigation
- **PWA**: Offline-capable Progressive Web App with precaching and runtime cache
- **Accessibility**: WCAG 2.1 AA / BITV 2.0 compliant — 36 axe-core tests, `prefers-reduced-motion`, semantic ARIA
- **Performance**: Code splitting (6 lazy-loaded view chunks), 12 KB initial JS load
- **npm Package**: `@open-gov-group/oscal-parser` — reusable parser and types for OSCAL JSON/XML
- **854 Tests** across 32 files, 7 Playwright E2E specs

### Added

#### Document Types & Parsing

- 6 OSCAL parsers with `ParseResult<T>` pattern (Catalog, Profile, ComponentDef, SSP, AR, POA&M)
- `parseOscalText()` unified entry point for JSON and XML input
- `xmlToJson()` for OSCAL XML-to-JSON conversion via browser DOMParser
- `detectFormat()` for automatic JSON/XML detection
- `detectDocumentType()` and `detectVersion()` utilities

#### Views & Components

- CatalogView with hierarchical GroupTree navigation, ControlDetail, nested Part accordions
- ProfileView with auto-resolved imports and resolved controls display
- ComponentDefView with component cards and control implementations
- SspView with system characteristics, implementation, and resolved import-profile chain
- AssessmentResultsView with findings, observations, and risk summaries
- PoamView with POA&M items, milestones, findings, and risks
- DocumentViewer router with lazy-loaded views (code splitting)

#### Shared Components

- MetadataPanel (parties, links, remarks), PropertyBadge, PropertyList
- SearchBar with global per-type indexing (useSearch hook)
- Accordion with session persistence, AccordionGroup with expand/collapse
- StatusBadge, CopyLinkButton, FilterBar (keyword + chips)
- LinkBadge (5 color variants: implements, required, related, bsi, template)
- ImportPanel for import source visualization
- ResourcePanel for back-matter resources
- ProseView with parameter substitution (amber highlighting)
- ParameterItem with selection and guidelines display
- LoadingSpinner for Suspense fallbacks

#### Services & Hooks

- HrefParser for OSCAL href classification (4 patterns: urn, absolute-url, fragment, relative)
- DocumentCache with URL normalization
- ResolutionService: resolveProfile, resolveSsp, resolveSource
- ParamSubstitutor for inline parameter value insertion
- useSearch, useDeepLink, useFilter, useResolver, useSspResolver, useSourceResolver hooks
- Cross-document navigation with browser history (pushState/popState)

#### Infrastructure

- Progressive Web App (PWA) with offline capability
- URL-based document loading with `?url=` query parameter for shareability
- Config presets (BSI Grundschutz, DP Kompendium, NIST HIGH Profile)
- npm package `@open-gov-group/oscal-parser` (GitHub Packages)
- `tsc-alias` resolves `@/` path aliases in build output
- 5 CI/CD workflows (deploy, ci, lighthouse, publish, e2e)
- ESLint 9 flat config with three-tier architecture layer rules

#### UI/UX

- Material Design AppBar with CSS variables (31 tokens)
- Responsive layout with dark mode (`prefers-color-scheme`)
- Full-width layout with sticky sidebar
- Deep-linking via URL hash (`#/{view}/{id}`)

#### Accessibility (WCAG 2.1 AA / BITV 2.0)

- 36 axe-core tests across 16 components
- Contrast audit: 22 color combinations, all >= 4.5:1
- `prefers-reduced-motion: reduce` disables all animations and transitions
- Semantic list roles (`role="list"`, `role="listitem"`) on ResourcePanel, PoamView
- `lang="en"`, `aria-live="polite"`, skip-link, keyboard navigation (roving tabindex)

#### Documentation

- ADR-001 to ADR-010 (architecture decisions)
- CODING_STANDARDS v5.0.0 (22 patterns)
- CONTRIBUTING.md, ACCESSIBILITY_STATEMENT.md
- ARCHITECTURE.md, ORCHESTRATION.md

---

### Development History

Pre-release versions (0.1.0 — 0.5.0):

- **0.5.0** (2026-02-10, Phases 7-10): Native XML parser, npm package publishable, code splitting, a11y re-audit
- **0.4.0** (2026-02-10, Phase 5): Parameter substitution, ResourcePanel, cross-document navigation, resolved catalogs
- **0.3.0** (2026-02-09, Phases 3-4): PWA, HrefParser, DocumentCache, ResolutionService, ImportPanel, config presets
- **0.2.0** (2026-02-07, Phase 2): Dashboard redesign, Material Design, accessibility audit, ESLint layer rules
- **0.1.0** (2026-02-06, Phase 1): Initial release: 4 renderers, parsers, search, GroupTree, 390 tests
