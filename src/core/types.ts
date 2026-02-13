export type RendererType = 'static' | 'playwright';

export interface BuildOptions {
  sitemap?: string;
  urls?: string;
  out: string;
  baseUrl?: string;
  maxPages?: number;
  renderer: RendererType;
  timeout: number;
  concurrency: number;
  extraWaitMs?: number;
  skipRobotsCheck?: boolean;
}

export interface UrlEntry {
  url: string;
  lastmod?: string;
}

export interface RenderResult {
  url: string;
  finalUrl: string;
  html: string;
  title?: string;
  origin: string;
}

export interface ConvertedContent {
  markdown: string;
  title?: string;
  description?: string;
  textContent: string;
}

export interface ManifestEntry {
  url: string;
  markdown_path: string;
  title: string;
  retrieved_at: string;
}
