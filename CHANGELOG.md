# Changelog

All notable changes to the OSCAL Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Progressive Web App (PWA) with offline capability (#8)
- CONTRIBUTING.md, CHANGELOG.md (#9)
- npm package `@open-gov-group/oscal-parser` for reusable parser/types (#10)

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
