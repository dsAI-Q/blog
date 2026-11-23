import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** 写成 draft: true 就只在本地预览，不构建上线 */
    draft: z.boolean().default(false),
    /** 勾上置顶：排在所有普通文章前面 */
    pinned: z.boolean().default(false),
    /** 排序权重：数字越大越靠前，默认 0 */
    order: z.number().default(0),
  }),
});

/** 单页正文（招生简章、关于页这类），不进文章列表 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
