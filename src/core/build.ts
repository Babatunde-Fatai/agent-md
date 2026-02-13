import { createHash } from 'node:crypto';
import path from 'node:path';
import pLimit from 'p-limit';
import { convertHtmlToMarkdown } from '../convert/markdown.js';
import { extractReadableContent } from '../extract/readability.js';
import { ensureDir, fileIsNewerThan, readFrontmatterTitle, writeTextFile } from './fs.js';
import { loadUrlsFromSources } from './inputs.js';
import { derivePublicMountPath, mapUrlToRelativeMarkdownPath } from './pathing.js';
import { createRenderer } from './renderer.js';
import { isAllowedByRobots } from './robots.js';
import type { BuildOptions, ManifestEntry } from './types.js';

export async function buildAgentMarkdown(options: BuildOptions): Promise<void> {
  const entries = await loadUrlsFromSources({
    sitemap: options.sitemap,
    urlsFile: options.urls,
    maxPages: options.maxPages,
    timeout: options.timeout,
    baseUrl: options.baseUrl
  });

  if (entries.length === 0) {
    const inputHint = options.sitemap
      ? `Sitemap provided: ${options.sitemap}`
      : options.urls
        ? `URLs file provided: ${options.urls}`
        : 'No input source provided.';
    throw new Error(
      `No valid URLs found to process. ${inputHint} ` +
        'Check that your sitemap contains <loc> entries (or your urls.txt has one absolute URL per line).'
    );
  }

  await ensureDir(options.out);
  const mountPath = derivePublicMountPath(options.out);

  const renderer = createRenderer({
    renderer: options.renderer,
    timeout: options.timeout,
    extraWaitMs: options.extraWaitMs ?? 1000
  });

  const limit = pLimit(options.concurrency);
  const now = new Date().toISOString();

  try {
    const processed = await Promise.all(
      entries.map((entry) =>
        limit(async (): Promise<ManifestEntry | null> => {
          const relativeMdPath = mapUrlToRelativeMarkdownPath(entry.url);
          const outputPath = path.join(options.out, relativeMdPath);
          const markdownPath = toPosixPath(path.posix.join(mountPath, relativeMdPath));

          if (entry.lastmod && (await fileIsNewerThan(outputPath, entry.lastmod))) {
            const existingTitle = await readFrontmatterTitle(outputPath);
            return {
              url: entry.url,
              markdown_path: markdownPath,
              title: existingTitle ?? fallbackTitleFromUrl(entry.url),
              retrieved_at: now
            };
          }

          if (options.skipRobotsCheck !== true) {
            const isAllowed = await isAllowedByRobots(entry.url, options.timeout);
            if (!isAllowed) {
              console.log(`agent-md: skipping ${entry.url} (disallowed by robots.txt)`);
              return null;
            }
          }

          const rendered = await renderer.render(entry.url);
          const extracted = extractReadableContent({
            html: rendered.html,
            pageUrl: rendered.finalUrl,
            baseUrl: options.baseUrl ?? rendered.origin
          });

          const markdownBody = convertHtmlToMarkdown(extracted.html);
          const title = extracted.title || rendered.title || fallbackTitleFromUrl(entry.url);
          const description = extracted.description || '';
          const wordCount = countWords(extracted.textContent || markdownBody);
          const estimatedTokens = Math.ceil(wordCount * 1.3);
          const hash = createHash('sha256').update(markdownBody).digest('hex').slice(0, 8);
          const contentType = inferContentType(rendered.finalUrl);

          const frontmatter = [
            '---',
            `title: ${quoteYaml(title)}`,
            `description: ${quoteYaml(description)}`,
            `source_url: ${quoteYaml(rendered.finalUrl)}`,
            `retrieved_at: ${quoteYaml(now)}`,
            `content_type: ${quoteYaml(contentType)}`,
            `word_count: ${wordCount}`,
            `estimated_tokens: ${estimatedTokens}`,
            `generator: ${quoteYaml('agent-web-md')}`,
            `hash: ${quoteYaml(hash)}`,
            '---',
            ''
          ].join('\n');

          await writeTextFile(outputPath, `${frontmatter}\n${markdownBody}\n`);

          return {
            url: entry.url,
            markdown_path: markdownPath,
            title,
            retrieved_at: now
          };
        })
      )
    );

    const manifestPath = path.join(options.out, 'index.json');
    const manifest = processed
      .filter((entry): entry is ManifestEntry => entry !== null)
      .sort((a, b) => a.url.localeCompare(b.url));
    await writeTextFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    console.log(`agent-md: generated ${manifest.length} markdown documents in ${options.out}`);
  } finally {
    await renderer.close();
  }
}

function fallbackTitleFromUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return url.hostname;
  }
  const lastPart = parts.at(-1);
  return (lastPart ?? url.hostname).replace(/[-_]/g, ' ');
}

export function inferContentType(rawUrl: string): string {
  const url = new URL(rawUrl);
  const first = url.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (!first) {
    return 'page';
  }
  if (['docs', 'documentation', 'guide', 'guides'].includes(first)) {
    return 'docs';
  }
  if (['blog', 'news', 'updates', 'posts'].includes(first)) {
    return 'article';
  }
  if (['api', 'reference'].includes(first)) {
    return 'reference';
  }
  return 'page';
}

function countWords(input: string): number {
  const words = input.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function quoteYaml(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
  return `"${escaped}"`;
}

function toPosixPath(input: string): string {
  return input.replace(/\\/g, '/');
}
