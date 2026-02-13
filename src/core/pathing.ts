import path from 'node:path';

export function mapUrlToRelativeMarkdownPath(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  const normalizedPath = normalizePathname(parsed.pathname);

  if (normalizedPath === '/') {
    return 'index.md';
  }

  const hadTrailingSlash = normalizedPath.endsWith('/');
  const trimmed = normalizedPath.replace(/^\/+|\/+$/g, '');

  if (!trimmed) {
    return 'index.md';
  }

  if (hadTrailingSlash) {
    return path.posix.join(trimmed, 'index.md');
  }

  return `${trimmed}.md`;
}

export function derivePublicMountPath(outDir: string): string {
  const normalized = outDir.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
  const match = normalized.match(/(?:^|\/)public\/?(.*)$/);

  if (match) {
    const suffix = (match[1] ?? '').replace(/^\/+/, '');
    return suffix ? `/${suffix}` : '/';
  }

  const baseName = path.posix.basename(normalized);
  return `/${baseName}`;
}

function normalizePathname(pathname: string): string {
  const collapsed = pathname.replace(/\/+/g, '/');
  if (collapsed === '') {
    return '/';
  }
  return collapsed.startsWith('/') ? collapsed : `/${collapsed}`;
}
