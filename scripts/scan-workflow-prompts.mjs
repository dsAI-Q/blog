/**
 * 扫描 ComfyUI 工作流 JSON，找出里面像提示词的长文本。
 * 只输出统计与少量样例，完整候选写到 .cache/workflow-prompts.json
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = process.argv[2] ?? String.raw`E:\Comfyui\Comfyui-xiaozhuAI\ComfyUI\user\default\workflows`;
const OUT = path.resolve('.cache/workflow-prompts.json');
const MIN_LEN = 60;

const isPromptish = (text) => {
  const t = text.trim();
  if (t.length < MIN_LEN) return false;
  if (/^[\d\s.,;:%=()\-+/]+$/.test(t)) return false; // 纯数字/公式
  if (/^(true|false|null)$/i.test(t)) return false;
  return /[\u4e00-\u9fa5]/.test(t) || /\b(prompt|describe|画面|镜头|风格|role|system)\b/i.test(t);
};

function collectFromLiteGraph(json, file) {
  const found = [];
  for (const node of json.nodes ?? []) {
    const title = node.title ?? node.type ?? `node-${node.id}`;
    const values = Array.isArray(node.widgets_values) ? node.widgets_values : [];
    values.forEach((value, index) => {
      if (typeof value !== 'string' || !isPromptish(value)) return;
      found.push({ file, nodeTitle: title, nodeType: node.type, field: `widgets_values[${index}]`, text: value });
    });
  }
  return found;
}

function collectFromApi(json, file) {
  const found = [];
  for (const [id, node] of Object.entries(json)) {
    if (!node || typeof node !== 'object') continue;
    const inputs = node.inputs ?? {};
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value !== 'string' || !isPromptish(value)) continue;
      found.push({
        file,
        nodeTitle: (node._meta?.title ?? node.class_type ?? `node-${id}`),
        nodeType: node.class_type,
        field: `inputs.${key}`,
        text: value,
      });
    }
  }
  return found;
}

const files = (await readdir(DIR)).filter((name) => name.toLowerCase().endsWith('.json')).sort();
const all = [];
const failed = [];

for (const name of files) {
  try {
    const json = JSON.parse(await readFile(path.join(DIR, name), 'utf8'));
    const found = Array.isArray(json.nodes) ? collectFromLiteGraph(json, name) : collectFromApi(json, name);
    all.push(...found);
  } catch (error) {
    failed.push(`${name}: ${error.message}`);
  }
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(all, null, 2), 'utf8');

const byFile = new Map();
for (const item of all) byFile.set(item.file, (byFile.get(item.file) ?? 0) + 1);

console.log(`工作流 ${files.length} 个，候选文本 ${all.length} 条，解析失败 ${failed.length}`);
if (failed.length) console.log('失败：', failed.slice(0, 5).join(' | '));

const lens = all.map((item) => item.text.length).sort((a, b) => b - a);
console.log(`长度：最长 ${lens[0]}，中位 ${lens[Math.floor(lens.length / 2)]}，>200 字 ${lens.filter((n) => n > 200).length} 条`);

console.log('\n候选最多的 10 个工作流：');
[...byFile.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([file, count]) => console.log(`  ${String(count).padStart(3)}  ${file}`));

console.log('\n最长的 12 条（截断展示）：');
lens.slice(0, 12).forEach(() => {});
[...all]
  .sort((a, b) => b.text.length - a.text.length)
  .slice(0, 12)
  .forEach((item) => {
    console.log(`  [${item.text.length}] ${item.file.slice(0, 28)} · ${String(item.nodeTitle).slice(0, 18)}`);
    console.log(`      ${item.text.replace(/\s+/g, ' ').slice(0, 60)}…`);
  });
