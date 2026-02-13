declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown';

  const plugin: {
    gfm: (service: TurndownService) => void;
    tables: (service: TurndownService) => void;
    strikethrough: (service: TurndownService) => void;
    taskListItems: (service: TurndownService) => void;
  };

  export default plugin;
}
