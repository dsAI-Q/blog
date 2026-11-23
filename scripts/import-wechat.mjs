/**
 * 把公众号排版产物（out/<date>.publish.md）导入成博客文章。
 *
 * 用法：
 *   node scripts/import-wechat.mjs "D:\gongzonghao\wechat\out"
 *
 * 规则：
 * - 标题优先取 <date>.title.txt，其次取正文里的 H1，都没有就用日期兜底
 * - 日期取文件名，slug 用 ai-daily-YYYY-MM-DD
 * - 去掉公众号的固定开场白和正文 H1
 * - 文末「编号 + 标题 + 链接」两行合并成 Markdown 列表链接
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = process.argv[2] ?? String.raw`D:\gongzonghao\wechat\out`;
const OUT = path.resolve('src/content/posts');
const TAGS = ['日报', 'AI资讯'];

const escapeYaml = (value) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

function toDescription(body) {
  const quote = body.match(/^>\s*(.+)$/m)?.[1]?.trim();
  if (quote) return quote;

  const paragraph = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith('#') && !block.startsWith('---') && !block.startsWith('*'));
  const text = (paragraph ?? '').replace(/[*>#`]/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 80 ? `${text.slice(0, 78)}…` : text;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter((name) => /^\d{4}-\d{2}-\d{2}\.publish\.md$/.test(name)).sort();
  console.log(`找到 ${files.length} 篇：`);

  const written = [];

  for (const file of files) {
    const date = file.slice(0, 10);
    let body = (await readFile(path.join(SRC, file), 'utf8')).replace(/\r\n/g, '\n');

    // 标题
    let title = '';
    try {
      const titleFile = (await readFile(path.join(SRC, `${date}.title.txt`), 'utf8')).trim();
      title = titleFile.split('\n')[0].trim();
    } catch {
      title = '';
    }
    if (!title) {
      title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '';
    }
    if (!title) {
      const [, month, day] = date.split('-');
      title = `大圣Ai 每日速递 · ${Number(month)}月${Number(day)}日`;
    }

    // 正文清理
    body = body.replace(/^#\s+.+\n/, '');
    body = body.replace(/^Ai资源分享详见文末链接\s*\n+/, '');

    // 文末来源：编号 + 标题 + 链接 → 列表链接
    body = body.replace(/^(\d{2})\s+(.+)\n(https?:\/\/\S+)$/gm, '- [$2]($3)');
    body = body.replace(/^(\d{2})\s+(.+?)\s*$/gm, '- $2');

    body = body.replace(/\n{3,}/g, '\n\n').trim();

    const frontmatter = [
      '---',
      `title: ${escapeYaml(title)}`,
      `description: ${escapeYaml(toDescription(body))}`,
      `date: ${date}`,
      `tags: [${TAGS.join(', ')}]`,
      'draft: false',
      '---',
      '',
    ].join('\n');

    const slug = `ai-daily-${date}`;
    await writeFile(path.join(OUT, `${slug}.md`), frontmatter + body + '\n', 'utf8');
    written.push({ date, slug, title, chars: body.length });
  }

  for (const item of written) {
    console.log(`  ${item.date}  ${item.title}  (${item.chars} 字) -> ${item.slug}.md`);
  }
  console.log(`\n共写入 ${written.length} 篇到 ${OUT}`);
}

await main();
