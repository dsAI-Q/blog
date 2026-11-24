/**
 * 生成提示词库数据：
 *   src/data/prompts.ts        —— 元数据（标题/分类/模型/类型/字数），页面用
 *   public/prompts-data.json   —— 正文，按 id 懒加载
 *
 * 来源：
 *  A. C:\Users\ASUS\Desktop\系统提示词 下的 .txt/.md
 *  B. D/E 盘白名单 10 个文件
 *  C. ComfyUI 工作流 JSON 里的提示词节点（自动过滤 JSON 配置、按内容去重）
 * 明确排除：E:\闲鱼\杂项\NSFW-闲鱼清单
 */

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DESKTOP = String.raw`C:\Users\ASUS\Desktop\系统提示词`;
const WF_DIR = String.raw`E:\Comfyui\Comfyui-xiaozhuAI\ComfyUI\user\default\workflows`;
const OUT_TS = path.resolve('src/data/prompts.ts');
const OUT_JSON = path.resolve('public/prompts-data.json');

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

const NAME_IMAGE = /(图像|生图|文生图|海报|封面|角色设定|脸型|图片|修图|设定图|image|t2i)/i;
const NAME_VIDEO = /(视频|分镜|生视频|运镜|武打|武戏|仙侠|监控|延长|一打多|白模|对白|二创|首尾帧|动作|viggle|refmod|video|t2v|i2v|ltx)/i;

const sha = (text) => createHash('sha1').update(text).digest('hex');

function detectModel(name, text) {
  const head = `${name}\n${text.slice(0, 4000)}`;
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
    .replace(/\.(txt|md|json)$/i, '')
    .replace(/^[🎬🐇🐷]\s*/u, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s*[（(]\d+[)）]\s*$/, '')
    .replace(/\s*[-－]\s*\d{4}-\d{2}-\d{2}\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ---------- A + B：本地文件 ---------- */

async function fromFiles() {
  const files = [];
  for (const entry of await readdir(DESKTOP, { withFileTypes: true })) {
    if (entry.isFile() && /\.(txt|md)$/i.test(entry.name)) files.push(path.join(DESKTOP, entry.name));
  }
  files.push(...WHITELIST);

  const items = [];
  for (const file of files) {
    let text = '';
    try {
      text = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n').trim();
    } catch {
      console.log(`跳过（读不到）：${path.basename(file)}`);
      continue;
    }
    if (!text) continue;

    const name = path.basename(file);
    items.push({
      source: 'file',
      id: `p-${sha(file).slice(0, 8)}`,
      title: cleanTitle(name),
      name,
      body: text,
    });
  }
  return items;
}

/* ---------- C：工作流 JSON ---------- */

const isConfigBlob = (text) => /^[\[{]/.test(text.trim()) || /^\s*data:/.test(text) || /^[A-Za-z0-9+/=]{200,}$/.test(text);

function looksLikePrompt(text) {
  const t = text.trim();
  if (t.length < 80) return false;
  if (isConfigBlob(t)) return false;
  if (/[\u4e00-\u9fa5]/.test(t)) return true;
  return /(you are|your role|task|instruction|prompt|describe|shot|camera|cinematic)/i.test(t.slice(0, 600));
}

function pickFromLiteGraph(json) {
  const found = [];
  for (const node of json.nodes ?? []) {
    const values = Array.isArray(node.widgets_values) ? node.widgets_values : [];
    for (const value of values) {
      if (typeof value === 'string' && looksLikePrompt(value)) {
        found.push({ nodeTitle: node.title ?? node.type ?? '', nodeType: node.type ?? '', text: value });
      }
    }
  }
  return found;
}

function pickFromApi(json) {
  const found = [];
  for (const [id, node] of Object.entries(json)) {
    if (!node || typeof node !== 'object' || !node.inputs) continue;
    for (const value of Object.values(node.inputs)) {
      if (typeof value === 'string' && looksLikePrompt(value)) {
        found.push({
          nodeTitle: node._meta?.title ?? node.class_type ?? `node-${id}`,
          nodeType: node.class_type ?? '',
          text: value,
        });
      }
    }
  }
  return found;
}

const GENERIC_NODE = /^(text|string|clip text encode|node-\d+|text \(task_prompt\)|.*widget.*|文本|提示词|正向|负向|正向提示词|负向提示词)$/i;

// 成人向工作流整份跳过（与「NSFW-闲鱼清单」保持一致的处理原则）
const ADULT_WORKFLOW = /(sex|eros|nsfw|porn|hentai|成人|色情|nude)/i;

async function fromWorkflows() {
  let names = [];
  try {
    names = (await readdir(WF_DIR)).filter((name) => name.toLowerCase().endsWith('.json')).sort();
  } catch {
    console.log('工作流目录读不到，跳过 C 类来源');
    return [];
  }

  const items = [];
  const seen = new Set();

  for (const name of names) {
    if (ADULT_WORKFLOW.test(name)) {
      console.log(`跳过成人向工作流：${name}`);
      continue;
    }
    let json;
    try {
      json = JSON.parse(await readFile(path.join(WF_DIR, name), 'utf8'));
    } catch {
      continue;
    }
    const candidates = Array.isArray(json.nodes) ? pickFromLiteGraph(json) : pickFromApi(json);
    const workflow = cleanTitle(name);

    for (const candidate of candidates) {
      const text = candidate.text.trim();
      const hash = sha(text);
      if (seen.has(hash)) continue;
      seen.add(hash);

      const nodeTitle = String(candidate.nodeTitle ?? '').trim();
      // 节点名太泛（「文本」「提示词」）就看不出内容，用工作流名兜底
      const title =
        nodeTitle && !GENERIC_NODE.test(nodeTitle) ? nodeTitle : `${workflow} · ${nodeTitle || candidate.nodeType || '节点'}`;

      items.push({
        source: 'workflow',
        id: `w-${hash.slice(0, 8)}`,
        title,
        name: `${workflow} · ${nodeTitle || candidate.nodeType || '节点'}`,
        body: text,
      });
    }
  }
  return items;
}

/* ---------- 汇总 ---------- */

const raw = [...(await fromFiles()), ...(await fromWorkflows())];

// 同内容只留一份（文件优先于工作流）
const seenBody = new Set();
const items = [];
for (const item of raw) {
  const hash = sha(item.body);
  if (seenBody.has(hash)) continue;
  seenBody.add(hash);
  items.push(item);
}

for (const item of items) {
  const name = item.name;
  item.category = detectCategory(name, item.body);
  item.model = detectModel(name, item.body);
  item.kind = detectKind(name, item.body);
  item.len = item.body.length;
}

const catOrder = { 图像: 0, 视频: 1, 通用: 2 };
const kindOrder = { 系统提示词: 0, 提示词: 1 };
items.sort(
  (a, b) =>
    catOrder[a.category] - catOrder[b.category] ||
    kindOrder[a.kind] - kindOrder[b.kind] ||
    a.title.localeCompare(b.title, 'zh-CN'),
);

await mkdir(path.resolve('public'), { recursive: true });
await writeFile(
  OUT_JSON,
  JSON.stringify(Object.fromEntries(items.map((item) => [item.id, item.body])), null, 0),
  'utf8',
);

const meta = items.map(({ id, title, category, model, kind, len, source }) => ({
  id,
  title,
  category,
  model,
  kind,
  len,
  source,
}));

const header = `// 由 scripts/import-prompts.mjs 自动生成，勿手改。正文见 public/prompts-data.json
export type PromptCategory = '图像' | '视频' | '通用';
export type PromptModel = 'MiniMax H3' | 'LTX 2' | 'Wan 2.2' | 'bernini' | 'Viggle' | '通用';
export type PromptKind = '系统提示词' | '提示词';
export type PromptSource = 'file' | 'workflow';

export type Prompt = {
  id: string;
  title: string;
  category: PromptCategory;
  model: PromptModel;
  kind: PromptKind;
  /** 正文字数（正文本身在 public/prompts-data.json 里懒加载） */
  len: number;
  source: PromptSource;
};

export const PROMPTS: Prompt[] = `;

const body = JSON.stringify(meta, null, 2)
  .replace(/"id":/g, 'id:')
  .replace(/"title":/g, 'title:')
  .replace(/"category":/g, 'category:')
  .replace(/"model":/g, 'model:')
  .replace(/"kind":/g, 'kind:')
  .replace(/"len":/g, 'len:')
  .replace(/"source":/g, 'source:');

await writeFile(OUT_TS, `${header}${body};\n`, 'utf8');

const count = (key, value) => items.filter((item) => item[key] === value).length;
console.log(`\n共 ${items.length} 条（文件 ${count('source', 'file')} / 工作流 ${count('source', 'workflow')}）`);
console.log(`图像 ${count('category', '图像')} / 视频 ${count('category', '视频')} / 通用 ${count('category', '通用')}`);
console.log(
  `模型：MiniMax H3 ${count('model', 'MiniMax H3')} / LTX 2 ${count('model', 'LTX 2')} / Wan 2.2 ${count('model', 'Wan 2.2')} / bernini ${count('model', 'bernini')} / Viggle ${count('model', 'Viggle')} / 通用 ${count('model', '通用')}`,
);
console.log(`类型：系统提示词 ${count('kind', '系统提示词')} / 提示词 ${count('kind', '提示词')}`);
console.log(`正文合计 ${(items.reduce((sum, item) => sum + item.len, 0) / 1024).toFixed(0)} KB`);
