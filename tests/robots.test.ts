import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAllowedByRobots } from '../src/core/robots.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isAllowedByRobots', () => {
  it('returns false when URL path is disallowed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('User-agent: *\nDisallow: /private/\n', { status: 200 })
      )
    );

    const allowed = await isAllowedByRobots('https://example.com/private/data', 1000);
    expect(allowed).toBe(false);
  });

  it('returns true when URL path does not match disallow rules', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('User-agent: *\nDisallow: /private/\n', { status: 200 })
      )
    );

    const allowed = await isAllowedByRobots('https://example.com/public/data', 1000);
    expect(allowed).toBe(true);
  });

  it('returns true when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    const allowed = await isAllowedByRobots('https://example.com/private/data', 1000);
    expect(allowed).toBe(true);
  });

  it('returns true when robots fetch status is non-200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not found', { status: 404 })));

    const allowed = await isAllowedByRobots('https://example.com/private/data', 1000);
    expect(allowed).toBe(true);
  });
});
