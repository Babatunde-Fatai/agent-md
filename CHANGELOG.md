# Changelog

## [0.2.0] - 2026-02-13

### Changed
- Default renderer changed from `playwright` to `static`. Use `--renderer playwright` for JS-heavy SPAs.
- `robots.txt` is now respected by default. Use `--skip-robots-check` to disable.
- Install documentation corrected: package installs as `npm install agent-web-md`; CLI command remains `agent-md`.

### Fixed
- `content_type` frontmatter field correctly falls back to `page` for unrecognised URL path patterns.

### Added
- `--skip-robots-check` flag to opt out of robots.txt enforcement.
- Playwright renderer now logs a clear install reminder when selected.
