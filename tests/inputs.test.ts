import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { loadUrlsFromSources } from '../src/core/inputs.js';

describe('loadUrlsFromSources', () => {
  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test('loads urls from gzipped sitemap', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n  <url><loc>https://example.com/a</loc></url>\n  <url><loc>https://example.com/b</loc></url>\n</urlset>`;
    const gz = gzipSync(Buffer.from(xml, 'utf8'));

    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url !== 'https://example.com/sitemap.xml.gz') {
        return new Response('not found', { status: 404 });
      }

      return new Response(gz, {
        status: 200,
        headers: {
          'content-type': 'application/x-gzip'
        }
      });
    }) as typeof fetch;

    const urls = await loadUrlsFromSources({
      sitemap: 'https://example.com/sitemap.xml.gz',
      timeout: 10_000
    });

    expect(urls.map((item) => item.url)).toEqual(['https://example.com/a', 'https://example.com/b']);
  });

  test('throws clear error when sitemap endpoint returns html instead of xml', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response('<!doctype html><html><body>404</body></html>', {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        }
      });
    }) as typeof fetch;

    await expect(
      loadUrlsFromSources({
        sitemap: 'https://example.com/sitemap.xml',
        timeout: 10_000
      })
    ).rejects.toThrow(/did not return XML sitemap data/i);
  });
});
