#!/usr/bin/env node
import { Command } from 'commander';
import { buildAgentMarkdown } from '../core/build.js';
import type { BuildOptions } from '../core/types.js';

const program = new Command();

program
  .name('agent-md')
  .description('Build-time markdown generator for agent-friendly static content')
  .version('0.1.0');

program
  .command('build')
  .description('Generate markdown files from sitemap or URL list')
  .option('--sitemap <url>', 'Sitemap URL to crawl')
  .option('--urls <file>', 'Path to text file containing URLs (one per line)')
  .option('--out <dir>', 'Output directory', 'public/agent')
  .option('--base-url <url>', 'Base URL used to resolve relative links')
  .option('--max-pages <n>', 'Maximum pages to process', parsePositiveInt)
  .option('--renderer <type>', 'Renderer: static or playwright', 'static')
  .option('--timeout <ms>', 'Timeout in milliseconds', parsePositiveInt, 30000)
  .option('--concurrency <n>', 'Concurrent page workers', parsePositiveInt, 3)
  .option(
    '--extra-wait-ms <ms>',
    'Extra wait after domcontentloaded before extraction (playwright only)',
    parseNonNegativeInt,
    1000
  )
  .option(
    '--skip-robots-check',
    'Skip robots.txt enforcement and crawl all URLs regardless',
    false
  )
  .action(async (rawOptions) => {
    const options = rawOptions as BuildOptions;

    if (!options.sitemap && !options.urls) {
      throw new Error('Either --sitemap or --urls is required.');
    }

    if (options.renderer !== 'static' && options.renderer !== 'playwright') {
      throw new Error('--renderer must be static or playwright');
    }

    await buildAgentMarkdown(options);
  });

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`agent-md failed: ${message}`);
  process.exitCode = 1;
});

function parsePositiveInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected positive integer but received: ${value}`);
  }
  return parsed;
}

function parseNonNegativeInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Expected non-negative integer but received: ${value}`);
  }
  return parsed;
}
