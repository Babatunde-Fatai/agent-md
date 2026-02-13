import { chromium, type Browser } from 'playwright';
import type { RenderResult, RendererType } from './types.js';

export interface Renderer {
  render(url: string): Promise<RenderResult>;
  close(): Promise<void>;
}

export function createRenderer(options: {
  renderer: RendererType;
  timeout: number;
  extraWaitMs?: number;
}): Renderer {
  if (options.renderer === 'static') {
    return createStaticRenderer(options.timeout);
  }
  return createPlaywrightRenderer(options.timeout, options.extraWaitMs ?? 1000);
}

function createStaticRenderer(timeout: number): Renderer {
  return {
    async render(url: string): Promise<RenderResult> {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      const finalUrl = response.url || url;
      return {
        url,
        finalUrl,
        html,
        origin: new URL(finalUrl).origin
      };
    },
    async close(): Promise<void> {
      return;
    }
  };
}

function createPlaywrightRenderer(timeout: number, extraWaitMs: number): Renderer {
  let browserPromise: Promise<Browser> | null = null;
  let installReminderShown = false;

  async function getBrowser(): Promise<Browser> {
    if (!browserPromise) {
      if (!installReminderShown) {
        console.log(
          'agent-md: using playwright renderer -- ensure chromium is installed: npx playwright install chromium'
        );
        installReminderShown = true;
      }
      browserPromise = chromium.launch({ headless: true });
    }
    return browserPromise;
  }

  return {
    async render(url: string): Promise<RenderResult> {
      const browser = await getBrowser();
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout
        });

        if (extraWaitMs > 0) {
          await page.waitForTimeout(extraWaitMs);
        }

        const html = await page.content();
        const finalUrl = page.url();
        const title = await page.title();

        return {
          url,
          finalUrl,
          html,
          title: title || undefined,
          origin: new URL(finalUrl).origin
        };
      } finally {
        await page.close();
        await context.close();
      }
    },
    async close(): Promise<void> {
      if (browserPromise) {
        const browser = await browserPromise;
        await browser.close();
      }
      browserPromise = null;
    }
  };
}
