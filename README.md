# agent-web-md

**npm package:** `agent-web-md` &nbsp;|&nbsp; **CLI command:** `agent-md`

Make your website readable by AI agents. Generate clean, structured Markdown from your pages at build time — no proxy, no middleware, no runtime dependency on anyone.

```bash
npm install --save-dev agent-web-md
npx agent-md build --sitemap https://yoursite.com/sitemap.xml --out public/agent
```

Your site now exposes:

- `https://yoursite.com/agent/index.json` - discovery manifest
- `https://yoursite.com/agent/your-page.md` — clean content per page

---

## The /agent/ convention

The `/agent/` path is a proposed open convention for agent-readable content, similar in spirit to `robots.txt` and `sitemap.xml`: a predictable location, no central authority, anyone can implement it.

`agent-web-md` is the reference implementation. It runs during your build or CI pipeline, reads your sitemap, extracts the main content from each page, and writes static `.md` files alongside your HTML. Nothing runs at request time.

This tool handles the **content layer** of the agentic web stack: what a page says. For exposing callable actions (forms, buttons, workflows) to agents, see the emerging [WebMCP standard](https://github.com/webmachinelearning/webmcp).

---

## Quickstart

Add one line to your existing build script:

```json
{
  "scripts": {
    "build": "next build && agent-md build --sitemap https://yoursite.com/sitemap.xml --out public/agent"
  }
}
```

Works with Next.js, Astro, Docusaurus, Hugo, Eleventy, or any framework that builds to a static directory.

For JS-heavy SPAs, install a browser runtime first:

```bash
npx playwright install chromium
```

Then use `--renderer playwright`.

---

## CLI reference

```
agent-md build [options]
```

| Flag | Default | Description |
|---|---|---|
| `--sitemap <url>` | | Sitemap URL to crawl |
| `--urls <file>` | | Line-separated file of URLs |
| `--out <dir>` | `public/agent` | Output directory |
| `--base-url <url>` | | Base URL for resolving relative links and assets |
| `--renderer static\|playwright` | `static` | Page renderer |
| `--concurrency <n>` | `3` | Concurrent page workers |
| `--timeout <ms>` | `30000` | Request timeout |
| `--extra-wait-ms <ms>` | `1000` | Extra wait after load, Playwright only |
| `--max-pages <n>` | | Cap for testing |
| `--skip-robots-check` | | Ignore robots.txt disallow rules |

**Choosing a renderer**

| Renderer | When to use |
|---|---|
| `static` (default) | Server-rendered, pre-rendered, or static HTML. Fast, no browser required. |
| `playwright` | JS-heavy SPAs that hydrate content client-side. Requires: `npx playwright install chromium` |

---

## What gets generated

For each URL, `agent-md` writes a Markdown file with YAML frontmatter:

```yaml
---
title: "Getting Started"
description: "A guide to setting up your project."
source_url: "https://yoursite.com/docs/getting-started"
retrieved_at: "2026-02-13T10:00:00.000Z"
content_type: "docs"
word_count: 640
estimated_tokens: 832
generator: "agent-md"
hash: "a1b2c3d4"
---

Your page content here, as clean Markdown...
```

It also writes a manifest at `public/agent/index.json`:

```json
[
  {
    "url": "https://yoursite.com/docs/getting-started",
    "markdown_path": "/agent/docs/getting-started.md",
    "title": "Getting Started",
    "retrieved_at": "2026-02-13T10:00:00.000Z"
  }
]
```

Pages behind login walls or that redirect to an auth URL are automatically skipped. They appear in the manifest with `"auth_required": true` and no `markdown_path`, so you have a full audit trail of what was excluded.

---

## Responsible crawling

The tool respects `robots.txt` by default. Pages declared as disallowed are skipped. Use `--skip-robots-check` only if you are running the tool against your own site and have intentionally marked paths as disallowed for external crawlers.

---

## Verifying your sitemap

Before pointing the tool at a sitemap, confirm it exists and is valid XML:

```bash
curl -sSI https://yoursite.com/sitemap.xml
curl -sSL https://yoursite.com/sitemap.xml | head -n 20
```

You should see HTTP `200` and XML starting with `<urlset` or `<sitemapindex`. If you get HTML or a 404, that URL is not a sitemap.

---

## Path mapping

| Source URL | Output file |
|---|---|
| `https://yoursite.com/` | `public/agent/index.md` |
| `https://yoursite.com/about` | `public/agent/about.md` |
| `https://yoursite.com/docs/` | `public/agent/docs/index.md` |
| `https://yoursite.com/docs/start` | `public/agent/docs/start.md` |

Query strings and URL fragments are stripped. Paths are normalised.

---

## Framework recipes

**Next.js**
```json
"build": "next build && agent-md build --sitemap https://yoursite.com/sitemap.xml --out public/agent"
```
Next.js serves everything in `public/` at root, so `/agent/*` is available immediately after deploy.

**Astro**
```json
"build": "astro build && agent-md build --sitemap https://yoursite.com/sitemap-index.xml --out public/agent"
```

**Docusaurus**
```json
"build": "docusaurus build && agent-md build --urls urls.txt --out static/agent"
```

**Generic static site**
```bash
# Run after your site build, before deploy
agent-md build --sitemap https://yoursite.com/sitemap.xml --out public/agent
```

---

## GitHub Actions

A ready-to-use workflow is available at `.github/workflows/generate-agent-markdown.yml`. It runs on push to `main`, generates the `/agent/` directory, and optionally commits the files back to the repo.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.
