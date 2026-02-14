import { describe, expect, it } from 'vitest';
import { looksLikeAuthRedirect, looksLikeLoginWall } from '../src/core/authDetection.js';

describe('looksLikeAuthRedirect', () => {
  it('returns true when final URL contains /login', () => {
    expect(looksLikeAuthRedirect('https://example.com/dashboard', 'https://example.com/login')).toBe(
      true
    );
  });

  it('returns false when original and final URL are the same', () => {
    expect(looksLikeAuthRedirect('https://example.com/dashboard', 'https://example.com/dashboard')).toBe(
      false
    );
  });

  it('returns false when final URL changes without auth pattern', () => {
    expect(
      looksLikeAuthRedirect('https://example.com/docs', 'https://example.com/docs/getting-started')
    ).toBe(false);
  });
});

describe('looksLikeLoginWall', () => {
  it('returns true for short content with multiple login signals', () => {
    const markdown = 'Please sign in to continue. Forgot your password? Create an account.';
    expect(looksLikeLoginWall(markdown)).toBe(true);
  });

  it('returns false for long content that mentions login once', () => {
    const markdown = `${'content '.repeat(400)}login`;
    expect(looksLikeLoginWall(markdown)).toBe(false);
  });

  it('returns false for normal content', () => {
    const markdown = 'This page documents product setup, architecture, and release process.';
    expect(looksLikeLoginWall(markdown)).toBe(false);
  });
});
