# agent-md Usage Report

## What agent-md does

`agent-md` is a build-time tool that converts website pages into agent-friendly Markdown and writes static files under an output directory (default: `public/agent`).

It does not proxy production traffic and does not run as middleware.

Core pipeline:

1. Read URLs from sitemap or text file.
2. Render pages (`playwright` by default for JS-heavy sites, or `static` for simple pages).
3. Extract main content with Mozilla Readability.
4. Convert extracted HTML to Markdown with Turndown + GFM plugin.
5. Write deterministic Markdown files and `index.json` manifest.

## Installation

```bash
npm install
npx playwright install chromium
npm run build
```

## Example commands

From sitemap:

```bash
npx agent-md build --sitemap https://example.com/sitemap.xml --out public/agent
```

From URL list:

```bash
npx agent-md build --urls urls.txt --out public/agent
```

With optional controls:

```bash
npx agent-md build \
  --sitemap https://example.com/sitemap.xml \
  --out public/agent \
  --renderer playwright \
  --concurrency 3 \
  --timeout 30000 \
  --extra-wait-ms 1000 \
  --max-pages 50
```

## Output structure

Input URL:

- `https://site.com/docs/getting-started`

Output file:

- `public/agent/docs/getting-started.md`

Rules:

- Query params/hash are stripped.
- Repeated slashes are normalized.
- Trailing slash routes become `index.md`.

Examples:

- `/` -> `index.md`
- `/docs/` -> `docs/index.md`
- `/docs/start` -> `docs/start.md`

## Frontmatter format

Each generated Markdown file starts with YAML frontmatter:

```yaml
---
title: "How to Configure agent-md"
description: "A comprehensive guide to setting up build-time markdown generation for static sites."
source_url: "https://website.com/docs/config"
retrieved_at: "2026-02-13T10:00:00Z"
content_type: "docs"
word_count: 850
estimated_tokens: 1105
generator: "agent-md"
hash: "a1b2c3d4"
---
```

## Manifest

`agent-md` always writes:

- `public/agent/index.json`

Shape:

```json
[
  {
    "url": "https://example.com/docs/start",
    "markdown_path": "/agent/docs/start.md",
    "title": "Getting Started",
    "retrieved_at": "2026-02-13T10:00:00.000Z"
  }
]
```

## Framework integration recipes

### Next.js

`package.json`:

```json
{
  "scripts": {
    "build": "next build && agent-md build --sitemap https://example.com/sitemap.xml --out public/agent"
  }
}
```

Notes:

- `public/agent` is automatically served at `/agent/*` by Next.js.
- If docs are generated from preview/staging URLs, set `--base-url https://your-production-site.com`.

### Astro

`package.json`:

```json
{
  "scripts": {
    "build": "astro build && agent-md build --sitemap https://example.com/sitemap-index.xml --out public/agent"
  }
}
```

Notes:

- Astro serves `public/` assets directly at the root.

### Docusaurus

`package.json`:

```json
{
  "scripts": {
    "build": "docusaurus build && agent-md build --urls ./urls.txt --out static/agent"
  }
}
```

Notes:

- Docusaurus static files live in `static/`.
- For this setup, outputs are typically served as `/agent/*` after deploy if your host maps `static/` into root assets.

### Generic static sites

For static generators (Hugo/Jekyll/Eleventy/custom):

1. Run site build.
2. Run `agent-md` into the directory your host serves as public assets.
3. Deploy both HTML and generated Markdown files.

Example:

```bash
agent-md build --sitemap https://example.com/sitemap.xml --out public/agent
```

## Deployment guide for /public/agent

1. Confirm your hosting platform serves `public/` files at root path.
2. Ensure generated files are part of deploy artifact.
3. Validate:
   - `/agent/index.json`
   - `/agent/<path>.md`

## GitHub Action

Use `.github/workflows/generate-agent-markdown.yml`.

Default behavior:

- Runs on push to `main`.
- Installs dependencies and Playwright Chromium.
- Generates markdown files from configured sitemap.
- Uploads generated folder as artifact.
- Optionally commits generated files back when `COMMIT_BACK` is set to `"true"`.

## npm release/versioning

- Version/tag scripts are in `package.json`:
  - `npm run release:tag:patch`
  - `npm run release:tag:minor`
  - `npm run release:tag:major`
- Release verification:
  - `npm run release:check`
- npm publish workflow:
  - `.github/workflows/publish-npm.yml`
- Full maintainer steps:
  - `RELEASING.md`

## Limitations

- Paywalled and authenticated pages are not supported out of the box.
- Client-heavy pages with delayed rendering may need larger timeout/wait strategy.
- Some dynamic widgets/scripts may be removed by Readability extraction.
- Non-HTML content is ignored.
- `robots.txt` policy checks are not implemented yet (roadmap item).
- Lastmod-based skip depends on reliable sitemap `lastmod` data and local file mtimes.
