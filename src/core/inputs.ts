import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { XMLParser } from 'fast-xml-parser';
import type { UrlEntry } from './types.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true
});

export async function loadUrlsFromSources(options: {
  sitemap?: string;
  urlsFile?: string;
  maxPages?: number;
  timeout: number;
  baseUrl?: string;
}): Promise<UrlEntry[]> {
  const fromSitemap = options.sitemap
    ? await loadFromSitemap(options.sitemap, options.timeout)
    : [];
  const fromFile = options.urlsFile
    ? await loadFromFile(options.urlsFile)
    : [];

  const merged = [...fromSitemap, ...fromFile]
    .map((entry) => normalizeEntry(entry, options.baseUrl))
    .filter((entry): entry is UrlEntry => entry !== null);

  const deduped = new Map<string, UrlEntry>();
  for (const entry of merged) {
    const current = deduped.get(entry.url);
    if (!current?.lastmod && entry.lastmod) {
      deduped.set(entry.url, entry);
      continue;
    }
    if (!current) {
      deduped.set(entry.url, entry);
    }
  }

  const sorted = [...deduped.values()].sort((a, b) => a.url.localeCompare(b.url));
  if (options.maxPages && options.maxPages > 0) {
    return sorted.slice(0, options.maxPages);
  }
  return sorted;
}

async function loadFromFile(filePath: string): Promise<UrlEntry[]> {
  const data = await readFile(filePath, 'utf8');
  return data
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((url) => ({ url }));
}

async function loadFromSitemap(sitemapUrl: string, timeout: number): Promise<UrlEntry[]> {
  const visited = new Set<string>();
  return loadSitemapRecursive(sitemapUrl, timeout, visited);
}

async function loadSitemapRecursive(
  sitemapUrl: string,
  timeout: number,
  visited: Set<string>
): Promise<UrlEntry[]> {
  if (visited.has(sitemapUrl)) {
    return [];
  }
  visited.add(sitemapUrl);

  const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapUrl} (${response.status})`);
  }

  const xml = await readSitemapBody(response, sitemapUrl);
  if (!looksLikeSitemapXml(xml)) {
    throw new Error(
      `Sitemap URL did not return XML sitemap data: ${response.url || sitemapUrl}. ` +
        'Use a URL that serves <urlset> or <sitemapindex>, or fallback to --urls urls.txt.'
    );
  }
  const parsed = parser.parse(xml) as SitemapLike;

  if (parsed.urlset?.url) {
    const urls = asArray(parsed.urlset.url);
    return urls
      .map((node) => ({
        url: typeof node.loc === 'string' ? node.loc : '',
        lastmod: typeof node.lastmod === 'string' ? node.lastmod : undefined
      }))
      .filter((entry) => entry.url);
  }

  if (parsed.sitemapindex?.sitemap) {
    const nested = asArray(parsed.sitemapindex.sitemap);
    const all = await Promise.all(
      nested
        .map((node) => (typeof node.loc === 'string' ? node.loc : null))
        .filter((url): url is string => Boolean(url))
        .map((url) => loadSitemapRecursive(url, timeout, visited))
    );
    return all.flat();
  }

  return [];
}

async function readSitemapBody(response: Response, sitemapUrl: string): Promise<string> {
  const contentEncoding = response.headers.get('content-encoding')?.toLowerCase() ?? '';
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  const looksGzipped =
    sitemapUrl.toLowerCase().endsWith('.gz') ||
    contentEncoding.includes('gzip') ||
    contentType.includes('gzip');

  if (!looksGzipped) {
    return response.text();
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const unzipped = gunzipSync(bytes);
  return Buffer.from(unzipped).toString('utf8');
}

function normalizeEntry(entry: UrlEntry, baseUrl?: string): UrlEntry | null {
  try {
    const resolved = baseUrl ? new URL(entry.url, baseUrl) : new URL(entry.url);
    resolved.hash = '';
    resolved.search = '';
    return {
      url: resolved.toString(),
      lastmod: entry.lastmod
    };
  } catch {
    return null;
  }
}

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function looksLikeSitemapXml(body: string): boolean {
  const sample = body.slice(0, 5000).toLowerCase();
  return sample.includes('<urlset') || sample.includes('<sitemapindex');
}

interface SitemapLike {
  urlset?: {
    url?:
      | {
          loc?: string;
          lastmod?: string;
        }
      | Array<{
          loc?: string;
          lastmod?: string;
        }>;
  };
  sitemapindex?: {
    sitemap?:
      | {
          loc?: string;
        }
      | Array<{
          loc?: string;
        }>;
  };
}
