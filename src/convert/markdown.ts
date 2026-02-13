import TurndownService from 'turndown';
import turndownPluginGfm from 'turndown-plugin-gfm';

export function convertHtmlToMarkdown(html: string): string {
  const service = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });

  service.use(turndownPluginGfm.gfm);

  const markdown = service.turndown(html);
  return markdown.trim();
}
