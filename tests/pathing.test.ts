import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { derivePublicMountPath, mapUrlToRelativeMarkdownPath } from '../src/core/pathing.js';

describe('mapUrlToRelativeMarkdownPath', () => {
  test('maps root URL to index.md', () => {
    expect(mapUrlToRelativeMarkdownPath('https://site.com/')).toBe('index.md');
  });

  test('maps trailing slash to index.md under folder', () => {
    expect(mapUrlToRelativeMarkdownPath('https://site.com/docs/')).toBe(path.posix.join('docs', 'index.md'));
  });

  test('maps non-trailing slash path to .md file', () => {
    expect(mapUrlToRelativeMarkdownPath('https://site.com/docs/getting-started')).toBe(
      path.posix.join('docs', 'getting-started.md')
    );
  });

  test('strips query string and hash', () => {
    expect(mapUrlToRelativeMarkdownPath('https://site.com/docs/start?ref=1#section')).toBe(
      path.posix.join('docs', 'start.md')
    );
  });

  test('normalizes repeated slashes', () => {
    expect(mapUrlToRelativeMarkdownPath('https://site.com/docs//api///')).toBe(
      path.posix.join('docs', 'api', 'index.md')
    );
  });
});

describe('derivePublicMountPath', () => {
  test('derives /agent for default public/agent output', () => {
    expect(derivePublicMountPath('public/agent')).toBe('/agent');
  });

  test('derives nested public mount path', () => {
    expect(derivePublicMountPath('public/assets/agent')).toBe('/assets/agent');
  });

  test('falls back to basename for non-public output', () => {
    expect(derivePublicMountPath('dist/agent-output')).toBe('/agent-output');
  });
});
