/**
 * 把本地提示词文件汇总成 src/data/prompts.ts
 *
 * 来源：
 *  A. C:\Users\ASUS\Desktop\系统提示词 下的 .txt/.md（跳过 模板工作流 子目录）
 *  B. 白名单散落在 D/E 盘的 10 个文件
 * 明确排除：E:\闲鱼\杂项\NSFW-闲鱼清单（不读）
 *
 * 规则（与用户确认过）：
 *  - model 只允许：MiniMax H3（H3/MiniMax 合并）、LTX 2、Wan 2.2、bernini、Viggle、通用
 *  - category：图像 / 视频 / 通用
 *  - kind：系统提示词 / 提示词
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DESKTOP = String.raw`C:\Users\ASUS\Desktop\系统提示词`;
const OUT = path.resolve('src/data/prompts.ts');

const WHITELIST = [
  String.raw`D:\google drive\Google AI Studio\LTX-2 首尾帧提示词工程.txt`,
  String.raw`D:\google drive\Google AI Studio\LTX-2 提示词工程.txt`,
  String.raw`D:\google drive\Google AI Studio\LTX-2 图生视频 (I2V) 提示词生成规则.txt`,
  String.raw`D:\google drive\Google AI Studio\LTX-2 文生视频 (T2V) 提示词生成规则.txt`,
  String.raw`D:\hypit\rea-out\viggle-bg-swap-prompt.txt`,
  String.raw`D:\hypit\rea-out\viggle-prompt-填空模板.txt`,
  String.raw`E:\resource\测试\古代监控视频\古代监控视频提示词SKILL.md`,
  String.raw`E:\resource\测试\古代监控视频\掩耳盗铃\掩耳盗铃_五段视频提示词_最终版.md`,
  String.raw`E:\resource\测试\电影镜头创作素材\华强买瓜\华强买瓜时隔 20 年重逢 5 段分镜提示词.txt`,
  String.raw`E:\闲鱼\杂项\万相文本指令v2\wan22提示词生成方法.txt`,
];

// 文件名比正文可靠：先按名字判，名字没线索才看正文
const NAME_IMAGE = /(图像|生图|文生图|海报|封面|角色设定|脸型|图片|修图|设定图|image|t2i)/i;
const NAME_VIDEO = /(视频|分镜|生视频|运镜|武打|武戏|仙侠|监控|延长|一打多|白模|对白|二创|首尾帧|动作|viggle|refmod|video|t2v|i2v|ltx)/i;

function detectModel(name, text) {
  const head = `${name}\n${text.slice(0, 4000)}`;
  // 按顺序判断，先具体后笼统
  if (/wan\s*2\.?2|万相/i.test(head)) return 'Wan 2.2';
  if (/bernini/i.test(head)) return 'bernini';
  if (/viggle/i.test(head)) return 'Viggle';
  if (/LTX\s*-?\s*2/i.test(head)) return 'LTX 2';
  if (/MiniMax|H3/i.test(head)) return 'MiniMax H3';
  return '通用';
}

function detectCategory(name, text) {
  if (NAME_IMAGE.test(name)) return '图像';
  if (NAME_VIDEO.test(name)) return '视频';

  const head = text.slice(0, 3000);
  const image = /(文生图|生图|图像生成|海报|角色设定图)/.test(head);
  const video = /(文生视频|图生视频|生视频|分镜|运镜|首尾帧)/.test(head);
  if (image && !video) return '图像';
  if (video && !image) return '视频';
  return '通用';
}

function detectKind(name, text) {
  if (/系统提示词|system\s*prompt|系统指令/i.test(name)) return '系统提示词';
  if (/系统提示词|system\s*prompt/i.test(text.slice(0, 800))) return '系统提示词';
  return '提示词';
}

function cleanTitle(name) {
  return name
    .replace(/\.(txt|md)$/i, '')
    .replace(/^🎬\s*/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s*[（(]\d+[)）]\s*$/, '')
    .replace(/\s*[-－]\s*\d{4}-\d{2}-\d{2}\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function collect() {
  const files = [];

  // A. 桌面目录（只收根级 .txt/.md）
  for (const entry of await readdir(DESKTOP, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!/\.(txt|md)$/i.test(entry.name)) continue;
    files.push(path.join(DESKTOP, entry.name));
  }

  // B. 白名单
  files.push(...WHITELIST);
  return files;
}

const files = await collect();
const items = [];
const seen = new Set();

for (const file of files) {
  let text = '';
  try {
    text = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n').trim();
  } catch (error) {
    console.log(`跳过（读不到）：${path.basename(file)} — ${error.message}`);
    continue;
  }
  if (!text) {
    console.log(`跳过（空文件）：${path.basename(file)}`);
    continue;
  }

  const name = path.basename(file);
  const title = cleanTitle(name);
  const id = `p-${createHash('sha1').update(file).digest('hex').slice(0, 8)}`;

  if (seen.has(id)) continue;
  seen.add(id);

  // 内容完全相同的重复文件只留一份（比如带 🎬 前缀的那对）
  const bodyHash = createHash('sha1').update(text).digest('hex');
  if (seen.has(bodyHash)) {
    console.log(`跳过重复内容：${name}`);
    continue;
  }
  seen.add(bodyHash);

  items.push({
    id,
    title,
    category: detectCategory(name, text),
    model: detectModel(name, text),
    kind: detectKind(name, text),
    body: text,
  });
}

const sortOrder = { 图像: 0, 视频: 1, 通用: 2 };
const kindOrder = { 系统提示词: 0, 提示词: 1 };
items.sort(
  (a, b) =>
    sortOrder[a.category] - sortOrder[b.category] ||
    kindOrder[a.kind] - kindOrder[b.kind] ||
    a.title.localeCompare(b.title, 'zh-CN'),
);

const header = `// 由 scripts/import-prompts.mjs 自动生成，勿手改
export type PromptCategory = '图像' | '视频' | '通用';
export type PromptModel = 'MiniMax H3' | 'LTX 2' | 'Wan 2.2' | 'bernini' | 'Viggle' | '通用';
export type PromptKind = '系统提示词' | '提示词';

export type Prompt = {
  id: string;
  title: string;
  category: PromptCategory;
  model: PromptModel;
  kind: PromptKind;
  body: string;
};

export const PROMPTS: Prompt[] = `;

const body = JSON.stringify(items, null, 2)
  .replace(/"id":/g, 'id:')
  .replace(/"title":/g, 'title:')
  .replace(/"category":/g, 'category:')
  .replace(/"model":/g, 'model:')
  .replace(/"kind":/g, 'kind:')
  .replace(/"body":/g, 'body:');

await writeFile(OUT, `${header}${body};\n`, 'utf8');

const count = (key, value) => items.filter((item) => item[key] === value).length;
console.log(`\n共 ${items.length} 条 -> ${OUT}`);
console.log(`图像 ${count('category', '图像')} / 视频 ${count('category', '视频')} / 通用 ${count('category', '通用')}`);
console.log(
  `模型：MiniMax H3 ${count('model', 'MiniMax H3')} / LTX 2 ${count('model', 'LTX 2')} / Wan 2.2 ${count('model', 'Wan 2.2')} / bernini ${count('model', 'bernini')} / Viggle ${count('model', 'Viggle')} / 通用 ${count('model', '通用')}`,
);
console.log(`类型：系统提示词 ${count('kind', '系统提示词')} / 提示词 ${count('kind', '提示词')}`);

console.log('\n标题 / 分类 / 模型 / 类型 / 字数');
for (const item of items) {
  console.log(`${item.title.slice(0, 34).padEnd(36)} ${item.category} ${item.model.padEnd(12)} ${item.kind.padEnd(6)} ${item.body.length}`);
}
