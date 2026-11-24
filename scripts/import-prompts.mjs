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

/* ---------- 标题：从正文首句取，而不是节点名 ---------- */

const CJK = /[\u2E80-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;

function widthOf(text) {
  let n = 0;
  for (const ch of text) n += CJK.test(ch) ? 2 : 1;
  return n;
}

// 「Note」「Usage」「说明」这类没有信息量的单行
const LABEL_ONLY =
  /^(note|notes|usage|size|tips?|params?|settings?|example|examples|说明|注意|备注|参数|设置|使用说明|示例)\s*[:：]?$/i;
// 「subject_definitions:」这种字段名单独一行
const STRUCT_LINE = /^[A-Za-z_]{3,32}\s*:\s*$/;

function stripLine(raw) {
  let line = raw
    .trim()
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*+>]\s+/, '')
    .replace(/^\d+[.、)]\s*/, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 「（杰作」这种没有闭合的起始标点去掉；「（叹气）…」留着
  const lead = line.match(/^[（(【[「『“‘"'\s]+/);
  if (lead) {
    const pairs = { '（': '）', '(': ')', '【': '】', '[': ']', '「': '」', '『': '』', '“': '”', '‘': '’' };
    const rest = line.slice(lead[0].length);
    const closed = [...lead[0]].some((ch) => pairs[ch] && rest.includes(pairs[ch]));
    if (!closed) line = rest.trim();
  }
  return line;
}

function truncate(title, max) {
  if (widthOf(title) <= max) return title;
  let acc = '';
  for (const ch of title) {
    if (widthOf(acc + ch) > max - 1) break;
    acc += ch;
  }
  if (!CJK.test(acc.at(-1) ?? '')) acc = acc.replace(/\s+\S*$/, ''); // 别把英文词截成半个
  return `${acc.trim()}…`;
}

const LEAD_LABEL = /^(task|prompt|description|role|style|subject|note|usage|提示词|任务|描述|角色|风格|主体|场景)\s*[:：]\s*/i;

function tidy(title) {
  return title
    .replace(LEAD_LABEL, '')
    .replace(/[：:，,、；;。.\-—]+$/, '')
    .replace(/["'“”‘’]+$/, '')
    .trim();
}

// 同一行按标点切出由短到长的多个候选，标题撞车时用更长的那个
function titleCandidates(line) {
  const bounds = [];
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    const isDot = ch === '.' && (next === undefined || /\s/.test(next));
    if (/[。！？；!?;，,、]/.test(ch) || isDot) {
      if (widthOf(line.slice(0, i)) >= 8) bounds.push(i);
    }
  }

  let base = bounds.length ? line.slice(0, bounds[0]) : line;
  if (widthOf(base) < 10 && bounds.length > 1) base = line.slice(0, bounds[1]);

  const out = [tidy(truncate(base.trim(), 48))];
  for (const i of bounds) {
    const candidate = tidy(truncate(line.slice(0, i).trim(), 72));
    if (candidate && !out.includes(candidate)) out.push(candidate);
  }
  return out.filter(Boolean);
}

function titlesFromBody(text) {
  for (const raw of text.split('\n')) {
    const line0 = raw.trim();
    if (!line0) continue;
    if (line0 === '---') continue;
    // 字段名单独一行（**subject_definitions:** / subject_definitions：）
    if (/^[A-Za-z_]{3,32}\s*[:：]\s*$/.test(stripLine(line0))) continue;
    if (/^[A-Za-z_]{3,32}$/.test(line0)) continue; // 裸字段名
    // 跳过真正的标签行，但 <Subject 1> 这类占位符是正文
    if (/^<\?|^<[a-zA-Z/!]/.test(line0) && !/^<(Subject|Picture|Video|Audio|Image|Ref|Character)\b/i.test(line0)) continue;
    if (/^https?:/i.test(line0)) continue;
    if (line0.split('|').length >= 3 && !CJK.test(line0)) continue; // 纯英文参数表
    const line = stripLine(line0);
    if (!line || LABEL_ONLY.test(line)) continue;
    if (isConfigBlob(line)) continue;
    if (/https?:\/\//i.test(line)) continue; // 纯链接说明
    if (/[A-Za-z]:\\|[\\/][\w.-]+[\\/][\w.-]+/.test(line) && !CJK.test(line)) continue; // 路径
    if ((line.match(/\\/g) ?? []).length >= 2) continue; // 一串文件名/目录
    if (widthOf(line) < 8) continue;
    const titles = titleCandidates(line);
    if (titles.length) return titles;
  }
  return [];
}

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
      origin: '',
      name,
      body: text,
    });
  }
  return items;
}

/* ---------- C：工作流 JSON ---------- */

const isConfigBlob = (text) =>
  /^[\[{]/.test(text.trim()) ||
  /^"[\w.-]+"\s*[:,]/.test(text.trim()) || // JSON 键值行
  /^\s*data:/.test(text) ||
  /^[A-Za-z0-9+/=]{200,}$/.test(text);

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
const ADULT_WORKFLOW = /(sex|eros|nfsw|nsfw|porn|hentai|成人|色情|nude)/i;

// 文件名干净但节点正文是成人向的，同样剔除（上一轮就漏了 7 条）
const ADULT_EN =
  /\b(sex|sexual|sexy|porn\w*|nfsw|nsfw|hentai|nude|naked|erotic|orgasm|masturbat\w*|penis|cock|dick|pussy|vagina|anal|blowjob|deepthroat|handjob|creampie|cumshot|cum|sperm|semen|nipples?|breasts?|tits|boobs|fuck\w*|bdsm|fetish|striptease)\b/i;
const ADULT_CJK = /(色情|成人视频|裸体|裸照|性爱|性交|做爱|口交|阴茎|阴道|射精|淫|情色|脱衣|床戏|乳房|性器|露点|A片)/;

function isAdult(text) {
  if (ADULT_EN.test(text)) return true;
  // 「不要色情内容」这种护栏表述不算
  const guarded = text.replace(/(不|禁|避免|拒绝|勿|无需|非|杜绝)\S{0,3}(色情|裸露|裸体|性爱)/g, '');
  return ADULT_CJK.test(guarded);
}

// 这些节点不是「写提示词」的节点：说明、参数、展示、编码器、加载器
const NON_PROMPT_NODE =
  /^(note|notes?|markdownnote|markdown note|nsfw|showtext(\|pysssss)?|frame rate note|easy showanything|easy promptline|easy showtext|cliptextencode|clip text encode|clip text encode \(negative prompt\)|cr prompt text|previewimage|.*preview.*|loraloadermodelonly|checkpointloader(?:simple)?|unetloader|vaeloader|.*loader.*)$/i;

// 模型文件名、负向词表、入团广告，都不是提示词
const MODEL_FILE = /\.(safetensors|ckpt|pt|pth|bin|onnx|gguf)$/i;
const AD_TEXT = /(入团|解锁本集合|加群|联系作者|微信号|公众号|扫码|购买|领取|付费|会员)/;
const NEG_WORDS =
  /(watermark|subtitles?|caption|blurry|out of focus|low quality|worst quality|bad anatomy|overexposed|underexposed|watermark|logo|水印|字幕|过曝|低质量|最差质量|畸形|残缺|多余的手指|模糊|画得不好)/gi;

function looksLikeNegative(text) {
  const t = text.trim();
  const hits = (t.match(NEG_WORDS) ?? []).length;
  const separators = (t.match(/[,，、]/g) ?? []).length;
  return hits >= 3 && separators >= 8 && !/[。！？]/.test(t);
}

// 工作流节点里的参数说明（步数、显存设置），不是提示词
const PARAM_NOTE = /(transition_step|步数|采样步|去噪强度|显存|CFG|cfg)/;

// 一个工作流最多取几条
const MAX_PER_WORKFLOW = 2;

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
    if (/加密|解密/.test(name)) continue; // 工具演示工作流，正文是使用说明
    let json;
    try {
      json = JSON.parse(await readFile(path.join(WF_DIR, name), 'utf8'));
    } catch {
      continue;
    }
    const candidates = Array.isArray(json.nodes) ? pickFromLiteGraph(json) : pickFromApi(json);
    const workflow = cleanTitle(name);

    // 只留真正的提示词节点，再按「像提示词的节点 + 正文长度」取前 2 条
    const kept = candidates
      .filter((candidate) => {
        const label = `${candidate.nodeTitle ?? ''} ${candidate.nodeType ?? ''}`.trim();
        return label && !NON_PROMPT_NODE.test(label);
      })
      .map((candidate) => {
        const label = `${candidate.nodeTitle ?? ''} ${candidate.nodeType ?? ''}`;
        const promptish = /(prompt|text|提示词)/i.test(label) ? 0 : 1;
        return { candidate, promptish };
      })
      .sort((a, b) => a.promptish - b.promptish || b.candidate.text.trim().length - a.candidate.text.trim().length)
      .slice(0, MAX_PER_WORKFLOW)
      .map((entry) => entry.candidate);

    for (const candidate of kept) {
      const text = candidate.text.trim();
      const hash = sha(text);
      if (seen.has(hash)) continue;

      // 正文就是成人向内容的，整条剔除（节点名不含关键词时靠这一道兜住）
      if (isAdult(text)) {
        console.log(`跳过成人向节点：${workflow} · ${candidate.nodeTitle || candidate.nodeType || '节点'}`);
        continue;
      }
      if (MODEL_FILE.test(text) && text.length < 300) continue; // 模型文件名
      if (AD_TEXT.test(text)) continue; // 入团/联系方式
      if (looksLikeNegative(text)) continue; // 负向词表
      if (PARAM_NOTE.test(text) && text.length < 400) continue; // 参数说明
      seen.add(hash);

      const nodeTitle = String(candidate.nodeTitle ?? '').trim();
      const bodyTitles = titlesFromBody(text);
      // 标题优先取正文首句；取不到才退回「工作流名 · 节点名」
      const fallback = `${workflow} · ${nodeTitle || candidate.nodeType || '节点'}`;

      items.push({
        source: 'workflow',
        id: `w-${hash.slice(0, 8)}`,
        title: bodyTitles[0] ?? fallback,
        titles: bodyTitles,
        origin: workflow,
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

/* 标题：先按正文首句分组；组内撞车的，用「共同前缀之后那一段」区分，
   这样 18 条都以「参考首帧的人物…」开头的条目也能各自看出是哪一段 */
const usedTitles = new Set();

function assignTitle(item, title) {
  if (!usedTitles.has(title)) {
    usedTitles.add(title);
    return title;
  }
  for (let n = 2; ; n++) {
    const candidate = item.origin ? `${title}（${item.origin} ${n}）` : `${title}（${n}）`;
    if (!usedTitles.has(candidate)) {
      usedTitles.add(candidate);
      return candidate;
    }
  }
}

for (const item of items) item.baseTitle = item.titles?.[0] ?? item.title;

const titleGroups = new Map();
for (const item of items) {
  const list = titleGroups.get(item.baseTitle) ?? [];
  list.push(item);
  titleGroups.set(item.baseTitle, list);
}

for (const [base, group] of titleGroups) {
  if (group.length === 1) {
    const [item] = group;
    item.title = assignTitle(item, base);
    continue;
  }

  // 组内正文的共同前缀（撞车通常只是开头一样，后半段才是差异）
  let cp = group[0].body.length;
  for (const item of group) {
    let i = 0;
    while (i < cp && i < item.body.length && item.body[i] === group[0].body[i]) i++;
    cp = i;
  }

  const seen = new Set();
  for (const item of group) {
    let from = Math.max(cp, base.length);
    // 别在英文单词中间切（「An East Asian」→「n East Asian」）
    const isWord = (ch) => /[A-Za-z0-9]/.test(ch ?? '');
    while (from < item.body.length && isWord(item.body[from]) && isWord(item.body[from - 1])) from++;

    let rest = item.body
      .slice(from)
      .replace(/\*\*|__|`/g, '')
      .replace(/^[\s，,。.、：:；;！!？?\-—·"“”'‘’）)】\]】]+/, '');
    // 「12]：荒岛蛰伏」这类被切断的分镜编号，补成「镜头12：荒岛蛰伏」
    rest = rest.replace(/^(\d{1,3})\s*[\]】)）]\s*[：:]\s*/, '镜头$1：').replace(/^\d+[.、)]\s*/, '');
    const bare = base.replace(/[：:，,。.、；;！!？?\s]+$/, '');
    while (bare && rest.startsWith(bare)) rest = rest.slice(bare.length).replace(/^[\s，,。.、：:；;！!？?\-—·）)】\]]+/, '');

    let suffix = tidy(truncate((rest.split('\n')[0] ?? '').trim(), 30));
    if (suffix === base) suffix = '';
    const candidate = suffix && widthOf(suffix) >= 4 ? `${base} · ${suffix}` : base;
    item.title = assignTitle(item, candidate);
    seen.add(item.title);
  }
}

for (const item of items) delete item.baseTitle;
for (const item of items) delete item.titles;

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

const meta = items.map(({ id, title, origin, category, model, kind, len, source }) => ({
  id,
  title,
  origin,
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
  /** 正文首句（工作流条目）或文件名（本地文档） */
  title: string;
  /** 来源工作流名；本地文档为空串 */
  origin: string;
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
  .replace(/"origin":/g, 'origin:')
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
