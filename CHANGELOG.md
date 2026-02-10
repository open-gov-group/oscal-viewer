# Changelog

All notable changes to the OSCAL Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-02-10

### Added
- ParamSubstitutor service for inline parameter value insertion
- ProseView shared component with parameter substitution (amber highlighting)
- ResourcePanel shared component for back-matter resources
- Cross-document navigation with browser history (pushState/popState)
- Fragment-to-URL resolution (resolveFragmentToUrl) for back-matter resource links
- useSspResolver hook for SSP->Profile->Catalog chain
- useSourceResolver hook for CompDef source metadata
- Resolved Catalog display in ProfileView and SspView
- NIST HIGH Profile config preset

### Changed
- ProfileView auto-resolves imports and displays resolved controls with AccordionGroup
- SspView auto-resolves import-profile chain
- ControlDetail supports paramMap for prose parameter substitution
- Tests: 650 across 28 files | Bundle: 36.10 KB gzipped

## [0.3.0] - 2026-02-09

### Added
- Progressive Web App (PWA) with offline capability (#8)
- CONTRIBUTING.md, CHANGELOG.md (#9)
- npm package `@open-gov-group/oscal-parser` for reusable parser/types (#10)
- HrefParser service for OSCAL href classification (4 patterns: relative, fragment, absolute-url, urn)
- DocumentCache service for in-memory document caching with URL normalization
- ResolutionService with resolveProfile, resolveSsp, resolveSource functions
- LinkBadge component with 5 color variants (implements, required, related, bsi, template)
- ImportPanel shared component for import source visualization
- Fragment-link navigation for clickable `#CONTROL-ID` references
- ESLint services/ layer rules (Domain Layer protection)
- ADR-008 Resolution Service Architecture
- Config presets (BSI Grundschutz, DP Kompendium)
- URL-based document loading with `?url=` query parameter for shareability
- MetadataPanel expanded with parties cards, links section, remarks section
- CODING_STANDARDS v5.0.0 with 22 patterns

### Changed
- HrefParser relative paths now resolvable (isResolvable: true when baseUrl available)
- Tests: 583 across 25 files | Bundle: 33.58 KB gzipped

## [0.2.0] - 2026-02-07

### Added
- Stakeholder-Feedback: Multi-line navigation titles, nested part accordions, BITV 2.0 compliance
- Dashboard-Redesign: Accordion with session persistence, Deep-Linking (URL hash), Filter (keyword + chips), StatusBadge, CopyLinkButton
- UI/UX Overhaul: Material Design AppBar, CSS variables (31 tokens), responsive layout, dark mode
- Full-Width Layout with sticky sidebar, borderless desktop design
- Accessibility: axe-core tests, WCAG 2.1 AA contrast audit (22/22 PASS), aria-live for status messages
- CODING_STANDARDS.md v3.1.0 with 18 patterns including BITV 2.0 section
- ADR-005: Performance strategy (memoization, code splitting, virtual scrolling)
- ESLint layer rules enforcing three-tier architecture
- PR template with code quality, testing, and accessibility checklists

### Changed
- Navigation titles now wrap instead of truncating
- Parts rendered as nested accordions with heading hierarchy h4-h6

## [0.1.0] - 2026-02-06

### Added
- Initial release: Catalog, Profile, Component-Definition, SSP renderers
- 4 OSCAL parsers with ParseResult<T> pattern
- Global search with per-type indexing (useSearch hook)
- Hierarchical navigation with GroupTree
- Shared components: MetadataPanel, PropertyBadge, PropertyList, SearchBar
- Three-tier architecture: Domain -> Application -> Presentation
- 390 tests, 89% coverage, 13 axe-core accessibility tests
- GitHub Pages deployment
- ADR-001 to ADR-004 (Preact, Zero-Backend, Component Architecture, Build Tooling)
