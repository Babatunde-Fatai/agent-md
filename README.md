# agent-md

`agent-md` is a build-time Markdown generator for publishing agent-friendly static `.md` pages from your website content.

It is **not** a runtime proxy or middleware. It runs during CI/deploy and writes files you host directly.

## Quickstart

```bash
npm install
npx playwright install chromium
npm run build
npx agent-md build --sitemap https://example.com/sitemap.xml --out public/agent
```

Generated output is available at paths like:

- `public/agent/docs/getting-started.md`
- `public/agent/index.json`

If your static files are deployed from `public/`, those become:

- `https://website.com/agent/docs/getting-started.md`
- `https://website.com/agent/index.json`

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
- `--renderer static|playwright`: renderer mode (default: `playwright`)
- `--timeout <ms>`: request/page timeout
- `--concurrency <n>`: concurrent page workers (default: `3`)
- `--extra-wait-ms <ms>`: extra wait after `domcontentloaded` before extraction (default: `1000`; playwright only)

## What it generates

For each source URL, `agent-md` writes:

1. Markdown file with YAML frontmatter
2. `index.json` manifest for discovery

See `USAGE.md` for full integration recipes and deployment guidance.

## Publishing

- Maintainer release flow: `RELEASING.md`
- Beginner onboarding: `novice_usge.md`
