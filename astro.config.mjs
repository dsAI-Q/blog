import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: 换自定义域名时改这一处（影响 canonical、sitemap、RSS 里的绝对地址）
export default defineConfig({
  site: 'https://dashengai.pages.dev',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // 编辑器是给自己用的，不进 sitemap
      filter: (page) => !page.includes('/edit/'),
    }),
  ],
});
