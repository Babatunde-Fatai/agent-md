import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, 'utf8');
}

export async function fileIsNewerThan(filePath: string, timestamp: string): Promise<boolean> {
  let fileStats;
  try {
    fileStats = await stat(filePath);
  } catch {
    return false;
  }

  const sourceTime = Date.parse(timestamp);
  if (!Number.isFinite(sourceTime)) {
    return false;
  }

  return fileStats.mtimeMs > sourceTime;
}

export async function readFrontmatterTitle(filePath: string): Promise<string | undefined> {
  try {
    const content = await readFile(filePath, 'utf8');
    const match = content.match(/^---\n[\s\S]*?\ntitle:\s*"([^"]*)"/m);
    return match?.[1] || undefined;
  } catch {
    return undefined;
  }
}
