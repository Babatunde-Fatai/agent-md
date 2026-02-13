import { describe, expect, it } from 'vitest';
import { inferContentType } from '../src/core/build.js';

describe('inferContentType', () => {
  it('returns page for root URL with no path segments', () => {
    expect(inferContentType('https://example.com/')).toBe('page');
  });

  it('returns docs when first segment is docs-related', () => {
    expect(inferContentType('https://example.com/docs/getting-started')).toBe('docs');
    expect(inferContentType('https://example.com/documentation/start')).toBe('docs');
    expect(inferContentType('https://example.com/guide/intro')).toBe('docs');
    expect(inferContentType('https://example.com/guides/setup')).toBe('docs');
  });

  it('returns article when first segment is blog-related', () => {
    expect(inferContentType('https://example.com/blog/welcome')).toBe('article');
    expect(inferContentType('https://example.com/news/latest')).toBe('article');
    expect(inferContentType('https://example.com/updates/release')).toBe('article');
    expect(inferContentType('https://example.com/posts/launch')).toBe('article');
  });

  it('returns reference when first segment is api-related', () => {
    expect(inferContentType('https://example.com/api/users')).toBe('reference');
    expect(inferContentType('https://example.com/reference/endpoints')).toBe('reference');
  });

  it('returns page for unrecognized first segment /about', () => {
    expect(inferContentType('https://example.com/about')).toBe('page');
  });

  it('returns page for unrecognized first segment /pricing', () => {
    expect(inferContentType('https://example.com/pricing')).toBe('page');
  });

  it('returns page for unrecognized first segment /contact', () => {
    expect(inferContentType('https://example.com/contact')).toBe('page');
  });
});
