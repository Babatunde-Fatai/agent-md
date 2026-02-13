import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface ExtractedContent {
  title?: string;
  description?: string;
  html: string;
  textContent: string;
}

export function extractReadableContent(input: {
  html: string;
  pageUrl: string;
  baseUrl?: string;
}): ExtractedContent {
  const dom = new JSDOM(input.html, { url: input.pageUrl });
  const baseForUrls = input.baseUrl ?? input.pageUrl;

  absolutizeDocumentUrls(dom.window.document, baseForUrls);

  const article = new Readability(dom.window.document).parse();

  if (article && article.content) {
    const text = article.textContent?.trim() ?? '';
    return {
      title: article.title ?? undefined,
      description: article.excerpt ?? undefined,
      html: article.content,
      textContent: text
    };
  }

  const title = dom.window.document.title || undefined;
  const body = dom.window.document.body?.innerHTML ?? '';
  const text = dom.window.document.body?.textContent?.trim() ?? '';

  return {
    title,
    html: body,
    textContent: text
  };
}

function absolutizeDocumentUrls(document: Document, baseUrl: string): void {
  const linkLike = document.querySelectorAll('[href]');
  for (const node of linkLike) {
    const href = node.getAttribute('href');
    if (!href) {
      continue;
    }
    const absolute = tryResolveUrl(href, baseUrl);
    if (absolute) {
      node.setAttribute('href', absolute);
    }
  }

  const srcLike = document.querySelectorAll('[src]');
  for (const node of srcLike) {
    const src = node.getAttribute('src');
    if (!src) {
      continue;
    }
    const absolute = tryResolveUrl(src, baseUrl);
    if (absolute) {
      node.setAttribute('src', absolute);
    }
  }

  const srcSetLike = document.querySelectorAll('[srcset]');
  for (const node of srcSetLike) {
    const srcset = node.getAttribute('srcset');
    if (!srcset) {
      continue;
    }

    const rewritten = srcset
      .split(',')
      .map((part) => part.trim())
      .map((entry) => {
        const [candidate, descriptor] = entry.split(/\s+/, 2);
        if (!candidate) {
          return entry;
        }
        const absolute = tryResolveUrl(candidate, baseUrl);
        if (!absolute) {
          return entry;
        }
        return descriptor ? `${absolute} ${descriptor}` : absolute;
      })
      .join(', ');

    node.setAttribute('srcset', rewritten);
  }
}

function tryResolveUrl(value: string, baseUrl: string): string | null {
  if (value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}
