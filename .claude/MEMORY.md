# Persistent Memory & Documentation Index

Last Updated: 2026-02-13
Session Count: 14

## Active Project Context

**Project**: Eden
**Tech Stack**: 
**Key Constraints**:
- 

## Critical Decisions (Don't Reopen)

1. **Redis Cron Optimization** [2026-02-02]
   - RSS/Reddit: 30min, GoogleNews/Gov: 60min
   
2. **agent-md is build-time only (no runtime proxy/middleware)** [2026-02-13]
   - Output static files directly under deployable public asset directory for agent access and deterministic deploys.
   - Status: FINAL

3. **Default renderer is Playwright with Readability + Turndown pipeline** [2026-02-13]
   - JS-heavy sites require rendered HTML before extraction; static renderer remains optional fallback.
   - Status: FINAL

4. **Sitemap `lastmod` skip optimization enabled** [2026-02-13]
   - Skip regeneration when local markdown file mtime is newer than sitemap lastmod to reduce build time.
   - Status: FINAL

5. **Integration coverage now includes mocked sitemap + HTML end-to-end build path** [2026-02-13]
   - Added fixture-based tests validating markdown output, manifest shape, link/image absolutization, and lastmod skip behavior.
   - Status: FINAL

6. **CLI now supports configurable Playwright extraction wait** [2026-02-13]
   - Added `--extra-wait-ms` (default `1000`) to tune JS hydration delay before extraction.
   - Status: FINAL

7. **Initial npm release workflow established** [2026-02-13]
   - Added version bump scripts and tag-triggered publish workflow with provenance support.
   - Status: FINAL


## Persistent Documentation

| Document | Purpose | Last Updated | Status |
|----------|---------|--------------|--------|
| `docs/frontend-design.md` | Eden landing frontend implementation + design decisions | 2026-02-12 | Active |
| `docs/plans/2026-02-13-agent-md.md` | Implementation plan for agent-md CLI and pipeline | 2026-02-13 | Active |
| `USAGE.md` | Usage report and integration recipes for agent-md | 2026-02-13 | Active |
| `RELEASING.md` | Maintainer runbook for npm versioning/tag/publish | 2026-02-13 | Active |
| `novice_usge.md` | No-code beginner setup flow from repo to deployed Next app | 2026-02-13 | Active |


**Archived Docs** (delete if not referenced in 30 days):
- None yet

## Known Issues (Unresolved)

| Issue | Owner | Priority | Notes |
|-------|-------|----------|-------|


## Skills Consulted This Session

- `skills/karpathy-guidelines` - All code changes
- `superpowers/using-superpowers` - Mandatory skill bootstrap
- `superpowers/brainstorming` - Requirements framing before implementation
- `superpowers/writing-plans` - Multi-step implementation plan creation
- `superpowers/test-driven-development` - URL path mapping implemented RED->GREEN
- `superpowers/verification-before-completion` - Evidence-based completion checks

## Quick Links for Next Agent

- Backend repo structure: `src/modules/` organized by feature
- Test reset-password flow: See `/docs/OTP_FIX_DEPLOYMENT.md#testing`
- Frontend work needed: See `/docs/FRONTEND_INSTRUCTIONS.md`
