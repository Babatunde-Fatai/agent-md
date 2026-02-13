function normalizeDisallowPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') {
    return trimmed;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function parseDisallowRules(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const disallow: string[] = [];
  let inStarBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.split('#')[0]?.trim() ?? '';
    if (!line) {
      continue;
    }

    const [directiveRaw, ...valueParts] = line.split(':');
    const directive = directiveRaw?.trim().toLowerCase();
    const value = valueParts.join(':').trim();
    if (!directive) {
      continue;
    }

    if (directive === 'user-agent') {
      inStarBlock = value === '*';
      continue;
    }

    if (inStarBlock && directive === 'disallow') {
      const normalized = normalizeDisallowPath(value);
      if (normalized) {
        disallow.push(normalized);
      }
    }
  }

  return disallow;
}

export async function isAllowedByRobots(url: string, timeout: number): Promise<boolean> {
  try {
    const pageUrl = new URL(url);
    const robotsUrl = new URL('/robots.txt', pageUrl.origin);
    const response = await fetch(robotsUrl, { signal: AbortSignal.timeout(timeout) });

    if (response.status !== 200) {
      return true;
    }

    const content = await response.text();
    const disallowRules = parseDisallowRules(content);
    const pathName = pageUrl.pathname || '/';

    return !disallowRules.some((rule) => pathName.startsWith(rule));
  } catch {
    return true;
  }
}
