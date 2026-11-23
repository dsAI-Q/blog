/**
 * 把公众号文章（mp.weixin.qq.com）抓成博客 Markdown。
 *
 * 用法：
 *   node scripts/import-wechat-url.mjs <链接1> [链接2 ...]
 *   node scripts/import-wechat-url.mjs --file links.txt
 *   node scripts/import-wechat-url.mjs --file links.txt --tags "教程,工作流" --dry
 *   node scripts/import-wechat-url.mjs --selftest      # 只测转换器
 *
 * 图片会下载到 public/uploads/<slug>/ 下，正文里改成站内路径。
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const OUT_DIR = path.resolve('src/content/posts');
const UPLOAD_ROOT = path.resolve('public/uploads');
const REFERER = 'https://mp.weixin.qq.com/';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

/* ---------------- HTML → Markdown ---------------- */

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&hellip;': '…',
  '&mdash;': '—',
  '&middot;': '·',
};

function decodeEntities(text) {
  return text
    .replace(/&[a-z]+;|&#\d+;/g, (match) => {
      if (ENTITIES[match]) return ENTITIES[match];
      const num = /^&#(\d+);$/.exec(match);
      return num ? String.fromCodePoint(Number(num[1])) : match;
    })
    .replace(/\u00a0/g, ' ');
}

function htmlToMarkdown(html) {
  let text = html;

  // 先去脚本、注释、样式（注意：data-* 属性要留到图片提取之后再清，否则 data-src 会丢）
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/\sstyle="[^"]*"/gi, '');

  // 图片先占位，后面单独处理
  const images = [];
  text = text.replace(/<img[^>]*>/gi, (tag) => {
    const src =
      /data-src="([^"]+)"/i.exec(tag)?.[1] ??
      /\ssrc="([^"]+)"/i.exec(tag)?.[1] ??
      '';
    if (!src) return '';
    images.push(src);
    return `\n\n[[IMG:${images.length - 1}]]\n\n`;
  });

  // 图片提完再清 data-*
  text = text.replace(/\sdata-[a-z-]+="[^"]*"/gi, '');

  // 链接、强调、行内代码
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const label = inner.replace(/<[^>]+>/g, '').trim();
    return label ? `[${label}](${href})` : '';
  });
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => `**${inner}**`);
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => `*${inner}*`);
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => `\`${inner}\``);

  // 块级结构
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, inner) => `\n\n# ${inner.trim()}\n\n`);
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => `\n\n## ${inner.trim()}\n\n`);
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => `\n\n### ${inner.trim()}\n\n`);
  text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const body = inner.replace(/<[^>]+>/g, '').trim();
    return `\n\n> ${body.split('\n').join('\n> ')}\n\n`;
  });
  text = text.replace(/<li[^>]*>/gi, '\n- ');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/(p|section|div|ul|ol|tr|table|figure|figcaption)>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // 剩下的标签一律去掉，保留文字
  text = text.replace(/<[^>]+>/g, '');

  text = decodeEntities(text);
  text = text.replace(/[ \t]+\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  // 列表：项之间不空行，但列表整体前面要有空行
  text = text.replace(/\n{2,}(?=- )/g, '\n');
  {
    const lines = text.split('\n');
    const out = [];
    for (const line of lines) {
      const isItem = /^- /.test(line);
      const prev = out[out.length - 1];
      if (isItem && prev !== undefined && prev.trim() !== '' && !/^- /.test(prev)) {
        out.push('');
      }
      out.push(line);
    }
    text = out.join('\n');
  }
  text = text.replace(/\*\*\s*\*\*/g, '');
  text = text.trim();

  return { markdown: text, images };
}

/* ---------------- 抓取 ---------------- */

function extractBalancedDiv(html, marker) {
  const start = html.indexOf(marker);
  if (start < 0) return '';

  const open = html.lastIndexOf('<div', start);
  let index = open;
  let depth = 0;

  while (index < html.length) {
    const nextOpen = html.indexOf('<div', index + 1);
    const nextClose = html.indexOf('</div>', index + 1);
    if (nextClose < 0) break;

    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen;
    } else {
      if (depth === 0) {
        // 跳过开始标签自身的 ">"，否则会把 id="js_content" 一起带进正文
        const tagEnd = html.indexOf('>', open);
        return html.slice(tagEnd + 1, nextClose);
      }
      depth -= 1;
      index = nextClose;
    }
  }
  return '';
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: REFERER,
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
  });
  const html = await res.text();
  return { status: res.status, html };
}

function parseMeta(html, name) {
  return (
    new RegExp(`<meta[^>]+property="${name}"[^>]+content="([^"]*)"`, 'i').exec(html)?.[1] ??
    new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, 'i').exec(html)?.[1] ??
    ''
  );
}

function parseDate(html) {
  const raw =
    /id="publish_time"[^>]*>([^<]*)</i.exec(html)?.[1] ??
    parseMeta(html, 'article:published_time');
  const match = raw?.match(/(\d{4})\D{0,3}(\d{1,2})\D{0,3}(\d{1,2})/);
  if (!match) return new Date().toISOString().slice(0, 10);
  const [, y, m, d] = match;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function slugFor(url, date, title) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 6);
  // 中文标题里能提出来的英文词通常没意义（比如只剩 "0" "h3" "5"），
  // 挑出长度 > 2 且有字母的词，凑不够就用日期 + 哈希。
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .split('-')
    .filter((word) => /[a-z]/.test(word) && word.length > 2)
    .slice(0, 5);
  const ascii = words.join('-');
  return ascii.length >= 6 ? `wechat-${date}-${hash}-${ascii.slice(0, 40)}` : `wechat-${date}-${hash}`;
}

async function downloadImage(src, dir, index) {
  const res = await fetch(src, {
    headers: { 'User-Agent': UA, Referer: REFERER },
  });
  if (!res.ok) throw new Error(`图片 ${res.status}`);

  const type = res.headers.get('content-type') ?? 'image/jpeg';
  const ext = type.includes('png')
    ? 'png'
    : type.includes('webp')
      ? 'webp'
      : type.includes('gif')
        ? 'gif'
        : 'jpg';
  const name = `${String(index + 1).padStart(2, '0')}.${ext}`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
  return name;
}

function pickDescription(html, body) {
  // 公众号的 meta description 往往就是正文开头（还带「🎁文末链接」这类开场白），
  // 所以优先从正文里挑第一段正经内容。
  const boilerplate = /(文末链接|点赞、投币|关注走一波|本期工具|详见文末)/;
  const paragraph = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block && !block.startsWith('#') && !block.startsWith('![') && !block.startsWith('---'))
    .find((block) => !boilerplate.test(block) && block.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').length >= 15);

  const meta = decodeEntities(parseMeta(html, 'og:description') || parseMeta(html, 'description') || '').trim();
  const text = (paragraph ?? meta ?? body)
    .replace(/[*>`#\-]/g, '')
    .replace(/\s+/g, '')
    .trim();
  return text.length > 80 ? `${text.slice(0, 78)}…` : text;
}

/** 砍掉正文开头的公众号固定开场白（短段落且含「文末链接 / 点赞投币」等） */
function stripBoilerplate(text) {
  const paragraphs = text.split(/\n{2,}/);
  while (paragraphs.length > 0) {
    const head = paragraphs[0].trim();
    const isBoilerplate = head.length < 140 && /(文末链接|详见文末|点赞、投币|关注走一波)/.test(head);
    if (!isBoilerplate) break;
    paragraphs.shift();
  }
  return paragraphs.join('\n\n').trim();
}

/* ---------------- 主流程 ---------------- */

async function importOne(url, { tags, dry }) {
  console.log(`\n▸ ${url}`);
  const { status, html } = await fetchPage(url);
  if (status !== 200) throw new Error(`页面 ${status}`);
  if (!html.includes('js_content')) throw new Error('页面里没有 js_content，可能已删除或需要验证');

  const title = decodeEntities(
    /id="activity-name"[^>]*>([\s\S]*?)</i.exec(html)?.[1]?.trim() || parseMeta(html, 'og:title') || '未命名文章',
  ).replace(/\s+/g, ' ');

  const contentHtml = extractBalancedDiv(html, 'id="js_content"');
  if (!contentHtml) throw new Error('正文区域解析失败');

  const { markdown, images } = htmlToMarkdown(contentHtml);
  const date = parseDate(html);
  const slug = slugFor(url, date, title);

  const body = stripBoilerplate(markdown.trim());
  const cleanedBody = body;
  const description = pickDescription(html, cleanedBody);

  console.log(`  标题: ${title}`);
  console.log(`  日期: ${date}   图片: ${images.length} 张   正文: ${body.length} 字`);
  console.log(`  文件: ${slug}.md`);

  if (dry) {
    console.log('  [dry] 前 200 字：\n' + cleanedBody.slice(0, 200));
    return { slug, title, date, images: images.length };
  }

  // 下载图片并替换占位符
  let finalBody = body;
  if (images.length > 0) {
    const dir = path.join(UPLOAD_ROOT, slug);
    for (const [index, src] of images.entries()) {
      try {
        const saved = await downloadImage(src, dir, index);
        finalBody = finalBody.replaceAll(
          `[[IMG:${index}]]`,
          `![配图 ${index + 1}](/uploads/${slug}/${saved})`,
        );
        console.log(`  图片 ${index + 1} 已保存`);
      } catch (error) {
        console.log(`  图片 ${index + 1} 失败：${error.message}（保留原地址）`);
        finalBody = finalBody.replaceAll(`[[IMG:${index}]]`, src);
      }
    }
  }

  const escape = (value) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const frontmatter = [
    '---',
    `title: ${escape(title)}`,
    `description: ${escape(description)}`,
    `date: ${date}`,
    `tags: [${tags.join(', ')}]`,
    'draft: false',
    `source: ${escape(url)}`,
    '---',
    '',
  ].join('\n');

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, `${slug}.md`), frontmatter + finalBody + '\n', 'utf8');
  return { slug, title, date, images: images.length };
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--selftest')) {
    const sample = `<div id="js_content"><section><p><span>这是一段<b>加粗</b>文字</span></p>
      <p><img data-src="https://mmbiz.qpic.cn/a.jpg" /></p>
      <h2>小标题</h2><ul><li>第一点</li><li>第二点</li></ul>
      <blockquote>引用内容</blockquote><p>链接 <a href="https://x.com">示例</a> &amp; 收尾&nbsp;。</p></section></div>`;
    const inner = extractBalancedDiv(sample, 'id="js_content"');
    const { markdown, images } = htmlToMarkdown(inner);
    console.log('--- selftest markdown ---');
    console.log(markdown);
    console.log('--- images ---');
    console.log(images);
    return;
  }

  let urls = [];
  const fileIndex = argv.indexOf('--file');
  if (fileIndex >= 0) {
    const listFile = argv[fileIndex + 1];
    const text = await readFile(listFile, 'utf8');
    urls = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^https?:\/\//.test(line));
  } else {
    urls = argv.filter((arg) => /^https?:\/\//.test(arg));
  }

  if (urls.length === 0) {
    console.log('没有链接。用法：node scripts/import-wechat-url.mjs <链接> …');
    return;
  }

  const tagsIndex = argv.indexOf('--tags');
  const tags =
    tagsIndex >= 0 && argv[tagsIndex + 1]
      ? argv[tagsIndex + 1]
          .split(/[,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean)
      : ['公众号', 'AI'];
  const dry = argv.includes('--dry');

  const results = [];
  for (const url of urls) {
    try {
      results.push(await importOne(url, { tags, dry }));
    } catch (error) {
      console.log(`  失败：${error.message}`);
    }
  }

  console.log(`\n完成 ${results.length}/${urls.length} 篇`);
  for (const item of results) console.log(`  ${item.date}  ${item.title}  (${item.images} 图)`);
}

await main();
