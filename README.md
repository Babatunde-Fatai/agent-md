# agent-md

`agent-md` is a build-time Markdown generator for publishing agent-friendly static `.md` pages from your website content.

It is **not** a runtime proxy or middleware. It runs during CI/deploy and writes files you host directly.

## Quickstart
```bash
npm install --save-dev agent-web-md
npx agent-md build --sitemap https://example.com/sitemap.xml --out public/agent
```

## After package and dependencies installation, add commands to your build - E.g:
```bash
"build": "next build && agent-md build --urls urls.txt --out public/agent"

Explicitly specify --renderer static
"build:agent": "agent-md build --urls urls.txt --out public/agent --renderer static" 
```


Package name on npm: `agent-web-md`  
CLI command exposed by the package: `agent-md`

Generated output is available at paths like:

- `public/agent/docs/getting-started.md`
- `public/agent/index.json`

If your static files are deployed from `public/`, those become:

- `https://website.com/agent/docs/getting-started.md`
- `https://website.com/agent/index.json`

Agent discovery entrypoint is `https://website.com/agent/index.json`.
Agents can read that manifest first, then follow each `markdown_path`.

## CLI

```bash
npx agent-md build --sitemap <url> --out <dir>
npx agent-md build --urls urls.txt --out <dir>
```

Flags:

- `--sitemap <url>`: sitemap URL input
- `--urls <file>`: line-separated URL file input
- `--out <dir>`: output directory (default: `public/agent`)
- `--base-url <url>`: optional base URL for relative link/image rewriting
- `--max-pages <n>`: optional page cap for testing
- `--renderer static|playwright`: renderer mode (default: `static`)
- `--timeout <ms>`: request/page timeout
- `--concurrency <n>`: concurrent page workers (default: `3`)
- `--extra-wait-ms <ms>`: extra wait after `domcontentloaded` before extraction (default: `1000`; playwright only)
- `--skip-robots-check`: skip robots.txt enforcement for URL crawling

## Choosing a renderer

| Renderer | When to use |
|---|---|
| `static` (default) | Server-rendered, pre-rendered, or static HTML sites. Fast, no browser required. |
| `playwright` | JS-heavy SPAs or pages that hydrate content client-side. Requires: `npx playwright install chromium` |

Note: for large sites, prefer `--sitemap` (including sitemap index and `.xml.gz` sitemap files). Use `--urls` as a manual fallback.

Before using `--sitemap`, sanity-check the URL:

```bash
curl -sSI -L https://your-domain.com/sitemap.xml
curl -sSL https://your-domain.com/sitemap.xml | head -n 40
```

You should see:
- HTTP `200`
- XML containing `<urlset>` or `<sitemapindex>`

If you get HTML/404, that endpoint is not a sitemap for `agent-md`.

## What it generates

For each source URL, `agent-md` writes:

1. Markdown file with YAML frontmatter
2. `index.json` manifest for discovery

Use `/agent/index.json` as the discovery URL you can share publicly for agents.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.
