import { mkdtemp, readFile, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { buildAgentMarkdown } from '../src/core/build.js';

const fixtureDir = path.join(process.cwd(), 'tests', 'fixtures');
const FIXED_NOW = new Date('2026-02-13T10:00:00.000Z');

describe('buildAgentMarkdown integration', () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = realFetch;
  });

  test('builds markdown and manifest from sitemap using mocked HTML pages', async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), 'agent-md-test-'));
    const outDir = path.join(tmp, 'public', 'agent');

    const sitemap = await readFile(path.join(fixtureDir, 'sitemap.xml'), 'utf8');
    const pageStart = await readFile(path.join(fixtureDir, 'page-start.html'), 'utf8');
    const pageDocsIndex = await readFile(path.join(fixtureDir, 'page-docs-index.html'), 'utf8');

    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);

      if (url === 'https://example.com/sitemap.xml') {
        return new Response(sitemap, { status: 200 });
      }

      if (url === 'https://example.com/docs/start') {
        return new Response(pageStart, { status: 200 });
      }

      if (url === 'https://example.com/docs/') {
        return new Response(pageDocsIndex, { status: 200 });
      }

      return new Response('not found', { status: 404 });
    }) as typeof fetch;

    await buildAgentMarkdown({
      sitemap: 'https://example.com/sitemap.xml',
      out: outDir,
      renderer: 'static',
      timeout: 10_000,
      concurrency: 2,
      extraWaitMs: 1200
    });

    const startMd = await readFile(path.join(outDir, 'docs', 'start.md'), 'utf8');
    const docsIndexMd = await readFile(path.join(outDir, 'docs', 'index.md'), 'utf8');
    const manifest = JSON.parse(await readFile(path.join(outDir, 'index.json'), 'utf8')) as Array<{
      url: string;
      markdown_path: string;
      title: string;
      retrieved_at: string;
    }>;

    expect(startMd).toContain('title: "Start Here"');
    expect(startMd).toContain('source_url: "https://example.com/docs/start"');
    expect(startMd).toContain('[Next step](https://example.com/docs/next)');
    expect(startMd).toContain('![logo](https://example.com/img/logo.png)');

    expect(docsIndexMd).toContain('title: "Docs Home"');
    expect(docsIndexMd).toContain('Overview page content.');

    expect(manifest).toEqual([
      {
        url: 'https://example.com/docs/',
        markdown_path: '/agent/docs/index.md',
        title: 'Docs Home',
        retrieved_at: FIXED_NOW.toISOString()
      },
      {
        url: 'https://example.com/docs/start',
        markdown_path: '/agent/docs/start.md',
        title: 'Start Here',
        retrieved_at: FIXED_NOW.toISOString()
      }
    ]);
  });

  test('skips regeneration when output file is newer than sitemap lastmod', async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), 'agent-md-test-'));
    const outDir = path.join(tmp, 'public', 'agent');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n  <url>\n    <loc>https://example.com/docs/start</loc>\n    <lastmod>2025-01-01T00:00:00Z</lastmod>\n  </url>\n</urlset>`;

    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === 'https://example.com/sitemap.xml') {
        return new Response(sitemap, { status: 200 });
      }
      return new Response('<html><body>ignored</body></html>', { status: 200 });
    }) as typeof fetch;

    const markdownPath = path.join(outDir, 'docs', 'start.md');
    await buildAgentMarkdown({
      sitemap: 'https://example.com/sitemap.xml',
      out: outDir,
      renderer: 'static',
      timeout: 10_000,
      concurrency: 1,
      extraWaitMs: 1000
    });

    const firstMtime = (await stat(markdownPath)).mtimeMs;

    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === 'https://example.com/sitemap.xml') {
        return new Response(sitemap, { status: 200 });
      }
      throw new Error(`unexpected fetch call: ${url}`);
    }) as typeof fetch;

    await buildAgentMarkdown({
      sitemap: 'https://example.com/sitemap.xml',
      out: outDir,
      renderer: 'static',
      timeout: 10_000,
      concurrency: 1,
      extraWaitMs: 1000
    });

    const secondMtime = (await stat(markdownPath)).mtimeMs;

    expect(secondMtime).toBe(firstMtime);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test('includes auth-required pages in manifest without markdown output', async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), 'agent-md-test-'));
    const outDir = path.join(tmp, 'public', 'agent');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n  <url><loc>https://example.com/dashboard</loc></url>\n</urlset>`;

    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === 'https://example.com/sitemap.xml') {
        return new Response(sitemap, { status: 200 });
      }
      if (url === 'https://example.com/robots.txt') {
        return new Response('User-agent: *\nDisallow:', { status: 200 });
      }
      if (url === 'https://example.com/dashboard') {
        return new Response(
          '<html><body><main><h1>Sign in</h1><p>Forgot your password?</p><p>Create an account</p></main></body></html>',
          {
            status: 200,
            headers: { 'content-type': 'text/html' }
          }
        );
      }
      return new Response('not found', { status: 404 });
    }) as typeof fetch;

    await buildAgentMarkdown({
      sitemap: 'https://example.com/sitemap.xml',
      out: outDir,
      renderer: 'static',
      timeout: 10_000,
      concurrency: 1,
      extraWaitMs: 1000
    });

    const manifest = JSON.parse(await readFile(path.join(outDir, 'index.json'), 'utf8')) as Array<{
      url: string;
      auth_required?: true;
      retrieved_at: string;
      markdown_path?: string;
      title?: string;
    }>;

    expect(manifest).toEqual([
      {
        url: 'https://example.com/dashboard',
        auth_required: true,
        retrieved_at: FIXED_NOW.toISOString()
      }
    ]);
  });
});
